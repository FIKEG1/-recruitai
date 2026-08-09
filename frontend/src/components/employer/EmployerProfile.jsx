import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Badge, Image, Tab, Nav } from 'react-bootstrap';
import { FaUser, FaUpload, FaTrash, FaSave, FaCamera, FaBuilding, FaGlobe, FaMapMarkerAlt, FaPhone, FaInfoCircle, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api, { getImageUrl } from '../../services/api';
import { toast } from 'react-toastify';

const EmployerProfile = () => {
    const { user, updateProfile } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(user?.profile?.profilePhoto || null);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        profile: {
            phone: user?.profile?.phone || '',
            location: user?.profile?.location || '',
            bio: user?.profile?.bio || '',
            skills: user?.profile?.skills || []
        },
        company: {
            name: user?.company?.name || '',
            description: user?.company?.description || '',
            website: user?.company?.website || '',
            location: user?.company?.location || '',
            industry: user?.company?.industry || '',
            size: user?.company?.size || '',
            foundedYear: user?.company?.foundedYear || '',
            email: user?.company?.email || '',
            phone: user?.company?.phone || ''
        }
    });

    useEffect(() => {
        if (user?.profile?.profilePhoto) {
            setProfilePhoto(user.profile.profilePhoto);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('profile.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                profile: { ...formData.profile, [field]: value }
            });
        } else if (name.startsWith('company.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                company: { ...formData.company, [field]: value }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await updateProfile({
            name: formData.name,
            profile: formData.profile,
            company: formData.company
        });
        setLoading(false);
        if (result.success) {
            toast.success('Company profile updated successfully!');
        }
    };

    // Photo upload
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only JPEG, PNG, GIF, and WebP images are allowed');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        const localPreview = URL.createObjectURL(file);
        setPreviewPhoto(localPreview);
        setUploadingPhoto(true);
        try {
            const response = await api.post('/upload/profile-photo', formData);
            const uploadedPhoto = response.data.data.profilePhoto;
            setProfilePhoto(uploadedPhoto);
            setPreviewPhoto(null);
            toast.success('Profile photo updated successfully!');
            await updateProfile({
                profile: { profilePhoto: uploadedPhoto }
            });
        } catch (error) {
            setPreviewPhoto(null);
            toast.error(error.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
            e.target.value = '';
        }
    };

    const handleRemovePhoto = async () => {
        if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
        try {
            await api.delete('/upload/profile-photo');
            setProfilePhoto(null);
            toast.success('Profile photo removed');
            await updateProfile({
                profile: { profilePhoto: null }
            });
        } catch (error) {
            toast.error('Failed to remove photo');
        }
    };

    return (
        <section className="profile-section py-4">
            <Container>
                <h2 className="fw-bold mb-4">
                    <FaBuilding className="me-2 text-primary" /> Company Profile
                </h2>
                
                <Row>
                    <Col lg={3}>
                        {/* Profile Photo Card */}
                        <Card className="shadow-sm mb-4 text-center">
                            <Card.Body className="p-4">
                                <div className="position-relative d-inline-block">
                                    {profilePhoto || previewPhoto ? (
                                        <Image 
                                            key={profilePhoto || previewPhoto}
                                            src={previewPhoto || getImageUrl(profilePhoto)}
                                            roundedCircle 
                                            style={{ 
                                                width: '150px', 
                                                height: '150px', 
                                                objectFit: 'cover',
                                                border: '4px solid #2c3e8f'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                                            }}
                                        />
                                    ) : (
                                        <div 
                                            style={{ 
                                                width: '150px', 
                                                height: '150px', 
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #2c3e8f, #1a237e)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--surface)',
                                                fontSize: '4rem',
                                                margin: '0 auto',
                                                border: '4px solid #2c3e8f'
                                            }}
                                        >
                                            <FaBuilding />
                                        </div>
                                    )}
                                    {profilePhoto || previewPhoto ? (
                                        <div 
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #2c3e8f, #1a237e)',
                                                display: 'none',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--surface)',
                                                fontSize: '4rem',
                                                margin: '0 auto',
                                                border: '4px solid #2c3e8f'
                                            }}
                                        >
                                            <FaBuilding />
                                        </div>
                                    ) : null}
                                    <div className="position-absolute bottom-0 end-0">
                                        <label 
                                            htmlFor="photo-upload" 
                                            style={{ 
                                                cursor: 'pointer',
                                                background: '#2c3e8f',
                                                color: 'var(--surface)',
                                                borderRadius: '50%',
                                                padding: '10px',
                                                display: 'inline-block',
                                                border: '2px solid var(--surface)'
                                            }}
                                        >
                                            <FaCamera size={16} />
                                        </label>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/*"
                                            capture="user"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                            disabled={uploadingPhoto}
                                        />
                                    </div>
                                </div>
                                <h5 className="mt-3">{formData.company.name || user?.name}</h5>
                                <p className="text-muted small">Employer</p>
                                {profilePhoto && (
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={handleRemovePhoto}
                                        className="mt-2"
                                    >
                                        <FaTrash className="me-1" /> Remove Photo
                                    </Button>
                                )}
                                {uploadingPhoto && (
                                    <div className="mt-2">
                                        <Spinner animation="border" size="sm" />
                                        <span className="ms-2">Uploading...</span>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Company Stats */}
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white fw-bold">
                                <FaInfoCircle className="me-2" /> Company Info
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-2">
                                    <small className="text-muted">Company Name</small>
                                    <p className="fw-semibold mb-0">{formData.company.name || 'Not set'}</p>
                                </div>
                                <div className="mb-2">
                                    <small className="text-muted">Industry</small>
                                    <p className="fw-semibold mb-0">{formData.company.industry || 'Not set'}</p>
                                </div>
                                <div className="mb-2">
                                    <small className="text-muted">Location</small>
                                    <p className="fw-semibold mb-0">{formData.company.location || 'Not set'}</p>
                                </div>
                                <div className="mb-2">
                                    <small className="text-muted">Company Size</small>
                                    <p className="fw-semibold mb-0">{formData.company.size || 'Not set'}</p>
                                </div>
                                <div>
                                    <small className="text-muted">Founded</small>
                                    <p className="fw-semibold mb-0">{formData.company.foundedYear || 'Not set'}</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={9}>
                        <Card className="shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <Tab.Container defaultActiveKey="company">
                                    <Nav variant="tabs" className="mb-3">
                                        <Nav.Item>
                                            <Nav.Link eventKey="company">
                                                <FaBuilding className="me-2" /> Company Info
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="personal">
                                                <FaUser className="me-2" /> Personal
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>

                                    <Tab.Content>
                                        {/* Company Info Tab */}
                                        <Tab.Pane eventKey="company">
                                            <Form onSubmit={handleSubmit}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Company Name *</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="company.name"
                                                                value={formData.company.name}
                                                                onChange={handleChange}
                                                                placeholder="e.g., Sidama Innovation and Technology Agency"
                                                                className="form-control-custom"
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Industry</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="company.industry"
                                                                value={formData.company.industry}
                                                                onChange={handleChange}
                                                                placeholder="e.g., Technology, Government, Education"
                                                                className="form-control-custom"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Company Email</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                name="company.email"
                                                                value={formData.company.email}
                                                                onChange={handleChange}
                                                                placeholder="company@email.com"
                                                                className="form-control-custom"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Company Phone</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="company.phone"
                                                                value={formData.company.phone}
                                                                onChange={handleChange}
                                                                placeholder="+251 912 345 678"
                                                                className="form-control-custom"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Website</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="company.website"
                                                                value={formData.company.website}
                                                                onChange={handleChange}
                                                                placeholder="https://example.com"
                                                                className="form-control-custom"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Company Location</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="company.location"
                                                                value={formData.company.location}
                                                                onChange={handleChange}
                                                                placeholder="e.g., Hawassa, Ethiopia"
                                                                className="form-control-custom"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Company Size</Form.Label>
                                                            <Form.Select
                                                                name="company.size"
                                                                value={formData.company.size}
                                                                onChange={handleChange}
                                                                className="form-control-custom"
                                                            >
                                                                <option value="">Select size</option>
                                                                <option value="1-10">1-10 employees</option>
                                                                <option value="11-50">11-50 employees</option>
                                                                <option value="51-200">51-200 employees</option>
                                                                <option value="201-500">201-500 employees</option>
                                                                <option value="501-1000">501-1000 employees</option>
                                                                <option value="1000+">1000+ employees</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Founded Year</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                name="company.foundedYear"
                                                                value={formData.company.foundedYear}
                                                                onChange={handleChange}
                                                                placeholder="e.g., 2020"
                                                                className="form-control-custom"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Company Description</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={4}
                                                        name="company.description"
                                                        value={formData.company.description}
                                                        onChange={handleChange}
                                                        placeholder="Describe your company, mission, and what you do..."
                                                        className="form-control-custom"
                                                    />
                                                </Form.Group>

                                                <Button
                                                    type="submit"
                                                    variant="primary-gradient"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                    ) : (
                                                        <FaSave className="me-2" />
                                                    )}
                                                    Save Company Profile
                                                </Button>
                                            </Form>
                                        </Tab.Pane>

                                        {/* Personal Tab */}
                                        <Tab.Pane eventKey="personal">
                                            <Form onSubmit={handleSubmit}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Full Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="name"
                                                                value={formData.name}
                                                                onChange={handleChange}
                                                                className="form-control-custom"
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Email</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                value={user?.email}
                                                                disabled
                                                                className="form-control-custom bg-light"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Phone Number</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="profile.phone"
                                                                value={formData.profile.phone}
                                                                onChange={handleChange}
                                                                placeholder="+251 912 345 678"
                                                                className="form-control-custom"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">Location</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="profile.location"
                                                                value={formData.profile.location}
                                                                onChange={handleChange}
                                                                placeholder="e.g., Hawassa, Ethiopia"
                                                                className="form-control-custom"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Bio / About</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={4}
                                                        name="profile.bio"
                                                        value={formData.profile.bio}
                                                        onChange={handleChange}
                                                        placeholder="Tell about yourself and your role..."
                                                        className="form-control-custom"
                                                    />
                                                </Form.Group>

                                                <Button
                                                    type="submit"
                                                    variant="primary-gradient"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                    ) : (
                                                        <FaSave className="me-2" />
                                                    )}
                                                    Save Personal Info
                                                </Button>
                                            </Form>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Tab.Container>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default EmployerProfile;