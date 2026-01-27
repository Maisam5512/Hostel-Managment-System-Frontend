import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthHook } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useForm } from '../hooks/useForm';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuthHook();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
    }
    
    setIsLoading(false);
  };

  const demoLogins = [
    { role: 'Admin', email: 'admin@hostel.com', password: 'admin123' },
    { role: 'Accountant', email: 'accountant@hostel.com', password: 'accountant123' },
    { role: 'Member', email: 'member@hostel.com', password: 'member123' },
  ];

  const handleDemoLogin = (demoUser) => {
    handleSubmit(() => handleLogin(demoUser))();
  };

  return (
    <div className="d-flex align-items-center min-vh-100 bg-dark">
      <Container>
        <Row className="justify-content-center">
          <Col md={4}>
            <Card className="border-0 shadow">
              <Card.Header className="bg-dark-theme text-orange text-center py-4 border-bottom-4 border-orange">
                <h3 className="mb-0">HOSTEL SYSTEM</h3>
                <p className="mb-0 text-white-50 small">Please sign in to continue</p>
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
                    disabled={isLoading || authLoading}
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
                  
                  <div className="text-center">
                    <p className="text-muted small mb-2">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-orange text-decoration-none">
                        Sign up here
                      </Link>
                    </p>
                    
                    <div className="mt-4">
                      <p className="text-muted small mb-2">Quick Demo Login:</p>
                      <div className="d-flex justify-content-between gap-2">
                        {demoLogins.map((demo, index) => (
                          <button
                            key={index}
                            type="button"
                            className="badge bg-dark border-0 py-2 px-3 role-badge"
                            onClick={() => handleDemoLogin(demo)}
                            style={{ cursor: 'pointer', transition: '0.3s' }}
                            onMouseEnter={(e) => e.target.style.opacity = 0.8}
                            onMouseLeave={(e) => e.target.style.opacity = 1}
                          >
                            {demo.role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <style>{`
        .role-badge:hover {
          opacity: 0.8;
        }
        .min-vh-100 {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default Login;