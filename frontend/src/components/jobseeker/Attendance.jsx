import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaClock, FaSignOutAlt, FaSignInAlt, FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Attendance = () => {
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [todayStatus, setTodayStatus] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get('/attendance/me');
            setAttendance(response.data.data || []);
            setStats(response.data.stats);
            setTodayStatus(response.data.today);
            setError('');
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setError('Failed to load attendance data');
            toast.error('Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        setCheckingIn(true);
        try {
            await api.post('/attendance/check-in', {
                method: 'web',
                location: 'Office'
            });
            toast.success('Checked in successfully!');
            fetchAttendance();
        } catch (error) {
            console.error('Check-in error:', error);
            toast.error(error.response?.data?.message || 'Failed to check in');
        } finally {
            setCheckingIn(false);
        }
    };

    const handleCheckOut = async () => {
        setCheckingOut(true);
        try {
            await api.post('/attendance/check-out', {
                method: 'web',
                location: 'Office'
            });
            toast.success('Checked out successfully!');
            fetchAttendance();
        } catch (error) {
            console.error('Check-out error:', error);
            toast.error(error.response?.data?.message || 'Failed to check out');
        } finally {
            setCheckingOut(false);
        }
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            present: { bg: 'success', icon: <FaCheckCircle />, text: 'Present' },
            absent: { bg: 'danger', icon: <FaTimesCircle />, text: 'Absent' },
            late: { bg: 'warning', icon: <FaClock />, text: 'Late' },
            leave: { bg: 'info', icon: <FaCalendar />, text: 'Leave' },
            half_day: { bg: 'secondary', icon: <FaClock />, text: 'Half Day' }
        };
        const config = statusConfig[status] || { bg: 'secondary', icon: null, text: status };
        return (
            <Badge bg={config.bg} className="d-flex align-items-center gap-1">
                {config.icon} {config.text}
            </Badge>
        );
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" />
                    <p className="mt-3">Loading attendance data...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold mb-1">Attendance Management</h2>
                    <p className="text-muted">Track your daily attendance and working hours</p>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Today's Status Card */}
            <Card className="mb-4 shadow-sm">
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h4 className="fw-bold mb-2">Today's Status</h4>
                            <p className="text-muted mb-3">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            {todayStatus?.record ? (
                                <div className="d-flex gap-3">
                                    <div>
                                        <small className="text-muted">Check-in</small>
                                        <div className="fw-bold text-success">
                                            <FaSignInAlt className="me-1" /> {formatTime(todayStatus.record.checkIn?.time)}
                                        </div>
                                    </div>
                                    <div>
                                        <small className="text-muted">Check-out</small>
                                        <div className="fw-bold text-danger">
                                            <FaSignOutAlt className="me-1" /> {formatTime(todayStatus.record.checkOut?.time)}
                                        </div>
                                    </div>
                                    <div>
                                        <small className="text-muted">Status</small>
                                        <div>{getStatusBadge(todayStatus.record.status)}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted">No attendance record for today</p>
                            )}
                        </Col>
                        <Col md={6} className="text-md-end mt-3 mt-md-0">
                            {!todayStatus?.checkedIn ? (
                                <Button 
                                    variant="success" 
                                    size="lg" 
                                    onClick={handleCheckIn}
                                    disabled={checkingIn}
                                    className="d-flex align-items-center gap-2"
                                >
                                    {checkingIn ? <Spinner size="sm" /> : <FaSignInAlt />}
                                    Check In
                                </Button>
                            ) : !todayStatus?.checkedOut ? (
                                <Button 
                                    variant="danger" 
                                    size="lg" 
                                    onClick={handleCheckOut}
                                    disabled={checkingOut}
                                    className="d-flex align-items-center gap-2"
                                >
                                    {checkingOut ? <Spinner size="sm" /> : <FaSignOutAlt />}
                                    Check Out
                                </Button>
                            ) : (
                                <div className="text-success fw-bold">
                                    <FaCheckCircle className="me-2" />
                                    Completed for today
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h3 className="text-primary fw-bold">{stats?.present || 0}</h3>
                            <p className="text-muted mb-0">Present Days</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h3 className="text-danger fw-bold">{stats?.absent || 0}</h3>
                            <p className="text-muted mb-0">Absent Days</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h3 className="text-warning fw-bold">{stats?.late || 0}</h3>
                            <p className="text-muted mb-0">Late Arrivals</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h3 className="text-info fw-bold">{stats?.leave || 0}</h3>
                            <p className="text-muted mb-0">Leave Days</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Attendance History */}
            <Card className="shadow-sm">
                <Card.Header className="bg-white fw-bold">
                    Attendance History
                </Card.Header>
                <Card.Body className="p-0">
                    {attendance.length === 0 ? (
                        <div className="text-center p-4">
                            <p className="text-muted">No attendance records found</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Check-in</th>
                                        <th>Check-out</th>
                                        <th>Hours Worked</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record) => (
                                        <tr key={record._id}>
                                            <td>{formatDate(record.date)}</td>
                                            <td>{formatTime(record.checkIn?.time)}</td>
                                            <td>{formatTime(record.checkOut?.time)}</td>
                                            <td>{record.hoursWorked || '-'}</td>
                                            <td>{getStatusBadge(record.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Attendance;
