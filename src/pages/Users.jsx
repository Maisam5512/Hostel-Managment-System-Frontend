import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';

// Icons
import {
  FaUsers, FaCheckCircle, FaCrown, FaBan, FaPlus, FaFilter,
  FaTimes, FaEdit, FaToggleOn, FaExclamationTriangle,
  FaEnvelope, FaPhone, FaUser, FaKey, FaIdCard, FaCalendarAlt
} from 'react-icons/fa';

const Users = () => {
  const { callApi, loading, error, data } = useApi();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Validation errors
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const { values, handleChange, resetForm, setValues } = useForm({
    fullName: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    isActive: true
  });

  const editForm = useForm({
    fullName: '',
    email: '',
    role: '',
    phone: '',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Show API error in modal
  useEffect(() => {
    if (error) {
      setErrorModalMessage(error);
      setShowErrorModal(true);
    }
  }, [error]);

  const fetchUsers = async () => {
    try {
      const response = await callApi('get', '/users');
      setUsers(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await callApi('get', '/roles');
      if (response.success) {
        setRoles(response.data.filter(role => role.isActive));
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setRoles([]);
    }
  };

  // Helper: validate phone – exactly 10 digits
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

  // Validation function for create user
  const validateCreateForm = (formData) => {
    const errors = {};
    if (!formData.fullName || formData.fullName.trim() === '') {
      errors.fullName = 'Full name is required';
    }
    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Enter a valid email address';
      }
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    return errors;
  };

  // Validation function for edit user
  const validateEditForm = (formData) => {
    const errors = {};
    if (!formData.fullName || formData.fullName.trim() === '') {
      errors.fullName = 'Full name is required';
    }
    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Enter a valid email address';
      }
    }
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    return errors;
  };

  // Handle phone input – only digits, max 10
  const handlePhoneChange = (e, formHook, field) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      formHook.setValues({ ...formHook.values, [field]: value });
    }
  };

  const handleCreateUser = async (formData) => {
    const errors = validateCreateForm(formData);
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});

    try {
      const response = await callApi('post', '/auth/signup', {
        ...formData,
        isActive: formData.isActive || true
      });
      if (response.message) {
        setSuccessMessage('User created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleEditUser = async (formData) => {
    const errors = validateEditForm(formData);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    try {
      const response = await callApi('put', `/users/${selectedUser._id}`, formData);
      if (response.message) {
        setSuccessMessage('User updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleToggleStatus = async (user) => {
    if (window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user?`)) {
      try {
        const response = await callApi('patch', `/users/${user._id}/status`, {});
        if (response.message) {
          setSuccessMessage(`User ${user.isActive ? 'deactivated' : 'activated'} successfully!`);
          fetchUsers();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error toggling user status:', err);
      }
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    editForm.setValues({
      fullName: user.fullName,
      email: user.email,
      role: user.role?._id || user.role,
      phone: user.phone || '',
      isActive: user.isActive
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const filteredUsers = filterRole
    ? users.filter(user => {
        const userrole = user.role?._id || user.role;
        return userrole === filterRole;
      })
    : users;

  if (loading && users.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading users..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="text-dark mb-1">Users Management</h2>
                <p className="text-muted">Manage system users and their roles</p>
              </div>
              <Button 
                variant="orange" 
                onClick={() => setShowCreateModal(true)}
                className="d-flex align-items-center"
              >
                <FaPlus className="me-2" /> Add New User
              </Button>
            </div>
          </Col>
        </Row>

        {/* Success Message */}
        {successMessage && (
          <Row className="mb-3">
            <Col>
              <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
                {successMessage}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Error Modal (instead of top error alert) */}
        <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <FaExclamationTriangle className="me-2" /> Error
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{errorModalMessage}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => setShowErrorModal(false)}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Users</h6>
                    <h3 className="mb-0">{users.length}</h3>
                  </div>
                  <div className="bg-primary-light p-2 rounded-circle">
                    <FaUsers size={20} className="text-primary" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Active Users</h6>
                    <h3 className="mb-0">{users.filter(u => u.isActive).length}</h3>
                  </div>
                  <div className="bg-success-light p-2 rounded-circle">
                    <FaCheckCircle size={20} className="text-success" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Admin Users</h6>
                    <h3 className="mb-0">
                      {users.filter(u => {
                        const roleCode = u.role?.code;
                        return roleCode === 'ADMIN';
                      }).length}
                    </h3>
                  </div>
                  <div className="bg-warning-light p-2 rounded-circle">
                    <FaCrown size={20} className="text-warning" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Inactive Users</h6>
                    <h3 className="mb-0">{users.filter(u => !u.isActive).length}</h3>
                  </div>
                  <div className="bg-danger-light p-2 rounded-circle">
                    <FaBan size={20} className="text-danger" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label><FaFilter className="me-1" /> Filter by Role</Form.Label>
              <Form.Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role._id} value={role._id}>{role.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={8} className="d-flex align-items-end justify-content-end">
            <Button 
              variant="outline-secondary" 
              onClick={() => setFilterRole('')}
              className="me-2"
            >
              <FaTimes className="me-1" /> Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Users Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <div className="bg-orange text-white rounded-circle d-flex align-items-center justify-content-center" 
                                    style={{ width: '36px', height: '36px' }}>
                                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                </div>
                                <div>
                                  <div className="fw-bold">{user.fullName}</div>
                                  <div className="small text-muted"><FaIdCard className="me-1" size={8} /> ID: {user._id?.slice(-6)}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div><FaEnvelope className="me-1" size={10} /> {user.email}</div>
                            </td>
                            <td>
                              <Badge bg="info" className="px-2 py-1">
                                {user.role?.name || 'No Role'}
                              </Badge>
                            </td>
                            <td>
                              <div>{user.phone ? <><FaPhone className="me-1" size={10} /> {user.phone}</> : 'Not set'}</div>
                            </td>
                            <td>
                              <Badge 
                                bg={user.isActive ? 'success' : 'danger'} 
                                className="px-2 py-1"
                              >
                                {user.isActive ? <FaCheckCircle className="me-1" /> : <FaBan className="me-1" />}
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td>
                              <div className="small text-muted">
                                <FaCalendarAlt className="me-1" size={10} />
                                {new Date(user.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openEditModal(user)}
                                >
                                  <FaEdit className="me-1" /> Edit
                                </Button>
                                <Button
                                  variant={user.isActive ? 'outline-warning' : 'outline-success'}
                                  size="sm"
                                  onClick={() => handleToggleStatus(user)}
                                >
                                  <FaToggleOn className="me-1" />
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Create User Modal with validation */}
      <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); setCreateErrors({}); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.keys(createErrors).length > 0 && (
            <Alert variant="danger" className="mb-3">
              <ul className="mb-0">
                {Object.values(createErrors).map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            </Alert>
          )}
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleCreateUser(values);
          }}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={values.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    isInvalid={!!createErrors.fullName}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.fullName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    isInvalid={!!createErrors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    isInvalid={!!createErrors.password}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.password}</Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Minimum 6 characters
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number * (10 digits)</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={values.phone}
                    onChange={(e) => handlePhoneChange(e, { values, setValues }, 'phone')}
                    placeholder="e.g., 9876543210"
                    maxLength="10"
                    isInvalid={!!createErrors.phone}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.phone}</Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {values.phone.length}/10 digits
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    name="role"
                    value={values.role}
                    onChange={handleChange}
                    isInvalid={!!createErrors.role}
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>{role.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{createErrors.role}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Check
                    type="switch"
                    name="isActive"
                    label="Active User"
                    checked={values.isActive}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'isActive',
                        value: e.target.checked
                      }
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => { setShowCreateModal(false); setCreateErrors({}); }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit User Modal with validation */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setEditErrors({}); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User: {selectedUser?.fullName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.keys(editErrors).length > 0 && (
            <Alert variant="danger" className="mb-3">
              <ul className="mb-0">
                {Object.values(editErrors).map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
            </Alert>
          )}
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleEditUser(editForm.values);
          }}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={editForm.values.fullName}
                    onChange={editForm.handleChange}
                    isInvalid={!!editErrors.fullName}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.fullName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={editForm.values.email}
                    onChange={editForm.handleChange}
                    isInvalid={!!editErrors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number * (10 digits)</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={editForm.values.phone}
                    onChange={(e) => handlePhoneChange(e, editForm, 'phone')}
                    maxLength="10"
                    isInvalid={!!editErrors.phone}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.phone}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    name="role"
                    value={editForm.values.role}
                    onChange={editForm.handleChange}
                    isInvalid={!!editErrors.role}
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>{role.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{editErrors.role}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                name="isActive"
                label="Active User"
                checked={editForm.values.isActive}
                onChange={(e) => editForm.handleChange({
                  target: {
                    name: 'isActive',
                    value: e.target.checked
                  }
                })}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => { setShowEditModal(false); setEditErrors({}); }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Users;