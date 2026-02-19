import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import {
  FaBuilding, FaTachometerAlt, FaUsers, FaHome, FaBed,
  FaClipboardList, FaLock, FaUserTie, FaUser, FaUtensils,
  FaClipboard, FaMoneyBillWave, FaUserFriends, FaArrowLeft
} from 'react-icons/fa';
import '../../styles/sidebar.css';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { hasRole } = useAuth();

  const allMenuItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.MEMBER] },
    { path: '/members', icon: <FaUsers />, label: 'Members', roles: [ROLES.ADMIN] },
    { path: '/rooms', icon: <FaHome />, label: 'Rooms', roles: [ROLES.ADMIN] },
    { path: '/beds', icon: <FaBed />, label: 'Beds', roles: [ROLES.ADMIN] },
    { path: '/bed-assignments', icon: <FaClipboardList />, label: 'Bed Assignments', roles: [ROLES.ADMIN, ROLES.WARDEN] },
    { path: '/permissions', icon: <FaLock />, label: 'Permissions', roles: [ROLES.ADMIN] },
    { path: '/roles', icon: <FaUserTie />, label: 'Roles', roles: [ROLES.ADMIN] },
    { path: '/users', icon: <FaUser />, label: 'Users', roles: [ROLES.ADMIN] },
    { path: '/food-items', icon: <FaUtensils />, label: 'Food Items', roles: [ROLES.ADMIN, ROLES.MESS_INCHARGE] },
    { path: '/food-orders', icon: <FaClipboard />, label: 'Food Orders', roles: [ROLES.ADMIN, ROLES.MESS_INCHARGE] },
    { path: '/bills', icon: <FaMoneyBillWave />, label: 'Bills', roles: [ROLES.ADMIN, ROLES.ACCOUNTANT] },
    { path: '/visitors', icon: <FaUserFriends />, label: 'Visitors', roles: [ROLES.ADMIN, ROLES.SECURITY] },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (hasRole(ROLES.ADMIN)) return true;
    return item.roles.some(role => hasRole(role));
  });

  return (
    <div className="sidebar bg-dark-theme text-white">
      <div className="sidebar-header p-4 text-center border-bottom border-orange">
        <h3 className="text-orange mb-0">🏨 HOSTELO</h3>
        <p className="small text-white-50 mt-1">Management System</p>
      </div>

      <div className="sidebar-menu p-3">
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`sidebar-link mb-2 ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-icon me-3">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>
      </div>

      {/* Close button at bottom right – left arrow icon */}
      <div className="sidebar-close-container p-3 d-flex justify-content-end">
        <button
          className="btn btn-link text-white p-2"
          onClick={onClose}
          style={{
            fontSize: '20px',
            lineHeight: 1,
            textDecoration: 'none',
            background: 'rgba(255,140,0,0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close sidebar"
        >
          <FaArrowLeft />
        </button>
      </div>

      <div className="sidebar-footer p-3 border-top border-secondary mt-auto">
        <div className="text-center small">
          <p className="text-white-50 mb-1">Hostel Management System</p>
          <p className="text-white-50 mb-0">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;









