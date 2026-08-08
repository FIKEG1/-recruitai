import React from 'react';
import { Nav, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaHome, FaUsers, FaBriefcase, FaCalendar, FaClock, 
    FaBook, FaFlag, FaExchangeAlt, FaCog, FaChartBar,
    FaBuilding, FaUserTie, FaFileAlt, FaBell
} from 'react-icons/fa';

const AdminSidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', icon: <FaChartBar />, label: 'Dashboard' },
        { path: '/admin/config', icon: <FaCog />, label: 'Configuration' },
        { path: '/admin/employees', icon: <FaUsers />, label: 'Employees' },
        { path: '/admin/leaves', icon: <FaCalendar />, label: 'Leave Management' },
        { path: '/admin/attendance', icon: <FaClock />, label: 'Attendance' },
        { path: '/admin/training', icon: <FaBook />, label: 'Training' },
        { path: '/admin/complaints', icon: <FaFlag />, label: 'Complaints' },
        { path: '/admin/delegations', icon: <FaExchangeAlt />, label: 'Delegations' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="admin-sidebar" style={{
            width: '260px',
            minHeight: 'calc(100vh - 60px)',
            background: '#1a1a2e',
            color: '#f0f0f0',
            padding: '20px 0',
            position: 'sticky',
            top: '60px',
            height: 'calc(100vh - 60px)',
            overflowY: 'auto'
        }}>
            <div className="px-3 mb-4">
                <h5 className="text-white mb-1">Admin Panel</h5>
                <small className="text-muted">Manage your platform</small>
            </div>

            <Nav className="flex-column">
                {menuItems.map((item) => (
                    <Nav.Link
                        key={item.path}
                        as={Link}
                        to={item.path}
                        style={{
                            color: isActive(item.path) ? '#fff' : '#aaa',
                            background: isActive(item.path) ? 'rgba(44, 62, 143, 0.3)' : 'transparent',
                            borderLeft: isActive(item.path) ? '3px solid #2c3e8f' : '3px solid transparent',
                            padding: '10px 20px',
                            margin: '2px 0',
                            borderRadius: '0 8px 8px 0',
                            transition: 'all 0.3s ease'
                        }}
                        className="d-flex align-items-center"
                    >
                        <span className="me-2" style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                        {item.label}
                        {item.badge && (
                            <Badge bg="danger" className="ms-auto">{item.badge}</Badge>
                        )}
                    </Nav.Link>
                ))}
            </Nav>

            <hr style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '20px 15px' }} />

            <div className="px-3 mt-3">
                <small className="text-muted">RecruitAI v1.0</small>
                <br />
                <small className="text-muted">© 2026 All rights reserved</small>
            </div>
        </div>
    );
};

export default AdminSidebar;