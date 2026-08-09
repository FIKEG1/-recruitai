import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Button, Alert, Nav } from 'react-bootstrap';
import { 
    FaUsers, FaBriefcase, FaFileAlt, FaCheckCircle, 
    FaClock, FaChartLine, FaDownload, FaEye, FaStar,
    FaUserPlus, FaBuilding, FaCalendarAlt, FaPercent,
    FaCog, FaUserCheck, FaCalendar, FaBook, FaFlag,
    FaExchangeAlt, FaBars, FaTimes, FaHome
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0,
        totalResumes: 0,
        pendingApplications: 0,
        recentActivities: [],
        monthlyApplications: [],
        statusBreakdown: [],
        jobsByDepartment: [],
        topCandidates: [],
        summary: {
            placementRate: 0,
            averageApplicationsPerJob: 0,
            totalEmployers: 0,
            totalJobSeekers: 0
        }
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const [reportRes, adminRes, topCandidatesRes] = await Promise.all([
                api.get('/reports/summary'),
                api.get('/admin/stats'),
                api.get('/admin/top-candidates')
            ]);

            const reportData = reportRes.data.data;
            const adminData = adminRes.data.stats;
            const topCandidates = topCandidatesRes.data.topCandidates || [];

            setStats({
                totalUsers: reportData.summary?.totalUsers || adminData.totalUsers || 0,
                totalJobs: reportData.summary?.totalJobs || adminData.totalJobs || 0,
                totalApplications: reportData.summary?.totalApplications || adminData.totalApplications || 0,
                totalResumes: adminData.totalResumes || 0,
                pendingApplications: reportData.statusBreakdown?.find(s => s._id === 'pending')?.count || 0,
                recentActivities: reportData.recentApplications || [],
                monthlyApplications: reportData.monthlyApplications || [],
                statusBreakdown: reportData.statusBreakdown || [],
                jobsByDepartment: reportData.jobsByDepartment || [],
                topCandidates,
                summary: {
                    placementRate: reportData.summary?.placementRate || 0,
                    averageApplicationsPerJob: reportData.summary?.averageApplicationsPerJob || 0,
                    totalEmployers: reportData.summary?.totalEmployers || adminData.totalEmployers || 0,
                    totalJobSeekers: reportData.summary?.totalJobSeekers || adminData.totalJobSeekers || 0
                }
            });

            if (reportData) {
                setError('');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 401) {
                setError('Please login again to view dashboard data.');
            } else {
                setError('Failed to load dashboard data. Please try again.');
            }
            toast.error('Failed to load dashboard data');
            setStats({
                totalUsers: 0,
                totalJobs: 0,
                totalApplications: 0,
                totalResumes: 0,
                pendingApplications: 0,
                recentActivities: [],
                monthlyApplications: [],
                statusBreakdown: [],
                jobsByDepartment: [],
                topCandidates: [],
                summary: {
                    placementRate: 0,
                    averageApplicationsPerJob: 0,
                    totalEmployers: 0,
                    totalJobSeekers: 0
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data - only if there's data
    const monthlyData = {
        labels: stats.monthlyApplications?.length > 0 ? 
            stats.monthlyApplications.map(m => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months[(m._id?.month || 1) - 1];
            }) : ['No Data'],
        datasets: [
            {
                label: 'Applications',
                data: stats.monthlyApplications?.length > 0 ? 
                    stats.monthlyApplications.map(m => m.count) : [0],
                borderColor: '#2c3e8f',
                backgroundColor: 'rgba(44, 62, 143, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2c3e8f',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }
        ]
    };

    const statusData = {
        labels: stats.statusBreakdown?.length > 0 ? 
            stats.statusBreakdown.map(s => s._id?.charAt(0).toUpperCase() + s._id?.slice(1) || 'Unknown') : ['No Data'],
        datasets: [
            {
                label: 'Applications',
                data: stats.statusBreakdown?.length > 0 ? 
                    stats.statusBreakdown.map(s => s.count) : [1],
                backgroundColor: stats.statusBreakdown?.length > 0 ? [
                    '#ff9f1c', // pending - amber
                    '#7b2cbf', // reviewed - purple
                    '#ff6b35', // shortlisted - coral
                    '#8e24aa', // interviewed - deep magenta
                    '#e83e8c', // offered - hot pink
                    '#e74c3c'  // rejected - red
                ] : ['#ccc'],
                borderWidth: 2,
                borderColor: '#fff'
            }
        ]
    };

    const departmentData = {
        labels: stats.jobsByDepartment?.length > 0 ? 
            stats.jobsByDepartment.map(d => d._id || 'Unknown') : ['No Data'],
        datasets: [
            {
                label: 'Jobs',
                data: stats.jobsByDepartment?.length > 0 ? 
                    stats.jobsByDepartment.map(d => d.count) : [0],
                backgroundColor: [
                    '#ff6b35',
                    '#7b2cbf',
                    '#e83e8c',
                    '#9c27b0',
                    '#ff9f1c',
                    '#8e24aa',
                    '#d81b60',
                    '#ab47bc'
                ],
                borderRadius: 4
            }
        ]
    };

    const exportReport = async () => {
        try {
            toast.info('Generating report...');
            
            const token = localStorage.getItem('token');
            const response = await api.get('/reports/summary', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = response.data.data;
            
            const reportText = `
RECRUITAI - RECRUITMENT SUMMARY REPORT
=======================================
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS
------------------
Total Users: ${stats.totalUsers || 0}
Total Job Seekers: ${stats.summary.totalJobSeekers || 0}
Total Employers: ${stats.summary.totalEmployers || 0}
Total Jobs Posted: ${stats.totalJobs || 0}
Total Applications: ${stats.totalApplications || 0}
Pending Reviews: ${stats.pendingApplications || 0}
Placement Rate: ${stats.summary.placementRate || 0}%
Average Applications per Job: ${stats.summary.averageApplicationsPerJob || 0}

STATUS BREAKDOWN
----------------
${stats.statusBreakdown?.map(s => `${s._id}: ${s.count}`).join('\n') || 'No data'}

JOBS BY DEPARTMENT
------------------
${stats.jobsByDepartment?.map(d => `${d._id}: ${d.count}`).join('\n') || 'No data'}

Generated by RecruitAI Platform
© ${new Date().getFullYear()} Sidama Innovation and Technology Agency
            `;
            
            const blob = new Blob([reportText], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recruitment_report_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            toast.success('Report downloaded successfully!');
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Failed to export report');
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading dashboard...</p>
            </Container>
        );
    }

    return (
        <section className="admin-dashboard" style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                {/* Sidebar */}
                <div style={{
                    width: sidebarOpen ? '260px' : '70px',
                    background: 'linear-gradient(180deg, #1a237e 0%, #2c3e8f 100%)',
                    color: 'white',
                    padding: '20px',
                    transition: 'width 0.3s ease',
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        {sidebarOpen && (
                            <h5 className="mb-0 fw-bold" style={{ fontSize: '1.2rem' }}>
                                <FaCog className="me-2" /> Admin
                            </h5>
                        )}
                        <Button 
                            variant="link" 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ color: 'white', padding: 0 }}
                        >
                            {sidebarOpen ? <FaTimes /> : <FaBars />}
                        </Button>
                    </div>

                    <Nav className="flex-column" style={{ gap: '8px' }}>
                        <Nav.Link 
                            as={Link}
                            to="/admin/dashboard"
                            className={`d-flex align-items-center ${activeSection === 'overview' ? 'active' : ''}`}
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: activeSection === 'overview' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setActiveSection('overview')}
                        >
                            <FaChartLine className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Overview</span>}
                        </Nav.Link>

                        <Nav.Link 
                            as={Link}
                            to="/admin/users"
                            className={`d-flex align-items-center ${activeSection === 'users' ? 'active' : ''}`}
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: activeSection === 'users' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setActiveSection('users')}
                        >
                            <FaUsers className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Manage Users</span>}
                        </Nav.Link>

                        <Nav.Link 
                            as={Link}
                            to="/admin/attendance"
                            className={`d-flex align-items-center ${activeSection === 'attendance' ? 'active' : ''}`}
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: activeSection === 'attendance' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setActiveSection('attendance')}
                        >
                            <FaUserCheck className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Attendance</span>}
                        </Nav.Link>

                        <Nav.Link 
                            as={Link}
                            to="/admin/leaves"
                            className={`d-flex align-items-center ${activeSection === 'leaves' ? 'active' : ''}`}
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: activeSection === 'leaves' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setActiveSection('leaves')}
                        >
                            <FaCalendarAlt className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Leave Management</span>}
                        </Nav.Link>

                        <Nav.Link 
                            as={Link}
                            to="/admin/config"
                            className={`d-flex align-items-center ${activeSection === 'config' ? 'active' : ''}`}
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: activeSection === 'config' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setActiveSection('config')}
                        >
                            <FaCog className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Configuration</span>}
                        </Nav.Link>

                        <Nav.Link 
                            as={Link}
                            to="/admin/employees"
                            className={`d-flex align-items-center ${activeSection === 'employees' ? 'active' : ''}`}
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: activeSection === 'employees' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setActiveSection('employees')}
                        >
                            <FaUsers className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Employees</span>}
                        </Nav.Link>

                        <Nav.Link 
                            as={Link}
                            to="/admin/training"
                            className={`d-flex align-items-center ${activeSection === 'training' ? 'active' : ''}`}
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: activeSection === 'training' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setActiveSection('training')}
                        >
                            <FaBook className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Training</span>}
                        </Nav.Link>

                        <Nav.Link 
                            as={Link}
                            to="/admin/complaints"
                            className={`d-flex align-items-center ${activeSection === 'complaints' ? 'active' : ''}`}
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: activeSection === 'complaints' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setActiveSection('complaints')}
                        >
                            <FaFlag className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Complaints</span>}
                        </Nav.Link>

                        <Nav.Link 
                            as={Link}
                            to="/admin/delegations"
                            className={`d-flex align-items-center ${activeSection === 'delegations' ? 'active' : ''}`}
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: activeSection === 'delegations' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                            onClick={() => setActiveSection('delegations')}
                        >
                            <FaExchangeAlt className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Delegations</span>}
                        </Nav.Link>
                    </Nav>

                    <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Nav.Link 
                            as={Link}
                            to="/"
                            className="d-flex align-items-center"
                            style={{ 
                                color: 'rgba(255,255,255,0.8)', 
                                padding: '12px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none'
                            }}
                        >
                            <FaHome className="me-3" style={{ minWidth: '20px' }} />
                            {sidebarOpen && <span>Back to Home</span>}
                        </Nav.Link>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ 
                    marginLeft: sidebarOpen ? '260px' : '70px',
                    flex: 1,
                    padding: '30px',
                    transition: 'margin-left 0.3s ease'
                }}>
                    <Container fluid>
                        {/* Header */}
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                            <div>
                                <h2 className="fw-bold" style={{ color: '#1a237e' }}>Admin Dashboard</h2>
                                <p className="text-muted">Welcome back, {user?.name}! Here's an overview of the platform.</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="primary" onClick={exportReport} style={{ background: 'linear-gradient(135deg, #2c3e8f 0%, #1a237e 100%)', border: 'none' }}>
                                    <FaDownload className="me-2" /> Export Report
                                </Button>
                                <Button variant="outline-secondary" onClick={fetchDashboardData}>
                                    <FaChartLine className="me-2" /> Refresh
                                </Button>
                            </div>
                        </div>

                {error && (
                    <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Stats Cards */}
                <Row className="g-3 mb-4">
                    <Col md={3} sm={6}>
                        <Card className="dashboard-card">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="label text-muted">Total Users</div>
                                        <div className="number fw-bold fs-2">{stats.totalUsers || 0}</div>
                                        <small className="text-muted">
                                            <FaUserPlus className="me-1" />
                                            {stats.summary.totalJobSeekers || 0} Job Seekers
                                        </small>
                                    </div>
                                    <div className="icon text-primary" style={{ fontSize: '2rem' }}>
                                        <FaUsers />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="dashboard-card" style={{ borderLeftColor: '#7b2cbf' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="label text-muted">Total Jobs</div>
                                        <div className="number fw-bold fs-2">{stats.totalJobs || 0}</div>
                                        <small className="text-muted">
                                            <FaBuilding className="me-1" />
                                            {stats.summary.totalEmployers || 0} Employers
                                        </small>
                                    </div>
                                    <div className="icon text-primary" style={{ fontSize: '2rem' }}>
                                        <FaBriefcase />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="dashboard-card" style={{ borderLeftColor: '#FF9800' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="label text-muted">Applications</div>
                                        <div className="number fw-bold fs-2">{stats.totalApplications || 0}</div>
                                        <small className="text-muted">
                                            <FaPercent className="me-1" />
                                            {stats.summary.placementRate || 0}% Placement Rate
                                        </small>
                                    </div>
                                    <div className="icon text-warning" style={{ fontSize: '2rem' }}>
                                        <FaFileAlt />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="dashboard-card" style={{ borderLeftColor: '#e74c3c' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="label text-muted">Pending Reviews</div>
                                        <div className="number fw-bold fs-2">{stats.pendingApplications || 0}</div>
                                        <small className="text-muted">
                                            <FaClock className="me-1" />
                                            Needs attention
                                        </small>
                                    </div>
                                    <div className="icon text-danger" style={{ fontSize: '2rem' }}>
                                        <FaClock />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Charts - Only show if there's data */}
                {(stats.monthlyApplications?.length > 0 || stats.statusBreakdown?.length > 0) ? (
                    <>
                        <Row className="g-4 mb-4">
                            <Col lg={8}>
                                <Card className="shadow-sm">
                                    <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 fw-bold">
                                            <FaChartLine className="me-2 text-primary" />
                                            Monthly Applications
                                        </h5>
                                        <Badge bg="primary">Trend</Badge>
                                    </Card.Header>
                                    <Card.Body>
                                        <Line 
                                            data={monthlyData} 
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function(context) {
                                                                return `${context.parsed.y} applications`;
                                                            }
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            stepSize: 1
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={4}>
                                <Card className="shadow-sm">
                                    <Card.Header className="bg-white">
                                        <h5 className="mb-0 fw-bold">Application Status</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Doughnut 
                                            data={statusData}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: { 
                                                        position: 'bottom',
                                                        labels: {
                                                            padding: 10,
                                                            usePointStyle: true,
                                                            pointStyle: 'circle'
                                                        }
                                                    }
                                                },
                                                cutout: '60%'
                                            }}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {stats.jobsByDepartment?.length > 0 && (
                            <Row className="mb-4">
                                <Col>
                                    <Card className="shadow-sm">
                                        <Card.Header className="bg-white">
                                            <h5 className="mb-0 fw-bold">
                                                <FaBriefcase className="me-2 text-primary" />
                                                Jobs by Department
                                            </h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <Bar 
                                                data={departmentData}
                                                options={{
                                                    responsive: true,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: function(context) {
                                                                    return `${context.parsed.y} jobs`;
                                                                }
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            ticks: {
                                                                stepSize: 1
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </>
                ) : (
                    <Card className="shadow-sm mb-4">
                        <Card.Body className="text-center py-5">
                            <div style={{ fontSize: '4rem' }} className="mb-3">📊</div>
                            <h5>No Data Available</h5>
                            <p className="text-muted">
                                Start posting jobs and accepting applications to see analytics here.
                            </p>
                            <Button variant="primary-gradient" onClick={() => window.location.href = '/employer/post-job'}>
                                Post a Job
                            </Button>
                        </Card.Body>
                    </Card>
                )}

                {/* Recent Activities */}
                <Card className="shadow-sm">
                    <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold">
                            <FaClock className="me-2 text-primary" />
                            Recent Activities
                        </h5>
                        <Badge bg="secondary">{stats.recentActivities?.length || 0} activities</Badge>
                    </Card.Header>
                    <Card.Body>
                        {stats.recentActivities?.length === 0 ? (
                            <div className="text-center py-4">
                                <div className="mb-3" style={{ fontSize: '3rem' }}>📭</div>
                                <p className="text-muted">No recent activities</p>
                            </div>
                        ) : (
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Applicant</th>
                                        <th>Job</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentActivities.map((activity, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-semibold">
                                                {activity.applicant?.name || 'Unknown'}
                                            </td>
                                            <td>{activity.job?.title || 'Unknown Job'}</td>
                                            <td>
                                                <Badge 
                                                    bg={
                                                        activity.status === 'pending' ? 'warning' :
                                                        activity.status === 'shortlisted' ? 'success' :
                                                        activity.status === 'rejected' ? 'danger' :
                                                        activity.status === 'interviewed' ? 'info' :
                                                        activity.status === 'offered' ? 'success' :
                                                        'secondary'
                                                    }
                                                >
                                                    {activity.status?.toUpperCase() || 'PENDING'}
                                                </Badge>
                                            </td>
                                            <td className="text-muted small">
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>

                {/* Top Candidates */}
                <Card className="shadow-sm mt-4">
                    <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold">
                            <FaStar className="me-2 text-primary" />
                            Top Candidates
                        </h5>
                        <Badge bg="primary">Best Matches</Badge>
                    </Card.Header>
                    <Card.Body>
                        {stats.topCandidates?.length === 0 ? (
                            <div className="text-center py-4">
                                <div className="mb-3" style={{ fontSize: '3rem' }}>🏆</div>
                                <p className="text-muted">No candidate match data available yet.</p>
                            </div>
                        ) : (
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Email</th>
                                        <th>Job</th>
                                        <th>Match Score</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topCandidates.map((candidate) => (
                                        <tr key={candidate._id}>
                                            <td className="fw-semibold">{candidate.applicant?.name || 'Unknown'}</td>
                                            <td>{candidate.applicant?.email || '-'}</td>
                                            <td>{candidate.job?.title || 'Unknown Job'}</td>
                                            <td>{candidate.matchScore ?? 'N/A'}%</td>
                                            <td>
                                                <Badge
                                                    bg={
                                                        candidate.status === 'pending' ? 'warning' :
                                                        candidate.status === 'shortlisted' ? 'success' :
                                                        candidate.status === 'rejected' ? 'danger' :
                                                        candidate.status === 'interviewed' ? 'info' :
                                                        candidate.status === 'offered' ? 'success' :
                                                        'secondary'
                                                    }
                                                >
                                                    {candidate.status?.toUpperCase() || 'N/A'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
                    </Container>
                </div>
            </div>
        </section>
    );
};

export default AdminDashboard;