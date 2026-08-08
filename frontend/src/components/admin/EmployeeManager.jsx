import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUser, FaBriefcase, FaPhone, FaEnvelope, FaCalendar, FaSave, FaTimes, FaUserPlus } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const EmployeeManager = () => {
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        personalInfo: { firstName: '', lastName: '', dateOfBirth: '', gender: 'male' },
        contactInfo: { phone: '', email: '', address: { city: '' } },
        employmentInfo: { department: '', position: '', hireDate: '' }
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.get('/employees');
            setEmployees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError('Failed to load employees');
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const employeeData = {
                personalInfo: {
                    firstName: formData.personalInfo.firstName,
                    lastName: formData.personalInfo.lastName,
                    dateOfBirth: formData.personalInfo.dateOfBirth || null,
                    gender: formData.personalInfo.gender || 'male'
                },
                contactInfo: {
                    email: formData.contactInfo.email || '',
                    phone: formData.contactInfo.phone || '',
                    address: {
                        city: formData.contactInfo.address?.city || ''
                    }
                },
                employmentInfo: {
                    department: formData.employmentInfo.department || null,
                    position: formData.employmentInfo.position || null,
                    hireDate: formData.employmentInfo.hireDate || new Date()
                }
            };
            
            const response = await api.post('/employees', employeeData);
            setEmployees([response.data.data, ...employees]);
            toast.success('Employee added successfully!');
            setShowModal(false);
            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error('Add Employee Error:', error);
            const message = error.response?.data?.message || 'Failed to add employee';
            toast.error(message);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/employees/${editingEmployee._id}`, formData);
            toast.success('Employee updated successfully!');
            setShowEditModal(false);
            setEditingEmployee(null);
            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error('Update Employee Error:', error);
            const message = error.response?.data?.message || 'Failed to update employee';
            toast.error(message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await api.delete(`/employees/${id}`);
            toast.success('Employee deleted successfully!');
            fetchEmployees();
        } catch (error) {
            toast.error('Failed to delete employee');
        }
    };

    const handleView = (employee) => {
        setSelectedEmployee(employee);
        setShowViewModal(true);
    };

    const handleEditClick = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            personalInfo: {
                firstName: employee.personalInfo?.firstName || '',
                lastName: employee.personalInfo?.lastName || '',
                dateOfBirth: employee.personalInfo?.dateOfBirth ? new Date(employee.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
                gender: employee.personalInfo?.gender || 'male'
            },
            contactInfo: {
                phone: employee.contactInfo?.phone || '',
                email: employee.contactInfo?.email || '',
                address: {
                    city: employee.contactInfo?.address?.city || ''
                }
            },
            employmentInfo: {
                department: employee.employmentInfo?.department?._id || employee.employmentInfo?.department || '',
                position: employee.employmentInfo?.position?._id || employee.employmentInfo?.position || '',
                hireDate: employee.employmentInfo?.hireDate ? new Date(employee.employmentInfo.hireDate).toISOString().split('T')[0] : ''
            }
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            personalInfo: { firstName: '', lastName: '', dateOfBirth: '', gender: 'male' },
            contactInfo: { phone: '', email: '', address: { city: '' } },
            employmentInfo: { department: '', position: '', hireDate: '' }
        });
    };

    const getStatusBadge = (status) => {
        const map = {
            active: 'success',
            inactive: 'secondary',
            terminated: 'danger',
            on_leave: 'warning'
        };
        return map[status] || 'secondary';
    };

    if (loading) {
        return (
            <AdminLayout title="👥 Employee Management">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading employees...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="👥 Employee Management">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="text-muted">Manage all employees in the organization</p>
                <Button variant="primary-gradient" onClick={() => setShowModal(true)}>
                    <FaPlus className="me-2" /> Add Employee
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>ID</th>
                                    <th>Department</th>
                                    <th>Position</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp._id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="me-2">
                                                    <div style={{
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
                                                    }}>
                                                        {emp.personalInfo?.firstName?.charAt(0) || 'U'}
                                                        {emp.personalInfo?.lastName?.charAt(0) || ''}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">
                                                        {emp.personalInfo?.firstName} {emp.personalInfo?.lastName}
                                                    </div>
                                                    <div className="text-muted small">{emp.contactInfo?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><Badge bg="secondary">{emp.employeeId}</Badge></td>
                                        <td>{emp.employmentInfo?.department?.name || 'N/A'}</td>
                                        <td>{emp.employmentInfo?.position?.title || 'N/A'}</td>
                                        <td>
                                            <Badge bg={getStatusBadge(emp.status)}>
                                                {emp.status || 'active'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button 
                                                variant="outline-info" 
                                                size="sm" 
                                                className="me-1" 
                                                onClick={() => handleView(emp)}
                                                title="View"
                                            >
                                                <FaEye />
                                            </Button>
                                            <Button 
                                                variant="outline-warning" 
                                                size="sm" 
                                                className="me-1" 
                                                onClick={() => handleEditClick(emp)}
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                onClick={() => handleDelete(emp._id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {employees.length === 0 && (
                                    <tr><td colSpan="6" className="text-center text-muted">No employees found</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Add Employee Modal */}
            <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title><FaUserPlus className="me-2" /> Add New Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name *</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.personalInfo.firstName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            personalInfo: { ...formData.personalInfo, firstName: e.target.value }
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name *</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.personalInfo.lastName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            personalInfo: { ...formData.personalInfo, lastName: e.target.value }
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.contactInfo.email}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            contactInfo: { ...formData.contactInfo, email: e.target.value }
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={formData.contactInfo.phone}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            contactInfo: { ...formData.contactInfo, phone: e.target.value }
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Button type="submit" variant="primary-gradient" className="w-100">
                                    <FaSave className="me-2" /> Add Employee
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* View Employee Modal */}
            <Modal show={showViewModal} onHide={() => { setShowViewModal(false); setSelectedEmployee(null); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title><FaUser className="me-2" /> Employee Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEmployee && (
                        <>
                            <Row>
                                <Col md={6}>
                                    <h6 className="fw-bold">Personal Information</h6>
                                    <p><strong>Name:</strong> {selectedEmployee.personalInfo?.firstName} {selectedEmployee.personalInfo?.lastName}</p>
                                    <p><strong>Employee ID:</strong> {selectedEmployee.employeeId}</p>
                                    <p><strong>Gender:</strong> {selectedEmployee.personalInfo?.gender || 'N/A'}</p>
                                    <p><strong>Date of Birth:</strong> {selectedEmployee.personalInfo?.dateOfBirth ? new Date(selectedEmployee.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                </Col>
                                <Col md={6}>
                                    <h6 className="fw-bold">Contact Information</h6>
                                    <p><strong>Email:</strong> {selectedEmployee.contactInfo?.email || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedEmployee.contactInfo?.phone || 'N/A'}</p>
                                    <p><strong>City:</strong> {selectedEmployee.contactInfo?.address?.city || 'N/A'}</p>
                                </Col>
                            </Row>
                            <hr />
                            <Row>
                                <Col md={6}>
                                    <h6 className="fw-bold">Employment Information</h6>
                                    <p><strong>Department:</strong> {selectedEmployee.employmentInfo?.department?.name || 'N/A'}</p>
                                    <p><strong>Position:</strong> {selectedEmployee.employmentInfo?.position?.title || 'N/A'}</p>
                                    <p><strong>Hire Date:</strong> {selectedEmployee.employmentInfo?.hireDate ? new Date(selectedEmployee.employmentInfo.hireDate).toLocaleDateString() : 'N/A'}</p>
                                </Col>
                                <Col md={6}>
                                    <h6 className="fw-bold">Status</h6>
                                    <Badge bg={getStatusBadge(selectedEmployee.status)} size="lg">
                                        {selectedEmployee.status || 'active'}
                                    </Badge>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowViewModal(false); setSelectedEmployee(null); }}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Employee Modal */}
            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setEditingEmployee(null); resetForm(); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title><FaEdit className="me-2" /> Edit Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEdit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name *</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.personalInfo.firstName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            personalInfo: { ...formData.personalInfo, firstName: e.target.value }
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name *</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.personalInfo.lastName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            personalInfo: { ...formData.personalInfo, lastName: e.target.value }
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.contactInfo.email}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            contactInfo: { ...formData.contactInfo, email: e.target.value }
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={formData.contactInfo.phone}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            contactInfo: { ...formData.contactInfo, phone: e.target.value }
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Button type="submit" variant="primary-gradient" className="w-100">
                                    <FaSave className="me-2" /> Update Employee
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </AdminLayout>
    );
};

export default EmployeeManager;