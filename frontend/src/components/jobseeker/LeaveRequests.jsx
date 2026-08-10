import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FaCalendarAlt, FaPlus, FaEye, FaPaperPlane, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import BackButton from '../common/BackButton';

const LeaveRequests = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        totalDays: 1
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const response = await api.get('/leaves/me');
            setLeaves(response.data.data || []);
            setError('');
        } catch (error) {
            console.error('Error fetching leaves:', error);
            setError('Failed to load leave requests');
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const calculateDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleDateChange = (field, value) => {
        const updated = { ...formData, [field]: value };
        if (updated.startDate && updated.endDate) {
            updated.totalDays = calculateDays(updated.startDate, updated.endDate);
        }
        setFormData(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/leaves', formData);
            toast.success('Leave request submitted successfully!');
            setFormData({ leaveType: '', startDate: '', endDate: '', reason: '', totalDays: 1 });
            setShowForm(false);
            fetchLeaves();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { bg: 'warning', text: 'Pending' },
            approved: { bg: 'success', text: 'Approved' },
            rejected: { bg: 'danger', text: 'Rejected' },
            cancelled: { bg: 'secondary', text: 'Cancelled' }
        };
        const { bg, text } = config[status] || config.pending;
        return <Badge bg={bg}>{text}</Badge>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" />
                    <p className="mt-3">Loading leave requests...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <BackButton to="/jobseeker/dashboard" />
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold mb-1">{t('leave.title')}</h2>
                    <p className="text-muted">{t('leave.subtitle')}</p>
                </Col>
                <Col xs="auto">
                    <Button 
                        variant="primary" 
                        onClick={() => setShowForm(!showForm)}
                        className="d-flex align-items-center gap-2"
                    >
                        {showForm ? <FaEye /> : <FaPlus />}
                        {showForm ? t('leave.view_requests') : t('leave.new_request')}
                    </Button>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {showForm ? (
                <Card className="mb-4 shadow-sm">
                    <h2 className="fw-bold mb-4">
                        <FaCalendarAlt className="me-2 text-primary" /> {t('leave.title')}
                    </h2>
                    <Card.Header className="bg-white fw-bold">
                        {t('leave.new_request')}
                    </Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('leave.leave_type')} *</Form.Label>
                                        <Form.Select
                                            value={formData.leaveType}
                                            onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                                            required
                                        >
                                            <option value="">Select leave type</option>
                                            <option value="annual">Annual Leave</option>
                                            <option value="sick">Sick Leave</option>
                                            <option value="personal">Personal Leave</option>
                                            <option value="maternity">Maternity Leave</option>
                                            <option value="paternity">Paternity Leave</option>
                                            <option value="unpaid">Unpaid Leave</option>
                                            <option value="other">Other</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Total Days</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.totalDays}
                                            readOnly
                                            className="bg-light"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Start Date *</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>End Date *</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                                            required
                                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Reason *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    required
                                    placeholder="Provide reason for your leave request"
                                />
                            </Form.Group>
                            <div className="d-flex gap-2">
                                <Button 
                                    type="submit" 
                                    variant="primary"
                                    disabled={submitting}
                                    className="d-flex align-items-center gap-2"
                                >
                                    {submitting ? <Spinner size="sm" /> : <FaPaperPlane />}
                                    Submit Request
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="shadow-sm">
                    <Card.Header className="bg-white fw-bold">
                        My Leave Requests
                    </Card.Header>
                    <Card.Body className="p-0">
                        {leaves.length === 0 ? (
                            <div className="text-center p-4">
                                <FaCalendarAlt className="text-muted mb-3" size={48} />
                                <p className="text-muted">No leave requests submitted yet</p>
                                <Button variant="primary" onClick={() => setShowForm(true)}>
                                    Submit Your First Request
                                </Button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Leave Type</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Days</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaves.map((leave) => (
                                            <tr key={leave._id}>
                                                <td className="text-capitalize fw-semibold">{leave.leaveType}</td>
                                                <td>{formatDate(leave.startDate)}</td>
                                                <td>{formatDate(leave.endDate)}</td>
                                                <td>
                                                    <FaClock className="me-1 text-muted" />
                                                    {leave.totalDays || '-'}
                                                </td>
                                                <td>{getStatusBadge(leave.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default LeaveRequests;
