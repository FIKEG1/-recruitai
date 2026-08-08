import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children, title }) => {
    return (
        <Container fluid className="p-0">
            <Row className="g-0">
                <Col md={2} className="d-none d-md-block">
                    <AdminSidebar />
                </Col>
                <Col md={10}>
                    <div className="p-4">
                        {title && (
                            <h2 className="fw-bold mb-4">{title}</h2>
                        )}
                        {children}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminLayout;  // ← MUST HAVE THIS!