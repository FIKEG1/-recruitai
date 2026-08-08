import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaSearch, FaClock } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ComplaintManager = () => {
    const [loading, setLoading] = useState(true);
    const [complaints, setComplaints] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolution, setResolution] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/complaints');
            setComplaints(response.data.data || []);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setError('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/complaints/${id}/status`, { 
                status: newStatus,
                resolution: resolution || 'Resolved by admin'
            });
            toast.success(`Complaint ${newStatus} successfully!`);
            fetchComplaints();
            setShowModal(false);
            setSelectedComplaint(null);
            setResolution('');
        } catch (error) {
            toast.error('Failed to update complaint');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: 'warning',
            investigating: 'info',
            resolved: 'success',
            rejected: 'danger'
        };
        return map[status] || 'secondary';
    };

    const getPriorityBadge = (priority) => {
        const map = {
            low: 'secondary',
            medium: 'info',
            high: 'warning',
            urgent: 'danger'
        };
        return map[priority] || 'secondary';
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading complaints...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="fw-bold mb-4">📋 Complaint Management</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map((complaint) => (
                                <tr key={complaint._id}>
                                    <td>{complaint.employee?.user?.name || 'N/A'}</td>
                                    <td>{complaint.title}</td>
                                    <td>{complaint.type}</td>
                                    <td>
                                        <Badge bg={getPriorityBadge(complaint.priority)}>
                                            {complaint.priority}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={getStatusBadge(complaint.status)}>
                                            {complaint.status}
                                        </Badge>
                                    </td>
                                    <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {complaint.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => {
                                                        setSelectedComplaint(complaint);
                                                        setStatus('investigating');
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    <FaSearch /> Investigate
                                                </Button>
                                            </>
                                        )}
                                        {complaint.status === 'investigating' && (
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="me-1"
                                                onClick={() => {
                                                    setSelectedComplaint(complaint);
                                                    setStatus('resolved');
                                                    setShowModal(true);
                                                }}
                                            >
                                                <FaCheck /> Resolve
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            className="me-1"
                                            onClick={() => {
                                                setSelectedComplaint(complaint);
                                                // View details
                                            }}
                                        >
                                            <FaEye />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {complaints.length === 0 && (
                                <tr><td colSpan="7" className="text-center text-muted">No complaints found</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Action Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {status === 'investigating' ? 'Start Investigation' : 
                         status === 'resolved' ? 'Resolve Complaint' : 'Update Complaint'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Employee:</strong> {selectedComplaint?.employee?.user?.name}</p>
                    <p><strong>Title:</strong> {selectedComplaint?.title}</p>
                    <p><strong>Description:</strong> {selectedComplaint?.description}</p>
                    <Form.Group>
                        <Form.Label>Resolution / Note</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Add resolution details..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button 
                        variant={status === 'investigating' ? 'info' : 'success'}
                        onClick={() => handleStatusUpdate(selectedComplaint?._id, status)}
                    >
                        {status === 'investigating' ? 'Start Investigation' : 'Resolve Complaint'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ComplaintManager;