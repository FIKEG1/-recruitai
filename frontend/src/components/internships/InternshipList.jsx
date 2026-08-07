import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, InputGroup, Pagination, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaClock, FaGraduationCap, FaMoneyBillWave, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const InternshipList = () => {
    const { t } = useLanguage();
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        internshipType: '',
        internshipDuration: '',
        fieldOfStudy: '',
        yearOfStudy: '',
        minGPA: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalInternships: 0
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchInternships();
    }, [filters, pagination.currentPage]);

    const fetchInternships = async () => {
        try {
            setLoading(true);
            setError('');
            const params = new URLSearchParams({
                page: pagination.currentPage,
                ...filters
            });
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });
            
            const response = await api.get(`/internships?${params.toString()}`);
            setInternships(response.data.internships || []);
            setPagination({
                currentPage: response.data.currentPage || 1,
                totalPages: response.data.totalPages || 1,
                totalInternships: response.data.totalInternships || 0
            });
        } catch (error) {
            console.error('Error fetching internships:', error);
            setError(t('internships.load_error'));
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
            internshipType: '',
            internshipDuration: '',
            fieldOfStudy: '',
            yearOfStudy: '',
            minGPA: ''
        });
        setPagination({ ...pagination, currentPage: 1 });
    };

    const getInternshipTypeBadge = (type) => {
        const typeMap = {
            'Paid': 'success',
            'Unpaid': 'secondary',
            'Stipend': 'info',
            'Credit': 'warning'
        };
        return typeMap[type] || 'secondary';
    };

    const getDurationBadge = (duration) => {
        const durationMap = {
            '3 Months': 'primary',
            '6 Months': 'success',
            '9 Months': 'info',
            '12 Months': 'warning',
            'Flexible': 'secondary'
        };
        return durationMap[duration] || 'secondary';
    };

    const internshipsFoundText = t('internships.found_count', {
        count: pagination.totalInternships,
        plural: pagination.totalInternships !== 1 ? 's' : ''
    });

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">{t('internships.loading')}</p>
            </Container>
        );
    }

    return (
        <section className="internship-section py-4">
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold">🎓 {t('internships.title')}</h2>
                        <p className="text-muted">{t('internships.subtitle')}</p>
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                </div>

                {/* Search Bar */}
                <Card className="shadow-sm mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={5} className="mb-2 mb-md-0">
                                <InputGroup>
                                    <InputGroup.Text className="bg-white">
                                        <FaSearch className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="search"
                                        placeholder={t('internships.search_placeholder')}
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                        className="border-start-0"
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={4} className="mb-2 mb-md-0">
                                <Form.Control
                                    type="text"
                                    name="location"
                                    placeholder={t('internships.location_placeholder')}
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
                                    {t('internships.filters')} {Object.values(filters).some(v => v) && <Badge bg="primary" className="ms-1">{t('internships.active')}</Badge>}
                                </Button>
                            </Col>
                        </Row>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <Row className="mt-3 pt-3 border-top">
                                <Col md={3} className="mb-2">
                                    <Form.Label className="fw-semibold small">{t('internships.internship_type')}</Form.Label>
                                    <Form.Select
                                        name="internshipType"
                                        value={filters.internshipType}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">{t('internships.all_types')}</option>
                                        <option value="Paid">{t('internships.paid')}</option>
                                        <option value="Unpaid">{t('internships.unpaid')}</option>
                                        <option value="Stipend">{t('internships.stipend')}</option>
                                        <option value="Credit">{t('internships.credit')}</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Form.Label className="fw-semibold small">{t('internships.duration')}</Form.Label>
                                    <Form.Select
                                        name="internshipDuration"
                                        value={filters.internshipDuration}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">{t('internships.all_durations')}</option>
                                        <option value="3 Months">{t('internships.months_3')}</option>
                                        <option value="6 Months">{t('internships.months_6')}</option>
                                        <option value="9 Months">{t('internships.months_9')}</option>
                                        <option value="12 Months">{t('internships.months_12')}</option>
                                        <option value="Flexible">{t('internships.flexible')}</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Form.Label className="fw-semibold small">{t('internships.field_of_study')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fieldOfStudy"
                                        placeholder={t('internships.field_of_study_placeholder')}
                                        value={filters.fieldOfStudy}
                                        onChange={handleFilterChange}
                                    />
                                </Col>
                                <Col md={3} className="mb-2">
                                    <Form.Label className="fw-semibold small">{t('internships.min_gpa')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="minGPA"
                                        placeholder={t('internships.min_gpa_placeholder')}
                                        step="0.1"
                                        min="0"
                                        max="4"
                                        value={filters.minGPA}
                                        onChange={handleFilterChange}
                                    />
                                </Col>
                                <Col md={12} className="text-end mt-2">
                                    <Button variant="link" onClick={resetFilters} className="text-decoration-none">
                                        {t('internships.reset_filters')}
                                    </Button>
                                </Col>
                            </Row>
                        )}
                    </Card.Body>
                </Card>

                {/* Results Count */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">
                        {internshipsFoundText}
                    </span>
                </div>

                {/* Internship Listings */}
                {internships.length === 0 ? (
                    <Card className="text-center py-5">
                        <Card.Body>
                            <div className="mb-3" style={{ fontSize: '4rem' }}>🔍</div>
                            <h4>{t('internships.no_results')}</h4>
                            <p className="text-muted">{t('internships.no_results_desc')}</p>
                            <Button variant="primary-gradient" onClick={resetFilters}>
                                {t('internships.clear_filters')}
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row>
                        {internships.map((internship) => (
                            <Col md={6} lg={4} key={internship._id} className="mb-4">
                                <Card className="job-card h-100">
                                    <Card.Body>
                                        <div className="job-card-header">
                                            <h5 className="job-title">{internship.title}</h5>
                                            <Badge bg={getInternshipTypeBadge(internship.internshipType)}>
                                                {internship.internshipType || t('internships.unpaid')}
                                            </Badge>
                                        </div>
                                        <p className="company-name text-muted">
                                            {internship.employer?.name || t('home.default_company')}
                                        </p>
                                        
                                        <div className="job-meta small text-muted">
                                            <div><FaMapMarkerAlt className="me-1" /> {internship.location || t('home.default_location')}</div>
                                            <div><FaGraduationCap className="me-1" /> {internship.academicRequirements?.yearOfStudy || t('internships.year_any')}</div>
                                        </div>

                                        <div className="mt-2">
                                            <Badge bg={getDurationBadge(internship.internshipDuration)} className="me-1">
                                                <FaClock className="me-1" /> {internship.internshipDuration || t('internships.months_6')}
                                            </Badge>
                                            {internship.internshipType === 'Paid' && (
                                                <Badge bg="success" className="me-1">
                                                    <FaMoneyBillWave className="me-1" /> {t('internships.paid')}
                                                </Badge>
                                            )}
                                            {internship.numberOfPositions && (
                                                <Badge bg="info">
                                                    {internship.numberOfPositions} {t('internships.positions')}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="job-description mt-2 small text-muted" style={{ 
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {internship.description}
                                        </div>

                                        {/* Skills */}
                                        <div className="mt-2">
                                            {internship.requirements?.skills?.slice(0, 3).map((skill, idx) => (
                                                <span key={idx} className="job-tag" style={{
                                                    background: '#e8f5e9',
                                                    color: '#2e7d32',
                                                    padding: '2px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.7rem',
                                                    marginRight: '4px',
                                                    marginBottom: '4px',
                                                    display: 'inline-block'
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                            {internship.requirements?.skills?.length > 3 && (
                                                <span className="text-muted small">+{internship.requirements.skills.length - 3} more</span>
                                            )}
                                        </div>

                                        {/* Benefits */}
                                        {internship.benefits?.length > 0 && (
                                            <div className="mt-2">
                                                <small className="text-muted">{t('internships.benefits')}</small>
                                                <div className="d-flex flex-wrap gap-1 mt-1">
                                                    {internship.benefits.slice(0, 2).map((benefit, idx) => (
                                                        <span key={idx} className="badge bg-light text-dark border">
                                                            {benefit}
                                                        </span>
                                                    ))}
                                                    {internship.benefits.length > 2 && (
                                                        <span className="text-muted small">+{internship.benefits.length - 2}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="text-muted small">
                                                <FaCalendarAlt className="me-1" />
                                                {t('internships.deadline')} {new Date(internship.applicationDeadline).toLocaleDateString()}
                                            </span>
                                            <Button 
                                                as={Link} 
                                                to={`/internships/apply/${internship._id}`} 
                                                variant="primary-gradient" 
                                                size="sm"
                                            >
                                                {t('internships.apply_now')}
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
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

export default InternshipList;