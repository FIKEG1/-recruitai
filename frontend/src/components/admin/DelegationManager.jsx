import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';  // ← ADD Row and Col
import { FaPlus, FaCheck, FaTimes, FaUser, FaCalendar } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const DelegationManager = () => {
    const [loading, setLoading] = useState(true);
    const [delegations, setDelegations] = useState([]);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        delegate: '',
        type: 'task',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        permissions: ['view']
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDelegations();
        fetchUsers();
    }, []);

    const fetchDelegations = async () => {
        try {
            const response = await api.get('/delegations');
            setDelegations(response.data.data || []);
        } catch (error) {
            console.error('Error fetching delegations:', error);
            setError('Failed to load delegations');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/delegations', formData);
            setDelegations([response.data.data, ...delegations]);
            toast.success('Delegation created successfully!');
            setShowModal(false);
            setFormData({
                delegate: '',
                type: 'task',
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                permissions: ['view']
            });
        } catch (error) {
            toast.error('Failed to create delegation');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/delegations/${id}/status`, { status });
            toast.success(`Delegation ${status} successfully!`);
            fetchDelegations();
        } catch (error) {
            toast.error('Failed to update delegation');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: 'warning',
            active: 'success',
            completed: 'info',
            revoked: 'danger'
        };
        return map[status] || 'secondary';
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading delegations...</p>
            </Container>
        );
    }

    return (
        <AdminLayout title="🔄 Delegation Management">
            <Container fluid>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <p className="text-muted">Manage task and authority delegations</p>
                    </div>
                    <Button variant="primary-gradient" onClick={() => setShowModal(true)}>
                        <FaPlus className="me-2" /> Create Delegation
                    </Button>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Card className="shadow-sm">
                    <Card.Body>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Delegator</th>
                                    <th>Delegate</th>
                                    <th>Type</th>
                                    <th>Dates</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {delegations.map((delegation) => (
                                    <tr key={delegation._id}>
                                        <td className="fw-semibold">{delegation.title}</td>
                                        <td>{delegation.delegator?.name || 'N/A'}</td>
                                        <td>{delegation.delegate?.name || 'N/A'}</td>
                                        <td><Badge bg="secondary">{delegation.type}</Badge></td>
                                        <td>
                                            {new Date(delegation.startDate).toLocaleDateString()} - {new Date(delegation.endDate).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <Badge bg={getStatusBadge(delegation.status)}>
                                                {delegation.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            {delegation.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="me-1"
                                                        onClick={() => handleStatusUpdate(delegation._id, 'active')}
                                                    >
                                                        <FaCheck /> Activate
                                                    </Button>
                                                </>
                                            )}
                                            {delegation.status === 'active' && (
                                                <>
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        className="me-1"
                                                        onClick={() => handleStatusUpdate(delegation._id, 'completed')}
                                                    >
                                                        <FaCheck /> Complete
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(delegation._id, 'revoked')}
                                                    >
                                                        <FaTimes /> Revoke
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {delegations.length === 0 && (
                                    <tr><td colSpan="7" className="text-center text-muted">No delegations found</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {/* Create Delegation Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Create Delegation</Modal.Title>
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
                                            <option value="task">Task</option>
                                            <option value="authority">Authority</option>
                                            <option value="approval">Approval</option>
                                            <option value="project">Project</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Delegate *</Form.Label>
                                        <Form.Select
                                            required
                                            value={formData.delegate}
                                            onChange={(e) => setFormData({ ...formData, delegate: e.target.value })}
                                        >
                                            <option value="">Select user...</option>
                                            {users.map((user) => (
                                                <option key={user._id} value={user._id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Permissions</Form.Label>
                                        <Form.Select
                                            multiple
                                            value={formData.permissions}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                setFormData({ ...formData, permissions: selected });
                                            }}
                                        >
                                            <option value="view">View</option>
                                            <option value="edit">Edit</option>
                                            <option value="create">Create</option>
                                            <option value="delete">Delete</option>
                                            <option value="approve">Approve</option>
                                        </Form.Select>
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
                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Button type="submit" variant="primary-gradient" className="w-100">
                                        Create Delegation
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </AdminLayout>
    );
};

export default DelegationManager;