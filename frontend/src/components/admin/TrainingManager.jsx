import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaCalendar, FaUser } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import BackButton from '../common/BackButton';

const TrainingManager = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [trainings, setTrainings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'technical',
        description: '',
        duration: 1,
        durationUnit: 'days',
        startDate: '',
        endDate: '',
        provider: '',
        trainer: '',
        location: '',
        maxParticipants: 20
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        try {
            const response = await api.get('/training');
            setTrainings(response.data.data || []);
        } catch (error) {
            console.error('Error fetching trainings:', error);
            setError('Failed to load training programs');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/training', formData);
            setTrainings([response.data.data, ...trainings]);
            toast.success('Training program created successfully!');
            setShowModal(false);
            setFormData({
                title: '',
                type: 'technical',
                description: '',
                duration: 1,
                durationUnit: 'days',
                startDate: '',
                endDate: '',
                provider: '',
                trainer: '',
                location: '',
                maxParticipants: 20
            });
        } catch (error) {
            toast.error('Failed to create training program');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            draft: 'secondary',
            open: 'info',
            in_progress: 'warning',
            completed: 'success',
            cancelled: 'danger'
        };
        return map[status] || 'secondary';
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading training programs...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <BackButton to="/admin/dashboard" />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-0">📚 {t('admin.training_management')}</h2>
                    <p className="text-muted">{t('admin.manage_training')}</p>
                </div>
                <Button variant="primary-gradient" onClick={() => setShowModal(true)}>
                    <FaPlus className="me-2" /> {t('admin.create_training')}
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                {trainings.map((training) => (
                    <Col md={4} key={training._id} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <h5 className="fw-bold">{training.title}</h5>
                                    <Badge bg={getStatusBadge(training.status)}>
                                        {training.status}
                                    </Badge>
                                </div>
                                <p className="text-muted small">{training.type}</p>
                                <p className="small">{training.description?.substring(0, 100)}...</p>
                                <div className="d-flex justify-content-between mt-3">
                                    <small className="text-muted">
                                        <FaCalendar className="me-1" />
                                        {new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}
                                    </small>
                                    <small className="text-muted">
                                        <FaUser className="me-1" />
                                        {training.participants?.length || 0}/{training.maxParticipants}
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                {trainings.length === 0 && (
                    <Col md={12}>
                        <div className="text-center py-5">
                            <h5>{t('admin.no_training')}</h5>
                            <p className="text-muted">{t('admin.create_first')}</p>
                        </div>
                    </Col>
                )}
            </Row>

            {/* Create Training Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Create Training Program</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title *</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type *</Form.Label>
                                    <Form.Select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="technical">Technical</option>
                                        <option value="soft_skills">Soft Skills</option>
                                        <option value="leadership">Leadership</option>
                                        <option value="compliance">Compliance</option>
                                        <option value="other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Button type="submit" variant="primary-gradient" className="w-100">
                                    Create Training
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default TrainingManager;