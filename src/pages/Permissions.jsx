import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';

// Icons
import {
  FaLock, FaCheckCircle, FaBox, FaBan, FaPlus, FaFilter,
  FaTimes, FaEdit, FaToggleOn, FaTrash, FaExclamationTriangle,
  FaCalendarAlt, FaInfoCircle, FaKey, FaCube
} from 'react-icons/fa';

const Permissions = () => {
  const { callApi, loading, error, data } = useApi();
  const [permissions, setPermissions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterModule, setFilterModule] = useState('');

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Validation errors
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const { values, handleChange, resetForm, setValues } = useForm({
    name: '',
    key: '',
    module: '',
    description: ''
  });

  const editForm = useForm({
    name: '',
    key: '',
    module: '',
    description: ''
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Show API error in modal
  useEffect(() => {
    if (error) {
      setErrorModalMessage(error);
      setShowErrorModal(true);
    }
  }, [error]);

  const fetchPermissions = async () => {
    try {
      const response = await callApi('get', '/permissions');
      if (response.success) {
        setPermissions(response.data);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  // Validation function for create/edit
  const validatePermissionForm = (formData) => {
    const errors = {};
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Permission name is required';
    }
    if (!formData.key || formData.key.trim() === '') {
      errors.key = 'Permission key is required';
    }
    if (!formData.module || formData.module.trim() === '') {
      errors.module = 'Module is required';
    }
    return errors;
  };

  const handleCreatePermission = async (formData) => {
    // Validate
    const errors = validatePermissionForm(formData);
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});

    try {
      const response = await callApi('post', '/permissions', formData);
      if (response.success) {
        setSuccessMessage('Permission created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchPermissions();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error creating permission:', err);
    }
  };

  const handleEditPermission = async (formData) => {
    // Validate
    const errors = validatePermissionForm(formData);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    try {
      const response = await callApi('put', `/permissions/${selectedPermission._id}`, formData);
      if (response.success) {
        setSuccessMessage('Permission updated successfully!');
        setShowEditModal(false);
        setSelectedPermission(null);
        fetchPermissions();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating permission:', err);
    }
  };

  const handleToggleStatus = async (permission) => {
    if (window.confirm(`Are you sure you want to ${permission.isActive ? 'disable' : 'enable'} this permission?`)) {
      try {
        const response = await callApi('patch', `/permissions/${permission._id}/status`);
        if (response.success) {
          setSuccessMessage(`Permission ${permission.isActive ? 'disabled' : 'enabled'} successfully!`);
          fetchPermissions();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error toggling permission status:', err);
      }
    }
  };

  const handleDeletePermission = async (permission) => {
    if (window.confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
      try {
        const response = await callApi('delete', `/permissions/${permission._id}`);
        if (response.success) {
          setSuccessMessage('Permission deleted successfully!');
          fetchPermissions();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error deleting permission:', err);
      }
    }
  };

  const openEditModal = (permission) => {
    setSelectedPermission(permission);
    editForm.setValues({
      name: permission.name,
      key: permission.key,
      module: permission.module,
      description: permission.description
    });
    setEditErrors({}); // Clear previous errors
    setShowEditModal(true);
  };

  const modules = [...new Set(permissions.map(p => p.module))].sort();

  const filteredPermissions = filterModule
    ? permissions.filter(p => p.module === filterModule)
    : permissions;

  if (loading && permissions.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading permissions..." />
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
                <h2 className="text-dark mb-1">Permissions Management</h2>
                <p className="text-muted">Manage system permissions and access controls</p>
              </div>
              <Button 
                variant="orange" 
                onClick={() => setShowCreateModal(true)}
                className="d-flex align-items-center"
              >
                <FaPlus className="me-2" /> Add New Permission
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
                    <h6 className="text-muted mb-1">Total Permissions</h6>
                    <h3 className="mb-0">{permissions.length}</h3>
                  </div>
                  <div className="bg-primary-light p-2 rounded-circle">
                    <FaLock size={20} className="text-primary" />
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
                    <h6 className="text-muted mb-1">Active</h6>
                    <h3 className="mb-0">{permissions.filter(p => p.isActive).length}</h3>
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
                    <h6 className="text-muted mb-1">Modules</h6>
                    <h3 className="mb-0">{modules.length}</h3>
                  </div>
                  <div className="bg-warning-light p-2 rounded-circle">
                    <FaBox size={20} className="text-warning" />
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
                    <h6 className="text-muted mb-1">Inactive</h6>
                    <h3 className="mb-0">{permissions.filter(p => !p.isActive).length}</h3>
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
              <Form.Label><FaFilter className="me-1" /> Filter by Module</Form.Label>
              <Form.Select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
              >
                <option value="">All Modules</option>
                {modules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={8} className="d-flex align-items-end justify-content-end">
            <Button 
              variant="outline-secondary" 
              onClick={() => setFilterModule('')}
              className="me-2"
            >
              <FaTimes className="me-1" /> Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Permissions Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th>Key</th>
                        <th>Module</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPermissions.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No permissions found
                          </td>
                        </tr>
                      ) : (
                        filteredPermissions.map((permission) => (
                          <tr key={permission._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <FaLock className="text-secondary" />
                                </div>
                                <div>
                                  <div className="fw-bold">{permission.name}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge bg="secondary" className="px-2 py-1">
                                <FaKey className="me-1" size={10} /> {permission.key}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg="info" className="px-2 py-1">
                                <FaCube className="me-1" size={10} /> {permission.module}
                              </Badge>
                            </td>
                            <td>
                              <div className="text-muted small">
                                {permission.description || 'No description'}
                              </div>
                            </td>
                            <td>
                              <Badge 
                                bg={permission.isActive ? 'success' : 'danger'} 
                                className="px-2 py-1"
                              >
                                {permission.isActive ? <FaCheckCircle className="me-1" /> : <FaBan className="me-1" />}
                                {permission.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td>
                              <div className="small text-muted">
                                <FaCalendarAlt className="me-1" size={10} />
                                {new Date(permission.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openEditModal(permission)}
                                >
                                  <FaEdit className="me-1" /> Edit
                                </Button>
                                <Button
                                  variant={permission.isActive ? 'outline-warning' : 'outline-success'}
                                  size="sm"
                                  onClick={() => handleToggleStatus(permission)}
                                >
                                  <FaToggleOn className="me-1" />
                                  {permission.isActive ? 'Disable' : 'Enable'}
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeletePermission(permission)}
                                >
                                  <FaTrash className="me-1" /> Delete
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

      {/* Create Permission Modal with validation */}
      <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); setCreateErrors({}); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Permission</Modal.Title>
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
            handleCreatePermission(values);
          }}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Permission Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="e.g., User Create Access"
                    isInvalid={!!createErrors.name}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Permission Key *</Form.Label>
                  <Form.Control
                    type="text"
                    name="key"
                    value={values.key}
                    onChange={handleChange}
                    placeholder="e.g., USER_CREATE"
                    isInvalid={!!createErrors.key}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.key}</Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Use uppercase with underscores (e.g., USER_CREATE)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Module *</Form.Label>
                  <Form.Control
                    type="text"
                    name="module"
                    value={values.module}
                    onChange={handleChange}
                    placeholder="e.g., User, Room, Billing"
                    isInvalid={!!createErrors.module}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.module}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    placeholder="Brief description of the permission"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => { setShowCreateModal(false); setCreateErrors({}); }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Permission'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Permission Modal with validation */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setEditErrors({}); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Permission</Modal.Title>
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
            handleEditPermission(editForm.values);
          }}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Permission Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editForm.values.name}
                    onChange={editForm.handleChange}
                    isInvalid={!!editErrors.name}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Permission Key *</Form.Label>
                  <Form.Control
                    type="text"
                    name="key"
                    value={editForm.values.key}
                    onChange={editForm.handleChange}
                    isInvalid={!!editErrors.key}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.key}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Module *</Form.Label>
                  <Form.Control
                    type="text"
                    name="module"
                    value={editForm.values.module}
                    onChange={editForm.handleChange}
                    isInvalid={!!editErrors.module}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.module}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={editForm.values.description}
                    onChange={editForm.handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => { setShowEditModal(false); setEditErrors({}); }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Permission'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Permissions;