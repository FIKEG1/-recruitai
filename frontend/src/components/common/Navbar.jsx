import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { 
    FaUser, 
    FaBriefcase, 
    FaSignOutAlt, 
    FaUserPlus, 
    FaSignInAlt, 
    FaHome, 
    FaBuilding, 
    FaUserCog,
    FaUsers,
    FaGraduationCap,
    FaMoon,
    FaSun,
    FaChartBar,      // NEW
    FaCog,           // NEW
    FaCalendar,      // NEW
    FaClock,         // NEW
    FaBook,          // NEW
    FaFlag,          // NEW
    FaExchangeAlt    // NEW
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from '../../context/ThemeContext';

const CustomNavbar = () => {
    const { user, logout, isAuthenticated, isJobSeeker, isEmployer, isAdmin } = useAuth();
    const { t, language } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Get role display name with translation
    const getRoleDisplay = (role) => {
        const roleMap = {
            jobseeker: t('auth.job_seeker'),
            employer: t('auth.employer'),
            admin: t('auth.admin')
        };
        return roleMap[role] || role;
    };

    // Get role icon
    const getRoleIcon = (role) => {
        const iconMap = {
            jobseeker: <FaUser size={14} />,
            employer: <FaBuilding size={14} />,
            admin: <FaUserCog size={14} />
        };
        return iconMap[role] || <FaUser size={14} />;
    };

    return (
        <>
            <Navbar 
                expand="lg" 
                className="custom-navbar" 
                sticky="top" 
            >
                <Container>
                    <Navbar.Brand 
                        as={Link} 
                        to="/" 
                        className="brand" 
                        style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 700, 
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ 
                            fontSize: '1.8rem', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            padding: '6px 10px', 
                            borderRadius: '10px', 
                            color: 'white',
                            display: 'inline-block',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}>
                            🤖
                        </span>
                        <span style={{ 
                            background: 'var(--gradient)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent', 
                            backgroundClip: 'text',
                            marginLeft: '10px' 
                        }}>
                            RecruitAI
                        </span>
                    </Navbar.Brand>
                    
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-lg-center">
                            <Nav.Link 
                                as={Link} 
                                to="/" 
                                className="nav-link-custom" 
                                style={{ 
                                    color: 'var(--muted)', 
                                    fontWeight: 500, 
                                    padding: '8px 16px', 
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <FaHome className="me-1" /> {t('nav.home')}
                            </Nav.Link>
                            
                            <Nav.Link 
                                as={Link} 
                                to="/jobs" 
                                className="nav-link-custom" 
                                style={{ 
                                    color: 'var(--muted)', 
                                    fontWeight: 500, 
                                    padding: '8px 16px', 
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <FaBriefcase className="me-1" /> {t('nav.jobs')}
                            </Nav.Link>

                            {/* Internships Link */}
                            <Nav.Link 
                                as={Link} 
                                to="/internships" 
                                className="nav-link-custom" 
                                style={{ 
                                    color: 'var(--muted)', 
                                    fontWeight: 500, 
                                    padding: '8px 16px', 
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <FaGraduationCap className="me-1" /> {t('nav.internships')}
                            </Nav.Link>

                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* Theme Toggle */}
                            <div className="ms-2 d-flex align-items-center">
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={toggleTheme}
                                    title={theme === 'light' ? t('nav.dark_mode') || 'Toggle theme' : t('nav.light_mode') || 'Toggle theme'}
                                    style={{
                                        borderRadius: '8px',
                                        padding: '6px 10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: '8px',
                                        borderColor: 'var(--muted)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                                </Button>
                            </div>

                            {!isAuthenticated ? (
                                <>
                                    <Nav.Link 
                                        as={Link} 
                                        to="/login" 
                                        className="nav-link-custom"
                                        style={{ 
                                            color: 'var(--muted)', 
                                            fontWeight: 500, 
                                            padding: '8px 16px', 
                                            borderRadius: '8px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <FaSignInAlt className="me-1" /> {t('nav.login')}
                                    </Nav.Link>
                                    
                                    <Button 
                                        as={Link} 
                                        to="/register" 
                                        className="btn-primary-gradient" 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #2c3e8f 0%, #1a237e 100%)',
                                            border: 'none', 
                                            color: 'white', 
                                            padding: '8px 20px', 
                                            borderRadius: '8px', 
                                            fontWeight: 600, 
                                            marginLeft: '8px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <FaUserPlus className="me-1" /> {t('nav.register')}
                                    </Button>
                                </>
                            ) : (
                                <Dropdown align="end">
                                    <Dropdown.Toggle 
                                        variant="light" 
                                        className="d-flex align-items-center" 
                                        style={{ 
                                            background: 'transparent', 
                                            border: 'none', 
                                            padding: '4px 8px', 
                                            borderRadius: '10px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {/* User Avatar */}
                                        <div style={{ 
                                            width: '36px', 
                                            height: '36px', 
                                            borderRadius: '50%', 
                                            background: 'var(--gradient)', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            color: 'white', 
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}>
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        
                                        {/* User Name */}
                                        <span className="ms-2 d-none d-md-inline" style={{ fontWeight: 500 }}>
                                            {user?.name}
                                        </span>
                                        
                                        {/* Role Badge */}
                                        <Badge 
                                            bg="light" 
                                            text="dark" 
                                            className="ms-2 d-flex align-items-center gap-1" 
                                            style={{ 
                                                fontSize: '0.65rem', 
                                                padding: '2px 10px', 
                                                borderRadius: '20px', 
                                                background: 'rgba(232,245,233,0.06)', 
                                                color: 'var(--primary-color)', 
                                                textTransform: 'capitalize' 
                                            }}
                                        >
                                            {getRoleIcon(user?.role)}
                                            {getRoleDisplay(user?.role)}
                                        </Badge>
                                    </Dropdown.Toggle>
                                    
                                    <Dropdown.Menu style={{ 
                                        border: 'none', 
                                        borderRadius: '12px', 
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)', 
                                        padding: '8px', 
                                        minWidth: '200px' 
                                    }}>
                                        {isJobSeeker && (
                                            <>
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/jobseeker/dashboard"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaUser className="me-2" /> {t('nav.dashboard')}
                                                </Dropdown.Item>
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/jobseeker/profile"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaUserCog className="me-2" /> {t('nav.profile')}
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                            </>
                                        )}
                                        
                                        {isEmployer && (
                                            <>
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/employer/jobs"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaBriefcase className="me-2" /> {t('nav.dashboard')}
                                                </Dropdown.Item>
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/employer/post-job"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaUserPlus className="me-2" /> {t('nav.post_job')}
                                                </Dropdown.Item>
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/employer/profile"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaBuilding className="me-2" /> Company Profile
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                            </>
                                        )}
                                        
                                        {/* ============================================
                                            ADMIN DROPDOWN - WITH HRM LINKS
                                        ============================================ */}
                                        {isAdmin && (
                                            <>
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/admin/dashboard"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaChartBar className="me-2" /> Dashboard
                                                </Dropdown.Item>
                                                
                                                <Dropdown.Divider />
                                                
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/admin/config"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaCog className="me-2" /> Configuration
                                                </Dropdown.Item>
                                                
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/admin/employees"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaUsers className="me-2" /> Employees
                                                </Dropdown.Item>
                                                
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/admin/leaves"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaCalendar className="me-2" /> Leave Management
                                                </Dropdown.Item>
                                                
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/admin/attendance"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaClock className="me-2" /> Attendance
                                                </Dropdown.Item>
                                                
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/admin/training"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaBook className="me-2" /> Training
                                                </Dropdown.Item>
                                                
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/admin/complaints"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaFlag className="me-2" /> Complaints
                                                </Dropdown.Item>
                                                
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/admin/delegations"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaExchangeAlt className="me-2" /> Delegations
                                                </Dropdown.Item>
                                                
                                                <Dropdown.Divider />
                                                
                                                <Dropdown.Item 
                                                    as={Link} 
                                                    to="/admin/users"
                                                    className="dropdown-item-custom"
                                                >
                                                    <FaUsers className="me-2" /> Manage Users
                                                </Dropdown.Item>
                                                
                                                <Dropdown.Divider />
                                            </>
                                        )}
                                        
                                        <Dropdown.Item 
                                            onClick={handleLogout} 
                                            className="text-danger dropdown-item-custom"
                                        >
                                            <FaSignOutAlt className="me-2" /> {t('nav.logout')}
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
};

export default CustomNavbar;