import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';
import { memberService } from '../services/memberService';
import { userService } from '../services/userService';
import { roomService } from '../services/roomService';
import { bedService } from '../services/bedService';

const Members = () => {
  const { callApi, loading, error, data } = useApi();
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRoom, setFilterRoom] = useState('');

  const { values, handleChange, resetForm, setValues } = useForm({
    user: '',
    registrationNumber: '',
    fatherName: '',
    phone: '',
    cnic: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    status: 'ACTIVE',
    monthlyRent: 0,
    securityDeposit: 0,
    messEnabled: true,
    dietPreference: 'NORMAL'
  });

  const editForm = useForm({
    fatherName: '',
    phone: '',
    cnic: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    },
    monthlyRent: 0,
    securityDeposit: 0,
    messEnabled: true,
    dietPreference: 'NORMAL'
  });

  const assignForm = useForm({
    roomId: '',
    bedId: ''
  });

  const statusForm = useForm({
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchMembers();
    fetchUsers();
    fetchRooms();
    fetchAvailableBeds();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await memberService.getAllMembers();
      if (response.success) {
        setMembers(response.data);
      } else {
        // Mock data for development
        setMembers([
          {
            _id: '1',
            user: { fullName: 'John Doe', email: 'john@example.com' },
            registrationNumber: 'REG001',
            fatherName: 'Robert Doe',
            phone: '03001234567',
            cnic: '12345-6789012-3',
            status: 'ACTIVE',
            currentRoom: { roomNumber: 'A-101' },
            currentBed: { bedNumber: 'B1' },
            monthlyRent: 15000,
            totalDue: 0,
            messEnabled: true,
            dietPreference: 'NORMAL'
          },
          {
            _id: '2',
            user: { fullName: 'Jane Smith', email: 'jane@example.com' },
            registrationNumber: 'REG002',
            fatherName: 'John Smith',
            phone: '03001234568',
            cnic: '12345-6789012-4',
            status: 'ACTIVE',
            currentRoom: { roomNumber: 'A-102' },
            currentBed: { bedNumber: 'B1' },
            monthlyRent: 15000,
            totalDue: 5000,
            messEnabled: false,
            dietPreference: 'VEG'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      // Mock data for development
      setMembers([
        {
          _id: '1',
          user: { fullName: 'John Doe', email: 'john@example.com' },
          registrationNumber: 'REG001',
          fatherName: 'Robert Doe',
          phone: '03001234567',
          cnic: '12345-6789012-3',
          status: 'ACTIVE',
          currentRoom: { roomNumber: 'A-101' },
          currentBed: { bedNumber: 'B1' },
          monthlyRent: 15000,
          totalDue: 0,
          messEnabled: true,
          dietPreference: 'NORMAL',
          joiningDate: '2026-01-15'
        },
        {
          _id: '2',
          user: { fullName: 'Jane Smith', email: 'jane@example.com' },
          registrationNumber: 'REG002',
          fatherName: 'John Smith',
          phone: '03001234568',
          cnic: '12345-6789012-4',
          status: 'ACTIVE',
          currentRoom: { roomNumber: 'A-102' },
          currentBed: { bedNumber: 'B1' },
          monthlyRent: 15000,
          totalDue: 5000,
          messEnabled: false,
          dietPreference: 'VEG',
          joiningDate: '2026-01-10'
        }
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      if (Array.isArray(response)) {
        setUsers(response);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      if (response.success) {
        setRooms(response.data.filter(room => room.isActive && room.status === 'AVAILABLE'));
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchAvailableBeds = async () => {
    try {
      const response = await bedService.getAllBeds();
      if (response.success) {
        setAvailableBeds(response.data.filter(bed => bed.status === 'AVAILABLE' && bed.isActive));
      }
    } catch (err) {
      console.error('Error fetching available beds:', err);
    }
  };

  const handleCreateMember = async (formData) => {
    try {
      // In a real app, this would call the API
      const mockResponse = { success: true, message: 'Member created successfully' };
      
      if (mockResponse.success) {
        setSuccessMessage('Member created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchMembers();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error creating member:', err);
    }
  };

  const handleEditMember = async (formData) => {
    try {
      // In a real app, this would call the API
      const mockResponse = { success: true, message: 'Member updated successfully' };
      
      if (mockResponse.success) {
        setSuccessMessage('Member updated successfully!');
        setShowEditModal(false);
        setSelectedMember(null);
        fetchMembers();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating member:', err);
    }
  };

  const handleUpdateStatus = async (formData) => {
    try {
      // In a real app, this would call the API
      const mockResponse = { success: true, message: 'Member status updated successfully' };
      
      if (mockResponse.success) {
        setSuccessMessage(`Member ${formData.status === 'LEFT' ? 'marked as left' : 'status updated'} successfully!`);
        setShowStatusModal(false);
        setSelectedMember(null);
        fetchMembers();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating member status:', err);
    }
  };

  const handleAssignBed = async (formData) => {
    try {
      // In a real app, this would call the API
      const mockResponse = { success: true, message: 'Bed assigned successfully' };
      
      if (mockResponse.success) {
        setSuccessMessage('Bed assigned successfully!');
        setShowAssignModal(false);
        setSelectedMember(null);
        fetchMembers();
        fetchAvailableBeds();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error assigning bed:', err);
    }
  };

  const handleUnassignBed = async (member) => {
    if (window.confirm(`Are you sure you want to unassign bed from ${member.user?.fullName}?`)) {
      try {
        // In a real app, this would call the API
        const mockResponse = { success: true, message: 'Bed unassigned successfully' };
        
        if (mockResponse.success) {
          setSuccessMessage('Bed unassigned successfully!');
          fetchMembers();
          fetchAvailableBeds();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error unassigning bed:', err);
      }
    }
  };

  const handleDeleteMember = async () => {
    try {
      // In a real app, this would call the API
      const mockResponse = { success: true, message: 'Member deleted successfully' };
      
      if (mockResponse.success) {
        setSuccessMessage('Member deleted successfully!');
        setShowDeleteModal(false);
        setSelectedMember(null);
        fetchMembers();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    editForm.setValues({
      fatherName: member.fatherName || '',
      phone: member.phone || '',
      cnic: member.cnic || '',
      address: member.address || '',
      emergencyContact: member.emergencyContact || { name: '', phone: '', relation: '' },
      monthlyRent: member.monthlyRent || 0,
      securityDeposit: member.securityDeposit || 0,
      messEnabled: member.messEnabled !== undefined ? member.messEnabled : true,
      dietPreference: member.dietPreference || 'NORMAL'
    });
    setShowEditModal(true);
  };

  const openStatusModal = (member) => {
    setSelectedMember(member);
    statusForm.setValues({ status: member.status });
    setShowStatusModal(true);
  };

  const openAssignModal = (member) => {
    setSelectedMember(member);
    setShowAssignModal(true);
  };

  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', color: 'success', icon: '✅' },
    { value: 'LEFT', label: 'Left', color: 'secondary', icon: '🚪' },
    { value: 'SUSPENDED', label: 'Suspended', color: 'danger', icon: '⛔' }
  ];

  const dietOptions = [
    { value: 'NORMAL', label: 'Normal', icon: '🍛' },
    { value: 'VEG', label: 'Vegetarian', icon: '🥦' },
    { value: 'DIABETIC', label: 'Diabetic', icon: '🩺' }
  ];

  const filteredMembers = members.filter(member => {
    if (filterStatus && member.status !== filterStatus) return false;
    if (filterRoom && member.currentRoom?._id !== filterRoom) return false;
    return true;
  });

  const getBedsForRoom = (roomId) => {
    return availableBeds.filter(bed => bed.room_Id?._id === roomId);
  };

  const handleRoomChange = (roomId) => {
    assignForm.setValues({
      ...assignForm.values,
      roomId: roomId,
      bedId: '' // Reset bed selection when room changes
    });
  };

  if (loading && members.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading members..." />
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
                <h2 className="text-dark mb-1">Members Management</h2>
                <p className="text-muted">Manage hostel residents and room allocations</p>
              </div>
              <Button 
                variant="orange" 
                onClick={() => setShowCreateModal(true)}
                className="d-flex align-items-center"
              >
                <span className="me-2">+</span> Add New Member
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
                    <h6 className="text-muted mb-1">Total Members</h6>
                    <h3 className="mb-0">{members.length}</h3>
                  </div>
                  <div className="bg-primary-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>👥</span>
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
                    <h3 className="mb-0">{members.filter(m => m.status === 'ACTIVE').length}</h3>
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
                    <h6 className="text-muted mb-1">With Mess</h6>
                    <h3 className="mb-0">{members.filter(m => m.messEnabled).length}</h3>
                  </div>
                  <div className="bg-warning-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>🍽️</span>
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
                    <h6 className="text-muted mb-1">Total Due</h6>
                    <h3 className="mb-0">
                      ₹{members.reduce((sum, member) => sum + (member.totalDue || 0), 0).toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-danger-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>💰</span>
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
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Room</Form.Label>
              <Form.Select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
              >
                <option value="">All Rooms</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>{room.roomNumber}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end justify-content-end">
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setFilterStatus('');
                setFilterRoom('');
              }}
              className="me-2"
            >
              Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Members Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Member Details</th>
                        <th>Registration</th>
                        <th>Contact</th>
                        <th>Room/Bed</th>
                        <th>Rent/Due</th>
                        <th>Mess</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No members found
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((member) => {
                          const statusOption = statusOptions.find(s => s.value === member.status);
                          const dietOption = dietOptions.find(d => d.value === member.dietPreference);
                          
                          return (
                            <tr key={member._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    <div className="bg-orange text-white rounded-circle d-flex align-items-center justify-content-center" 
                                      style={{ width: '36px', height: '36px' }}>
                                      {member.user?.fullName?.charAt(0).toUpperCase() || 'M'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="fw-bold">{member.user?.fullName || 'Unknown'}</div>
                                    <div className="small text-muted">{member.user?.email || 'No email'}</div>
                                    <div className="small text-muted">Father: {member.fatherName || 'N/A'}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <Badge bg="secondary" className="px-2 py-1 mb-1">
                                    {member.registrationNumber || 'N/A'}
                                  </Badge>
                                  <div className="small text-muted">CNIC: {member.cnic || 'N/A'}</div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div>{member.phone || 'N/A'}</div>
                                  <div className="small text-muted">
                                    {member.emergencyContact?.name ? 
                                      `Emergency: ${member.emergencyContact.name} (${member.emergencyContact.relation})` : 
                                      'No emergency contact'}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  {member.currentRoom ? (
                                    <>
                                      <Badge bg="info" className="px-2 py-1">
                                        Room: {member.currentRoom.roomNumber}
                                      </Badge>
                                      <div className="small mt-1">
                                        {member.currentBed ? (
                                          <Badge bg="primary" className="px-1 py-0">
                                            Bed: {member.currentBed.bedNumber}
                                          </Badge>
                                        ) : (
                                          <span className="text-warning">No bed assigned</span>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-danger">No room assigned</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">₹{member.monthlyRent?.toLocaleString()}</div>
                                  <div className="small text-muted">per month</div>
                                  <div className={`small ${member.totalDue > 0 ? 'text-danger fw-bold' : 'text-success'}`}>
                                    Due: ₹{member.totalDue?.toLocaleString() || '0'}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex flex-column gap-1">
                                  <Badge bg={member.messEnabled ? 'success' : 'danger'} className="px-2 py-1">
                                    {member.messEnabled ? 'Mess On' : 'Mess Off'}
                                  </Badge>
                                  {dietOption && (
                                    <Badge bg="warning" className="px-1 py-0 small">
                                      {dietOption.icon} {dietOption.label}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td>
                                <Badge 
                                  bg={statusOption?.color || 'secondary'} 
                                  className="px-2 py-1"
                                >
                                  {statusOption?.icon} {member.status}
                                </Badge>
                                <div className="small text-muted mt-1">
                                  Joined: {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : 'N/A'}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex flex-column gap-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => openEditModal(member)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant={member.currentRoom ? 'outline-warning' : 'outline-success'}
                                    size="sm"
                                    onClick={() => member.currentRoom ? handleUnassignBed(member) : openAssignModal(member)}
                                  >
                                    {member.currentRoom ? 'Unassign' : 'Assign Room'}
                                  </Button>
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => openStatusModal(member)}
                                  >
                                    Status
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => openDeleteModal(member)}
                                    disabled={member.status === 'ACTIVE'}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Create Member Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Register New Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleCreateMember(values);
          }}>
            <h6 className="mb-3 border-bottom pb-2">Personal Information</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select User *</Form.Label>
                  <Form.Select
                    name="user"
                    value={values.user}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.fullName} ({user.email}) - {user.role?.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    User must be registered in the system first
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Registration Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="registrationNumber"
                    value={values.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g., REG001, STU2024001"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Father's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fatherName"
                    value={values.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    placeholder="e.g., 03001234567"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CNIC *</Form.Label>
                  <Form.Control
                    type="text"
                    name="cnic"
                    value={values.cnic}
                    onChange={handleChange}
                    placeholder="e.g., 12345-6789012-3"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    placeholder="Enter permanent address"
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3 border-bottom pb-2 mt-4">Emergency Contact</h6>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergencyContact.name"
                    value={values.emergencyContact.name}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'emergencyContact',
                        value: { ...values.emergencyContact, name: e.target.value }
                      }
                    })}
                    placeholder="Emergency contact name"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergencyContact.phone"
                    value={values.emergencyContact.phone}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'emergencyContact',
                        value: { ...values.emergencyContact, phone: e.target.value }
                      }
                    })}
                    placeholder="Emergency phone"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Relation</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergencyContact.relation"
                    value={values.emergencyContact.relation}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'emergencyContact',
                        value: { ...values.emergencyContact, relation: e.target.value }
                      }
                    })}
                    placeholder="e.g., Father, Mother"
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3 border-bottom pb-2 mt-4">Financial Information</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Monthly Rent (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="monthlyRent"
                    value={values.monthlyRent}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Security Deposit (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="securityDeposit"
                    value={values.securityDeposit}
                    onChange={handleChange}
                    min="0"
                    step="100"
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3 border-bottom pb-2 mt-4">Mess Settings</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mess Subscription</Form.Label>
                  <Form.Check
                    type="switch"
                    name="messEnabled"
                    label="Enable Mess Service"
                    checked={values.messEnabled}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'messEnabled',
                        value: e.target.checked
                      }
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Diet Preference</Form.Label>
                  <Form.Select
                    name="dietPreference"
                    value={values.dietPreference}
                    onChange={handleChange}
                  >
                    {dietOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Member'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Member Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Member: {selectedMember?.user?.fullName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleEditMember(editForm.values);
          }}>
            <h6 className="mb-3 border-bottom pb-2">Personal Information</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Father's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fatherName"
                    value={editForm.values.fatherName}
                    onChange={editForm.handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={editForm.values.phone}
                    onChange={editForm.handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CNIC *</Form.Label>
                  <Form.Control
                    type="text"
                    name="cnic"
                    value={editForm.values.cnic}
                    onChange={editForm.handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={editForm.values.address}
                    onChange={editForm.handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3 border-bottom pb-2 mt-4">Emergency Contact</h6>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergencyContact.name"
                    value={editForm.values.emergencyContact.name}
                    onChange={(e) => editForm.handleChange({
                      target: {
                        name: 'emergencyContact',
                        value: { ...editForm.values.emergencyContact, name: e.target.value }
                      }
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergencyContact.phone"
                    value={editForm.values.emergencyContact.phone}
                    onChange={(e) => editForm.handleChange({
                      target: {
                        name: 'emergencyContact',
                        value: { ...editForm.values.emergencyContact, phone: e.target.value }
                      }
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Relation</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergencyContact.relation"
                    value={editForm.values.emergencyContact.relation}
                    onChange={(e) => editForm.handleChange({
                      target: {
                        name: 'emergencyContact',
                        value: { ...editForm.values.emergencyContact, relation: e.target.value }
                      }
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3 border-bottom pb-2 mt-4">Financial Information</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Monthly Rent (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="monthlyRent"
                    value={editForm.values.monthlyRent}
                    onChange={editForm.handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Security Deposit (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="securityDeposit"
                    value={editForm.values.securityDeposit}
                    onChange={editForm.handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mb-3 border-bottom pb-2 mt-4">Mess Settings</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    name="messEnabled"
                    label="Enable Mess Service"
                    checked={editForm.values.messEnabled}
                    onChange={(e) => editForm.handleChange({
                      target: {
                        name: 'messEnabled',
                        value: e.target.checked
                      }
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Diet Preference</Form.Label>
                  <Form.Select
                    name="dietPreference"
                    value={editForm.values.dietPreference}
                    onChange={editForm.handleChange}
                  >
                    {dietOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Member'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Change Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Member Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <div className="mb-3">
              <p>Member: <strong>{selectedMember.user?.fullName}</strong></p>
              <p>Registration: <Badge bg="secondary">{selectedMember.registrationNumber}</Badge></p>
              <p>Current Status: 
                <Badge bg={statusOptions.find(s => s.value === selectedMember.status)?.color || 'secondary'} className="ms-2">
                  {selectedMember.status}
                </Badge>
              </p>
            </div>
          )}
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateStatus(statusForm.values);
          }}>
            <Form.Group className="mb-3">
              <Form.Label>New Status *</Form.Label>
              <Form.Select
                name="status"
                value={statusForm.values.status}
                onChange={statusForm.handleChange}
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </Form.Select>
              {statusForm.values.status === 'LEFT' && (
                <Form.Text className="text-warning">
                  Note: When marking as LEFT, the member will be removed from their room and bed.
                </Form.Text>
              )}
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Assign Room/Bed Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Room/Bed to {selectedMember?.user?.fullName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <div className="mb-3">
              <p>Member: <strong>{selectedMember.user?.fullName}</strong></p>
              <p>Current: 
                {selectedMember.currentRoom ? (
                  <span className="ms-2">
                    Room <Badge bg="info">{selectedMember.currentRoom.roomNumber}</Badge>
                    {selectedMember.currentBed && (
                      <span className="ms-2">
                        Bed <Badge bg="primary">{selectedMember.currentBed.bedNumber}</Badge>
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-danger ms-2">No room assigned</span>
                )}
              </p>
            </div>
          )}
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleAssignBed(assignForm.values);
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Select Room *</Form.Label>
              <Form.Select
                name="roomId"
                value={assignForm.values.roomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                required
              >
                <option value="">Select a room</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.roomNumber} (Floor {room.floor}, {room.roomType}, ₹{room.rentPerBed}/bed)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            {assignForm.values.roomId && (
              <Form.Group className="mb-3">
                <Form.Label>Select Bed *</Form.Label>
                <Form.Select
                  name="bedId"
                  value={assignForm.values.bedId}
                  onChange={assignForm.handleChange}
                  required
                >
                  <option value="">Select a bed</option>
                  {getBedsForRoom(assignForm.values.roomId).map(bed => (
                    <option key={bed._id} value={bed._id}>
                      {bed.bedNumber} - {bed.status}
                    </option>
                  ))}
                </Form.Select>
                {getBedsForRoom(assignForm.values.roomId).length === 0 && (
                  <Form.Text className="text-danger">
                    No available beds in this room. Please create beds first.
                  </Form.Text>
                )}
              </Form.Group>
            )}
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading || !assignForm.values.roomId || !assignForm.values.bedId}
              >
                {loading ? 'Assigning...' : 'Assign Room/Bed'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <div className="mb-3">
              <Alert variant="danger">
                <h5>⚠️ Warning!</h5>
                <p>Are you sure you want to delete member <strong>{selectedMember.user?.fullName}</strong>?</p>
                <p className="mb-0">This action cannot be undone. All associated records will be removed.</p>
              </Alert>
              <div className="small text-muted">
                <p><strong>Member Details:</strong></p>
                <p>Registration: {selectedMember.registrationNumber}</p>
                <p>CNIC: {selectedMember.cnic}</p>
                <p>Status: {selectedMember.status}</p>
                {selectedMember.currentRoom && (
                  <p>Currently in: Room {selectedMember.currentRoom.roomNumber}</p>
                )}
              </div>
            </div>
          )}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteMember} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Member'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Members;