import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuthHook } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AppNavbar from '../components/layout/Navbar';
import AppFooter from '../components/layout/Footer';

const Dashboard = () => {
  const { user, loading } = useAuthHook();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      
      <Container className="py-4 flex-grow-1">
        <h1 className="text-dark mb-4">Dashboard</h1>
        
        <Row className="g-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <h2 className="text-orange">👤</h2>
                <h5 className="text-dark">Profile</h5>
                <p className="text-muted small">{user?.fullName}</p>
                <p className="text-muted small">{user?.email}</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <h2 className="text-orange">🏠</h2>
                <h5 className="text-dark">Rooms</h5>
                <p className="text-muted small">Total: 50</p>
                <p className="text-muted small">Occupied: 35</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <h2 className="text-orange">👥</h2>
                <h5 className="text-dark">Members</h5>
                <p className="text-muted small">Active: 120</p>
                <p className="text-muted small">Total: 150</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <h2 className="text-orange">💰</h2>
                <h5 className="text-dark">Fees</h5>
                <p className="text-muted small">Collected: ₹85,000</p>
                <p className="text-muted small">Pending: ₹15,000</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body>
            <h5 className="text-dark mb-3">Quick Actions</h5>
            <Row>
              <Col md={3}>
                <button className="btn btn-outline-orange w-100 mb-2">
                  Add Member
                </button>
              </Col>
              <Col md={3}>
                <button className="btn btn-outline-orange w-100 mb-2">
                  Allocate Room
                </button>
              </Col>
              <Col md={3}>
                <button className="btn btn-outline-orange w-100 mb-2">
                  Collect Fee
                </button>
              </Col>
              <Col md={3}>
                <button className="btn btn-outline-orange w-100 mb-2">
                  View Reports
                </button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
      
      <AppFooter />
    </div>
  );
};

export default Dashboard;