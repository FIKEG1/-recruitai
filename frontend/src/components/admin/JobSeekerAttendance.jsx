import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { FaUserCheck, FaUserTimes, FaClock, FaCalendar, FaSync } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const JobSeekerAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [jobSeekers, setJobSeekers] = useState([]);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            if (refreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            
            const response = await api.get('/attendance/job-seekers');
            setJobSeekers(response.data.data || []);
            setStats(response.data.stats);
            setError('');
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setError('Failed to load attendance data');
            toast.error('Failed to load attendance');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchAttendance();
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
            present: { bg: 'success', icon: <FaUserCheck />, text: 'Present' },
            absent: { bg: 'danger', icon: <FaUserTimes />, text: 'Absent' },
            late: { bg: 'warning', icon: <FaClock />, text: 'Late' },
            leave: { bg: 'info', icon: <FaCalendar />, text: 'Leave' },
            not_started: { bg: 'secondary', icon: <FaClock />, text: 'Not Started' }
        };
        const config = statusConfig[status] || statusConfig.not_started;
        return (
            <Badge bg={config.bg} className="d-flex align-items-center gap-1">
                {config.icon} {config.text}
            </Badge>
        );
    };

    const getCheckInBadge = (checkedIn) => {
        return checkedIn ? (
            <Badge bg="success" className="d-flex align-items-center gap-1">
                <FaUserCheck /> Checked In
            </Badge>
        ) : (
            <Badge bg="secondary" className="d-flex align-items-center gap-1">
                <FaUserTimes /> Not Checked In
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
                    <h2 className="fw-bold mb-1">Job Seeker Attendance</h2>
                    <p className="text-muted">Real-time attendance tracking for all job seekers</p>
                </Col>
                <Col xs="auto">
                    <Button 
                        variant="outline-primary" 
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="d-flex align-items-center gap-2"
                    >
                        {refreshing ? <Spinner size="sm" /> : <FaSync />}
                        Refresh
                    </Button>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h3 className="text-primary fw-bold">{stats?.totalJobSeekers || 0}</h3>
                            <p className="text-muted mb-0">Total Job Seekers</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h3 className="text-success fw-bold">{stats?.checkedInToday || 0}</h3>
                            <p className="text-muted mb-0">Checked In Today</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h3 className="text-warning fw-bold">{stats?.totalPresent || 0}</h3>
                            <p className="text-muted mb-0">Total Present Days</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <h3 className="text-info fw-bold">{stats?.withEmployeeRecords || 0}</h3>
                            <p className="text-muted mb-0">With Records</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Attendance Table */}
            <Card className="shadow-sm">
                <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
                    <span>Job Seekers Attendance Status</span>
                    <Badge bg="primary">{jobSeekers.length} Records</Badge>
                </Card.Header>
                <Card.Body className="p-0">
                    {jobSeekers.length === 0 ? (
                        <div className="text-center p-4">
                            <p className="text-muted">No job seekers found</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Today's Status</th>
                                        <th>Check-in Time</th>
                                        <th>Check-out Time</th>
                                        <th>Present Days</th>
                                        <th>Absent Days</th>
                                        <th>Late Days</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobSeekers.map((jobSeeker) => (
                                        <tr key={jobSeeker._id}>
                                            <td className="fw-semibold">{jobSeeker.name}</td>
                                            <td className="text-muted">{jobSeeker.email}</td>
                                            <td>
                                                {getCheckInBadge(jobSeeker.todayStatus.checkedIn)}
                                                <div className="mt-1">
                                                    {getStatusBadge(jobSeeker.todayStatus.status)}
                                                </div>
                                            </td>
                                            <td>{formatTime(jobSeeker.todayStatus.checkInTime)}</td>
                                            <td>{formatTime(jobSeeker.todayStatus.checkOutTime)}</td>
                                            <td>
                                                <Badge bg="success">{jobSeeker.stats.present}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg="danger">{jobSeeker.stats.absent}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg="warning">{jobSeeker.stats.late}</Badge>
                                            </td>
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

export default JobSeekerAttendance;
