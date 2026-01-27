import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuthHook } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const AppNavbar = () => {
  const { user, logout, isAuthenticated } = useAuthHook();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark-theme" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-orange fw-bold">
          🏨 Hostel Management System
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/members">Members</Nav.Link>
                <Nav.Link as={Link} to="/rooms">Rooms</Nav.Link>
                <Nav.Link as={Link} to="/fees">Fees</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="text-white me-3">
                  Welcome, <span className="text-orange">{user?.fullName}</span>
                </Navbar.Text>
                <Button variant="outline-orange" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-white">
                  Login
                </Nav.Link>
                <Button as={Link} to="/signup" variant="outline-orange" size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;