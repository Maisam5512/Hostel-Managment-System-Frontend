// pages/Unauthorized.jsx
import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const Unauthorized = () => {
  return (
    <Layout>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Card className="text-center border-0 shadow-sm" style={{ maxWidth: '500px' }}>
          <Card.Body className="p-5">
            <div className="mb-4">
              <span style={{ fontSize: '64px' }}>🔒</span>
            </div>
            <h2 className="text-danger mb-3">403 - Access Denied</h2>
            <p className="text-muted mb-4">
              You do not have permission to access this page.<br />
              Please contact your administrator if you believe this is an error.
            </p>
            <div className="d-grid gap-2">
              <Button as={Link} to="/dashboard" variant="primary">
                Go to Dashboard
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
};

export default Unauthorized;