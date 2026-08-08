import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ConfigManager = () => {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [activeTab, setActiveTab] = useState('organization');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get('/config');
            setConfig(response.data.data || {});
        } catch (error) {
            console.error('Error fetching config:', error);
            setError('Failed to load configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleOrganizationUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/config/organization', config.organization);
            setConfig(response.data.data);
            toast.success('Organization updated successfully!');
        } catch (error) {
            toast.error('Failed to update organization');
        }
    };

    const handleAddItem = async (type) => {
        try {
            const response = await api.post(`/config/${type}`, newItem);
            setConfig(response.data.data);
            setNewItem({});
            setShowAddModal(false);
            toast.success(`${type} added successfully!`);
        } catch (error) {
            toast.error('Failed to add item');
        }
    };

    const handleDeleteItem = async (type, id) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            const response = await api.delete(`/config/${type}/${id}`);
            setConfig(response.data.data);
            toast.success('Item deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const renderOrganization = () => (
        <Form onSubmit={handleOrganizationUpdate}>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Organization Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={config?.organization?.name || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                organization: { ...config?.organization, name: e.target.value }
                            })}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={config?.organization?.email || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                organization: { ...config?.organization, email: e.target.value }
                            })}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            value={config?.organization?.phone || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                organization: { ...config?.organization, phone: e.target.value }
                            })}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Website</Form.Label>
                        <Form.Control
                            type="text"
                            value={config?.organization?.website || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                organization: { ...config?.organization, website: e.target.value }
                            })}
                        />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={config?.organization?.address || ''}
                            onChange={(e) => setConfig({
                                ...config,
                                organization: { ...config?.organization, address: e.target.value }
                            })}
                        />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Button type="submit" variant="primary-gradient">
                        <FaSave className="me-2" /> Update Organization
                    </Button>
                </Col>
            </Row>
        </Form>
    );

    const renderList = (items, type, fields, label) => (
        <div>
            <div className="d-flex justify-content-between mb-3">
                <h6>{label}</h6>
                <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                    <FaPlus className="me-1" /> Add {label}
                </Button>
            </div>
            <Table responsive hover>
                <thead>
                    <tr>
                        {fields.map((field) => (
                            <th key={field}>{field}</th>
                        ))}
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items?.map((item) => (
                        <tr key={item._id}>
                            {fields.map((field) => (
                                <td key={field}>{item[field] || 'N/A'}</td>
                            ))}
                            <td>
                                <Badge bg={item.status === 'active' ? 'success' : 'danger'}>
                                    {item.status || 'active'}
                                </Badge>
                            </td>
                            <td>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteItem(type, item._id)}>
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {(!items || items.length === 0) && (
                        <tr><td colSpan={fields.length + 2} className="text-center text-muted">No items found</td></tr>
                    )}
                </tbody>
            </Table>
        </div>
    );

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading configurations...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="fw-bold mb-4">⚙️ Configuration Manager</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm">
                <Card.Body>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-4"
                    >
                        <Tab eventKey="organization" title="Organization">
                            {renderOrganization()}
                        </Tab>
                        <Tab eventKey="departments" title="Departments">
                            {renderList(
                                config?.departments,
                                'departments',
                                ['name', 'code', 'description'],
                                'Departments'
                            )}
                        </Tab>
                        <Tab eventKey="positions" title="Positions">
                            {renderList(
                                config?.positions,
                                'positions',
                                ['title', 'code', 'rank'],
                                'Positions'
                            )}
                        </Tab>
                        <Tab eventKey="skills" title="Skills">
                            {renderList(
                                config?.skills,
                                'skills',
                                ['name', 'category'],
                                'Skills'
                            )}
                        </Tab>
                        <Tab eventKey="leaveTypes" title="Leave Types">
                            {renderList(
                                config?.leaveTypes,
                                'leave-types',
                                ['name', 'daysPerYear', 'paid'],
                                'Leave Types'
                            )}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ConfigManager;