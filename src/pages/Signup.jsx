import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Signup = () => {
  const navigate = useNavigate();
  const { loading, error, callApi } = useApi();
  const [roles, setRoles] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch roles from API (you'll need to implement this endpoint)
    // For now, using mock data
    const mockRoles = [
      { _id: '1', name: 'Admin', code: 'ADMIN' },
      { _id: '2', name: 'Accountant', code: 'ACCOUNTANT' },
      { _id: '3', name: 'Member', code: 'MEMBER' },
    ];
    setRoles(mockRoles);
  }, []);

  const { values, handleChange, handleSubmit, errors, touched, handleBlur } = useForm(
    {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: '',
      phone: '',
      isActive: true,
    },
    validateForm
  );

  function validateForm(values) {
    const errors = {};
    if (!values.fullName) errors.fullName = 'Full name is required';
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email is invalid';
    }
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!values.roleId) errors.roleId = 'Role is required';
    if (!values.phone) errors.phone = 'Phone number is required';
    return errors;
  }

  const handleSignup = async (formData) => {
    setSuccess('');
    
    // Remove confirmPassword from data sent to API
    const { confirmPassword, ...signupData } = formData;
    
    try {
      await callApi('post', '/auth/signup', signupData);
      setSuccess('User created successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="d-flex align-items-center min-vh-100 bg-dark">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="border-0 shadow">
              <Card.Header className="bg-dark-theme text-orange text-center py-4 border-bottom-4 border-orange">
                <h3 className="mb-0">CREATE ACCOUNT</h3>
                <p className="mb-0 text-white-50 small">Register new user account</p>
              </Card.Header>
              
              <Card.Body className="p-4">
                {success && (
                  <Alert variant="success" className="small">
                    {success}
                  </Alert>
                )}
                
                {error && (
                  <Alert variant="danger" className="small">
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit(handleSignup)}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-dark fw-bold">
                          Full Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={values.fullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter full name"
                          isInvalid={touched.fullName && errors.fullName}
                          className="py-2"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.fullName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-dark fw-bold">
                          Email Address *
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter email"
                          isInvalid={touched.email && errors.email}
                          className="py-2"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-dark fw-bold">
                          Password *
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="••••••••"
                          isInvalid={touched.password && errors.password}
                          className="py-2"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-dark fw-bold">
                          Confirm Password *
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="••••••••"
                          isInvalid={touched.confirmPassword && errors.confirmPassword}
                          className="py-2"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-dark fw-bold">
                          Role *
                        </Form.Label>
                        <Form.Select
                          name="roleId"
                          value={values.roleId}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.roleId && errors.roleId}
                          className="py-2"
                        >
                          <option value="">Select Role</option>
                          {roles.map((role) => (
                            <option key={role._id} value={role._id}>
                              {role.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.roleId}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-dark fw-bold">
                          Phone Number *
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="03111222333"
                          isInvalid={touched.phone && errors.phone}
                          className="py-2"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="isActive"
                      checked={values.isActive}
                      onChange={handleChange}
                      label="Active Account"
                      className="text-dark"
                    />
                  </Form.Group>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 mb-3 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Creating Account...
                      </>
                    ) : (
                      'CREATE ACCOUNT'
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-muted small mb-0">
                      Already have an account?{' '}
                      <Link to="/login" className="text-orange text-decoration-none">
                        Login here
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup;