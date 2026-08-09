import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaRobot, FaBriefcase, FaUsers, FaCheckCircle, FaLaptopCode, FaChartBar, FaBullhorn, FaPenNib, FaHeadset, FaMicrophone, FaLanguage, FaDesktop } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({ jobs: 24, candidates: 156, placements: 89, companies: 24 });
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const jobsResponse = await api.get('/jobs?limit=4');
            setRecentJobs(jobsResponse.data.jobs || []);
            
            try {
                const usersResponse = await api.get('/public/stats');
                setStats(prev => ({ ...prev, candidates: usersResponse.data.stats?.totalUsers || prev.candidates, jobs: usersResponse.data.stats?.totalJobs || prev.jobs }));
            } catch (e) { }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const popularServices = [
        { icon: <FaBullhorn />, title: "Digital Marketing" },
        { icon: <FaLanguage />, title: "Translation" },
        { icon: <FaDesktop />, title: "Web Development" },
        { icon: <FaLaptopCode />, title: "Mobile Apps" },
        { icon: <FaChartBar />, title: "Data Analysis" },
        { icon: <FaPenNib />, title: "Graphic Design" },
        { icon: <FaMicrophone />, title: "Voice Over" },
        { icon: <FaHeadset />, title: "Customer Support" }
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-5 mb-lg-0">
                            <div className="hero-content pe-lg-4">
                                <div className="hero-badge">
                                    <FaRobot className="me-2" /> ET Where Talent Meets Opportunity
                                </div>
                                <h1 className="hero-title">
                                    Your AI-Powered Recruitment <span className="text-secondary">Platform</span>
                                </h1>
                                <p className="hero-subtitle">
                                    KETARI connects businesses with top-tier professionals for on-site, remote, and hybrid opportunities. Leverage our intelligent matching to find your next great hire or perfect job.
                                </p>
                                {!isAuthenticated && (
                                    <div className="hero-buttons mb-4">
                                        <Button as={Link} to="/register" variant="primary" size="lg" className="hero-btn-solid">
                                            Sign Up for Free
                                        </Button>
                                        <Button as={Link} to="/login" variant="outline-primary" size="lg" className="hero-btn-outline">
                                            Login
                                        </Button>
                                    </div>
                                )}
                                <div className="hero-buttons d-flex flex-wrap gap-2">
                                    <Button as={Link} to="/employer/post-job" variant={isAuthenticated ? "primary" : "secondary"} size="md" className="shadow-sm">
                                        Post a Job
                                    </Button>
                                    <Button as={Link} to="/jobs" variant="light" size="md" className="shadow-sm border">
                                        Explore Jobs
                                    </Button>
                                </div>
                                <div className="hero-stats-row mt-5">
                                    <span><strong>{stats.candidates}+</strong> candidates</span>
                                    <span><strong>{stats.jobs}+</strong> completed jobs</span>
                                    <span>Trusted by Ethiopian startups</span>
                                </div>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="hero-visual">
                                <Card className="floating-job-card card-1 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between mb-2">
                                            <h6 className="fw-bold mb-0">Web developer</h6>
                                        </div>
                                        <p className="text-muted small mb-3">we need a remote python developer to work from home</p>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div>
                                                <span className="fw-bold text-success">$2999.99 fixed</span>
                                            </div>
                                            <Button variant="success" size="sm" className="rounded-pill px-3">View Details</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                                <Card className="floating-job-card card-2 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between mb-2">
                                            <h6 className="fw-bold mb-0">Junior Python Developer</h6>
                                        </div>
                                        <p className="text-muted small mb-3">as a python developer u are responsible to handle python based operations</p>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div>
                                                <span className="fw-bold text-success">Negotiable</span>
                                            </div>
                                            <Button variant="success" size="sm" className="rounded-pill px-3">View Details</Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* How It Works - Dual Path */}
            <section className="how-it-works-section py-5">
                <Container className="py-4">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold">How KETARI works</h2>
                        <p className="text-muted">One platform, two paths to success</p>
                    </div>
                    <Row className="g-4">
                        <Col md={6}>
                            <Card className="workflow-card employer-card h-100 border-0">
                                <Card.Body className="p-5">
                                    <h3 className="fw-bold mb-4 text-primary">For Employers</h3>
                                    
                                    <div className="workflow-step">
                                        <div className="step-num bg-white text-primary fw-bold shadow-sm">1</div>
                                        <div>
                                            <h5 className="fw-bold">Post a Job</h5>
                                            <p className="text-muted mb-0">Describe your project, set a budget.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="workflow-step">
                                        <div className="step-num bg-white text-primary fw-bold shadow-sm">2</div>
                                        <div>
                                            <h5 className="fw-bold">Receive Proposals</h5>
                                            <p className="text-muted mb-0">Connect with skilled Ethiopian professionals.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="workflow-step">
                                        <div className="step-num bg-white text-primary fw-bold shadow-sm">3</div>
                                        <div>
                                            <h5 className="fw-bold">Hire & get work done</h5>
                                            <p className="text-muted mb-0">Collaborate, review, and pay securely.</p>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="workflow-card talent-card h-100 border-0">
                                <Card.Body className="p-5">
                                    <h3 className="fw-bold mb-4 text-secondary">For Candidates</h3>
                                    
                                    <div className="workflow-step">
                                        <div className="step-num bg-white text-secondary fw-bold shadow-sm">1</div>
                                        <div>
                                            <h5 className="fw-bold">Create Profile</h5>
                                            <p className="text-muted mb-0">Showcase your skills & portfolio.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="workflow-step">
                                        <div className="step-num bg-white text-secondary fw-bold shadow-sm">2</div>
                                        <div>
                                            <h5 className="fw-bold">Find Jobs</h5>
                                            <p className="text-muted mb-0">Browse projects that match your expertise.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="workflow-step">
                                        <div className="step-num bg-white text-secondary fw-bold shadow-sm">3</div>
                                        <div>
                                            <h5 className="fw-bold">Get Paid</h5>
                                            <p className="text-muted mb-0">Secure payments, local or international.</p>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Popular Services Grid */}
            <section className="popular-services-section py-5">
                <Container className="py-4">
                    <div className="text-center mb-5">
                        <Badge bg="light" text="dark" className="px-3 py-2 border mb-3 rounded-pill">
                            <span className="text-warning me-1">🔥</span> In Demand
                        </Badge>
                        <h2 className="fw-bold">Popular Services on <span className="text-primary">KETARI</span></h2>
                        <p className="text-muted">In-demand skills from Ethiopia's top talent</p>
                    </div>
                    
                    <Row className="g-3 justify-content-center">
                        {popularServices.map((service, idx) => (
                            <Col xs={6} md={3} lg={3} key={idx}>
                                <Card className="service-card text-center h-100 border shadow-sm">
                                    <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                                        <div className="service-icon mb-3">
                                            {service.icon}
                                        </div>
                                        <h6 className="fw-bold mb-0 text-dark">{service.title}</h6>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Featured Candidates (Mock Data representing recent candidates/jobs) */}
            <section className="recent-jobs-section bg-light py-5">
                <Container className="py-4">
                    <div className="d-flex justify-content-between align-items-center mb-5">
                        <h2 className="fw-bold mb-0">Featured Candidates</h2>
                        <Button as={Link} to="/candidates" variant="link" className="text-decoration-none fw-bold text-primary">
                            View all
                        </Button>
                    </div>
                    <Row className="g-4">
                        {[1, 2, 3, 4].map((item, index) => (
                            <Col md={3} key={index}>
                                <Card className="featured-candidate-card h-100 border-0 shadow-sm">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="avatar-placeholder bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style={{width: 50, height: 50}}>
                                                JD
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-0">Developer {index+1}</h6>
                                                <small className="text-muted">⭐⭐⭐⭐⭐ 5.0</small>
                                            </div>
                                        </div>
                                        <h6 className="fw-bold mt-2">Full Stack Developer</h6>
                                        <p className="text-muted small mb-3"><FaCheckCircle className="me-1"/> Addis Ababa</p>
                                        
                                        <div className="mt-auto pt-3 d-flex justify-content-between align-items-center">
                                            <span className="fw-bold text-success fs-5">ETB 150<small className="text-muted fs-6">/hr</small></span>
                                            <Button variant="primary" size="sm" className="rounded-pill px-3">
                                                View Profile
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default Home;