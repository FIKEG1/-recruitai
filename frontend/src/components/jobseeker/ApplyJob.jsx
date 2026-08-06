import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaCheckCircle, FaStar, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ApplyJob = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [job, setJob] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [matchScore, setMatchScore] = useState(null);
    const [matchDetails, setMatchDetails] = useState(null);

    useEffect(() => {
        fetchJobAndResumes();
    }, [jobId]);

    const fetchJobAndResumes = async () => {
        try {
            const [jobRes, resumeRes] = await Promise.all([
                api.get(`/jobs/${jobId}`),
                api.get('/resumes')
            ]);
            setJob(jobRes.data.job);
            setResumes(resumeRes.data.resumes || []);
            if (resumeRes.data.resumes?.length > 0) {
                const defaultResume = resumeRes.data.resumes.find(r => r.isDefault);
                setSelectedResume(defaultResume?._id || resumeRes.data.resumes[0]._id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load job details or resumes');
        } finally {
            setLoading(false);
        }
    };

    const calculateMatchScore = (job, resume) => {
        // Calculate match score based on job requirements and user profile
        let score = 0;
        let details = { skills: 0, education: 0, experience: 0 };

        // 1. Skills matching (40% weight)
        const jobSkills = job?.requirements?.skills || [];
        const userSkills = user?.profile?.skills || [];
        
        if (jobSkills.length > 0 && userSkills.length > 0) {
            const matchingSkills = jobSkills.filter(skill => 
                userSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()) || 
                                      skill.toLowerCase().includes(us.toLowerCase()))
            );
            details.skills = Math.round((matchingSkills.length / jobSkills.length) * 100);
            score += details.skills * 0.4;
        } else if (jobSkills.length === 0) {
            details.skills = 100;
            score += 40;
        }

        // 2. Education matching (25% weight)
        const jobEducation = job?.requirements?.education || '';
        const userEducation = user?.profile?.education || [];
        
        if (jobEducation && userEducation.length > 0) {
            let eduScore = 0;
            const jobEduLower = jobEducation.toLowerCase();
            for (const edu of userEducation) {
                const eduStr = `${edu.degree || ''} ${edu.field || ''} ${edu.institution || ''}`.toLowerCase();
                if (eduStr.includes(jobEduLower) || jobEduLower.includes(eduStr)) {
                    eduScore = 100;
                    break;
                }
            }
            details.education = eduScore;
            score += eduScore * 0.25;
        } else if (!jobEducation) {
            details.education = 100;
            score += 25;
        }

        // 3. Experience matching (25% weight)
        const jobExperience = job?.requirements?.experience || '';
        const userExperience = user?.profile?.workExperience || [];
        
        if (jobExperience && userExperience.length > 0) {
            let expScore = 50;
            const yearsMatch = jobExperience.match(/(\d+)/);
            if (yearsMatch) {
                const requiredYears = parseInt(yearsMatch[1]);
                let totalYears = userExperience.length * 1.5;
                expScore = Math.min(Math.round((totalYears / requiredYears) * 100), 100);
            }
            details.experience = expScore;
            score += expScore * 0.25;
        } else if (!jobExperience) {
            details.experience = 100;
            score += 25;
        }

        // 4. Location matching (10% weight)
        const jobLocation = job?.location || '';
        const userLocation = user?.profile?.location || '';
        
        if (jobLocation && userLocation) {
            const locScore = jobLocation.toLowerCase().includes(userLocation.toLowerCase()) ||
                           userLocation.toLowerCase().includes(jobLocation.toLowerCase()) ? 100 : 50;
            details.location = locScore;
            score += locScore * 0.1;
        } else {
            details.location = 50;
            score += 5;
        }

        return {
            overall: Math.round(score),
            details: details
        };
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF and DOCX files are allowed');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setUploading(true);
        try {
            const response = await api.post('/resumes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newResume = response.data.resume;
            setResumes([newResume, ...resumes]);
            setSelectedResume(newResume._id);
            toast.success('Resume uploaded successfully!');
            
            // Refresh resumes list
            const resumeRes = await api.get('/resumes');
            setResumes(resumeRes.data.resumes || []);
            if (resumeRes.data.resumes?.length > 0) {
                const defaultResume = resumeRes.data.resumes.find(r => r.isDefault);
                setSelectedResume(defaultResume?._id || resumeRes.data.resumes[0]._id);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload resume');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedResume) {
            setError('Please select a resume or upload one');
            return;
        }
        setSubmitting(true);
        setError('');

        try {
            // Calculate match score before submitting
            const matchResult = calculateMatchScore(job, null);
            setMatchScore(matchResult.overall);
            setMatchDetails(matchResult.details);

            await api.post('/applications', {
                jobId,
                resumeId: selectedResume,
                coverLetter,
                matchScore: matchResult.overall
            });
            setSuccess(true);
            toast.success('Application submitted successfully!');
            setTimeout(() => navigate('/jobseeker/dashboard'), 3000);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to submit application';
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'success';
        if (score >= 40) return 'warning';
        return 'danger';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent Match!';
        if (score >= 60) return 'Good Match';
        if (score >= 40) return 'Fair Match';
        return 'Low Match';
    };

    // Calculate match score when component loads or resume changes
    useEffect(() => {
        if (job && user) {
            const result = calculateMatchScore(job, null);
            setMatchScore(result.overall);
            setMatchDetails(result.details);
        }
    }, [job, user]);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading job details...</p>
            </Container>
        );
    }

    if (!job) {
        return (
            <Container className="py-5 text-center">
                <h4>Job not found</h4>
                <Link to="/jobs" className="text-decoration-none">Back to jobs</Link>
            </Container>
        );
    }

    if (success) {
        return (
            <Container className="py-5">
                <Card className="text-center py-5">
                    <Card.Body>
                        <div style={{ fontSize: '4rem' }} className="mb-3">✅</div>
                        <h4 className="fw-bold">Application Submitted!</h4>
                        <p className="text-muted">Your application for <strong>{job.title}</strong> has been submitted successfully.</p>
                        
                        {/* Show match score on success */}
                        {matchScore && (
                            <div className="mt-3 p-3 bg-light rounded">
                                <h6 className="fw-bold">🤖 AI Match Score</h6>
                                <div className={`display-4 fw-bold text-${getScoreColor(matchScore)}`}>
                                    {matchScore}%
                                </div>
                                <p className="text-muted">{getScoreLabel(matchScore)}</p>
                            </div>
                        )}
                        
                        <p className="text-muted mt-3">You will be notified about the status of your application.</p>
                        <Button as={Link} to="/jobseeker/dashboard" variant="primary-gradient" className="mt-3">
                            Go to Dashboard
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <section className="apply-section py-4">
            <Container>
                <Button 
                    variant="link" 
                    className="text-decoration-none mb-3 d-inline-flex align-items-center gap-2"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft /> Back
                </Button>

                <Row>
                    <Col lg={8} className="mx-auto">
                        <Card className="shadow-sm">
                            <Card.Body className="p-4 p-md-5">
                                <h3 className="fw-bold mb-4">Apply for {job.title}</h3>
                                
                                {/* Job Summary */}
                                <Card className="bg-light mb-4">
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <div className="small text-muted">Department</div>
                                                <div className="fw-semibold">{job.department}</div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="small text-muted">Employment Type</div>
                                                <div className="fw-semibold">{job.employmentType}</div>
                                            </Col>
                                            <Col md={6} className="mt-2">
                                                <div className="small text-muted">Location</div>
                                                <div className="fw-semibold">{job.location}</div>
                                            </Col>
                                            <Col md={6} className="mt-2">
                                                <div className="small text-muted">Deadline</div>
                                                <div className="fw-semibold">{new Date(job.applicationDeadline).toLocaleDateString()}</div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* AI Match Score Card */}
                                {matchScore !== null && (
                                    <Card className={`mb-4 border-${getScoreColor(matchScore)}`}>
                                        <Card.Body>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <h6 className="fw-bold mb-1">
                                                        <FaChartLine className="me-2 text-primary" />
                                                        AI Match Score
                                                    </h6>
                                                    <p className="text-muted small mb-0">
                                                        How well your profile matches this job
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <div className={`match-score-circle ${getScoreColor(matchScore)}`}>
                                                        {matchScore}%
                                                    </div>
                                                    <small className={`text-${getScoreColor(matchScore)} d-block`}>
                                                        {getScoreLabel(matchScore)}
                                                    </small>
                                                </div>
                                            </div>
                                            {matchDetails && (
                                                <div className="mt-3">
                                                    <Row className="text-center">
                                                        <Col xs={4}>
                                                            <div className="small text-muted">Skills</div>
                                                            <div className="fw-bold">{matchDetails.skills || 0}%</div>
                                                        </Col>
                                                        <Col xs={4}>
                                                            <div className="small text-muted">Education</div>
                                                            <div className="fw-bold">{matchDetails.education || 0}%</div>
                                                        </Col>
                                                        <Col xs={4}>
                                                            <div className="small text-muted">Experience</div>
                                                            <div className="fw-bold">{matchDetails.experience || 0}%</div>
                                                        </Col>
                                                    </Row>
                                                    <div className="progress mt-2" style={{ height: '8px' }}>
                                                        <div 
                                                            className={`progress-bar bg-${getScoreColor(matchScore)}`} 
                                                            style={{ width: `${matchScore}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                )}

                                {error && (
                                    <Alert variant="danger" className="mb-3">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">
                                            Select Resume <span className="text-danger">*</span>
                                        </Form.Label>
                                        
                                        {/* Upload Resume Section */}
                                        <div className="mb-3 p-3 border rounded bg-light">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="flex-grow-1">
                                                    <Form.Control
                                                        type="file"
                                                        accept=".pdf,.docx"
                                                        onChange={handleResumeUpload}
                                                        disabled={uploading}
                                                        className="form-control-custom"
                                                        size="sm"
                                                    />
                                                    <small className="text-muted">Supported: PDF, DOCX (Max 5MB)</small>
                                                </div>
                                                {uploading && (
                                                    <div>
                                                        <Spinner animation="border" size="sm" />
                                                        <span className="ms-2">Uploading...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Resume List */}
                                        {resumes.length === 0 ? (
                                            <div className="text-center py-3 border rounded bg-light">
                                                <p className="mb-2 text-muted">No resumes uploaded yet</p>
                                                <p className="text-muted small">Upload a resume using the button above</p>
                                            </div>
                                        ) : (
                                            <div className="resume-selector">
                                                {resumes.map((resume) => (
                                                    <div key={resume._id} className="resume-option mb-2 p-2 border rounded">
                                                        <Form.Check
                                                            type="radio"
                                                            name="resume"
                                                            value={resume._id}
                                                            id={`resume-${resume._id}`}
                                                            checked={selectedResume === resume._id}
                                                            onChange={() => setSelectedResume(resume._id)}
                                                            label={
                                                                <span>
                                                                    <strong>{resume.fileName}</strong>
                                                                    {resume.isDefault && (
                                                                        <span className="badge bg-success ms-2">Default</span>
                                                                    )}
                                                                    <br />
                                                                    <span className="text-muted small">
                                                                        Uploaded: {new Date(resume.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </span>
                                                            }
                                                            className="resume-radio"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">Cover Letter</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={6}
                                            placeholder="Write a brief cover letter explaining why you're a good fit for this position..."
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            className="form-control-custom"
                                        />
                                    </Form.Group>

                                    <div className="d-flex gap-3">
                                        <Button
                                            type="submit"
                                            variant="primary-gradient"
                                            className="flex-grow-1"
                                            disabled={submitting || resumes.length === 0}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheckCircle className="me-2" />
                                                    Submit Application
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => navigate(-1)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                    {resumes.length === 0 && (
                                        <p className="text-danger small mt-2">Please upload a resume before applying</p>
                                    )}
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default ApplyJob;