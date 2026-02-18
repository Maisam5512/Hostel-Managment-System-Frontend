import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';
import { roomService } from '../services/roomService';
import { bedService } from '../services/bedService';

// Icons
import {
  FaHome, FaCheckCircle, FaBed, FaChartLine, FaPlus, FaFilter,
  FaTimes, FaEdit, FaToggleOn, FaInfoCircle, FaTrash, FaUsers,
  FaWifi, FaSnowflake, FaWater, FaDoorOpen, FaBan, FaWrench,
  FaList, FaUser, FaCalendarAlt, FaCheck, FaExclamationTriangle
} from 'react-icons/fa';

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

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Validation errors
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Store bed occupancy for each room
  const [roomOccupancy, setRoomOccupancy] = useState({});

  const { values, handleChange, resetForm, setValues } = useForm({
    roomNumber: '',
    floor: 1,
    roomType: 'SINGLE',
    rentPerBed: 0,
    status: 'AVAILABLE',
    hasAC: false,
    hasWashroom: false
  });

  const editForm = useForm({
    roomNumber: '',
    floor: 1,
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

  // Show API error in modal
  useEffect(() => {
    if (error) {
      setErrorModalMessage(error);
      setShowErrorModal(true);
    }
  }, [error]);

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      if (response.success) {
        setRooms(response.data);
        await fetchAllRoomsBeds(response.data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      // Error will be caught by useApi and trigger the useEffect above
    }
  };

  const fetchAllRoomsBeds = async (roomsList) => {
    const occupancy = {};
    for (const room of roomsList) {
      try {
        const bedsRes = await bedService.getBedsByRoom(room._id);
        if (bedsRes.success) {
          const beds = bedsRes.data;
          const totalBeds = beds.length;
          const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
          occupancy[room._id] = {
            totalBeds,
            occupiedBeds,
            rate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
          };
        } else {
          occupancy[room._id] = { totalBeds: 0, occupiedBeds: 0, rate: 0 };
        }
      } catch (err) {
        console.error(`Error fetching beds for room ${room._id}:`, err);
        occupancy[room._id] = { totalBeds: 0, occupiedBeds: 0, rate: 0 };
      }
    }
    setRoomOccupancy(occupancy);
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

  // Validation function for create/edit
  const validateRoomForm = (formData, isEdit = false) => {
    const errors = {};
    if (!formData.roomNumber || formData.roomNumber.trim() === '') {
      errors.roomNumber = 'Room number is required';
    }
    const floor = parseInt(formData.floor);
    if (isNaN(floor) || floor < 1) {
      errors.floor = 'Floor must be at least 1';
    }
    if (!formData.roomType) {
      errors.roomType = 'Room type is required';
    }
    const rent = parseFloat(formData.rentPerBed);
    if (isNaN(rent) || rent < 0) {
      errors.rentPerBed = 'Rent per bed must be a non-negative number';
    }
    return errors;
  };

  // Determine bed count based on room type
  const getBedCountFromType = (roomType) => {
    switch (roomType) {
      case 'SINGLE': return 1;
      case 'DOUBLE': return 2;
      case 'TRIPLE': return 3;
      default: return 1;
    }
  };

  const handleCreateRoom = async (formData) => {
    const errors = validateRoomForm(formData);
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});

    try {
      const bedCount = getBedCountFromType(formData.roomType);
      const response = await roomService.createRoom({
        ...formData,
        floor: parseInt(formData.floor),
        totalBeds: bedCount,
        rentPerBed: parseFloat(formData.rentPerBed),
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
      // Error will be shown in modal via useEffect
    }
  };

  const handleEditRoom = async (formData) => {
    const errors = validateRoomForm(formData, true);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    try {
      const bedCount = getBedCountFromType(formData.roomType);
      const response = await roomService.updateRoom(selectedRoom._id, {
        ...formData,
        floor: parseInt(formData.floor),
        totalBeds: bedCount,
        rentPerBed: parseFloat(formData.rentPerBed)
      });
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
      roomType: room.roomType,
      rentPerBed: room.rentPerBed,
      hasAC: room.hasAC,
      hasWashroom: room.hasWashroom
    });
    setEditErrors({});
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
    { value: 'SINGLE', label: 'Single', icon: <FaUser /> },
    { value: 'DOUBLE', label: 'Double', icon: <FaUsers /> },
    { value: 'TRIPLE', label: 'Triple', icon: <FaUsers style={{ transform: 'scaleX(-1)' }} /> }
  ];

  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available', color: 'success', icon: <FaCheckCircle /> },
    { value: 'FULL', label: 'Full', color: 'warning', icon: <FaBan /> },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'danger', icon: <FaWrench /> }
  ];

  const floors = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);
  const roomTypes = [...new Set(rooms.map(room => room.roomType))];

  const filteredRooms = rooms.filter(room => {
    if (filterStatus && room.status !== filterStatus) return false;
    if (filterRoomType && room.roomType !== filterRoomType) return false;
    if (filterFloor && room.floor !== parseInt(filterFloor)) return false;
    return true;
  });

  const overallOccupancy = rooms.length > 0
    ? Math.round(rooms.reduce((sum, room) => {
        const occ = roomOccupancy[room._id];
        return sum + (occ?.rate || 0);
      }, 0) / rooms.length)
    : 0;

  const totalBedsOverall = rooms.reduce((sum, room) => {
    const occ = roomOccupancy[room._id];
    return sum + (occ?.totalBeds || 0);
  }, 0);

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
                <FaPlus className="me-2" /> Add New Room
              </Button>
            </div>
          </Col>
        </Row>

        {/* Success Message (top alert) */}
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
                    <h6 className="text-muted mb-1">Total Rooms</h6>
                    <h3 className="mb-0">{rooms.length}</h3>
                  </div>
                  <div className="bg-primary-light p-2 rounded-circle">
                    <FaHome size={20} className="text-primary" />
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
                    <h6 className="text-muted mb-1">Total Beds</h6>
                    <h3 className="mb-0">{totalBedsOverall}</h3>
                  </div>
                  <div className="bg-warning-light p-2 rounded-circle">
                    <FaBed size={20} className="text-warning" />
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
                    <h3 className="mb-0">{overallOccupancy}%</h3>
                  </div>
                  <div className="bg-info-light p-2 rounded-circle">
                    <FaChartLine size={20} className="text-info" />
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
              <Form.Label><FaFilter className="me-1" /> Status</Form.Label>
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
              <Form.Label><FaUsers className="me-1" /> Room Type</Form.Label>
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
              <Form.Label><FaDoorOpen className="me-1" /> Floor</Form.Label>
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
              <FaTimes className="me-1" /> Clear Filters
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
                          const occupancy = roomOccupancy[room._id] || { totalBeds: 0, occupiedBeds: 0, rate: 0 };
                          
                          return (
                            <tr key={room._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    {roomTypeOption?.icon || <FaHome />}
                                  </div>
                                  <div>
                                    <div className="fw-bold">{room.roomNumber}</div>
                                    <div className="small text-muted">ID: {room._id?.slice(-6)}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <Badge bg="secondary" className="px-2 py-1">
                                  <FaDoorOpen className="me-1" /> Floor {room.floor}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg="info" className="px-2 py-1">
                                  {room.roomType}
                                </Badge>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">{occupancy.totalBeds}</div>
                                  <div className="small text-muted">
                                    {occupancy.occupiedBeds} occupied ({occupancy.rate}%)
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="fw-bold">₹{room.rentPerBed?.toLocaleString()}</div>
                                <div className="small text-muted">per bed/month</div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  {room.hasAC && (
                                    <Badge bg="primary" className="px-1 py-0 small">
                                      <FaSnowflake className="me-1" size={10} /> AC
                                    </Badge>
                                  )}
                                  {room.hasWashroom && (
                                    <Badge bg="success" className="px-1 py-0 small">
                                      <FaWater className="me-1" size={10} /> WC
                                    </Badge>
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
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => openStatusModal(room)}
                                    title="Change Status"
                                  >
                                    <FaToggleOn />
                                  </Button>
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => handleViewBeds(room)}
                                    title="View Beds"
                                  >
                                    <FaList />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => openDeleteModal(room)}
                                    disabled={room.status === 'OCCUPIED'}
                                    title="Delete"
                                  >
                                    <FaTrash />
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
      <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); setCreateErrors({}); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Room</Modal.Title>
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
                    isInvalid={!!createErrors.roomNumber}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.roomNumber}</Form.Control.Feedback>
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
                    isInvalid={!!createErrors.floor}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.floor}</Form.Control.Feedback>
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
                    isInvalid={!!createErrors.roomType}
                    required
                  >
                    {roomTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {values.roomType === 'SINGLE' && '1 bed will be created'}
                    {values.roomType === 'DOUBLE' && '2 beds will be created'}
                    {values.roomType === 'TRIPLE' && '3 beds will be created'}
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">{createErrors.roomType}</Form.Control.Feedback>
                </Form.Group>
              </Col>
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
                    isInvalid={!!createErrors.rentPerBed}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{createErrors.rentPerBed}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
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
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="hasAC"
                    label={<><FaSnowflake className="me-1" /> Has Air Conditioning</>}
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
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="hasWashroom"
                    label={<><FaWater className="me-1" /> Has Attached Washroom</>}
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
              <Button variant="secondary" onClick={() => { setShowCreateModal(false); setCreateErrors({}); }}>
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
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setEditErrors({}); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Room: {selectedRoom?.roomNumber}</Modal.Title>
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
                    isInvalid={!!editErrors.roomNumber}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.roomNumber}</Form.Control.Feedback>
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
                    isInvalid={!!editErrors.floor}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.floor}</Form.Control.Feedback>
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
                    isInvalid={!!editErrors.roomType}
                    required
                  >
                    {roomTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Changing type may affect existing beds (handled by server).
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">{editErrors.roomType}</Form.Control.Feedback>
                </Form.Group>
              </Col>
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
                    isInvalid={!!editErrors.rentPerBed}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{editErrors.rentPerBed}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="hasAC"
                    label={<><FaSnowflake className="me-1" /> Has Air Conditioning</>}
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="hasWashroom"
                    label={<><FaWater className="me-1" /> Has Attached Washroom</>}
                    checked={editForm.values.hasWashroom}
                    onChange={(e) => editForm.handleChange({
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
              <Button variant="secondary" onClick={() => { setShowEditModal(false); setEditErrors({}); }}>
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
              <p>Floor: <Badge bg="secondary"><FaDoorOpen className="me-1" /> Floor {selectedRoom.floor}</Badge></p>
              <p>Current Status: 
                <Badge bg={statusOptions.find(s => s.value === selectedRoom.status)?.color || 'secondary'} className="ms-2">
                  {statusOptions.find(s => s.value === selectedRoom.status)?.icon} {selectedRoom.status}
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
                <h5><FaExclamationTriangle className="me-2" /> Warning!</h5>
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
                  <div className="small"><FaDoorOpen className="me-1" /> Floor: <strong>{selectedRoom.floor}</strong></div>
                </Col>
                <Col md={4}>
                  <div className="small"><FaUsers className="me-1" /> Type: <strong>{selectedRoom.roomType}</strong></div>
                </Col>
                <Col md={4}>
                  <div className="small"><FaBed className="me-1" /> Capacity: <strong>{selectedRoom.totalBeds} beds</strong></div>
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
                          <FaBed className="me-2" />
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
                          <FaCalendarAlt className="me-1" size={10} />
                          {new Date(bed.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <Badge bg={bed.isActive ? 'success' : 'danger'} className="px-2 py-1">
                          {bed.isActive ? <FaCheck className="me-1" /> : <FaTimes className="me-1" />}
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
              window.location.href = `/beds?room=${selectedRoom?._id}`;
            }}>
              <FaBed className="me-1" /> Manage Beds
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