import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/sidebar.css';

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/members', icon: '👥', label: 'Members' },
    { path: '/rooms', icon: '🏠', label: 'Rooms' },
    { path: '/beds', icon: '🛏️', label: 'Beds' },
    { path: '/bed-assignments', icon: '📋', label: 'Bed Assignments' },
    { path: '/food-items', icon: '🍽️', label: 'Food Items' },
    { path: '/food-orders', icon: '📝', label: 'Food Orders' },
    { path: '/bills', icon: '💰', label: 'Bills' },
    { path: '/fees', icon: '💰', label: 'Fees' },
    { path: '/permissions', icon: '🔐', label: 'Permissions' },
    { path: '/roles', icon: '👑', label: 'Roles' },
    { path: '/users', icon: '👨‍💼', label: 'Users' },
    { path: '/visitors', icon: '👥', label: 'Visitors' },
  ];

  return (
    <div className="sidebar bg-dark-theme text-white">
      {/* Close button for mobile */}
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
              onClick={onClose} // Close sidebar on mobile when clicking a link
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