import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Modal, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaUserPlus, FaEnvelope, FaCalendar, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api, { getImageUrl } from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        shortlisted: 0,
        interviewed: 0,
        offered: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await api.get('/applications/me');
            const apps = response.data.applications || [];
            setApplications(apps);
            
            const statsData = {
                total: apps.length,
                pending: apps.filter(a => a.status === 'pending').length,
                shortlisted: apps.filter(a => a.status === 'shortlisted').length,
                interviewed: apps.filter(a => a.status === 'interviewed').length,
                offered: apps.filter(a => a.status === 'offered').length,
                rejected: apps.filter(a => a.status === 'rejected').length
            };
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error(t('common.error') || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
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

    const getStatusLabel = (status) => {
        const statusLabels = {
            pending: t('dashboard.pending'),
            reviewed: 'Reviewed',
            shortlisted: t('dashboard.shortlisted'),
            interviewed: t('dashboard.interviewed'),
            offered: t('dashboard.offered'),
            rejected: t('dashboard.rejected')
        };
        return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    };

    const handleViewInterview = (application) => {
        setSelectedApplication(application);
        setShowInterviewModal(true);
    };

    const formatDate = (date) => {
        if (!date) return 'Not scheduled yet';
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">{t('common.loading')}</p>
            </Container>
        );
    }

    return (
        <section className="dashboard-section py-4">
            <Container>
                {/* Welcome Section with Profile Photo */}
                <div className="welcome-section mb-4 d-flex align-items-center">
                    {user?.profile?.profilePhoto ? (
                        <Image 
                            src={getImageUrl(user.profile.profilePhoto)} 
                            roundedCircle 
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover',
                                marginRight: '15px',
                                border: '3px solid #2c3e8f'
                            }} 
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div 
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #2c3e8f, #1a237e)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                marginRight: '15px'
                            }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div>
                        <h2 className="fw-bold mb-0">
                            {t('dashboard.welcome', { name: user?.name || 'User' })}
                        </h2>
                        <p className="text-muted mb-0">{t('dashboard.welcome_desc')}</p>
                        <small className="text-muted">
                            <Badge bg="light" text="dark" className="me-1">
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </Badge>
                            {user?.profile?.location && (
                                <span>📍 {user.profile.location}</span>
                            )}
                        </small>
                    </div>
                </div>

                {/* Stats Cards */}
                <Row className="g-2 g-md-3 mb-4">
                    <Col xs={6} sm={4} md={2}>
                        <Card className="dashboard-card text-center">
                            <Card.Body className="p-2 p-md-3">
                                <div className="icon text-primary">
                                    <FaBriefcase size={24} />
                                </div>
                                <div className="number" style={{ fontSize: '1.5rem' }}>{stats.total}</div>
                                <div className="label" style={{ fontSize: '0.7rem', wordBreak: 'break-word' }}>
                                    {t('dashboard.total_applications')}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <Card className="dashboard-card text-center">
                            <Card.Body className="p-2 p-md-3">
                                <div className="icon text-warning">
                                    <FaClock size={24} />
                                </div>
                                <div className="number" style={{ fontSize: '1.5rem' }}>{stats.pending}</div>
                                <div className="label" style={{ fontSize: '0.7rem', wordBreak: 'break-word' }}>
                                    {t('dashboard.pending')}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <Card className="dashboard-card text-center">
                            <Card.Body className="p-2 p-md-3">
                                <div className="icon text-success">
                                    <FaCheckCircle size={24} />
                                </div>
                                <div className="number" style={{ fontSize: '1.5rem' }}>{stats.shortlisted}</div>
                                <div className="label" style={{ fontSize: '0.7rem', wordBreak: 'break-word' }}>
                                    {t('dashboard.shortlisted')}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <Card className="dashboard-card text-center">
                            <Card.Body className="p-2 p-md-3">
                                <div className="icon text-info">
                                    <FaUserPlus size={24} />
                                </div>
                                <div className="number" style={{ fontSize: '1.5rem' }}>{stats.interviewed}</div>
                                <div className="label" style={{ fontSize: '0.7rem', wordBreak: 'break-word' }}>
                                    {t('dashboard.interviewed')}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <Card className="dashboard-card text-center">
                            <Card.Body className="p-2 p-md-3">
                                <div className="icon text-success">
                                    <FaCheckCircle size={24} />
                                </div>
                                <div className="number" style={{ fontSize: '1.5rem' }}>{stats.offered}</div>
                                <div className="label" style={{ fontSize: '0.7rem', wordBreak: 'break-word' }}>
                                    {t('dashboard.offered')}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <Card className="dashboard-card text-center">
                            <Card.Body className="p-2 p-md-3">
                                <div className="icon text-danger">
                                    <FaTimesCircle size={24} />
                                </div>
                                <div className="number" style={{ fontSize: '1.5rem' }}>{stats.rejected}</div>
                                <div className="label" style={{ fontSize: '0.7rem', wordBreak: 'break-word' }}>
                                    {t('dashboard.rejected')}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row className="mb-4">
                    <Col>
                        <Card className="bg-primary text-white">
                            <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center">
                                <div className="mb-2 mb-sm-0">
                                    <h5 className="mb-1">{t('dashboard.opportunities')}</h5>
                                    <p className="mb-0 opacity-75">{t('dashboard.opportunities_desc')}</p>
                                </div>
                                <Button as={Link} to="/jobs" variant="light" className="fw-bold">
                                    {t('dashboard.browse_jobs')} →
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Recent Applications */}
                <Card className="shadow-sm">
                    <Card.Header className="bg-white d-flex flex-wrap justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold">{t('dashboard.recent_applications')}</h5>
                        <span className="text-muted small">{applications.length} {t('dashboard.total')}</span>
                    </Card.Header>
                    <Card.Body>
                        {applications.length === 0 ? (
                            <div className="text-center py-4">
                                <div className="mb-3" style={{ fontSize: '3rem' }}>📭</div>
                                <h6>{t('dashboard.no_applications')}</h6>
                                <p className="text-muted">{t('dashboard.no_applications_desc')}</p>
                                <Button as={Link} to="/jobs" variant="primary-gradient">
                                    {t('dashboard.browse_jobs')}
                                </Button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover>
                                    <thead>
                                        <tr>
                                            <th>{t('jobs.title')}</th>
                                            <th>{t('apply.department')}</th>
                                            <th>{t('apply.deadline')}</th>
                                            <th>{t('common.status')}</th>
                                            <th>{t('apply.ai_match')}</th>
                                            <th>Interview</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.slice(0, 10).map((app) => (
                                            <tr key={app._id}>
                                                <td className="fw-semibold">{app.job?.title || 'N/A'}</td>
                                                <td>{app.job?.department || 'SITA'}</td>
                                                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <Badge bg={getStatusBadge(app.status)}>
                                                        {getStatusLabel(app.status)}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {app.matchScore ? (
                                                        <span className={`match-score match-${app.matchScore >= 70 ? 'high' : app.matchScore >= 40 ? 'medium' : 'low'}`}>
                                                            {app.matchScore}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {(app.status === 'interviewed' || app.status === 'shortlisted' || app.status === 'offered') ? (
                                                        <Button 
                                                            variant="outline-primary" 
                                                            size="sm"
                                                            onClick={() => handleViewInterview(app)}
                                                        >
                                                            <FaEnvelope className="me-1" /> View Interview
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted small">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Profile Completion */}
                <Card className="shadow-sm mt-4">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md={8}>
                                <h6 className="fw-bold">{t('dashboard.complete_profile')}</h6>
                                <p className="text-muted small mb-0">
                                    {t('dashboard.complete_profile_desc')}
                                </p>
                            </Col>
                            <Col md={4} className="text-md-end mt-2 mt-md-0">
                                <Button as={Link} to="/jobseeker/profile" variant="outline-primary-custom" size="sm">
                                    {t('dashboard.update_profile')}
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>

            {/* Interview Details Modal */}
            <Modal show={showInterviewModal} onHide={() => setShowInterviewModal(false)} size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>
                        <FaEnvelope className="me-2" /> Interview Invitation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedApplication && (
                        <>
                            <div className="text-center mb-4">
                                <div style={{ fontSize: '3rem' }}>📧</div>
                                <h4 className="mt-2">You have been invited for an interview!</h4>
                                <p className="text-muted">for the position of <strong>{selectedApplication.job?.title}</strong></p>
                            </div>

                            <hr />

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="p-3 border rounded bg-light">
                                        <div className="d-flex align-items-center">
                                            <FaCalendar className="text-primary me-2" size={20} />
                                            <div>
                                                <div className="small text-muted">Interview Date & Time</div>
                                                <div className="fw-semibold">{formatDate(selectedApplication.interviewDate)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 border rounded bg-light">
                                        <div className="d-flex align-items-center">
                                            <FaMapMarkerAlt className="text-danger me-2" size={20} />
                                            <div>
                                                <div className="small text-muted">Location</div>
                                                <div className="fw-semibold">{selectedApplication.interviewLocation || 'To be confirmed'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interview Notes */}
                            {selectedApplication.statusHistory?.length > 0 && (
                                <div className="mt-3">
                                    <h6 className="fw-bold">
                                        <FaInfoCircle className="me-2 text-primary" />
                                        Additional Notes
                                    </h6>
                                    <div className="p-3 border rounded bg-light">
                                        {selectedApplication.statusHistory
                                            .filter(h => h.status === 'interviewed' || h.status === 'shortlisted' || h.status === 'offered')
                                            .map((history, idx) => (
                                                <div key={idx} className="mb-2">
                                                    <p className="mb-0">{history.note || 'No additional notes provided'}</p>
                                                    <small className="text-muted">
                                                        Sent on: {new Date(history.date).toLocaleDateString()}
                                                    </small>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Timeline */}
                            <div className="mt-4">
                                <h6 className="fw-bold">Application Timeline</h6>
                                <div className="p-3 border rounded bg-light">
                                    {selectedApplication.statusHistory?.map((history, idx) => (
                                        <div key={idx} className="d-flex align-items-start mb-2">
                                            <Badge 
                                                bg={
                                                    history.status === 'pending' ? 'warning' :
                                                    history.status === 'shortlisted' ? 'success' :
                                                    history.status === 'interviewed' ? 'info' :
                                                    history.status === 'offered' ? 'success' :
                                                    history.status === 'rejected' ? 'danger' :
                                                    'secondary'
                                                }
                                                className="me-2 mt-1"
                                            >
                                                {history.status?.toUpperCase()}
                                            </Badge>
                                            <div>
                                                <div className="small">{history.note || 'Status updated'}</div>
                                                <div className="text-muted small">
                                                    {new Date(history.date).toLocaleDateString()} at {new Date(history.date).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-center mt-4">
                                <p className="text-muted small">
                                    Please confirm your availability by replying to this invitation.
                                </p>
                                <Button 
                                    variant="primary-gradient" 
                                    onClick={() => {
                                        const subject = `Interview Confirmation: ${selectedApplication.job?.title}`;
                                        const body = `Dear Hiring Team,\n\nI confirm my availability for the interview on ${formatDate(selectedApplication.interviewDate)}.\n\nThank you.`;
                                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                    }}
                                >
                                    <FaEnvelope className="me-2" />
                                    Confirm via Email
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowInterviewModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </section>
    );
};

export default Dashboard;