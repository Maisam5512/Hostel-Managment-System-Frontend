import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';
import { roomService } from '../services/roomService';
import { bedService } from '../services/bedService';

const Rooms = () => {
  const { callApi, loading, error, data } = useApi();
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBedsModal, setShowBedsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomBeds, setRoomBeds] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRoomType, setFilterRoomType] = useState('');
  const [filterFloor, setFilterFloor] = useState('');

  const { values, handleChange, resetForm, setValues } = useForm({
    roomNumber: '',
    floor: 1,
    totalBeds: 1,
    roomType: 'SINGLE',
    rentPerBed: 0,
    status: 'AVAILABLE',
    hasAC: false,
    hasWashroom: false
  });

  const editForm = useForm({
    roomNumber: '',
    floor: 1,
    totalBeds: 1,
    roomType: 'SINGLE',
    rentPerBed: 0,
    hasAC: false,
    hasWashroom: false
  });

  const statusForm = useForm({
    status: 'AVAILABLE'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      if (response.success) {
        setRooms(response.data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchRoomBeds = async (roomId) => {
    try {
      const response = await bedService.getBedsByRoom(roomId);
      if (response.success) {
        setRoomBeds(response.data);
      }
    } catch (err) {
      console.error('Error fetching room beds:', err);
    }
  };

  const handleCreateRoom = async (formData) => {
    try {
      const response = await roomService.createRoom({
        ...formData,
        createdBy: JSON.parse(localStorage.getItem('user'))?.id
      });
      
      if (response.success) {
        setSuccessMessage('Room created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchRooms();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  const handleEditRoom = async (formData) => {
    try {
      const response = await roomService.updateRoom(selectedRoom._id, formData);
      if (response.success) {
        setSuccessMessage('Room updated successfully!');
        setShowEditModal(false);
        setSelectedRoom(null);
        fetchRooms();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating room:', err);
    }
  };

  const handleUpdateStatus = async (formData) => {
    try {
      const response = await roomService.updateRoomStatus(selectedRoom._id, formData.status);
      if (response.success) {
        setSuccessMessage('Room status updated successfully!');
        setShowStatusModal(false);
        setSelectedRoom(null);
        fetchRooms();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating room status:', err);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      const response = await roomService.deleteRoom(selectedRoom._id);
      if (response.success) {
        setSuccessMessage('Room deleted successfully!');
        setShowDeleteModal(false);
        setSelectedRoom(null);
        fetchRooms();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  };

  const handleViewBeds = async (room) => {
    setSelectedRoom(room);
    await fetchRoomBeds(room._id);
    setShowBedsModal(true);
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    editForm.setValues({
      roomNumber: room.roomNumber,
      floor: room.floor,
      totalBeds: room.totalBeds,
      roomType: room.roomType,
      rentPerBed: room.rentPerBed,
      hasAC: room.hasAC,
      hasWashroom: room.hasWashroom
    });
    setShowEditModal(true);
  };

  const openStatusModal = (room) => {
    setSelectedRoom(room);
    statusForm.setValues({ status: room.status });
    setShowStatusModal(true);
  };

  const openDeleteModal = (room) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  const roomTypeOptions = [
    { value: 'SINGLE', label: 'Single', icon: '👤' },
    { value: 'DOUBLE', label: 'Double', icon: '👥' },
    { value: 'TRIPLE', label: 'Triple', icon: '👨‍👩‍👧' }
  ];

  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available', color: 'success', icon: '✅' },
    { value: 'FULL', label: 'Full', color: 'warning', icon: '🈵' },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'danger', icon: '🔧' }
  ];

  const floors = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);
  const roomTypes = [...new Set(rooms.map(room => room.roomType))];

  const filteredRooms = rooms.filter(room => {
    if (filterStatus && room.status !== filterStatus) return false;
    if (filterRoomType && room.roomType !== filterRoomType) return false;
    if (filterFloor && room.floor !== parseInt(filterFloor)) return false;
    return true;
  });

  const calculateOccupancy = (room) => {
    // This would need actual bed data - for now using mock
    const totalBeds = room.totalBeds || 1;
    const occupiedBeds = Math.floor(totalBeds * 0.7); // Mock data
    return Math.round((occupiedBeds / totalBeds) * 100);
  };

  if (loading && rooms.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading rooms..." />
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
                <h2 className="text-dark mb-1">Rooms Management</h2>
                <p className="text-muted">Manage hostel rooms and allocations</p>
              </div>
              <Button 
                variant="orange" 
                onClick={() => setShowCreateModal(true)}
                className="d-flex align-items-center"
              >
                <span className="me-2">+</span> Add New Room
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
                    <h6 className="text-muted mb-1">Total Rooms</h6>
                    <h3 className="mb-0">{rooms.length}</h3>
                  </div>
                  <div className="bg-primary-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>🏠</span>
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
                    <h6 className="text-muted mb-1">Available</h6>
                    <h3 className="mb-0">{rooms.filter(r => r.status === 'AVAILABLE').length}</h3>
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
                    <h6 className="text-muted mb-1">Total Beds</h6>
                    <h3 className="mb-0">{rooms.reduce((sum, room) => sum + (room.totalBeds || 0), 0)}</h3>
                  </div>
                  <div className="bg-warning-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>🛏️</span>
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
                    <h6 className="text-muted mb-1">Occupancy Rate</h6>
                    <h3 className="mb-0">
                      {rooms.length > 0 
                        ? Math.round(rooms.reduce((sum, room) => sum + calculateOccupancy(room), 0) / rooms.length)
                        : 0}%
                    </h3>
                  </div>
                  <div className="bg-info-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>📊</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
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
          <Col md={3}>
            <Form.Group>
              <Form.Label>Room Type</Form.Label>
              <Form.Select
                value={filterRoomType}
                onChange={(e) => setFilterRoomType(e.target.value)}
              >
                <option value="">All Types</option>
                {roomTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Floor</Form.Label>
              <Form.Select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
              >
                <option value="">All Floors</option>
                {floors.map(floor => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex align-items-end justify-content-end">
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setFilterStatus('');
                setFilterRoomType('');
                setFilterFloor('');
              }}
              className="me-2"
            >
              Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Rooms Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Room Details</th>
                        <th>Floor</th>
                        <th>Type</th>
                        <th>Beds</th>
                        <th>Rent per Bed</th>
                        <th>Features</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRooms.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No rooms found
                          </td>
                        </tr>
                      ) : (
                        filteredRooms.map((room) => {
                          const statusOption = statusOptions.find(s => s.value === room.status);
                          const roomTypeOption = roomTypeOptions.find(t => t.value === room.roomType);
                          
                          return (
                            <tr key={room._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    <span style={{ fontSize: '16px' }}>{roomTypeOption?.icon || '🏠'}</span>
                                  </div>
                                  <div>
                                    <div className="fw-bold">{room.roomNumber}</div>
                                    <div className="small text-muted">ID: {room._id?.slice(-6)}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <Badge bg="secondary" className="px-2 py-1">
                                  Floor {room.floor}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg="info" className="px-2 py-1">
                                  {room.roomType}
                                </Badge>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">{room.totalBeds}</div>
                                  <div className="small text-muted">beds total</div>
                                </div>
                              </td>
                              <td>
                                <div className="fw-bold">₹{room.rentPerBed?.toLocaleString()}</div>
                                <div className="small text-muted">per bed/month</div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  {room.hasAC && (
                                    <Badge bg="primary" className="px-1 py-0 small">AC</Badge>
                                  )}
                                  {room.hasWashroom && (
                                    <Badge bg="success" className="px-1 py-0 small">WC</Badge>
                                  )}
                                </div>
                              </td>
                              <td>
                                <Badge 
                                  bg={statusOption?.color || 'secondary'} 
                                  className="px-2 py-1"
                                >
                                  {statusOption?.icon} {room.status}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => openEditModal(room)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => openStatusModal(room)}
                                  >
                                    Status
                                  </Button>
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => handleViewBeds(room)}
                                  >
                                    Beds
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => openDeleteModal(room)}
                                    disabled={room.status === 'OCCUPIED'}
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

      {/* Create Room Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleCreateRoom(values);
          }}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="roomNumber"
                    value={values.roomNumber}
                    onChange={handleChange}
                    placeholder="e.g., A-101, B-202"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Floor *</Form.Label>
                  <Form.Control
                    type="number"
                    name="floor"
                    value={values.floor}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Type *</Form.Label>
                  <Form.Select
                    name="roomType"
                    value={values.roomType}
                    onChange={handleChange}
                    required
                  >
                    {roomTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Beds *</Form.Label>
                  <Form.Control
                    type="number"
                    name="totalBeds"
                    value={values.totalBeds}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rent per Bed (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="rentPerBed"
                    value={values.rentPerBed}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Initial Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="hasAC"
                    label="Has Air Conditioning"
                    checked={values.hasAC}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'hasAC',
                        value: e.target.checked
                      }
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="hasWashroom"
                    label="Has Attached Washroom"
                    checked={values.hasWashroom}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'hasWashroom',
                        value: e.target.checked
                      }
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Room'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Room Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Room: {selectedRoom?.roomNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleEditRoom(editForm.values);
          }}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="roomNumber"
                    value={editForm.values.roomNumber}
                    onChange={editForm.handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Floor *</Form.Label>
                  <Form.Control
                    type="number"
                    name="floor"
                    value={editForm.values.floor}
                    onChange={editForm.handleChange}
                    min="1"
                    max="10"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Type *</Form.Label>
                  <Form.Select
                    name="roomType"
                    value={editForm.values.roomType}
                    onChange={editForm.handleChange}
                    required
                  >
                    {roomTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Beds *</Form.Label>
                  <Form.Control
                    type="number"
                    name="totalBeds"
                    value={editForm.values.totalBeds}
                    onChange={editForm.handleChange}
                    min="1"
                    max="10"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rent per Bed (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="rentPerBed"
                    value={editForm.values.rentPerBed}
                    onChange={editForm.handleChange}
                    min="0"
                    step="100"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="hasAC"
                    label="Has Air Conditioning"
                    checked={editForm.values.hasAC}
                    onChange={(e) => editForm.handleChange({
                      target: {
                        name: 'hasAC',
                        value: e.target.checked
                      }
                    })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="hasWashroom"
                label="Has Attached Washroom"
                checked={editForm.values.hasWashroom}
                onChange={(e) => editForm.handleChange({
                  target: {
                    name: 'hasWashroom',
                    value: e.target.checked
                  }
                })}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Room'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Change Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Room Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <div className="mb-3">
              <p>Room: <strong>{selectedRoom.roomNumber}</strong></p>
              <p>Floor: <Badge bg="secondary">Floor {selectedRoom.floor}</Badge></p>
              <p>Current Status: 
                <Badge bg={statusOptions.find(s => s.value === selectedRoom.status)?.color || 'secondary'} className="ms-2">
                  {selectedRoom.status}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <div className="mb-3">
              <Alert variant="danger">
                <h5>⚠️ Warning!</h5>
                <p>Are you sure you want to delete room <strong>{selectedRoom.roomNumber}</strong>?</p>
                <p className="mb-0">This action cannot be undone. All associated beds will also be deactivated.</p>
              </Alert>
              <div className="small text-muted">
                <p><strong>Room Details:</strong></p>
                <p>Floor: {selectedRoom.floor}</p>
                <p>Type: {selectedRoom.roomType}</p>
                <p>Beds: {selectedRoom.totalBeds}</p>
                <p>Status: {selectedRoom.status}</p>
              </div>
            </div>
          )}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteRoom} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Room'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* View Beds Modal */}
      <Modal show={showBedsModal} onHide={() => setShowBedsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Beds in Room: {selectedRoom?.roomNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <div className="mb-3">
              <Row className="mb-3">
                <Col md={4}>
                  <div className="small">Floor: <strong>{selectedRoom.floor}</strong></div>
                </Col>
                <Col md={4}>
                  <div className="small">Type: <strong>{selectedRoom.roomType}</strong></div>
                </Col>
                <Col md={4}>
                  <div className="small">Capacity: <strong>{selectedRoom.totalBeds} beds</strong></div>
                </Col>
              </Row>
            </div>
          )}
          
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Bed Number</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {roomBeds.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3">
                      No beds found in this room
                    </td>
                  </tr>
                ) : (
                  roomBeds.map((bed) => (
                    <tr key={bed._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2">🛏️</span>
                          <strong>{bed.bedNumber}</strong>
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={bed.status === 'AVAILABLE' ? 'success' : 
                              bed.status === 'OCCUPIED' ? 'warning' : 'danger'} 
                          className="px-2 py-1"
                        >
                          {bed.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="small text-muted">
                          {new Date(bed.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <Badge bg={bed.isActive ? 'success' : 'danger'} className="px-2 py-1">
                          {bed.isActive ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="outline-primary" size="sm" onClick={() => {
              // Navigate to beds page with room filter
              window.location.href = `/beds?room=${selectedRoom?._id}`;
            }}>
              Manage Beds
            </Button>
            <Button variant="secondary" onClick={() => setShowBedsModal(false)}>
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Rooms;