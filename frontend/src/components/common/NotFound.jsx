import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6} className="text-center">
                    <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#2c3e8f' }} className="mb-3">404</div>
                    <h2 className="fw-bold">Page Not Found</h2>
                    <p className="text-muted mb-4">
                        The page you are looking for might have been removed, had its name changed, 
                        or is temporarily unavailable.
                    </p>
                    <Button as={Link} to="/" variant="primary-gradient">
                        <FaHome className="me-2" /> Back to Home
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFound;