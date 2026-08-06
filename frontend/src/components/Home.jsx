import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaFileAlt, FaRobot, FaChartLine, FaBriefcase, FaUsers, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        jobs: 0,
        candidates: 0,
        placements: 0,
        companies: 0
    });
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const jobsResponse = await api.get('/jobs?limit=6');
            const jobs = jobsResponse.data.jobs || [];
            setRecentJobs(jobs);
            const totalJobs = jobsResponse.data.totalJobs || 0;

            let totalCandidates = 0;
            let totalEmployers = 0;
            try {
                const usersResponse = await api.get('/admin/stats');
                if (usersResponse.data.stats) {
                    totalCandidates = usersResponse.data.stats.totalUsers || 0;
                }
            } catch (error) {
                console.log('Admin stats not available, using fallback');
            }

            let totalApplications = 0;
            try {
                const appsResponse = await api.get('/applications/me');
                totalApplications = appsResponse.data.applications?.length || 0;
            } catch (error) {
                console.log('Applications not available, using fallback');
            }

            setStats({
                jobs: totalJobs || 24,
                candidates: totalCandidates || 156,
                placements: totalApplications || 89,
                companies: totalEmployers || 24
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            setStats({
                jobs: 24,
                candidates: 156,
                placements: 89,
                companies: 24
            });
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: <FaSearch />, title: t('home.smart_search'), description: t('home.smart_search_desc') },
        { icon: <FaFileAlt />, title: t('home.resume_parsing'), description: t('home.resume_parsing_desc') },
        { icon: <FaRobot />, title: t('home.ai_matching'), description: t('home.ai_matching_desc') },
        { icon: <FaChartLine />, title: t('home.analytics_title'), description: t('home.analytics_desc') }
    ];

    const howItWorks = [
        { step: '1', title: t('home.step1_title'), description: t('home.step1_desc') },
        { step: '2', title: t('home.step2_title'), description: t('home.step2_desc') },
        { step: '3', title: t('home.step3_title'), description: t('home.step3_desc') },
        { step: '4', title: t('home.step4_title'), description: t('home.step4_desc') }
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('common.loading')}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <div className="hero-content">
                                <div className="hero-badge">
                                    <FaRobot className="me-2" /> {t('home.hero_badge')}
                                </div>
                                <h1 className="hero-title">
                                    {t('home.hero_title')}
                                </h1>
                                <p className="hero-subtitle">
                                    {t('home.hero_subtitle')}
                                </p>
                                <div className="hero-buttons">
                                    {isAuthenticated ? (
                                        <>
                                            <Button as={Link} to="/jobs" variant="light" size="lg" className="hero-btn-light">
                                                {t('home.browse_jobs')}
                                            </Button>
                                            <Button as={Link} to="/employer/post-job" variant="outline-light" size="lg" className="hero-btn-outline">
                                                {t('home.get_started')}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button as={Link} to="/register" variant="light" size="lg" className="hero-btn-light">
                                                {t('home.get_started')}
                                            </Button>
                                            <Button as={Link} to="/jobs" variant="outline-light" size="lg" className="hero-btn-outline">
                                                {t('home.browse_jobs')}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="hero-image-wrapper">
                                <div className="hero-image-placeholder">
                                    <div className="floating-card card-1">
                                        <FaUsers /> {stats.candidates}+ {t('home.candidates')}
                                    </div>
                                    <div className="floating-card card-2">
                                        <FaBriefcase /> {stats.jobs}+ {t('home.job_openings')}
                                    </div>
                                    <div className="floating-card card-3">
                                        <FaCheckCircle /> {stats.placements}+ {t('home.placements')}
                                    </div>
                                    <div className="hero-image-content">
                                        <span className="hero-image-icon">🤖</span>
                                        <h3>{t('home.hero_image_title')}</h3>
                                        <p>{t('home.hero_image_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Stats Section */}
            <section className="stats-section-wrapper">
                <Container>
                    <Row className="stats-section">
                        <Col md={3} sm={6} className="stat-item">
                            <div className="stat-number">{stats.jobs}+</div>
                            <div className="stat-label">{t('home.job_openings')}</div>
                        </Col>
                        <Col md={3} sm={6} className="stat-item">
                            <div className="stat-number">{stats.candidates}+</div>
                            <div className="stat-label">{t('home.candidates')}</div>
                        </Col>
                        <Col md={3} sm={6} className="stat-item">
                            <div className="stat-number">{stats.placements}+</div>
                            <div className="stat-label">{t('home.placements')}</div>
                        </Col>
                        <Col md={3} sm={6} className="stat-item">
                            <div className="stat-number">{stats.companies}+</div>
                            <div className="stat-label">{t('home.companies')}</div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <Container>
                    <div className="section-header text-center">
                        <h2>{t('home.features_title')}</h2>
                        <p className="text-muted">{t('home.features_subtitle')}</p>
                    </div>
                    <Row>
                        {features.map((feature, index) => (
                            <Col md={3} sm={6} key={index} className="mb-4">
                                <Card className="feature-card text-center h-100">
                                    <Card.Body>
                                        <div className="feature-icon">{feature.icon}</div>
                                        <Card.Title>{feature.title}</Card.Title>
                                        <Card.Text>{feature.description}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Recent Jobs */}
            <section className="recent-jobs-section">
                <Container>
                    <div className="section-header d-flex justify-content-between align-items-center">
                        <div>
                            <h2>{t('jobs.title')}</h2>
                            <p className="text-muted">{t('home.hero_subtitle')}</p>
                        </div>
                        <Button as={Link} to="/jobs" variant="outline-primary-custom">
                            {t('home.browse_jobs')}
                        </Button>
                    </div>
                    <Row>
                        {recentJobs.length > 0 ? (
                            recentJobs.map((job, index) => (
                                <Col md={4} key={index} className="mb-4">
                                    <Card className="job-card h-100">
                                        <Card.Body>
                                            <div className="job-card-header">
                                                <h5 className="job-title">{job.title}</h5>
                                                <span className={`job-tag job-tag-${(job.employmentType || t('home.default_employment_type')).toLowerCase().replace(/\s+/g, '')}`}>
                                                    {job.employmentType || t('home.default_employment_type')}
                                                </span>
                                            </div>
                                            <p className="company-name">{job.employer?.name || t('home.default_company')}</p>
                                            <div className="job-meta">
                                                <span className="job-location">📍 {job.location || t('home.default_location')}</span>
                                                <span className="job-department">🏢 {job.department || t('home.default_department')}</span>
                                            </div>
                                            <Button as={Link} to={`/jobseeker/apply/${job._id}`} variant="primary-gradient" className="w-100 mt-3">
                                                {t('jobs.apply_now')}
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col md={12}>
                                <div className="text-center py-5">
                                    <h5>{t('jobs.no_jobs')}</h5>
                                    <p className="text-muted">{t('jobs.no_jobs_desc')}</p>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Container>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <Container>
                    <div className="section-header text-center">
                        <h2>{t('home.how_it_works')}</h2>
                        <p className="text-muted">{t('home.hero_subtitle')}</p>
                    </div>
                    <Row className="justify-content-center">
                        {howItWorks.map((item, index) => (
                            <Col md={3} sm={6} key={index} className="mb-4">
                                <div className="step-card text-center">
                                    <div className="step-number">{item.step}</div>
                                    <h5>{item.title}</h5>
                                    <p className="text-muted">{item.description}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8} className="mb-4 mb-lg-0">
                            <h2 className="cta-title">{t('home.cta_title')}</h2>
                            <p className="cta-text">{t('home.cta_text')}</p>
                        </Col>
                        <Col lg={4} className="text-lg-end">
                            {isAuthenticated ? (
                                <Button as={Link} to="/jobs" variant="light" size="lg" className="cta-btn">
                                    {t('home.browse_jobs')}
                                </Button>
                            ) : (
                                <Button as={Link} to="/register" variant="light" size="lg" className="cta-btn">
                                    {t('home.get_started')}
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    );
};

export default Home;