import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, Dropdown } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { bedAssignmentService } from '../services/bedAssignmentService';
import { memberService } from '../services/memberService';
import { bedService } from '../services/bedService';

const BedAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);   // new
  const [showEditRemarksModal, setShowEditRemarksModal] = useState(false); // new
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editRemarksText, setEditRemarksText] = useState(''); // for edit remarks
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states for new assignment
  const [members, setMembers] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [remarks, setRemarks] = useState('');
  
  // Fetch data on component mount
  useEffect(() => {
    fetchAssignments();
    fetchMembers();
    fetchAvailableBeds();
  }, []);
  
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await bedAssignmentService.getAllBedAssignments();
      
      if (response.success && response.data) {
        // Use the data directly from API (already populated with member, bed, and room info)
        const assignmentsWithSafeData = response.data.map(assignment => {
          // Ensure all fields have safe defaults to prevent undefined errors
          return {
            _id: assignment._id || '',
            member_Id: assignment.member_Id || { _id: '', memberCode: '', fullName: '' },
            bed_Id: assignment.bed_Id || { _id: '', bedNumber: '' },
            room_Id: assignment.room_Id || { _id: '', roomNumber: '', floor: '' },
            startDate: assignment.startDate || new Date(),
            endDate: assignment.endDate || null,
            status: assignment.status || 'ACTIVE',
            billable: assignment.billable !== undefined ? assignment.billable : true,
            rentAtAssignment: assignment.rentAtAssignment || 0,
            assignedBy: assignment.assignedBy || { _id: '', fullName: '' },
            remarks: assignment.remarks || '',
            createdAt: assignment.createdAt || new Date(),
            updatedAt: assignment.updatedAt || new Date()
          };
        });
        
        setAssignments(assignmentsWithSafeData);
        setError('');
      } else {
        setAssignments([]);
        setError('No assignments found');
      }
    } catch (err) {
      console.error('Error fetching bed assignments:', err);
      setError('Failed to load bed assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMembers = async () => {
    try {
      const response = await memberService.getAllMembers();
      if (response.success && response.data) {
        // Only show active members
        const activeMembers = response.data.filter(member => 
          member.isActive && member.status === 'ACTIVE'
        );
        setMembers(activeMembers);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setMembers([]);
    }
  };
  
  const fetchAvailableBeds = async () => {
    try {
      const response = await bedService.getAllBeds();
      if (response.success && response.data) {
        // Only show available and active beds
        const available = response.data.filter(bed => 
          bed.status === 'AVAILABLE' && bed.isActive
        );
        setAvailableBeds(available);
      }
    } catch (err) {
      console.error('Error fetching available beds:', err);
      setAvailableBeds([]);
    }
  };
  
  const handleCreateAssignment = async () => {
    try {
      if (!selectedMember || !selectedBed) {
        setError('Please select both member and bed');
        return;
      }
      
      const assignmentData = {
        member_Id: selectedMember._id,
        bed_Id: selectedBed._id,
        remarks: remarks
      };
      
      const response = await bedAssignmentService.createBedAssignment(assignmentData);
      
      if (response.success) {
        setSuccessMessage('Bed assignment created successfully!');
        setShowCreateModal(false);
        resetCreateForm();
        fetchAssignments(); // Refresh the list
        fetchAvailableBeds(); // Refresh available beds
        setTimeout(() => setSuccessMessage(''), 3000);
        setError('');
      } else {
        setError('Failed to create assignment');
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create assignment';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };
  
  const handleCloseAssignment = async () => {
    try {
      const response = await bedAssignmentService.closeBedAssignment(selectedAssignment._id);
      
      if (response.success) {
        setSuccessMessage('Bed assignment closed successfully!');
        setShowCloseModal(false);
        setSelectedAssignment(null);
        fetchAssignments(); // Refresh the list
        fetchAvailableBeds(); // Refresh available beds
        setTimeout(() => setSuccessMessage(''), 3000);
        setError('');
      } else {
        setError('Failed to close assignment');
      }
    } catch (err) {
      console.error('Error closing assignment:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to close assignment';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };
  
  const handleDeleteAssignment = async () => {
    try {
      const response = await bedAssignmentService.deleteBedAssignment(selectedAssignment._id);
      
      if (response.success) {
        setSuccessMessage('Bed assignment deleted successfully!');
        setShowDeleteModal(false);
        setSelectedAssignment(null);
        fetchAssignments(); // Refresh the list
        setTimeout(() => setSuccessMessage(''), 3000);
        setError('');
      } else {
        setError('Failed to delete assignment');
      }
    } catch (err) {
      console.error('Error deleting assignment:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete assignment';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };
  
  // New: Handle view details
  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };
  
  // New: Handle edit remarks
  const handleEditRemarks = (assignment) => {
    setSelectedAssignment(assignment);
    setEditRemarksText(assignment.remarks || '');
    setShowEditRemarksModal(true);
  };
  
  // New: Handle update remarks
  const handleUpdateRemarks = async () => {
    try {
      const response = await bedAssignmentService.updateBedAssignment(selectedAssignment._id, {
        remarks: editRemarksText
      });
      
      if (response.success) {
        setSuccessMessage('Remarks updated successfully!');
        setShowEditRemarksModal(false);
        setSelectedAssignment(null);
        fetchAssignments(); // Refresh the list
        setTimeout(() => setSuccessMessage(''), 3000);
        setError('');
      } else {
        setError('Failed to update remarks');
      }
    } catch (err) {
      console.error('Error updating remarks:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update remarks';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };
  
  const resetCreateForm = () => {
    setSelectedMember(null);
    setSelectedBed(null);
    setRemarks('');
  };
  
  const openCreateModal = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };
  
  const openCloseModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowCloseModal(true);
  };
  
  const openDeleteModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDeleteModal(true);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge bg="success">Active</Badge>;
      case 'CLOSED':
        return <Badge bg="secondary">Closed</Badge>;
      default:
        return <Badge bg="warning">{status}</Badge>;
    }
  };
  
  const filteredAssignments = assignments.filter(assignment => {
    // Filter by status
    if (filterStatus && assignment.status !== filterStatus) return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const memberName = assignment.member_Id?.fullName?.toLowerCase() || '';
      const memberCode = assignment.member_Id?.memberCode?.toLowerCase() || '';
      const roomNumber = assignment.room_Id?.roomNumber?.toLowerCase() || '';
      const bedNumber = assignment.bed_Id?.bedNumber?.toLowerCase() || '';
      
      return (
        memberName.includes(searchLower) ||
        memberCode.includes(searchLower) ||
        roomNumber.includes(searchLower) ||
        bedNumber.includes(searchLower)
      );
    }
    
    return true;
  });
  
  if (loading && assignments.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading bed assignments..." />
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
                <h2 className="text-dark mb-1">Bed Assignments</h2>
                <p className="text-muted">Manage bed assignments and allocations</p>
              </div>
              <Button 
                variant="orange" 
                onClick={openCreateModal}
                className="d-flex align-items-center"
              >
                <span className="me-2">+</span> New Assignment
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
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
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
                    <h6 className="text-muted mb-1">Total Assignments</h6>
                    <h3 className="mb-0">{assignments.length}</h3>
                  </div>
                  <div className="bg-primary-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>📋</span>
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
                    <h3 className="mb-0">{assignments.filter(a => a.status === 'ACTIVE').length}</h3>
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
                    <h6 className="text-muted mb-1">Closed</h6>
                    <h3 className="mb-0">{assignments.filter(a => a.status === 'CLOSED').length}</h3>
                  </div>
                  <div className="bg-secondary-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>🔒</span>
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
                    <h6 className="text-muted mb-1">Available Beds</h6>
                    <h3 className="mb-0">{availableBeds.length}</h3>
                  </div>
                  <div className="bg-info-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>🛏️</span>
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
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by member, room, or bed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end justify-content-end">
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setFilterStatus('');
                setSearchTerm('');
              }}
              className="me-2"
            >
              Clear Filters
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={fetchAssignments}
            >
              Refresh
            </Button>
          </Col>
        </Row>
        
        {/* Assignments Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Assignment ID</th>
                        <th>Member Details</th>
                        <th>Room/Bed</th>
                        <th>Dates</th>
                        <th>Rent</th>
                        <th>Status</th>
                        <th>Assigned By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No assignments found
                          </td>
                        </tr>
                      ) : (
                        filteredAssignments.map((assignment) => (
                          <tr key={assignment._id}>
                            <td>
                              <div className="small text-muted">
                                {assignment._id.slice(-6).toUpperCase()}
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-bold">{assignment.member_Id?.fullName || 'Unknown Member'}</div>
                                <div className="small text-muted">
                                  {assignment.member_Id?.memberCode || 'No Code'} • 
                                  {assignment.member_Id?.phone ? ` ${assignment.member_Id.phone}` : ''}
                                </div>
                                <div className="small">
                                  {assignment.member_Id?.instituteName || ''}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-bold">
                                  Room: {assignment.room_Id?.roomNumber || 'N/A'}
                                </div>
                                <div className="small text-muted">
                                  Bed: {assignment.bed_Id?.bedNumber || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="small">
                                  <strong>Start:</strong> {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="small">
                                  <strong>End:</strong> {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Ongoing'}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="fw-bold">
                                ₹{assignment.rentAtAssignment?.toLocaleString() || '0'}
                              </div>
                              <div className="small text-muted">
                                per bed/month
                              </div>
                            </td>
                            <td>
                              {getStatusBadge(assignment.status)}
                              <div className="small mt-1">
                                {assignment.billable ? (
                                  <Badge bg="success" className="px-1 py-0">Billable</Badge>
                                ) : (
                                  <Badge bg="secondary" className="px-1 py-0">Non-Billable</Badge>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="small">
                                {assignment.assignedBy?.fullName || 'System'}
                                <div className="text-muted">
                                  {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-basic">
                                  Actions
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {assignment.status === 'ACTIVE' && (
                                    <Dropdown.Item onClick={() => openCloseModal(assignment)}>
                                      🚪 Close Assignment
                                    </Dropdown.Item>
                                  )}
                                  {assignment.status === 'CLOSED' && (
                                    <Dropdown.Item onClick={() => openDeleteModal(assignment)}>
                                      🗑️ Delete
                                    </Dropdown.Item>
                                  )}
                                  <Dropdown.Divider />
                                  <Dropdown.Item onClick={() => handleViewDetails(assignment)}>
                                    📋 View Details
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleEditRemarks(assignment)}>
                                    ✏️ Edit Remarks
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                              {assignment.remarks && (
                                <div className="small text-muted mt-1">
                                  <em>"{assignment.remarks}"</em>
                                </div>
                              )}
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
      
      {/* Create Assignment Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Bed Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <h6 className="mb-3 border-bottom pb-2">Select Member</h6>
            <Form.Group className="mb-3">
              <Form.Label>Member *</Form.Label>
              <Form.Select
                value={selectedMember?._id || ''}
                onChange={(e) => {
                  const member = members.find(m => m._id === e.target.value);
                  setSelectedMember(member);
                }}
                required
              >
                <option value="">Select a member</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.memberCode} - {member.fullName} ({member.instituteName || 'No Institute'})
                  </option>
                ))}
              </Form.Select>
              {selectedMember && (
                <div className="mt-2 p-2 bg-light rounded">
                  <div className="small">
                    <strong>Selected Member:</strong> {selectedMember.fullName}
                  </div>
                  <div className="small">
                    <strong>CNIC:</strong> {selectedMember.cnic}
                  </div>
                  <div className="small">
                    <strong>Phone:</strong> {selectedMember.phone}
                  </div>
                </div>
              )}
            </Form.Group>
            
            <h6 className="mb-3 border-bottom pb-2 mt-4">Select Bed</h6>
            <Form.Group className="mb-3">
              <Form.Label>Available Beds *</Form.Label>
              <Form.Select
                value={selectedBed?._id || ''}
                onChange={(e) => {
                  const bed = availableBeds.find(b => b._id === e.target.value);
                  setSelectedBed(bed);
                }}
                required
              >
                <option value="">Select an available bed</option>
                {availableBeds.map(bed => (
                  <option key={bed._id} value={bed._id}>
                    Bed {bed.bedNumber} in Room {bed.room_Id?.roomNumber || 'Unknown'} (Floor {bed.room_Id?.floor || 'N/A'})
                  </option>
                ))}
              </Form.Select>
              {availableBeds.length === 0 && (
                <Form.Text className="text-danger">
                  No available beds found. Please create beds first or check bed availability.
                </Form.Text>
              )}
              {selectedBed && (
                <div className="mt-2 p-2 bg-light rounded">
                  <div className="small">
                    <strong>Selected Bed:</strong> {selectedBed.bedNumber}
                  </div>
                  <div className="small">
                    <strong>Room:</strong> {selectedBed.room_Id?.roomNumber || 'Unknown'}
                  </div>
                  <div className="small">
                    <strong>Floor:</strong> {selectedBed.room_Id?.floor || 'N/A'}
                  </div>
                </div>
              )}
            </Form.Group>
            
            <h6 className="mb-3 border-bottom pb-2 mt-4">Additional Information</h6>
            <Form.Group className="mb-3">
              <Form.Label>Remarks (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any remarks about this assignment..."
              />
            </Form.Group>
            
            <div className="alert alert-info">
              <small>
                <strong>Note:</strong> This will automatically update:
                <ul className="mb-0 mt-1">
                  <li>Bed status to OCCUPIED</li>
                  <li>Member's current bed and room assignment</li>
                  <li>Member status to ACTIVE</li>
                  <li>Room status to FULL if all beds are occupied</li>
                </ul>
              </small>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateAssignment}
            disabled={!selectedMember || !selectedBed}
          >
            Create Assignment
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Close Assignment Modal */}
      <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Close Bed Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAssignment && (
            <div>
              <Alert variant="warning">
                <h5>⚠️ Close Assignment</h5>
                <p>Are you sure you want to close this bed assignment?</p>
                <p className="mb-0">This will free up the bed and update member status to ON_LEAVE.</p>
              </Alert>
              <div className="p-3 bg-light rounded">
                <p><strong>Member:</strong> {selectedAssignment.member_Id?.fullName || 'Unknown Member'}</p>
                <p><strong>Room/Bed:</strong> {selectedAssignment.room_Id?.roomNumber || 'N/A'} / {selectedAssignment.bed_Id?.bedNumber || 'N/A'}</p>
                <p><strong>Assignment Start:</strong> {selectedAssignment.startDate ? new Date(selectedAssignment.startDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Rent:</strong> ₹{selectedAssignment.rentAtAssignment?.toLocaleString() || '0'} per month</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCloseModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleCloseAssignment}>
            Close Assignment
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Assignment Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Bed Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAssignment && (
            <div>
              <Alert variant="danger">
                <h5>🗑️ Delete Assignment</h5>
                <p>Are you sure you want to delete this bed assignment?</p>
                <p className="mb-0"><strong>Note:</strong> Only closed assignments can be deleted.</p>
              </Alert>
              <div className="p-3 bg-light rounded">
                <p><strong>Member:</strong> {selectedAssignment.member_Id?.fullName || 'Unknown Member'}</p>
                <p><strong>Status:</strong> {selectedAssignment.status}</p>
                <p><strong>Created:</strong> {selectedAssignment.createdAt ? new Date(selectedAssignment.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAssignment}
            disabled={selectedAssignment?.status === 'ACTIVE'}
          >
            Delete Assignment
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* View Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Assignment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAssignment && (
            <div className="p-3">
              <Row>
                <Col md={6}>
                  <h6 className="text-muted">Assignment ID</h6>
                  <p className="mb-3">{selectedAssignment._id}</p>
                  
                  <h6 className="text-muted">Member Information</h6>
                  <p className="mb-1"><strong>Name:</strong> {selectedAssignment.member_Id?.fullName || 'N/A'}</p>
                  <p className="mb-1"><strong>Code:</strong> {selectedAssignment.member_Id?.memberCode || 'N/A'}</p>
                  <p className="mb-1"><strong>Phone:</strong> {selectedAssignment.member_Id?.phone || 'N/A'}</p>
                  <p className="mb-1"><strong>CNIC:</strong> {selectedAssignment.member_Id?.cnic || 'N/A'}</p>
                  <p className="mb-3"><strong>Institute:</strong> {selectedAssignment.member_Id?.instituteName || 'N/A'}</p>
                  
                  <h6 className="text-muted">Bed Information</h6>
                  <p className="mb-1"><strong>Bed Number:</strong> {selectedAssignment.bed_Id?.bedNumber || 'N/A'}</p>
                  <p className="mb-3"><strong>Bed Status:</strong> {selectedAssignment.bed_Id?.status || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Room Information</h6>
                  <p className="mb-1"><strong>Room Number:</strong> {selectedAssignment.room_Id?.roomNumber || 'N/A'}</p>
                  <p className="mb-1"><strong>Floor:</strong> {selectedAssignment.room_Id?.floor || 'N/A'}</p>
                  <p className="mb-1"><strong>Room Type:</strong> {selectedAssignment.room_Id?.roomType || 'N/A'}</p>
                  <p className="mb-3"><strong>Has AC:</strong> {selectedAssignment.room_Id?.hasAC ? 'Yes' : 'No'}</p>
                  
                  <h6 className="text-muted">Assignment Details</h6>
                  <p className="mb-1"><strong>Start Date:</strong> {selectedAssignment.startDate ? new Date(selectedAssignment.startDate).toLocaleDateString() : 'N/A'}</p>
                  <p className="mb-1"><strong>End Date:</strong> {selectedAssignment.endDate ? new Date(selectedAssignment.endDate).toLocaleDateString() : 'Ongoing'}</p>
                  <p className="mb-1"><strong>Status:</strong> {getStatusBadge(selectedAssignment.status)}</p>
                  <p className="mb-1"><strong>Rent at Assignment:</strong> ₹{selectedAssignment.rentAtAssignment?.toLocaleString() || '0'}</p>
                  <p className="mb-1"><strong>Billable:</strong> {selectedAssignment.billable ? 'Yes' : 'No'}</p>
                  <p className="mb-1"><strong>Assigned By:</strong> {selectedAssignment.assignedBy?.fullName || 'System'}</p>
                  <p className="mb-1"><strong>Remarks:</strong> {selectedAssignment.remarks || 'None'}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Remarks Modal */}
      <Modal show={showEditRemarksModal} onHide={() => setShowEditRemarksModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Remarks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editRemarksText}
                onChange={(e) => setEditRemarksText(e.target.value)}
                placeholder="Enter remarks..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditRemarksModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateRemarks}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default BedAssignments;