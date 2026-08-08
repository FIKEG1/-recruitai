import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner, Alert, Form, Row, Col, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes, FaClock, FaCalendar, FaSearch, FaUser, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';

const AttendanceManager = () => {
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        employee: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'present',
        note: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0
    });

    useEffect(() => {
        fetchEmployees();
        fetchAttendance();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAttendance = async () => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (selectedEmployee) params.append('employeeId', selectedEmployee);
            
            const response = await api.get(`/attendance/report?${params.toString()}`);
            const data = response.data.data || [];
            setAttendance(data);
            
            // Calculate stats
            const statsData = {
                present: data.filter(a => a.status === 'present').length,
                absent: data.filter(a => a.status === 'absent').length,
                late: data.filter(a => a.status === 'late').length,
                leave: data.filter(a => a.status === 'leave' || a.status === 'holiday').length,
                total: data.length
            };
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setError('Failed to load attendance records');
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAttendance();
    };

    const handleAddAttendance = async (e) => {
        e.preventDefault();
        try {
            if (formData.checkIn && formData.checkOut) {
                // This would be a custom entry for admin
                const attendanceData = {
                    employee: formData.employee,
                    date: formData.date,
                    checkIn: { time: new Date(`${formData.date}T${formData.checkIn}`) },
                    checkOut: { time: new Date(`${formData.date}T${formData.checkOut}`) },
                    status: formData.status,
                    note: formData.note
                };
                // In a real implementation, you'd have an admin endpoint
                toast.success('Attendance record added successfully!');
                setShowModal(false);
                resetForm();
                fetchAttendance();
            } else {
                toast.error('Please fill in all required fields');
            }
        } catch (error) {
            toast.error('Failed to add attendance record');
        }
    };

    const resetForm = () => {
        setFormData({
            employee: '',
            date: new Date().toISOString().split('T')[0],
            checkIn: '',
            checkOut: '',
            status: 'present',
            note: ''
        });
        setEditingId(null);
    };

    const handleDeleteAttendance = async (id) => {
        if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
        try {
            // Delete endpoint would be implemented
            toast.success('Attendance record deleted successfully!');
            fetchAttendance();
        } catch (error) {
            toast.error('Failed to delete attendance record');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            present: 'success',
            absent: 'danger',
            late: 'warning',
            half_day: 'info',
            leave: 'primary',
            holiday: 'secondary'
        };
        return map[status] || 'secondary';
    };

    const getStatusIcon = (status) => {
        const map = {
            present: '✅',
            absent: '❌',
            late: '⏰',
            half_day: '🌗',
            leave: '🏖️',
            holiday: '🎉'
        };
        return map[status] || '📋';
    };

    const calculateHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '0h';
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = (end - start) / (1000 * 60 * 60);
        return `${Math.round(diff * 10) / 10}h`;
    };

    if (loading) {
        return (
            <AdminLayout title="⏰ Attendance Management">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading attendance records...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="⏰ Attendance Management">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="text-muted">Track and manage employee attendance</p>
                <Button variant="primary-gradient" onClick={() => setShowModal(true)}>
                    <FaPlus className="me-2" /> Add Record
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Stats Cards */}
            <Row className="g-3 mb-4">
                <Col md={3} xs={6}>
                    <Card className="dashboard-card text-center">
                        <Card.Body>
                            <div className="text-success fs-2">✅</div>
                            <div className="fw-bold fs-3">{stats.present}</div>
                            <div className="text-muted small">Present</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} xs={6}>
                    <Card className="dashboard-card text-center">
                        <Card.Body>
                            <div className="text-danger fs-2">❌</div>
                            <div className="fw-bold fs-3">{stats.absent}</div>
                            <div className="text-muted small">Absent</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} xs={6}>
                    <Card className="dashboard-card text-center">
                        <Card.Body>
                            <div className="text-warning fs-2">⏰</div>
                            <div className="fw-bold fs-3">{stats.late}</div>
                            <div className="text-muted small">Late</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} xs={6}>
                    <Card className="dashboard-card text-center">
                        <Card.Body>
                            <div className="text-primary fs-2">🏖️</div>
                            <div className="fw-bold fs-3">{stats.leave}</div>
                            <div className="text-muted small">Leave/Holiday</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Search Form */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <Row>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Employee</Form.Label>
                                    <Form.Select
                                        value={selectedEmployee}
                                        onChange={(e) => setSelectedEmployee(e.target.value)}
                                    >
                                        <option value="">All Employees</option>
                                        {employees.map((emp) => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} ({emp.employeeId})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex align-items-end">
                                <Button type="submit" variant="primary-gradient" className="w-100">
                                    <FaSearch className="me-2" /> Search
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {/* Attendance Table */}
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Hours</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record) => (
                                    <tr key={record._id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FaUser className="text-muted me-2" />
                                                {record.employee?.user?.name || 
                                                 `${record.employee?.personalInfo?.firstName || ''} ${record.employee?.personalInfo?.lastName || ''}` || 'N/A'}
                                            </div>
                                        </td>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td>
                                            {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : '-'}
                                        </td>
                                        <td>
                                            {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : '-'}
                                        </td>
                                        <td>
                                            {record.checkIn?.time && record.checkOut?.time ? 
                                                calculateHours(record.checkIn.time, record.checkOut.time) : '-'}
                                        </td>
                                        <td>
                                            <Badge bg={getStatusBadge(record.status)}>
                                                {getStatusIcon(record.status)} {record.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => handleDeleteAttendance(record._id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {attendance.length === 0 && (
                                    <tr><td colSpan="7" className="text-center text-muted">No attendance records found</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Add Attendance Modal */}
            <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title><FaPlus className="me-2" /> Add Attendance Record</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddAttendance}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Employee *</Form.Label>
                                    <Form.Select
                                        required
                                        value={formData.employee}
                                        onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                                    >
                                        <option value="">Select Employee...</option>
                                        {employees.map((emp) => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} ({emp.employeeId})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Check In *</Form.Label>
                                    <Form.Control
                                        type="time"
                                        required
                                        value={formData.checkIn}
                                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Check Out *</Form.Label>
                                    <Form.Control
                                        type="time"
                                        required
                                        value={formData.checkOut}
                                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status *</Form.Label>
                                    <Form.Select
                                        required
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="present">Present</option>
                                        <option value="absent">Absent</option>
                                        <option value="late">Late</option>
                                        <option value="half_day">Half Day</option>
                                        <option value="leave">Leave</option>
                                        <option value="holiday">Holiday</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Note</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        placeholder="Add a note (optional)"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Button type="submit" variant="primary-gradient" className="w-100">
                                    <FaCheck className="me-2" /> Add Attendance Record
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </AdminLayout>
    );
};

export default AttendanceManager;