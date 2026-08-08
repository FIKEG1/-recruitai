import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaGraduationCap, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ApplyInternship = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [internship, setInternship] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [academicInfo, setAcademicInfo] = useState({
        fieldOfStudy: user?.profile?.education?.[0]?.field || '',
        university: user?.profile?.education?.[0]?.institution || '',
        yearOfStudy: '',
        gpa: '',
        graduationYear: user?.profile?.education?.[0]?.graduationYear || ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchInternshipAndResumes();
    }, [id]);

    const fetchInternshipAndResumes = async () => {
        try {
            const [internshipRes, resumeRes] = await Promise.all([
                api.get(`/internships/${id}`),
                api.get('/resumes')
            ]);
            const internshipData = internshipRes.data.internship || internshipRes.data;
            setInternship(internshipData);
            setResumes(resumeRes.data.resumes || []);
            if (resumeRes.data.resumes?.length > 0) {
                const defaultResume = resumeRes.data.resumes.find(r => r.isDefault);
                setSelectedResume(defaultResume?._id || resumeRes.data.resumes[0]._id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            const message = error.response?.data?.message || t('internships.load_error');
            setError(message);
            setInternship(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedResume) {
            setError(t('internships.please_select_resume'));
            return;
        }
        setSubmitting(true);
        setError('');

        try {
            await api.post(`/internships/${id}/apply`, {
                resumeId: selectedResume,
                coverLetter,
                academicInfo
            });
            setSuccess(true);
            toast.success('Internship application submitted successfully!');
            setTimeout(() => navigate('/internships'), 2000);
        } catch (error) {
            const msg = error.response?.data?.message || t('internships.submit_error');
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setAcademicInfo({ ...academicInfo, [e.target.name]: e.target.value });
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">{t('internships.loading_details')}</p>
            </Container>
        );
    }

    if (!internship) {
        return (
            <Container className="py-5 text-center">
                <h4>{t('internships.not_found')}</h4>
                {error && <p className="text-danger mt-2">{error}</p>}
                <Link to="/internships" className="text-decoration-none">{t('internships.back_to_internships')}</Link>
            </Container>
        );
    }

    if (success) {
        return (
            <Container className="py-5">
                <Card className="text-center py-5">
                    <Card.Body>
                        <div style={{ fontSize: '4rem' }} className="mb-3">🎉</div>
                        <h4 className="fw-bold">{t('internships.application_submitted_title')}</h4>
                        <p className="text-muted">{t('internships.application_submitted_desc', { title: internship.title })}</p>
                        <p className="text-muted">{t('internships.application_review_desc')}</p>
                        <Button as={Link} to="/internships" variant="primary-gradient" className="mt-3">
                            {t('internships.browse_more_internships')}
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
                    <FaArrowLeft /> {t('common.back')}
                </Button>

                <Row>
                    <Col lg={8} className="mx-auto">
                        <Card className="shadow-sm">
                            <Card.Body className="p-4 p-md-5">
                                <h3 className="fw-bold mb-4">{t('internships.apply_for_title', { title: internship.title })}</h3>
                                
                                {/* Internship Summary */}
                                <Card className="bg-light mb-4">
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <div className="small text-muted">{t('internships.department')}</div>
                                                <div className="fw-semibold">{internship.department}</div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="small text-muted">{t('internships.type')}</div>
                                                <div className="fw-semibold">
                                                    <Badge bg={internship.internshipType === 'Paid' ? 'success' : 'secondary'}>
                                                        {internship.internshipType || 'Unpaid'}
                                                    </Badge>
                                                </div>
                                            </Col>
                                            <Col md={6} className="mt-2">
                                                <div className="small text-muted">{t('internships.duration')}</div>
                                                <div className="fw-semibold">{internship.internshipDuration || t('internships.months_6')}</div>
                                            </Col>
                                            <Col md={6} className="mt-2">
                                                <div className="small text-muted">{t('internships.location')}</div>
                                                <div className="fw-semibold">{internship.location}</div>
                                            </Col>
                                            <Col md={6} className="mt-2">
                                                <div className="small text-muted">{t('internships.positions')}</div>
                                                <div className="fw-semibold">{internship.numberOfPositions || 1}</div>
                                            </Col>
                                            <Col md={6} className="mt-2">
                                                <div className="small text-muted">{t('internships.deadline')}</div>
                                                <div className="fw-semibold">{new Date(internship.applicationDeadline).toLocaleDateString()}</div>
                                            </Col>
                                        </Row>

                                        {/* Academic Requirements */}
                                        {internship.academicRequirements && (
                                            <div className="mt-3 pt-2 border-top">
                                                <small className="text-muted">{t('internships.academic_requirements')}</small>
                                                <div className="d-flex flex-wrap gap-2 mt-1">
                                                    {internship.academicRequirements.fieldOfStudy?.length > 0 && (
                                                        <Badge bg="info">
                                                            <FaGraduationCap className="me-1" />
                                                            {internship.academicRequirements.fieldOfStudy.join(', ')}
                                                        </Badge>
                                                    )}
                                                    {internship.academicRequirements.minimumGPA > 0 && (
                                                        <Badge bg="success">GPA: {internship.academicRequirements.minimumGPA}+</Badge>
                                                    )}
                                                    {internship.academicRequirements.yearOfStudy && (
                                                        <Badge bg="warning" text="dark">
                                                            {internship.academicRequirements.yearOfStudy}
                                                        </Badge>
                                                    )}
                                                    {internship.academicRequirements.university && (
                                                        <Badge bg="secondary">{internship.academicRequirements.university}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Benefits */}
                                        {internship.benefits?.length > 0 && (
                                            <div className="mt-2 pt-2 border-top">
                                                <small className="text-muted">Benefits</small>
                                                <div className="d-flex flex-wrap gap-1 mt-1">
                                                    {internship.benefits.map((benefit, idx) => (
                                                        <Badge key={idx} bg="light" text="dark" className="border">
                                                            {benefit}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>

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
                                        {resumes.length === 0 ? (
                                            <div className="text-center py-3 border rounded bg-light">
                                                <p className="mb-2 text-muted">{t('internships.no_resumes')}</p>
                                                <Button as={Link} to="/jobseeker/profile" variant="primary-gradient" size="sm">
                                                    {t('internships.upload_resume')}
                                                </Button>
                                            </div>
                                        ) : (
                                            resumes.map((resume) => (
                                                <div key={resume._id} className="mb-2 p-2 border rounded">
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
                                                            </span>
                                                        }
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">{t('internships.academic_information')}</Form.Label>
                                        <Row>
                                            <Col md={6} className="mb-2">
                                                <Form.Control
                                                    type="text"
                                                    name="fieldOfStudy"
                                                    placeholder="Field of Study"
                                                    value={academicInfo.fieldOfStudy}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col md={6} className="mb-2">
                                                <Form.Control
                                                    type="text"
                                                    name="university"
                                                    placeholder="University"
                                                    value={academicInfo.university}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                            <Col md={6} className="mb-2">
                                                <Form.Select
                                                    name="yearOfStudy"
                                                    value={academicInfo.yearOfStudy}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Year of Study</option>
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                    <option value="4th Year">4th Year</option>
                                                    <option value="5th Year">5th Year</option>
                                                    <option value="Graduate">Graduate</option>
                                                </Form.Select>
                                            </Col>
                                            <Col md={6} className="mb-2">
                                                <Form.Control
                                                    type="number"
                                                    name="gpa"
                                                    placeholder="GPA (0-4)"
                                                    step="0.01"
                                                    min="0"
                                                    max="4"
                                                    value={academicInfo.gpa}
                                                    onChange={handleChange}
                                                />
                                            </Col>
                                        </Row>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">{t('internships.cover_letter')}</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={6}
                                            placeholder={t('internships.cover_letter_placeholder')}
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            className="form-control-custom"
                                        />
                                        <small className="text-muted">{t('internships.optional_but_recommended')}</small>
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
                                                    {t('internships.submitting')}
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheckCircle className="me-2" />
                                                    {t('internships.submit_application')}
                                                </>
                                            )}
                                        </Button>
                                        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                                            {t('common.cancel')}
                                        </Button>
                                    </div>
                                    {resumes.length === 0 && (
                                        <p className="text-danger small mt-2">{t('internships.upload_resume_before_applying')}</p>
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

export default ApplyInternship;