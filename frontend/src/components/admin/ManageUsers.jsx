import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'jobseeker',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // This endpoint doesn't exist yet - you need to add it
            // For now, we'll use mock data
            setUsers([
                { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'jobseeker', createdAt: new Date() },
                { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'employer', createdAt: new Date() },
                { _id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: new Date() }
            ]);
        } catch (error) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update user endpoint needed
            toast.success('User updated successfully');
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            // Delete user endpoint needed
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const getRoleBadge = (role) => {
        const roleMap = {
            jobseeker: 'primary',
            employer: 'success',
            admin: 'danger'
        };
        return roleMap[role] || 'secondary';
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading users...</p>
            </Container>
        );
    }

    return (
        <section className="manage-users py-4">
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-0">Manage Users</h2>
                        <p className="text-muted">View and manage all platform users</p>
                    </div>
                    <Button variant="primary-gradient" onClick={() => {
                        setEditingUser(null);
                        setFormData({ name: '', email: '', role: 'jobseeker', password: '' });
                        setShowModal(true);
                    }}>
                        <FaUserPlus className="me-2" /> Add User
                    </Button>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Card className="shadow-sm">
                    <Card.Body className="p-0">
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="fw-semibold">{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <Badge bg={getRoleBadge(user.role)}>
                                                {user.role?.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="text-muted small">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-1">
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => handleEdit(user)}
                                                    title="Edit User"
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(user._id)}
                                                    title="Delete User"
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {/* Add/Edit User Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Role</Form.Label>
                                <Form.Select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="jobseeker">Job Seeker</option>
                                    <option value="employer">Employer</option>
                                    <option value="admin">Admin</option>
                                </Form.Select>
                            </Form.Group>
                            {!editingUser && (
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter password"
                                        required={!editingUser}
                                        minLength={6}
                                    />
                                </Form.Group>
                            )}
                            <div className="d-flex gap-2">
                                <Button type="submit" variant="primary-gradient">
                                    {editingUser ? 'Update User' : 'Create User'}
                                </Button>
                                <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </section>
    );
};

export default ManageUsers;