import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FaCheck, FaTimes, FaClock, FaCalendar } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import BackButton from '../common/BackButton';

const LeaveManager = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [actionNote, setActionNote] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get('/leaves');
            setLeaves(response.data.data || []);
        } catch (error) {
            console.error('Error fetching leaves:', error);
            setError('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/leaves/${id}/status`, { status, rejectionReason: actionNote });
            toast.success(`Leave ${status} successfully!`);
            fetchLeaves();
            setShowModal(false);
            setSelectedLeave(null);
            setActionNote('');
        } catch (error) {
            toast.error('Failed to update leave status');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger',
            cancelled: 'secondary'
        };
        return map[status] || 'secondary';
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading leave requests...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <BackButton to="/admin/dashboard" />
            <h2 className="fw-bold mb-4">📋 {t('admin.leave_management')}</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Dates</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => (
                                <tr key={leave._id}>
                                    <td>{leave.employee?.user?.name || 'N/A'}</td>
                                    <td>{leave.leaveTypeName}</td>
                                    <td>
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </td>
                                    <td><Badge bg="primary">{leave.totalDays}</Badge></td>
                                    <td>{leave.reason}</td>
                                    <td>
                                        <Badge bg={getStatusBadge(leave.status)}>
                                            {leave.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        {leave.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => {
                                                        setSelectedLeave(leave);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    <FaCheck />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (window.confirm('Reject this leave request?')) {
                                                            handleStatusUpdate(leave._id, 'rejected');
                                                        }
                                                    }}
                                                >
                                                    <FaTimes />
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {leaves.length === 0 && (
                                <tr><td colSpan="7" className="text-center text-muted">No leave requests</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Approve Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Approve Leave Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Employee:</strong> {selectedLeave?.employee?.user?.name}</p>
                    <p><strong>Type:</strong> {selectedLeave?.leaveTypeName}</p>
                    <p><strong>Days:</strong> {selectedLeave?.totalDays}</p>
                    <Form.Group>
                        <Form.Label>Note (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={actionNote}
                            onChange={(e) => setActionNote(e.target.value)}
                            placeholder="Add approval note..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={() => handleStatusUpdate(selectedLeave?._id, 'approved')}>
                        <FaCheck className="me-2" /> Approve
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default LeaveManager;