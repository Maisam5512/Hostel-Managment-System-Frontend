import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import '../../styles/sidebar.css';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { hasRole, isAuthenticated, getUserRoleCode } = useAuth();

  // ----- ALL MENU ITEMS WITH CORRECT ROLE ASSIGNMENTS -----
  const allMenuItems = [
    // Dashboard: only ADMIN and MEMBER
    { path: '/dashboard', icon: '📊', label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.MEMBER] },
    // Admin‑only
    { path: '/members', icon: '👥', label: 'Members', roles: [ROLES.ADMIN] },
    { path: '/rooms', icon: '🏠', label: 'Rooms', roles: [ROLES.ADMIN] },
    { path: '/beds', icon: '🛏️', label: 'Beds', roles: [ROLES.ADMIN] },
    { path: '/bed-assignments', icon: '📋', label: 'Bed Assignments', roles: [ROLES.ADMIN] },
    { path: '/permissions', icon: '🔐', label: 'Permissions', roles: [ROLES.ADMIN] },
    { path: '/roles', icon: '👑', label: 'Roles', roles: [ROLES.ADMIN] },
    { path: '/users', icon: '👨‍💼', label: 'Users', roles: [ROLES.ADMIN] },
    // Mess Incharge
    { path: '/food-items', icon: '🍽️', label: 'Food Items', roles: [ROLES.ADMIN, ROLES.MESS_INCHARGE] },
    { path: '/food-orders', icon: '📝', label: 'Food Orders', roles: [ROLES.ADMIN, ROLES.MESS_INCHARGE] },
    // Accountant
    { path: '/bills', icon: '💰', label: 'Bills', roles: [ROLES.ADMIN, ROLES.ACCOUNTANT] },
    // Security
    { path: '/visitors', icon: '👥', label: 'Visitors', roles: [ROLES.ADMIN, ROLES.SECURITY] },
  ];

  // ----- FILTERING – EXACT ROLE MATCH, NO AUTOMATIC DASHBOARD -----
  const menuItems = allMenuItems.filter(item => {
    // Admin sees everything
    if (hasRole(ROLES.ADMIN)) return true;
    // For all other roles: check if the user's role is in the item's allowed roles
    return item.roles.some(role => hasRole(role));
  });

  // ----- ABSOLUTELY ORIGINAL JSX (no changes) -----
  return (
    <div className="sidebar bg-dark-theme text-white">
      {/* Mobile close button */}
      <div className="d-flex justify-content-end d-lg-none p-3">
        <button
          className="btn btn-close btn-close-white"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      </div>

      <div className="sidebar-header p-4 text-center border-bottom border-orange">
        <h3 className="text-orange mb-0">🏨 HOSTELOS</h3>
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
              onClick={onClose}
            >
              <span className="sidebar-icon me-3">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>
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