import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button, Modal, Form, Image } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    FaArrowLeft, FaCheck, FaTimes, FaCalendar, FaEnvelope, 
    FaUser, FaBriefcase, FaGraduationCap, FaStar, FaCertificate, 
    FaLanguage, FaPhone, FaMapMarkerAlt, FaInfoCircle 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Applications = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [error, setError] = useState('');
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [interviewData, setInterviewData] = useState({
        interviewDate: '',
        interviewLocation: '',
        note: ''
    });

    useEffect(() => {
        fetchApplications();
    }, [jobId]);

    const fetchApplications = async () => {
        try {
            const [appRes, jobRes] = await Promise.all([
                api.get(`/applications/job/${jobId}`),
                api.get(`/jobs/${jobId}`)
            ]);
            setApplications(appRes.data.applications || []);
            setJob(jobRes.data.job);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            await api.put(`/applications/${applicationId}/status`, { status });
            setApplications(applications.map(app => 
                app._id === applicationId ? { ...app, status } : app
            ));
            toast.success(`Application status updated to ${status}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/applications/${selectedApp._id}/schedule-interview`, interviewData);
            setApplications(applications.map(app => 
                app._id === selectedApp._id ? { 
                    ...app, 
                    status: 'interviewed',
                    interviewDate: interviewData.interviewDate,
                    interviewLocation: interviewData.interviewLocation
                } : app
            ));
            toast.success('Interview scheduled successfully');
            setShowInterviewModal(false);
            setSelectedApp(null);
            setInterviewData({ interviewDate: '', interviewLocation: '', note: '' });
        } catch (error) {
            toast.error('Failed to schedule interview');
        }
    };

    const handleViewProfile = (application) => {
        setSelectedCandidate(application.applicant);
        setShowProfileModal(true);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: 'warning',
            reviewed: 'info',
            shortlisted: 'success',
            interviewed: 'primary',
            offered: 'success',
            rejected: 'danger'
        };
        return statusMap[status] || 'secondary';
    };

    const getMatchScoreClass = (score) => {
        if (score >= 70) return 'match-high';
        if (score >= 40) return 'match-medium';
        return 'match-low';
    };

    const formatDate = (date) => {
        if (!date) return 'Not scheduled';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading applications...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button as={Link} to="/employer/jobs" variant="outline-primary">
                    <FaArrowLeft className="me-2" /> Back to Jobs
                </Button>
            </Container>
        );
    }

    return (
        <section className="applications-section py-4">
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <Button 
                            variant="link" 
                            className="text-decoration-none p-0 mb-2 d-inline-flex align-items-center gap-2"
                            onClick={() => navigate('/employer/jobs')}
                        >
                            <FaArrowLeft /> Back to Jobs
                        </Button>
                        <h2 className="fw-bold mb-0">Applications for {job?.title}</h2>
                        <p className="text-muted">{job?.department} • {job?.location}</p>
                    </div>
                    <Badge bg="primary" className="fs-6 p-2">
                        {applications.length} Applicants
                    </Badge>
                </div>

                {applications.length === 0 ? (
                    <Card className="text-center py-5">
                        <Card.Body>
                            <div className="mb-3" style={{ fontSize: '4rem' }}>📭</div>
                            <h4>No applications yet</h4>
                            <p className="text-muted">There are no applications for this job yet</p>
                        </Card.Body>
                    </Card>
                ) : (
                    <Card className="shadow-sm">
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Applied Date</th>
                                            <th>Match Score</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app) => (
                                            <tr key={app._id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        {/* Candidate Photo */}
                                                        {app.applicant?.profile?.profilePhoto ? (
                                                            <Image 
                                                                src={`http://localhost:5000/${app.applicant.profile.profilePhoto}`} 
                                                                roundedCircle 
                                                                style={{ 
                                                                    width: '40px', 
                                                                    height: '40px', 
                                                                    objectFit: 'cover',
                                                                    border: '2px solid #2c3e8f'
                                                                }} 
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div 
                                                                style={{ 
                                                                    width: '40px', 
                                                                    height: '40px', 
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #2c3e8f, #1a237e)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '1rem'
                                                                }}
                                                            >
                                                                {app.applicant?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="fw-semibold">{app.applicant?.name || 'Unknown'}</div>
                                                            <div className="text-muted small">{app.applicant?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    {app.matchScore ? (
                                                        <span className={`match-score ${getMatchScoreClass(app.matchScore)}`}>
                                                            {app.matchScore}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusBadge(app.status)}>
                                                        {app.status?.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1 flex-wrap">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-info"
                                                            onClick={() => handleViewProfile(app)}
                                                            title="View Profile"
                                                        >
                                                            <FaUser />
                                                        </Button>
                                                        {app.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-success"
                                                                    onClick={() => handleStatusUpdate(app._id, 'reviewed')}
                                                                    title="Mark as Reviewed"
                                                                >
                                                                    <FaCheck />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-danger"
                                                                    onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                                                    title="Reject"
                                                                >
                                                                    <FaTimes />
                                                                </Button>
                                                            </>
                                                        )}
                                                        {app.status === 'reviewed' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline-success"
                                                                onClick={() => handleStatusUpdate(app._id, 'shortlisted')}
                                                                title="Shortlist"
                                                            >
                                                                Shortlist
                                                            </Button>
                                                        )}
                                                        {app.status === 'shortlisted' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                onClick={() => {
                                                                    setSelectedApp(app);
                                                                    setShowInterviewModal(true);
                                                                }}
                                                                title="Schedule Interview"
                                                            >
                                                                <FaCalendar className="me-1" /> Interview
                                                            </Button>
                                                        )}
                                                        {app.status === 'interviewed' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-success"
                                                                    onClick={() => handleStatusUpdate(app._id, 'offered')}
                                                                    title="Offer"
                                                                >
                                                                    Offer
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-danger"
                                                                    onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                                                    title="Reject"
                                                                >
                                                                    <FaTimes />
                                                                </Button>
                                                            </>
                                                        )}
                                                        {app.status === 'offered' && (
                                                            <Badge bg="success">Offer Sent</Badge>
                                                        )}
                                                        {app.status === 'rejected' && (
                                                            <Badge bg="danger">Rejected</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Interview Modal */}
                <Modal show={showInterviewModal} onHide={() => setShowInterviewModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Schedule Interview</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleScheduleInterview}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Interview Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={interviewData.interviewDate}
                                    onChange={(e) => setInterviewData({ ...interviewData, interviewDate: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Interview Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={interviewData.interviewLocation}
                                    onChange={(e) => setInterviewData({ ...interviewData, interviewLocation: e.target.value })}
                                    placeholder="e.g., SITA Office, Hawassa"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Additional Note</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={interviewData.note}
                                    onChange={(e) => setInterviewData({ ...interviewData, note: e.target.value })}
                                    placeholder="Add any instructions or notes for the candidate"
                                />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button type="submit" variant="primary-gradient">
                                    <FaCalendar className="me-2" /> Schedule Interview
                                </Button>
                                <Button variant="outline-secondary" onClick={() => setShowInterviewModal(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Candidate Profile Modal */}
                <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaUser className="me-2" /> Candidate Profile
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedCandidate && (
                            <div>
                                {/* Header with Photo */}
                                <div className="text-center mb-4">
                                    {selectedCandidate.profile?.profilePhoto ? (
                                        <Image 
                                            src={`http://localhost:5000/${selectedCandidate.profile.profilePhoto}`} 
                                            roundedCircle 
                                            style={{ 
                                                width: '120px', 
                                                height: '120px', 
                                                objectFit: 'cover',
                                                border: '4px solid #2c3e8f'
                                            }} 
                                        />
                                    ) : (
                                        <div 
                                            style={{ 
                                                width: '120px', 
                                                height: '120px', 
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #2c3e8f, #1a237e)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '3rem',
                                                margin: '0 auto',
                                                border: '4px solid #2c3e8f'
                                            }}
                                        >
                                            {selectedCandidate.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <h4 className="mt-3 fw-bold">{selectedCandidate.name}</h4>
                                    <p className="text-muted">{selectedCandidate.email}</p>
                                    <Badge bg="primary">{selectedCandidate.role}</Badge>
                                </div>

                                <hr />

                                <Row>
                                    {/* Contact Info */}
                                    <Col md={6}>
                                        <h6 className="fw-bold"><FaInfoCircle className="me-2" /> Contact Information</h6>
                                        <div className="mb-2">
                                            <small className="text-muted">Phone</small>
                                            <p className="fw-semibold mb-0">
                                                {selectedCandidate.profile?.phone || 'Not provided'}
                                            </p>
                                        </div>
                                        <div className="mb-2">
                                            <small className="text-muted">Location</small>
                                            <p className="fw-semibold mb-0">
                                                {selectedCandidate.profile?.location || 'Not provided'}
                                            </p>
                                        </div>
                                        <div className="mb-2">
                                            <small className="text-muted">Bio</small>
                                            <p className="mb-0">
                                                {selectedCandidate.profile?.bio || 'No bio provided'}
                                            </p>
                                        </div>
                                    </Col>

                                    {/* Skills */}
                                    <Col md={6}>
                                        <h6 className="fw-bold"><FaStar className="me-2" /> Skills</h6>
                                        {selectedCandidate.profile?.skills?.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-1">
                                                {selectedCandidate.profile.skills.map((skill, idx) => (
                                                    <Badge key={idx} bg="primary" className="p-2">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted">No skills listed</p>
                                        )}

                                        <div className="mt-3">
                                            <h6 className="fw-bold"><FaCertificate className="me-2" /> Certifications</h6>
                                            {selectedCandidate.profile?.certifications?.length > 0 ? (
                                                <div className="d-flex flex-wrap gap-1">
                                                    {selectedCandidate.profile.certifications.map((cert, idx) => (
                                                        <Badge key={idx} bg="info" className="p-2">
                                                            {cert}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted">No certifications listed</p>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <h6 className="fw-bold"><FaLanguage className="me-2" /> Languages</h6>
                                            {selectedCandidate.profile?.languages?.length > 0 ? (
                                                <div className="d-flex flex-wrap gap-1">
                                                    {selectedCandidate.profile.languages.map((lang, idx) => (
                                                        <Badge key={idx} bg="secondary" className="p-2">
                                                            {lang}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted">No languages listed</p>
                                            )}
                                        </div>
                                    </Col>
                                </Row>

                                <hr />

                                {/* Education */}
                                <h6 className="fw-bold"><FaGraduationCap className="me-2" /> Education</h6>
                                {selectedCandidate.profile?.education?.length > 0 ? (
                                    selectedCandidate.profile.education.map((edu, idx) => (
                                        <div key={idx} className="p-2 border-bottom">
                                            <div className="fw-semibold">{edu.degree}</div>
                                            <div className="text-muted">{edu.institution}</div>
                                            <div className="text-muted small">{edu.field} {edu.graduationYear ? `• ${edu.graduationYear}` : ''}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted">No education listed</p>
                                )}

                                <hr />

                                {/* Work Experience */}
                                <h6 className="fw-bold"><FaBriefcase className="me-2" /> Work Experience</h6>
                                {selectedCandidate.profile?.workExperience?.length > 0 ? (
                                    selectedCandidate.profile.workExperience.map((exp, idx) => (
                                        <div key={idx} className="p-2 border-bottom">
                                            <div className="fw-semibold">{exp.position} at {exp.company}</div>
                                            <div className="text-muted small">
                                                {exp.startDate ? new Date(exp.startDate).getFullYear() : ''} 
                                                {exp.endDate === 'Present' ? ' - Present' : exp.endDate ? ` - ${new Date(exp.endDate).getFullYear()}` : ''}
                                            </div>
                                            {exp.description && (
                                                <div className="text-muted small">{exp.description}</div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted">No work experience listed</p>
                                )}

                                <hr />

                                {/* Match Score Summary */}
                                <div className="bg-light p-3 rounded">
                                    <h6 className="fw-bold"><FaStar className="me-2 text-warning" /> AI Match Summary</h6>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="text-center">
                                            <div className="display-6 fw-bold">{selectedCandidate.matchScore || 'N/A'}</div>
                                            <small className="text-muted">Overall Match</small>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between small">
                                                <span>Skills: {selectedCandidate.matchScore || 0}%</span>
                                                <span>Education: {selectedCandidate.matchScore || 0}%</span>
                                                <span>Experience: {selectedCandidate.matchScore || 0}%</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px' }}>
                                                <div 
                                                    className={`progress-bar ${selectedCandidate.matchScore >= 70 ? 'bg-success' : selectedCandidate.matchScore >= 40 ? 'bg-warning' : 'bg-danger'}`}
                                                    style={{ width: `${selectedCandidate.matchScore || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
                            Close
                        </Button>
                        <Button 
                            variant="primary-gradient"
                            onClick={() => {
                                if (selectedCandidate) {
                                    window.location.href = `mailto:${selectedCandidate.email}`;
                                }
                            }}
                        >
                            <FaEnvelope className="me-2" /> Contact Candidate
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </section>
    );
};

export default Applications;