import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge, Tab, Nav, Table, Image } from 'react-bootstrap';
import { FaUser, FaUpload, FaTrash, FaStar, FaCheck, FaPlus, FaTimes, FaGraduationCap, FaBriefcase, FaCertificate, FaLanguage, FaEdit, FaSave, FaCamera } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api, { getImageUrl } from '../../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [resumes, setResumes] = useState([]);
    const [profilePhoto, setProfilePhoto] = useState(user?.profile?.profilePhoto || null);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        profile: {
            phone: user?.profile?.phone || '',
            location: user?.profile?.location || '',
            bio: user?.profile?.bio || '',
            skills: user?.profile?.skills || [],
            education: user?.profile?.education || [],
            workExperience: user?.profile?.workExperience || [],
            certifications: user?.profile?.certifications || [],
            languages: user?.profile?.languages || []
        }
    });
    
    // New item states
    const [newSkill, setNewSkill] = useState('');
    const [newCertification, setNewCertification] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [newEducation, setNewEducation] = useState({
        institution: '',
        degree: '',
        field: '',
        graduationYear: ''
    });
    const [newExperience, setNewExperience] = useState({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        currentlyWorking: false
    });

    useEffect(() => {
        fetchResumes();
        // Set profile photo from user data
        if (user?.profile?.profilePhoto) {
            setProfilePhoto(user.profile.profilePhoto);
        }
    }, [user]);

    const fetchResumes = async () => {
        try {
            const response = await api.get('/resumes');
            setResumes(response.data.resumes || []);
        } catch (error) {
            console.error('Error fetching resumes:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('profile.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                profile: { ...formData.profile, [field]: value }
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
            profile: formData.profile
        });
        setLoading(false);
        if (result.success) {
            toast.success('Profile updated successfully!');
        }
    };

    // ============ PHOTO UPLOAD ============
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
            
            // Update user context
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

    // ============ SKILLS ============
    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.profile.skills.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                profile: {
                    ...formData.profile,
                    skills: [...formData.profile.skills, newSkill.trim()]
                }
            });
            setNewSkill('');
            toast.success('Skill added!');
        }
    };

    const handleRemoveSkill = (skill) => {
        setFormData({
            ...formData,
            profile: {
                ...formData.profile,
                skills: formData.profile.skills.filter(s => s !== skill)
            }
        });
    };

    // ============ CERTIFICATIONS ============
    const handleAddCertification = () => {
        if (newCertification.trim() && !formData.profile.certifications.includes(newCertification.trim())) {
            setFormData({
                ...formData,
                profile: {
                    ...formData.profile,
                    certifications: [...formData.profile.certifications, newCertification.trim()]
                }
            });
            setNewCertification('');
            toast.success('Certification added!');
        }
    };

    const handleRemoveCertification = (cert) => {
        setFormData({
            ...formData,
            profile: {
                ...formData.profile,
                certifications: formData.profile.certifications.filter(c => c !== cert)
            }
        });
    };

    // ============ LANGUAGES ============
    const handleAddLanguage = () => {
        if (newLanguage.trim() && !formData.profile.languages.includes(newLanguage.trim())) {
            setFormData({
                ...formData,
                profile: {
                    ...formData.profile,
                    languages: [...formData.profile.languages, newLanguage.trim()]
                }
            });
            setNewLanguage('');
            toast.success('Language added!');
        }
    };

    const handleRemoveLanguage = (lang) => {
        setFormData({
            ...formData,
            profile: {
                ...formData.profile,
                languages: formData.profile.languages.filter(l => l !== lang)
            }
        });
    };

    // ============ EDUCATION ============
    const handleAddEducation = () => {
        if (newEducation.institution && newEducation.degree) {
            setFormData({
                ...formData,
                profile: {
                    ...formData.profile,
                    education: [...formData.profile.education, { ...newEducation }]
                }
            });
            setNewEducation({ institution: '', degree: '', field: '', graduationYear: '' });
            toast.success('Education added!');
        }
    };

    const handleRemoveEducation = (index) => {
        setFormData({
            ...formData,
            profile: {
                ...formData.profile,
                education: formData.profile.education.filter((_, i) => i !== index)
            }
        });
    };

    // ============ WORK EXPERIENCE ============
    const handleAddExperience = () => {
        if (newExperience.company && newExperience.position) {
            const expToAdd = { ...newExperience };
            if (expToAdd.currentlyWorking) {
                expToAdd.endDate = 'Present';
            }
            setFormData({
                ...formData,
                profile: {
                    ...formData.profile,
                    workExperience: [...formData.profile.workExperience, expToAdd]
                }
            });
            setNewExperience({ 
                company: '', 
                position: '', 
                startDate: '', 
                endDate: '', 
                description: '',
                currentlyWorking: false 
            });
            toast.success('Work experience added!');
        }
    };

    const handleRemoveExperience = (index) => {
        setFormData({
            ...formData,
            profile: {
                ...formData.profile,
                workExperience: formData.profile.workExperience.filter((_, i) => i !== index)
            }
        });
    };

    // ============ RESUME UPLOAD ============
    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF and DOCX files are allowed');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setUploading(true);
        try {
            const response = await api.post('/resumes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumes([response.data.resume, ...resumes]);
            toast.success('Resume uploaded successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload resume');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSetDefaultResume = async (resumeId) => {
        try {
            await api.put(`/resumes/${resumeId}/default`);
            setResumes(resumes.map(r => ({
                ...r,
                isDefault: r._id === resumeId
            })));
            toast.success('Default resume updated');
        } catch (error) {
            toast.error('Failed to set default resume');
        }
    };

    const handleDeleteResume = async (resumeId) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            await api.delete(`/resumes/${resumeId}`);
            setResumes(resumes.filter(r => r._id !== resumeId));
            toast.success('Resume deleted');
        } catch (error) {
            toast.error('Failed to delete resume');
        }
    };

    return (
        <section className="profile-section py-4">
            <Container>
                <h2 className="fw-bold mb-4">
                    <FaUser className="me-2 text-primary" /> {t('profile.title')}
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
                                                color: 'white',
                                                fontSize: '4rem',
                                                margin: '0 auto',
                                                border: '4px solid #2c3e8f'
                                            }}
                                        >
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                                                color: 'white',
                                                fontSize: '4rem',
                                                margin: '0 auto',
                                                border: '4px solid #2c3e8f'
                                            }}
                                        >
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    ) : null}
                                    <div className="position-absolute bottom-0 end-0">
                                        <label 
                                            htmlFor="photo-upload" 
                                            style={{ 
                                                cursor: 'pointer',
                                                background: '#2c3e8f',
                                                color: 'white',
                                                borderRadius: '50%',
                                                padding: '10px',
                                                display: 'inline-block',
                                                border: '2px solid white'
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
                                <h5 className="mt-3">{user?.name}</h5>
                                <p className="text-muted small">{user?.role}</p>
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

                        {/* Profile Completion */}
                        <Card className="shadow-sm">
                            <Card.Header className="bg-white fw-bold">
                                Profile Completion
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between">
                                        <span>Completeness</span>
                                        <span className="fw-bold">
                                            {Math.min(
                                                100,
                                                (formData.profile.skills.length * 5) +
                                                (formData.profile.education.length * 5) +
                                                (formData.profile.workExperience.length * 5) +
                                                (formData.profile.certifications.length * 5) +
                                                (formData.profile.languages.length * 5) +
                                                (formData.profile.bio ? 10 : 0) +
                                                (formData.profile.phone ? 5 : 0) +
                                                (formData.profile.location ? 5 : 0) +
                                                (resumes.length > 0 ? 10 : 0) +
                                                (profilePhoto ? 10 : 0)
                                            )}%
                                        </span>
                                    </div>
                                    <div className="progress">
                                        <div 
                                            className="progress-bar bg-success" 
                                            style={{ 
                                                width: `${Math.min(100,
                                                    (formData.profile.skills.length * 5) +
                                                    (formData.profile.education.length * 5) +
                                                    (formData.profile.workExperience.length * 5) +
                                                    (formData.profile.certifications.length * 5) +
                                                    (formData.profile.languages.length * 5) +
                                                    (formData.profile.bio ? 10 : 0) +
                                                    (formData.profile.phone ? 5 : 0) +
                                                    (formData.profile.location ? 5 : 0) +
                                                    (resumes.length > 0 ? 10 : 0) +
                                                    (profilePhoto ? 10 : 0)
                                                )}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="text-muted small">
                                    <ul className="list-unstyled">
                                        <li className={formData.profile.bio ? 'text-success' : 'text-muted'}>
                                            {formData.profile.bio ? '✅' : '⬜'} Bio/About
                                        </li>
                                        <li className={formData.profile.skills.length > 0 ? 'text-success' : 'text-muted'}>
                                            {formData.profile.skills.length > 0 ? '✅' : '⬜'} Skills ({formData.profile.skills.length})
                                        </li>
                                        <li className={formData.profile.education.length > 0 ? 'text-success' : 'text-muted'}>
                                            {formData.profile.education.length > 0 ? '✅' : '⬜'} Education ({formData.profile.education.length})
                                        </li>
                                        <li className={formData.profile.workExperience.length > 0 ? 'text-success' : 'text-muted'}>
                                            {formData.profile.workExperience.length > 0 ? '✅' : '⬜'} Experience ({formData.profile.workExperience.length})
                                        </li>
                                        <li className={formData.profile.certifications.length > 0 ? 'text-success' : 'text-muted'}>
                                            {formData.profile.certifications.length > 0 ? '✅' : '⬜'} Certifications ({formData.profile.certifications.length})
                                        </li>
                                        <li className={resumes.length > 0 ? 'text-success' : 'text-muted'}>
                                            {resumes.length > 0 ? '✅' : '⬜'} Resume Uploaded
                                        </li>
                                        <li className={profilePhoto ? 'text-success' : 'text-muted'}>
                                            {profilePhoto ? '✅' : '⬜'} Profile Photo
                                        </li>
                                    </ul>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={9}>
                        <Card className="shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <Tab.Container defaultActiveKey="personal">
                                    <Nav variant="tabs" className="mb-3">
                                        <Nav.Item>
                                            <Nav.Link eventKey="personal">
                                                <FaUser className="me-2" /> Personal
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="skills">
                                                <FaStar className="me-2" /> Skills
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="education">
                                                <FaGraduationCap className="me-2" /> Education
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="experience">
                                                <FaBriefcase className="me-2" /> Experience
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="certifications">
                                                <FaCertificate className="me-2" /> Certifications
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>

                                    <Tab.Content>
                                        {/* ===== PERSONAL INFO TAB ===== */}
                                        <Tab.Pane eventKey="personal">
                                            <Form onSubmit={handleSubmit}>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">{t('profile.full_name')}</Form.Label>
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
                                                            <Form.Label className="fw-semibold">{t('profile.email')}</Form.Label>
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
                                                            <Form.Label className="fw-semibold">{t('profile.phone')}</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="profile.phone"
                                                                value={formData.profile.phone}
                                                                onChange={handleChange}
                                                                placeholder="e.g., +251 912 345 678"
                                                                className="form-control-custom"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">{t('profile.location')}</Form.Label>
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
                                                        placeholder="Tell us about yourself, your experience, and career goals..."
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
                                                    {t('profile.save_changes')}
                                                </Button>
                                            </Form>
                                        </Tab.Pane>

                                        {/* ===== SKILLS TAB ===== */}
                                        <Tab.Pane eventKey="skills">
                                            <div className="mb-3">
                                                <label className="fw-semibold mb-2">Add Skill</label>
                                                <div className="d-flex gap-2">
                                                    <Form.Control
                                                        type="text"
                                                        value={newSkill}
                                                        onChange={(e) => setNewSkill(e.target.value)}
                                                        placeholder="e.g., Python, Java, React, Project Management"
                                                        className="form-control-custom"
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                                    />
                                                    <Button onClick={handleAddSkill} variant="primary-gradient">
                                                        <FaPlus />
                                                    </Button>
                                                </div>
                                                <small className="text-muted">Press Enter or click + to add</small>
                                            </div>

                                            <div className="d-flex flex-wrap gap-2 mt-3">
                                                {formData.profile.skills.map((skill, idx) => (
                                                    <Badge 
                                                        key={idx} 
                                                        bg="primary" 
                                                        className="p-2 d-flex align-items-center gap-2"
                                                        style={{ fontSize: '0.9rem' }}
                                                    >
                                                        {skill}
                                                        <Button
                                                            variant="link"
                                                            className="p-0 text-white"
                                                            onClick={() => handleRemoveSkill(skill)}
                                                            style={{ fontSize: '0.7rem' }}
                                                        >
                                                            <FaTimes />
                                                        </Button>
                                                    </Badge>
                                                ))}
                                                {formData.profile.skills.length === 0 && (
                                                    <p className="text-muted">No skills added yet. Add your top skills!</p>
                                                )}
                                            </div>
                                        </Tab.Pane>

                                        {/* ===== EDUCATION TAB ===== */}
                                        <Tab.Pane eventKey="education">
                                            <div className="mb-3 p-3 border rounded bg-light">
                                                <h6 className="fw-bold mb-3">Add Education</h6>
                                                <Row>
                                                    <Col md={6} className="mb-2">
                                                        <Form.Control
                                                            placeholder="Institution *"
                                                            value={newEducation.institution}
                                                            onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={6} className="mb-2">
                                                        <Form.Control
                                                            placeholder="Degree *"
                                                            value={newEducation.degree}
                                                            onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={6} className="mb-2">
                                                        <Form.Control
                                                            placeholder="Field of Study"
                                                            value={newEducation.field}
                                                            onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={4} className="mb-2">
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Graduation Year"
                                                            value={newEducation.graduationYear}
                                                            onChange={(e) => setNewEducation({ ...newEducation, graduationYear: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={2} className="mb-2">
                                                        <Button onClick={handleAddEducation} variant="primary-gradient" className="w-100">
                                                            <FaPlus />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </div>

                                            {formData.profile.education.map((edu, idx) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-start p-2 border-bottom">
                                                    <div>
                                                        <strong>{edu.degree}</strong> - {edu.institution}
                                                        {edu.field && <span className="text-muted"> ({edu.field})</span>}
                                                        {edu.graduationYear && <span className="text-muted">, {edu.graduationYear}</span>}
                                                    </div>
                                                    <Button
                                                        variant="link"
                                                        className="text-danger p-0"
                                                        onClick={() => handleRemoveEducation(idx)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            ))}
                                            {formData.profile.education.length === 0 && (
                                                <p className="text-muted">No education added yet</p>
                                            )}
                                        </Tab.Pane>

                                        {/* ===== EXPERIENCE TAB ===== */}
                                        <Tab.Pane eventKey="experience">
                                            <div className="mb-3 p-3 border rounded bg-light">
                                                <h6 className="fw-bold mb-3">Add Work Experience</h6>
                                                <Row>
                                                    <Col md={6} className="mb-2">
                                                        <Form.Control
                                                            placeholder="Company *"
                                                            value={newExperience.company}
                                                            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={6} className="mb-2">
                                                        <Form.Control
                                                            placeholder="Position *"
                                                            value={newExperience.position}
                                                            onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={5} className="mb-2">
                                                        <Form.Control
                                                            type="date"
                                                            placeholder="Start Date"
                                                            value={newExperience.startDate}
                                                            onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={5} className="mb-2">
                                                        <Form.Control
                                                            type="date"
                                                            placeholder="End Date"
                                                            value={newExperience.endDate}
                                                            onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                                                            disabled={newExperience.currentlyWorking}
                                                        />
                                                    </Col>
                                                    <Col md={2} className="mb-2 d-flex align-items-center">
                                                        <Form.Check
                                                            type="checkbox"
                                                            label="Currently Working"
                                                            checked={newExperience.currentlyWorking}
                                                            onChange={(e) => setNewExperience({ ...newExperience, currentlyWorking: e.target.checked })}
                                                        />
                                                    </Col>
                                                    <Col md={12} className="mb-2">
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            placeholder="Description"
                                                            value={newExperience.description}
                                                            onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                                                        />
                                                    </Col>
                                                    <Col md={12}>
                                                        <Button onClick={handleAddExperience} variant="primary-gradient">
                                                            <FaPlus className="me-2" /> Add Experience
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </div>

                                            {formData.profile.workExperience.map((exp, idx) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-start p-2 border-bottom">
                                                    <div>
                                                        <strong>{exp.position}</strong> at {exp.company}
                                                        {exp.startDate && (
                                                            <span className="text-muted">
                                                                {' '}({new Date(exp.startDate).getFullYear()} - {exp.endDate === 'Present' ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'})
                                                            </span>
                                                        )}
                                                        {exp.description && (
                                                            <p className="text-muted small mb-0">{exp.description}</p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="link"
                                                        className="text-danger p-0"
                                                        onClick={() => handleRemoveExperience(idx)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            ))}
                                            {formData.profile.workExperience.length === 0 && (
                                                <p className="text-muted">No work experience added yet</p>
                                            )}
                                        </Tab.Pane>

                                        {/* ===== CERTIFICATIONS TAB ===== */}
                                        <Tab.Pane eventKey="certifications">
                                            <div className="mb-3">
                                                <label className="fw-semibold mb-2">Add Certification</label>
                                                <div className="d-flex gap-2">
                                                    <Form.Control
                                                        type="text"
                                                        value={newCertification}
                                                        onChange={(e) => setNewCertification(e.target.value)}
                                                        placeholder="e.g., AWS Certified Developer, PMP, CCNA"
                                                        className="form-control-custom"
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCertification()}
                                                    />
                                                    <Button onClick={handleAddCertification} variant="primary-gradient">
                                                        <FaPlus />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {formData.profile.certifications.map((cert, idx) => (
                                                    <Badge 
                                                        key={idx} 
                                                        bg="info" 
                                                        className="p-2 d-flex align-items-center gap-2"
                                                        style={{ fontSize: '0.85rem' }}
                                                    >
                                                        <FaCertificate className="me-1" />
                                                        {cert}
                                                        <Button
                                                            variant="link"
                                                            className="p-0 text-white"
                                                            onClick={() => handleRemoveCertification(cert)}
                                                            style={{ fontSize: '0.7rem' }}
                                                        >
                                                            <FaTimes />
                                                        </Button>
                                                    </Badge>
                                                ))}
                                                {formData.profile.certifications.length === 0 && (
                                                    <p className="text-muted">No certifications added yet</p>
                                                )}
                                            </div>

                                            <hr />

                                            <div>
                                                <label className="fw-semibold mb-2">Languages</label>
                                                <div className="d-flex gap-2">
                                                    <Form.Control
                                                        type="text"
                                                        value={newLanguage}
                                                        onChange={(e) => setNewLanguage(e.target.value)}
                                                        placeholder="e.g., English (Fluent), Amharic (Native)"
                                                        className="form-control-custom"
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                                                    />
                                                    <Button onClick={handleAddLanguage} variant="primary-gradient">
                                                        <FaPlus />
                                                    </Button>
                                                </div>
                                                <div className="d-flex flex-wrap gap-2 mt-2">
                                                    {formData.profile.languages.map((lang, idx) => (
                                                        <Badge 
                                                            key={idx} 
                                                            bg="secondary" 
                                                            className="p-2 d-flex align-items-center gap-2"
                                                            style={{ fontSize: '0.85rem' }}
                                                        >
                                                            <FaLanguage className="me-1" />
                                                            {lang}
                                                            <Button
                                                                variant="link"
                                                                className="p-0 text-white"
                                                                onClick={() => handleRemoveLanguage(lang)}
                                                                style={{ fontSize: '0.7rem' }}
                                                            >
                                                                <FaTimes />
                                                            </Button>
                                                        </Badge>
                                                    ))}
                                                    {formData.profile.languages.length === 0 && (
                                                        <p className="text-muted">No languages added yet</p>
                                                    )}
                                                </div>
                                            </div>
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

export default Profile;