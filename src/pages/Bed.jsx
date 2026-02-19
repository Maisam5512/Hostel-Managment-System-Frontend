import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';

// Icons
import {
  FaBed, FaCheckCircle, FaTools, FaUser, FaBan, FaPlus,
  FaFilter, FaTimes, FaEdit, FaToggleOn, FaTrash,
  FaExclamationTriangle, FaCalendarAlt, FaDoorOpen, FaHome,
  FaUsers, FaWrench
} from 'react-icons/fa';

const Beds = () => {
  const { callApi, loading, error, data } = useApi();
  const [beds, setBeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Validation errors
  const [createErrors, setCreateErrors] = useState({});

  const { values, handleChange, resetForm, setValues } = useForm({
    bedNumber: '',
    room_Id: '',
    status: 'AVAILABLE'
  });

  const statusForm = useForm({
    status: 'AVAILABLE'
  });

  useEffect(() => {
    fetchBeds();
    fetchRooms();
  }, []);

  // Show API error in modal
  useEffect(() => {
    if (error) {
      setErrorModalMessage(error);
      setShowErrorModal(true);
    }
  }, [error]);

  const fetchBeds = async () => {
    try {
      const response = await callApi('get', '/beds');
      if (response.success) {
        setBeds(response.data);
      }
    } catch (err) {
      console.error('Error fetching beds:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await callApi('get', '/rooms ');
      if (response.success) {
        setRooms(response.data);
        console.log('Fetched rooms:', response.data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  // Helper to get room details from rooms state
  const getRoomDetails = (roomId) => {
    if (!roomId) return null;
   // console.log('Getting details for roomId:', roomId);
    // roomId could be an object or a string
    const id = typeof roomId === 'object' ? roomId._id : roomId;
   // console.log('Finding room with id:', id);
    //    console.log('Found room details:', rooms.find(r => r._id === id));    
    return rooms.find(r => r._id === id);

  };

  // Validation function for create bed
  const validateBedForm = (formData) => {
    const errors = {};
    if (!formData.bedNumber || formData.bedNumber.trim() === '') {
      errors.bedNumber = 'Bed number is required';
    }
    if (!formData.room_Id) {
      errors.room_Id = 'Please select a room';
    }
    return errors;
  };

  const handleCreateBed = async (formData) => {
    // Validate
    const errors = validateBedForm(formData);
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});

    try {
      const response = await callApi('post', '/beds', formData);
      if (response.success) {
        setSuccessMessage('Bed created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchBeds();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error creating bed:', err);
    }
  };

  const handleUpdateStatus = async (formData) => {
    try {
      const response = await callApi('patch', `/beds/${selectedBed._id}/status`, formData);
      if (response.success) {
        setSuccessMessage('Bed status updated successfully!');
        setShowStatusModal(false);
        setSelectedBed(null);
        fetchBeds();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating bed status:', err);
    }
  };

  const handleToggleActive = async (bed) => {
    if (window.confirm(`Are you sure you want to ${bed.isActive ? 'deactivate' : 'activate'} this bed?`)) {
      try {
        const endpoint = bed.isActive ? 'delete' : 'patch';
        console.log('Toggling bed status for bed:', bed);
        console.log('API endpoint:', endpoint);
        const url = bed.isActive ? `/beds/${bed._id}` : `/beds/${bed._id}/activate`;
        console.log('API URL:', url);
        const response = await callApi(endpoint, url);
        if (response.success) {
          setSuccessMessage(`Bed ${bed.isActive ? 'deactivated' : 'activated'} successfully!`);
          fetchBeds();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (err) {
        console.error('Error toggling bed status:', err);
      }
    }
  };

  const openStatusModal = (bed) => {
    setSelectedBed(bed);
    statusForm.setValues({ status: bed.status });
    setShowStatusModal(true);
  };

  const filteredBeds = beds.filter(bed => {
    const roomId = typeof bed.room_Id === 'object' ? bed.room_Id?._id : bed.room_Id;
    if (filterRoom && roomId !== filterRoom) return false;
    if (filterStatus && bed.status !== filterStatus) return false;
    return true;
  });

  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available', color: 'success', icon: <FaCheckCircle /> },
    { value: 'OCCUPIED', label: 'Occupied', color: 'warning', icon: <FaUser /> },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'danger', icon: <FaWrench /> }
  ];

  if (loading && beds.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading beds..." />
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
                <h2 className="text-dark mb-1">Beds Management</h2>
                <p className="text-muted">Manage hostel beds and their status</p>
              </div>
              <Button 
                variant="orange" 
                onClick={() => setShowCreateModal(true)}
                className="d-flex align-items-center"
              >
                <FaPlus className="me-2" /> Add New Bed
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
                    <h6 className="text-muted mb-1">Total Beds</h6>
                    <h3 className="mb-0">{beds.length}</h3>
                  </div>
                  <div className="bg-primary-light p-2 rounded-circle">
                    <FaBed size={20} className="text-primary" />
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
                    <h3 className="mb-0">{beds.filter(b => b.status === 'AVAILABLE').length}</h3>
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
                    <h6 className="text-muted mb-1">Occupied</h6>
                    <h3 className="mb-0">{beds.filter(b => b.status === 'OCCUPIED').length}</h3>
                  </div>
                  <div className="bg-warning-light p-2 rounded-circle">
                    <FaUser size={20} className="text-warning" />
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
                    <h6 className="text-muted mb-1">Maintenance</h6>
                    <h3 className="mb-0">{beds.filter(b => b.status === 'MAINTENANCE').length}</h3>
                  </div>
                  <div className="bg-danger-light p-2 rounded-circle">
                    <FaWrench size={20} className="text-danger" />
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
              <Form.Label><FaFilter className="me-1" /> Filter by Room</Form.Label>
              <Form.Select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
              >
                <option value="">All Rooms</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>{room.roomNumber} (Floor {room.floor})</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label><FaBan className="me-1" /> Filter by Status</Form.Label>
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
          <Col md={4} className="d-flex align-items-end justify-content-end">
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setFilterRoom('');
                setFilterStatus('');
              }}
              className="me-2"
            >
              <FaTimes className="me-1" /> Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Beds Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Bed Number</th>
                        <th>Room</th>
                        <th>Floor</th>
                        <th>Room Type</th>
                        <th>Status</th>
                        <th>Active</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBeds.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No beds found
                          </td>
                        </tr>
                      ) : (
                        filteredBeds.map((bed) => {
                          const roomDetails = getRoomDetails(bed.room_Id);
                        //  console.log('Rendering room details 123:',roomDetails);
                          const roomNumber = roomDetails?.roomNumber || bed.room_Id?.roomNumber || 'N/A';
                          const floor = roomDetails?.floor || bed.room_Id?.floor || 'N/A';
                          const roomType = roomDetails?.roomType || bed.room_Id?.roomType || 'N/A';
                          const statusOption = statusOptions.find(s => s.value === bed.status);

                          return (
                            <tr key={bed._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    <FaBed className="text-secondary" />
                                  </div>
                                  <div>
                                    <div className="fw-bold">{bed.bedNumber}</div>
                                    <div className="small text-muted">ID: {bed._id?.slice(-6)}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <Badge bg="info" className="px-2 py-1">
                                  {roomNumber}
                                </Badge>
                              </td>
                              <td>
                                <div><FaDoorOpen className="me-1" size={10} /> Floor {floor}</div>
                              </td>
                              <td>
                                <div>{roomType}</div>
                              </td>
                              <td>
                                <Badge 
                                  bg={statusOption?.color || 'secondary'} 
                                  className="px-2 py-1"
                                >
                                  {statusOption?.icon} {bed.status}
                                </Badge>
                              </td>
                              <td>
                                <Badge 
                                  bg={bed.isActive ? 'success' : 'danger'} 
                                  className="px-2 py-1"
                                >
                                  {bed.isActive ? 'Yes' : 'No'}
                                </Badge>
                              </td>
                              <td>
                                <div className="small text-muted">
                                  <FaCalendarAlt className="me-1" size={10} />
                                  {new Date(bed.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => openStatusModal(bed)}
                                    title="Change Status"
                                  >
                                    <FaEdit className="me-1" /> Status
                                  </Button>
                                  <Button
                                    variant={bed.isActive ? 'outline-warning' : 'outline-success'}
                                    size="sm"
                                    onClick={() => handleToggleActive(bed)}
                                    title={bed.isActive ? 'Deactivate' : 'Activate'}
                                  >
                                    <FaToggleOn className="me-1" />
                                    {bed.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Create Bed Modal with validation errors */}
      <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); setCreateErrors({}); }}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Bed</Modal.Title>
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
            handleCreateBed(values);
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Bed Number *</Form.Label>
              <Form.Control
                type="text"
                name="bedNumber"
                value={values.bedNumber}
                onChange={handleChange}
                placeholder="e.g., B1, B2, B3"
                isInvalid={!!createErrors.bedNumber}
                required
              />
              <Form.Control.Feedback type="invalid">{createErrors.bedNumber}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Room *</Form.Label>
              <Form.Select
                name="room_Id"
                value={values.room_Id}
                onChange={handleChange}
                isInvalid={!!createErrors.room_Id}
                required
              >
                <option value="">Select a room</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.roomNumber} (Floor {room.floor}, {room.roomType})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{createErrors.room_Id}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Initial Status</Form.Label>
              <Form.Select
                name="status"
                value={values.status}
                onChange={handleChange}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => { setShowCreateModal(false); setCreateErrors({}); }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Bed'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Change Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Bed Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBed && (
            <div className="mb-3">
              <p>Bed: <strong>{selectedBed.bedNumber}</strong></p>
              <p>Room: <Badge bg="info">{selectedBed.room_Id?.roomNumber || 'N/A'}</Badge></p>
              <p>Current Status: 
                <Badge bg={statusOptions.find(s => s.value === selectedBed.status)?.color || 'secondary'} className="ms-2">
                  {statusOptions.find(s => s.value === selectedBed.status)?.icon} {selectedBed.status}
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
    </Layout>
  );
};

export default Beds;