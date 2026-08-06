import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, InputGroup, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaClock, FaFilter, FaStar, FaRobot } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const JobSearch = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        employmentType: '',
        minSalary: '',
        maxSalary: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, [filters, pagination.currentPage]);

    const calculateMatchScore = (job) => {
        // Calculate match score based on user profile and job requirements
        let score = 0;
        let matchedSkills = [];
        let totalSkills = 0;

        const jobSkills = job?.requirements?.skills || [];
        const userSkills = user?.profile?.skills || [];
        
        totalSkills = jobSkills.length;

        if (jobSkills.length > 0 && userSkills.length > 0) {
            matchedSkills = jobSkills.filter(skill => 
                userSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()) || 
                                      skill.toLowerCase().includes(us.toLowerCase()))
            );
            score = Math.round((matchedSkills.length / jobSkills.length) * 100);
        } else if (jobSkills.length === 0) {
            score = 100;
        }

        return {
            score: Math.min(score, 100),
            matchedSkills: matchedSkills,
            totalSkills: totalSkills
        };
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.currentPage,
                ...filters
            });
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });
            
            const response = await api.get(`/jobs?${params.toString()}`);
            let jobList = response.data.jobs || [];
            
            // Calculate match score for each job if user is logged in
            if (user) {
                jobList = jobList.map(job => ({
                    ...job,
                    matchScore: calculateMatchScore(job)
                }));
            }
            
            setJobs(jobList);
            setPagination({
                currentPage: response.data.currentPage || 1,
                totalPages: response.data.totalPages || 1,
                totalJobs: response.data.totalJobs || 0
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPagination({ ...pagination, currentPage: 1 });
    };

    const handlePageChange = (page) => {
        setPagination({ ...pagination, currentPage: page });
        window.scrollTo(0, 0);
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            location: '',
            employmentType: '',
            minSalary: '',
            maxSalary: ''
        });
        setPagination({ ...pagination, currentPage: 1 });
    };

    const getEmploymentTypeBadge = (type) => {
        const typeMap = {
            'Full-Time': 'success',
            'Part-Time': 'warning',
            'Contract': 'info',
            'Internship': 'primary'
        };
        return typeMap[type] || 'secondary';
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'success';
        if (score >= 40) return 'warning';
        return 'danger';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Match';
        if (score >= 40) return 'Fair Match';
        return 'Low Match';
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading jobs...</p>
            </Container>
        );
    }

    return (
        <section className="job-search-section py-4">
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-0">Browse Jobs</h2>
                        {user && (
                            <p className="text-muted small">
                                <FaRobot className="me-1" />
                                AI-powered matching shows how well each job fits your profile
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Search Bar */}
                <Card className="shadow-sm mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={6} className="mb-2 mb-md-0">
                                <InputGroup>
                                    <InputGroup.Text className="bg-white">
                                        <FaSearch className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="search"
                                        placeholder="Search by job title, department, or keyword..."
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                        className="border-start-0"
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3} className="mb-2 mb-md-0">
                                <Form.Control
                                    type="text"
                                    name="location"
                                    placeholder="Location"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                />
                            </Col>
                            <Col md={3}>
                                <Button 
                                    variant="outline-secondary" 
                                    className="w-100"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FaFilter className="me-2" />
                                    Filters {Object.values(filters).some(v => v) && <Badge bg="primary" className="ms-1">Active</Badge>}
                                </Button>
                            </Col>
                        </Row>
                        
                        {/* Advanced Filters */}
                        {showFilters && (
                            <Row className="mt-3 pt-3 border-top">
                                <Col md={4} className="mb-2">
                                    <Form.Label className="fw-semibold small">Employment Type</Form.Label>
                                    <Form.Select
                                        name="employmentType"
                                        value={filters.employmentType}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Types</option>
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </Form.Select>
                                </Col>
                                <Col md={4} className="mb-2">
                                    <Form.Label className="fw-semibold small">Min Salary (ETB)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="minSalary"
                                        placeholder="Min"
                                        value={filters.minSalary}
                                        onChange={handleFilterChange}
                                    />
                                </Col>
                                <Col md={4} className="mb-2">
                                    <Form.Label className="fw-semibold small">Max Salary (ETB)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="maxSalary"
                                        placeholder="Max"
                                        value={filters.maxSalary}
                                        onChange={handleFilterChange}
                                    />
                                </Col>
                                <Col md={12} className="text-end mt-2">
                                    <Button variant="link" onClick={resetFilters} className="text-decoration-none">
                                        Reset Filters
                                    </Button>
                                </Col>
                            </Row>
                        )}
                    </Card.Body>
                </Card>

                {/* Results Count */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">
                        Found {pagination.totalJobs} job{pagination.totalJobs !== 1 ? 's' : ''}
                    </span>
                    {user && (
                        <span className="text-muted small">
                            <FaStar className="text-warning me-1" />
                            Sorted by AI match score
                        </span>
                    )}
                </div>

                {/* Job Listings */}
                {jobs.length === 0 ? (
                    <Card className="text-center py-5">
                        <Card.Body>
                            <div className="mb-3" style={{ fontSize: '4rem' }}>🔍</div>
                            <h4>No jobs found</h4>
                            <p className="text-muted">Try adjusting your search filters</p>
                            <Button variant="primary-gradient" onClick={resetFilters}>
                                Clear Filters
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row>
                        {jobs.map((job) => {
                            const matchScore = job.matchScore?.score || 0;
                            const matchedSkills = job.matchScore?.matchedSkills || [];
                            const totalSkills = job.matchScore?.totalSkills || 0;
                            
                            return (
                                <Col md={6} lg={4} key={job._id} className="mb-4">
                                    <Card className="job-card h-100">
                                        <Card.Body>
                                            <div className="job-card-header">
                                                <h5 className="job-title">{job.title}</h5>
                                                <Badge bg={getEmploymentTypeBadge(job.employmentType)}>
                                                    {job.employmentType || 'Full-Time'}
                                                </Badge>
                                            </div>
                                            <p className="company-name text-muted">
                                                {job.employer?.name || 'Sidama Innovation and Technology Agency'}
                                            </p>
                                            <div className="job-meta small text-muted">
                                                <div><FaMapMarkerAlt className="me-1" /> {job.location || 'Hawassa'}</div>
                                                <div><FaBriefcase className="me-1" /> {job.department || 'ICT'}</div>
                                            </div>
                                            
                                            {/* AI Match Score - Only show if user is logged in */}
                                            {user && (
                                                <div className="mt-2 mb-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <small className="text-muted">
                                                            <FaRobot className="me-1" />
                                                            AI Match
                                                        </small>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className={`fw-bold text-${getScoreColor(matchScore)}`}>
                                                                {matchScore}%
                                                            </span>
                                                            <Badge bg={getScoreColor(matchScore)} className="px-2 py-1">
                                                                {getScoreLabel(matchScore)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    {matchedSkills.length > 0 && totalSkills > 0 && (
                                                        <div className="mt-1">
                                                            <small className="text-muted">
                                                                {matchedSkills.length}/{totalSkills} skills matched
                                                            </small>
                                                            <div className="progress" style={{ height: '4px' }}>
                                                                <div 
                                                                    className={`progress-bar bg-${getScoreColor(matchScore)}`} 
                                                                    style={{ width: `${matchScore}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="job-description mt-2 small text-muted" style={{ 
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {job.description}
                                            </div>
                                            <div className="mt-3">
                                                {job.requirements?.skills?.slice(0, 4).map((skill, idx) => {
                                                    const isMatched = user && matchedSkills.includes(skill);
                                                    return (
                                                        <span 
                                                            key={idx} 
                                                            className="job-tag" 
                                                            style={{
                                                                background: isMatched ? '#e8f5e9' : '#f5f5f5',
                                                                color: isMatched ? '#2e7d32' : '#666',
                                                                padding: '2px 10px',
                                                                borderRadius: '12px',
                                                                fontSize: '0.7rem',
                                                                marginRight: '4px',
                                                                marginBottom: '4px',
                                                                display: 'inline-block',
                                                                border: isMatched ? '1px solid #4caf50' : '1px solid #e0e0e0'
                                                            }}
                                                        >
                                                            {skill}
                                                            {isMatched && ' ✅'}
                                                        </span>
                                                    );
                                                })}
                                                {job.requirements?.skills?.length > 4 && (
                                                    <span className="text-muted small">+{job.requirements.skills.length - 4} more</span>
                                                )}
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="text-muted small">
                                                    <FaClock className="me-1" />
                                                    Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                                                </span>
                                                <Button 
                                                    as={Link} 
                                                    to={`/jobseeker/apply/${job._id}`} 
                                                    variant="primary-gradient" 
                                                    size="sm"
                                                >
                                                    Apply Now
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination>
                            <Pagination.Prev 
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                            />
                            {[...Array(pagination.totalPages)].map((_, idx) => (
                                <Pagination.Item
                                    key={idx + 1}
                                    active={pagination.currentPage === idx + 1}
                                    onClick={() => handlePageChange(idx + 1)}
                                >
                                    {idx + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                            />
                        </Pagination>
                    </div>
                )}
            </Container>
        </section>
    );
};

export default JobSearch;