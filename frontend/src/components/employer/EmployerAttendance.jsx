import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button, Form } from 'react-bootstrap';
import { FaCalendar, FaClock, FaUserCheck, FaUserTimes, FaFilter } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import BackButton from '../common/BackButton';

const EmployerAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [todayStats, setTodayStats] = useState(null);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async (dateFilter = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
            if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
            
            console.log('=== Frontend Attendance Fetch ===');
            console.log('Params:', params.toString());
            
            const response = await api.get(`/attendance/employer?${params.toString()}`);
            console.log('Response:', response.data);
            
            setAttendance(response.data.data || []);
            setStats(response.data.stats);
            setTodayStats(response.data.today);
            setError('');
        } catch (error) {
            console.error('Error fetching attendance:', error);
            console.error('Error response:', error.response?.data);
            setError('Failed to load attendance data');
            toast.error('Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        fetchAttendance(filter);
    };

    const handleReset = () => {
        setFilter({ startDate: '', endDate: '' });
        fetchAttendance({});
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            present: { bg: 'success', icon: <FaUserCheck />, text: 'Present' },
            absent: { bg: 'danger', icon: <FaUserTimes />, text: 'Absent' },
            late: { bg: 'warning', icon: <FaClock />, text: 'Late' },
            leave: { bg: 'info', icon: <FaCalendar />, text: 'Leave' },
            holiday: { bg: 'info', icon: <FaCalendar />, text: 'Holiday' },
            half_day: { bg: 'secondary', icon: <FaClock />, text: 'Half Day' }
        };
        const config = statusConfig[status] || { bg: 'secondary', icon: null, text: status };
        return (
            <Badge bg={config.bg} className="d-flex align-items-center gap-1">
                {config.icon} {config.text}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <Container className="py-5">
            <BackButton to="/employer/jobs" />
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold mb-1">Attendance Management</h2>
                    <p className="text-muted">View and manage employee attendance records</p>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            {stats && (
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                                            <FaUserCheck className="text-success fs-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-0">Present</h6>
                                        <h3 className="fw-bold mb-0">{stats.present}</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <div className="bg-danger bg-opacity-10 p-3 rounded-circle">
                                            <FaUserTimes className="text-danger fs-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-0">Absent</h6>
                                        <h3 className="fw-bold mb-0">{stats.absent}</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                                            <FaClock className="text-warning fs-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-0">Late</h6>
                                        <h3 className="fw-bold mb-0">{stats.late}</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                                            <FaCalendar className="text-info fs-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-0">Leave</h6>
                                        <h3 className="fw-bold mb-0">{stats.leave}</h3>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Today's Summary */}
            {todayStats && (
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <h5 className="fw-bold mb-3">Today's Summary</h5>
                        <Row>
                            <Col md={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <h4 className="fw-bold mb-0">{todayStats.total}</h4>
                                    <small className="text-muted">Total Records</small>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <h4 className="fw-bold mb-0 text-success">{todayStats.present}</h4>
                                    <small className="text-muted">Present</small>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <h4 className="fw-bold mb-0 text-danger">{todayStats.absent}</h4>
                                    <small className="text-muted">Absent</small>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <h4 className="fw-bold mb-0 text-warning">{todayStats.late}</h4>
                                    <small className="text-muted">Late</small>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Filter Form */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Form onSubmit={handleFilter}>
                        <Row className="align-items-end">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={filter.startDate}
                                        onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={filter.endDate}
                                        onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <div className="d-flex gap-2">
                                    <Button type="submit" variant="primary">
                                        <FaFilter className="me-2" /> Apply Filter
                                    </Button>
                                    <Button type="button" variant="outline-secondary" onClick={handleReset}>
                                        Reset
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {/* Attendance Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Loading attendance data...</p>
                        </div>
                    ) : attendance.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="mb-3" style={{ fontSize: '4rem' }}>📊</div>
                            <h4>No attendance records found</h4>
                            <p className="text-muted">Try adjusting your filter or check back later</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Employee</th>
                                        <th>Employee ID</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Hours Worked</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record) => (
                                        <tr key={record._id}>
                                            <td>{formatDate(record.date)}</td>
                                            <td>
                                                <div>
                                                    <strong>
                                                        {record.employee?.personalInfo?.firstName} {record.employee?.personalInfo?.lastName}
                                                    </strong>
                                                    {record.employee?.user?.email && (
                                                        <div className="small text-muted">{record.employee.user.email}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{record.employee?.employeeId || '-'}</td>
                                            <td>
                                                <div>
                                                    <strong>{formatTime(record.checkIn?.time)}</strong>
                                                    {record.checkIn?.method && (
                                                        <Badge bg="light" text="dark" className="ms-1 small">
                                                            {record.checkIn.method}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{formatTime(record.checkOut?.time)}</td>
                                            <td>{record.hoursWorked ? `${record.hoursWorked}h` : '-'}</td>
                                            <td>{getStatusBadge(record.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EmployerAttendance;
