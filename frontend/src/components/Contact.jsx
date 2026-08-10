import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission
        toast.success("Thank you for reaching out! We'll get back to you soon.");
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="contact-page py-5 bg-light min-vh-100">
            <Container>
                <div className="text-center mb-5 fade-in">
                    <h1 className="fw-bold display-4 text-dark mb-3">Contact Us</h1>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
                        Have a question or need assistance? We're here to help. Reach out to the KETARI team.
                    </p>
                </div>
                
                <Row className="g-4">
                    <Col md={5}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 p-4 text-white" style={{ background: 'var(--primary-gradient)' }}>
                            <Card.Body>
                                <h3 className="fw-bold mb-4">Get in Touch</h3>
                                <p className="mb-4">Fill out the form and our team will get back to you within 24 hours.</p>
                                
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-white text-primary rounded-circle p-3 me-3">
                                        <FaPhone />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Call Us</h6>
                                        <span>+251 911 234 567</span>
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-white text-primary rounded-circle p-3 me-3">
                                        <FaEnvelope />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Email Us</h6>
                                        <span>support@ketari.et</span>
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-center">
                                    <div className="bg-white text-primary rounded-circle p-3 me-3">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">Location</h6>
                                        <span>Addis Ababa, Ethiopia</span>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={7}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 p-4">
                            <Card.Body>
                                <h3 className="fw-bold mb-4">Send a Message</h3>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">Your Name</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Enter your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                            className="p-3 bg-light border-0 rounded-3"
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">Email Address</Form.Label>
                                        <Form.Control 
                                            type="email" 
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                            className="p-3 bg-light border-0 rounded-3"
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">Your Message</Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={5}
                                            placeholder="How can we help you?"
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            required
                                            className="p-3 bg-light border-0 rounded-3"
                                        />
                                    </Form.Group>
                                    
                                    <Button type="submit" variant="primary" size="lg" className="w-100 rounded-pill fw-bold">
                                        <FaPaperPlane className="me-2" /> Send Message
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;
