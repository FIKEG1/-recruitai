import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'jobseeker'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        const { confirmPassword, ...userData } = formData;
        const result = await register(userData);
        setLoading(false);

        if (result.success) {
            const user = result.user;
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'employer') {
                navigate('/employer/jobs');
            } else {
                navigate('/jobseeker/dashboard');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <section className="auth-section py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={6} md={8}>
                        <Card className="auth-card shadow-sm border-0">
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <div className="auth-icon mb-3">
                                        <span style={{ fontSize: '3rem' }}>🚀</span>
                                    </div>
                                    <h3 className="fw-bold">Create Account</h3>
                                    <p className="text-muted">Join the platform and find your perfect job</p>
                                </div>

                                {error && (
                                    <Alert variant="danger" className="rounded-3">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Label className="fw-semibold">Full Name</Form.Label>
                                            <div className="input-group-custom">
                                                <span className="input-icon">
                                                    <FaUser />
                                                </span>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    placeholder="Enter your full name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="form-control-custom"
                                                    required
                                                />
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Label className="fw-semibold">Email Address</Form.Label>
                                            <div className="input-group-custom">
                                                <span className="input-icon">
                                                    <FaEnvelope />
                                                </span>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    placeholder="Enter your email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="form-control-custom"
                                                    required
                                                />
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Label className="fw-semibold">Password</Form.Label>
                                            <div className="input-group-custom">
                                                <span className="input-icon">
                                                    <FaLock />
                                                </span>
                                                <Form.Control
                                                    type="password"
                                                    name="password"
                                                    placeholder="Min 6 characters"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="form-control-custom"
                                                    required
                                                    minLength="6"
                                                />
                                            </div>
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                                            <div className="input-group-custom">
                                                <span className="input-icon">
                                                    <FaLock />
                                                </span>
                                                <Form.Control
                                                    type="password"
                                                    name="confirmPassword"
                                                    placeholder="Confirm password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="form-control-custom"
                                                    required
                                                    minLength="6"
                                                />
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Label className="fw-semibold">I am a</Form.Label>
                                            <div className="role-selector">
                                                <div className="role-option">
                                                    <Form.Check
                                                        type="radio"
                                                        name="role"
                                                        value="jobseeker"
                                                        id="role-jobseeker"
                                                        checked={formData.role === 'jobseeker'}
                                                        onChange={handleChange}
                                                        label={
                                                            <span>
                                                                <FaUser className="me-2" /> Job Seeker
                                                            </span>
                                                        }
                                                        className="role-radio"
                                                    />
                                                </div>
                                                <div className="role-option">
                                                    <Form.Check
                                                        type="radio"
                                                        name="role"
                                                        value="employer"
                                                        id="role-employer"
                                                        checked={formData.role === 'employer'}
                                                        onChange={handleChange}
                                                        label={
                                                            <span>
                                                                <FaBuilding className="me-2" /> Employer
                                                            </span>
                                                        }
                                                        className="role-radio"
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                    <Button
                                        type="submit"
                                        variant="primary-gradient"
                                        className="w-100 py-2 fw-semibold mt-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account <FaUserPlus className="ms-2" />
                                            </>
                                        )}
                                    </Button>
                                </Form>

                                <div className="text-center mt-4">
                                    <p className="text-muted">
                                        Already have an account?{' '}
                                        <Link to="/login" className="fw-semibold text-decoration-none">
                                            Sign In
                                        </Link>
                                    </p>
                                </div>

                                <hr className="my-4" />
                                <div className="text-center">
                                    <p className="text-muted small">
                                        By creating an account, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Register;