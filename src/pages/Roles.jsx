import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';

const Roles = () => {
  const { callApi, loading, error, data } = useApi();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Validation errors
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const { values, handleChange, resetForm, setValues } = useForm({
    name: '',
    code: '',
    permissions: []
  });

  const editForm = useForm({
    name: '',
    code: '',
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await callApi('get', '/roles');
      if (response.success) {
        setRoles(response.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

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

  // Validation function
  const validateRoleForm = (formData) => {
    const errors = {};
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Role name is required';
    }
    if (!formData.code || formData.code.trim() === '') {
      errors.code = 'Role code is required';
    }
    return errors;
  };

  const handleCreateRole = async (formData) => {
    // Validate
    const errors = validateRoleForm(formData);
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});

    try {
      const response = await callApi('post', '/roles', {
        ...formData,
        permissions: formData.permissions.map(p => p._id || p)
      });
      if (response.success) {
        setSuccessMessage('Role created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchRoles();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error creating role:', err);
    }
  };

  const handleEditRole = async (formData) => {
    // Validate
    const errors = validateRoleForm(formData);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    try {
      const response = await callApi('put', `/roles/${selectedRole._id}`, {
        ...formData,
        permissions: formData.permissions.map(p => p._id || p)
      });
      if (response.success) {
        setSuccessMessage('Role updated successfully!');
        setShowEditModal(false);
        setSelectedRole(null);
        fetchRoles();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleToggleStatus = async (role) => {
    if (window.confirm(`Are you sure you want to ${role.isActive ? 'disable' : 'enable'} this role?`)) {
      try {
        const response = await callApi('patch', `/roles/${role._id}/status`);
        if (response.success) {
          setSuccessMessage(`Role ${role.isActive ? 'disabled' : 'enabled'} successfully!`);
          fetchRoles();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error toggling role status:', err);
      }
    }
  };

  const openEditModal = (role) => {
    console.log("edit pressed");
    setSelectedRole(role);
    editForm.setValues({
      name: role.name,
      code: role.code,
      permissions: role.permissions
    });
    setEditErrors({}); // Clear previous errors
    setShowEditModal(true);
  };

  const handlePermissionToggle = (permissionId, isEdit = false) => {
    const form = isEdit ? editForm : { values, handleChange };
    const currentPermissions = form.values.permissions || [];
    
    if (currentPermissions.some(p => p._id === permissionId || p === permissionId)) {
      form.handleChange({
        target: {
          name: 'permissions',
          value: currentPermissions.filter(p => p._id !== permissionId && p !== permissionId)
        }
      });
    } else {
      const permission = permissions.find(p => p._id === permissionId);
      form.handleChange({
        target: {
          name: 'permissions',
          value: [...currentPermissions, permission || permissionId]
        }
      });
    }
  };

  const isPermissionSelected = (permissionId, isEdit = false) => {
    const form = isEdit ? editForm : { values };
    const currentPermissions = form.values.permissions || [];
    return currentPermissions.some(p => p._id === permissionId || p === permissionId);
  };

  const groupedPermissions = permissions.reduce((groups, permission) => {
    if (!groups[permission.module]) {
      groups[permission.module] = [];
    }
    groups[permission.module].push(permission);
    return groups;
  }, {});

  if (loading && roles.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading roles..." />
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
                <h2 className="text-dark mb-1">Roles Management</h2>
                <p className="text-muted">Manage user roles and permissions assignment</p>
              </div>
              <Button 
                variant="orange" 
                onClick={() => setShowCreateModal(true)}
                className="d-flex align-items-center"
              >
                <span className="me-2">+</span> Add New Role
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

        {/* Error Message */}
        {error && (
          <Row className="mb-3">
            <Col>
              <Alert variant="danger">
                Error: {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Roles</h6>
                    <h3 className="mb-0">{roles.length}</h3>
                  </div>
                  <div className="bg-primary-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>👑</span>
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
                    <h6 className="text-muted mb-1">Active Roles</h6>
                    <h3 className="mb-0">{roles.filter(r => r.isActive).length}</h3>
                  </div>
                  <div className="bg-success-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>✅</span>
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
                    <h6 className="text-muted mb-1">System Roles</h6>
                    <h3 className="mb-0">{roles.filter(r => r.isSystemRole).length}</h3>
                  </div>
                  <div className="bg-warning-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>⚙️</span>
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
                    <h6 className="text-muted mb-1">Avg Permissions</h6>
                    <h3 className="mb-0">
                      {roles.length > 0 
                        ? Math.round(roles.reduce((sum, r) => sum + (r.permissions?.length || 0), 0) / roles.length)
                        : 0}
                    </h3>
                  </div>
                  <div className="bg-info-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>🔐</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Roles Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Role Name</th>
                        <th>Code</th>
                        <th>Permissions</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No roles found
                          </td>
                        </tr>
                      ) : (
                        roles.map((role) => (
                          <tr key={role._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <span style={{ fontSize: '16px' }}>👑</span>
                                </div>
                                <div>
                                  <div className="fw-bold">{role.name}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge bg="secondary" className="px-2 py-1">
                                {role.code}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {role.permissions?.slice(0, 3).map((perm) => (
                                  <Badge key={perm._id} bg="info" className="px-1 py-0" style={{ fontSize: '10px' }}>
                                    {perm.key?.split('_')[0]}
                                  </Badge>
                                ))}
                                {role.permissions?.length > 3 && (
                                  <Badge bg="light" text="dark" className="px-1 py-0" style={{ fontSize: '10px' }}>
                                    +{role.permissions.length - 3} more
                                  </Badge>
                                )}
                                {(!role.permissions || role.permissions.length === 0) && (
                                  <span className="text-muted small">No permissions</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <Badge bg={role.isSystemRole ? 'warning' : 'primary'} className="px-2 py-1">
                                {role.isSystemRole ? 'System' : 'Custom'}
                              </Badge>
                            </td>
                            <td>
                              <Badge 
                                bg={role.isActive ? 'success' : 'danger'} 
                                className="px-2 py-1"
                              >
                                {role.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td>
                              <div className="small text-muted">
                                {new Date(role.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openEditModal(role)}
                                  // disabled={role.isSystemRole}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant={role.isActive ? 'outline-warning' : 'outline-success'}
                                  size="sm"
                                  onClick={() => handleToggleStatus(role)}
                                  disabled={role.isSystemRole}
                                >
                                  {role.isActive ? 'Disable' : 'Enable'}
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

      {/* Create Role Modal with validation */}
      <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); setCreateErrors({}); }} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Create New Role</Modal.Title>
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
            handleCreateRole(values);
          }}>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="e.g., Manager, Accountant"
                    isInvalid={!!createErrors.name}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={values.code}
                    onChange={handleChange}
                    placeholder="e.g., MANAGER, ACCOUNTANT"
                    isInvalid={!!createErrors.code}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.code}</Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Use uppercase (e.g., ADMIN)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mb-3">Select Permissions</h5>
            <Row>
              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <Col md={6} key={module} className="mb-4">
                  <Card className="border">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">{module} Module</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-column gap-2">
                        {modulePermissions.map((permission) => (
                          <Form.Check
                            key={permission._id}
                            type="checkbox"
                            id={`perm-${permission._id}`}
                            label={
                              <div>
                                <div className="fw-bold small">{permission.name}</div>
                                <div className="text-muted small">{permission.key}</div>
                              </div>
                            }
                            checked={isPermissionSelected(permission._id)}
                            onChange={() => handlePermissionToggle(permission._id)}
                          />
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => { setShowCreateModal(false); setCreateErrors({}); }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Role Modal with validation */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setEditErrors({}); }} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Edit Role: {selectedRole?.name}</Modal.Title>
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
            handleEditRole(editForm.values);
          }}>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role Name *</Form.Label>
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
                  <Form.Label>Role Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={editForm.values.code}
                    onChange={editForm.handleChange}
                    isInvalid={!!editErrors.code}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.code}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mb-3">Select Permissions</h5>
            <Row>
              {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <Col md={6} key={module} className="mb-4">
                  <Card className="border">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">{module} Module</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-column gap-2">
                        {modulePermissions.map((permission) => (
                          <Form.Check
                            key={permission._id}
                            type="checkbox"
                            id={`edit-perm-${permission._id}`}
                            label={
                              <div>
                                <div className="fw-bold small">{permission.name}</div>
                                <div className="text-muted small">{permission.key}</div>
                              </div>
                            }
                            checked={isPermissionSelected(permission._id, true)}
                            onChange={() => handlePermissionToggle(permission._id, true)}
                          />
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => { setShowEditModal(false); setEditErrors({}); }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Roles;