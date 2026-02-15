import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useForm } from '../hooks/useForm';
import { DEFAULT_ROUTES } from '../constants/roles';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const { values, handleChange, handleSubmit } = useForm({
    email: '',
    password: '',
  });

  const validateForm = (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email is required';
    if (!values.password) errors.password = 'Password is required';
    return errors;
  };

  const handleLogin = async (formValues) => {
    setIsLoading(true);
    setError('');
    
    const result = await login(formValues.email, formValues.password);
    
    if (result.success) {
      // Navigation will happen automatically via useEffect or ProtectedRoute
      const roleCode = result.user?.role?.code || result.user?.role;
    const defaultRoute = DEFAULT_ROUTES[roleCode] || '/dashboard';
    navigate(defaultRoute, { replace: true });
      console.log('Login successful, redirecting...');
    } else {
      setError(result.error || 'Invalid credentials');
    }
    
    setIsLoading(false);
  };

  const demoLogins = [
    { role: 'Admin', email: 'admin@hostel.com', password: 'admin123' },
    { role: 'Accountant', email: 'accountant@hostel.com', password: 'accountant123' },
    { role: 'Mess Incharge', email: 'member@hostel.com', password: 'member123' },
  ];

  const handleDemoLogin = (demoUser) => {
    handleSubmit(() => handleLogin(demoUser))();
  };

  // Show loading while checking auth status
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Don't show login page if already authenticated (will redirect via useEffect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '15px' }}>
              <Card.Header className="bg-dark-theme text-orange text-center py-4" 
                         style={{ borderBottom: '4px solid #FF8C00', borderRadius: '15px 15px 0 0' }}>
                <h3 className="mb-0">HOSTEL SYSTEM</h3>
                <p className="mb-0 text-white-50 small mt-1">Please sign in to continue</p>
              </Card.Header>
              
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="small">
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit(handleLogin)}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-dark fw-bold">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="py-2"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="text-dark fw-bold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="py-2"
                    />
                  </Form.Group>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 mb-3 fw-bold"
                    disabled={isLoading}
                    style={{ fontSize: '16px' }}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Signing In...
                      </>
                    ) : (
                      'SIGN IN'
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <p className="text-muted small mb-2">Quick Demo Login:</p>
                    <div className="d-flex justify-content-center gap-3">
                      {demoLogins.map((demo, index) => (
                        <button
                          key={index}
                          type="button"
                          className="btn btn-outline-dark btn-sm"
                          onClick={() => handleDemoLogin(demo)}
                          style={{ 
                            transition: '0.3s',
                            fontSize: '12px',
                            padding: '6px 12px'
                          }}
                        >
                          {demo.role}
                        </button>
                      ))}
                    </div>
                  </div>
                </Form>
              </Card.Body>
              
              <Card.Footer className="text-center py-3 bg-light">
                <p className="small text-muted mb-0">
                  &copy; {new Date().getFullYear()} Hostel Management System
                </p>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;