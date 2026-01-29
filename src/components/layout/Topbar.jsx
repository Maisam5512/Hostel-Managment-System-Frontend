import React from 'react';
import { Container, Navbar, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Safely get user's role
  const getUserRole = () => {
    if (!user) return 'Guest';
    
    if (typeof user.role === 'object' && user.role !== null) {
      return user.role.code || user.role.name || 'Role';
    }
    
    return user.role || 'Role';
  };

  // Safely get user's full name
  const getUserName = () => {
    if (!user) return 'User';
    return user.fullName || user.email || 'User';
  };

  // Safely get user's email
  const getUserEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  // Safely get user's first initial
  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't render topbar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm border-bottom">
      <Container fluid>
        <div className="d-flex align-items-center">
          {/* Hamburger menu for mobile */}
          <button 
            className="btn btn-link d-lg-none me-2 p-0" 
            onClick={onToggleSidebar}
            style={{ 
              border: 'none', 
              background: 'transparent',
              fontSize: '24px',
              color: '#FF8C00',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ☰
          </button>
          
          {/* Mobile Brand */}
          <Navbar.Brand className="d-lg-none">
            <h4 className="text-orange mb-0">🏨 HostelOS</h4>
          </Navbar.Brand>
        </div>
        
        {isAuthenticated && (
          <div className="d-flex align-items-center">
            <div className="me-3 d-none d-md-block">
              <Badge bg="light" text="dark" className="px-3 py-2">
                <span className="me-2">💰</span>
                Total Collected: <strong>₹124,500</strong>
              </Badge>
            </div>
            
            <Dropdown align="end">
              <Dropdown.Toggle 
                variant="light" 
                id="dropdown-user" 
                className="d-flex align-items-center"
              >
                <div className="me-2">
                  <div 
                    className="bg-orange text-white rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ width: '32px', height: '32px' }}
                  >
                    {getUserInitial()}
                  </div>
                </div>
                <div className="d-none d-md-block">
                  <div className="small fw-bold">{getUserName()}</div>
                  <div className="small text-muted">{getUserRole()}</div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Header>
                  <div className="fw-bold">{getUserName()}</div>
                  <div className="small text-muted">{getUserEmail()}</div>
                  <div className="small text-muted mt-1">Role: {getUserRole()}</div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/profile">
                  👤 My Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings">
                  ⚙️ Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  🚪 Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </Container>
    </Navbar>
  );
};

export default Topbar;