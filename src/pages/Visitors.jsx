import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Alert,
  InputGroup,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import { format } from 'date-fns';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuthHook } from '../hooks/useAuth';
import { visitorService } from '../services/visitorService';
import { memberService } from '../services/memberService';
import { bedAssignmentService } from '../services/bedAssignmentService';

const Visitors = () => {
  const { user, loading: authLoading } = useAuthHook();
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorPhone: '',
    visitorCNIC: '',
    purpose: '',
    member: '',
    remarks: ''
  });

  // Load visitors and members with room/bed info
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load visitors
      const visitorsResponse = await visitorService.getAllVisitors({
        status: filterStatus === 'ALL' ? null : filterStatus
      });

      // Load all members
      const membersResponse = await memberService.getAllMembers();
      const activeMembers = (membersResponse.data || []).filter(m => m.status === 'ACTIVE');

      // For each active member, fetch active bed assignment to get room/bed numbers
      const membersWithRoomInfo = await Promise.all(activeMembers.map(async (member) => {
        let roomInfo = 'N/A';
        let bedInfo = '';
        try {
          const assignments = await bedAssignmentService.getBedAssignmentsByMember(member._id);
          const activeAssignment = assignments.data?.find(a => a.status === 'ACTIVE');
          if (activeAssignment) {
            roomInfo = activeAssignment.room_Id?.roomNumber || 'N/A';
            bedInfo = activeAssignment.bed_Id?.bedNumber ? `Bed: ${activeAssignment.bed_Id.bedNumber}` : '';
          }
        } catch (err) {
          console.error(`Error fetching assignment for member ${member._id}:`, err);
        }
        return {
          _id: member._id,
          name: member.fullName || `${member.memberCode} - Unknown`,
          room: roomInfo,
          bed: bedInfo.replace('Bed: ', ''),
          display: `${member.fullName || member.memberCode} - Room: ${roomInfo} ${bedInfo ? `(${bedInfo})` : ''}`
        };
      }));

      // Create a map for quick lookup by member ID
      const memberMap = {};
      membersWithRoomInfo.forEach(m => { memberMap[m._id] = m; });

      // Enrich visitors with full member details and filter out those whose member is not active
      const enrichedVisitors = (visitorsResponse.data || [])
        .map(visitor => {
          if (visitor.member && memberMap[visitor.member._id || visitor.member]) {
            const memberId = visitor.member._id || visitor.member;
            visitor.member = memberMap[memberId]; // replace with full member object
          }
          return visitor;
        })
        .filter(visitor => {
          // Keep only visitors whose member is an object with a name (i.e., enriched, meaning the member is active)
          return visitor.member && typeof visitor.member === 'object' && visitor.member.name;
        });

      setVisitors(enrichedVisitors);
      setMembers(membersWithRoomInfo);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle check-in
  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      const response = await visitorService.checkInVisitor(formData);
      
      if (response.success) {
        setShowCheckInModal(false);
        setFormData({
          visitorName: '',
          visitorPhone: '',
          visitorCNIC: '',
          purpose: '',
          member: '',
          remarks: ''
        });
        loadData(); // Refresh list
      }
    } catch (err) {
      console.error('Error checking in visitor:', err);
      setError(err.message || 'Failed to check in visitor');
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    try {
      if (!selectedVisitor) return;

      const response = await visitorService.checkOutVisitor(
        selectedVisitor._id,
        formData.remarks
      );

      if (response.success) {
        setShowCheckOutModal(false);
        setSelectedVisitor(null);
        setFormData(prev => ({ ...prev, remarks: '' }));
        loadData(); // Refresh list
      }
    } catch (err) {
      console.error('Error checking out visitor:', err);
      setError(err.message || 'Failed to check out visitor');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      if (!selectedVisitor) return;

      const response = await visitorService.deleteVisitor(selectedVisitor._id);

      if (response.success) {
        setShowDeleteModal(false);
        setSelectedVisitor(null);
        loadData(); // Refresh list
      }
    } catch (err) {
      console.error('Error deleting visitor:', err);
      setError(err.message || 'Failed to delete visitor');
    }
  };

  // Handle view details
  const handleViewDetails = (visitor) => {
    setSelectedVisitor(visitor);
    setShowDetailsModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  // Filter visitors based on search term
  const filteredVisitors = visitors.filter(visitor => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      visitor.visitorName?.toLowerCase().includes(searchLower) ||
      visitor.visitorPhone?.toLowerCase().includes(searchLower) ||
      visitor.visitorCNIC?.toLowerCase().includes(searchLower) ||
      visitor.purpose?.toLowerCase().includes(searchLower) ||
      (visitor.member?.name && visitor.member.name.toLowerCase().includes(searchLower))
    );
  });

  if (authLoading || loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="text-dark mb-1">Visitor Management</h2>
            <p className="text-muted mb-0">Manage visitor check-ins and check-outs</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowCheckInModal(true)}
          >
            <span className="me-2">➕</span> Check-in Visitor
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small text-muted">Filter by Status</Form.Label>
                <Form.Select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Visitors</option>
                  <option value="IN">Currently Inside</option>
                  <option value="OUT">Checked Out</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label className="small text-muted">Search Visitors</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, phone, CNIC, purpose..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    🔍
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Summary */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Visitors</h6>
                  <h3 className="mb-0">{visitors.length}</h3>
                </div>
                <div className="bg-primary-light p-3 rounded-circle">
                  <span style={{ fontSize: '24px' }}>👥</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Currently Inside</h6>
                  <h3 className="mb-0">
                    {visitors.filter(v => v.status === 'IN').length}
                  </h3>
                </div>
                <div className="bg-success-light p-3 rounded-circle">
                  <span style={{ fontSize: '24px' }}>🚶</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Today's Visitors</h6>
                  <h3 className="mb-0">
                    {visitors.filter(v => {
                      const today = new Date().toDateString();
                      const visitorDate = new Date(v.createdAt).toDateString();
                      return visitorDate === today;
                    }).length}
                  </h3>
                </div>
                <div className="bg-warning-light p-3 rounded-circle">
                  <span style={{ fontSize: '24px' }}>📅</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Visitors Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-3">Visitor</th>
                  <th>Contact</th>
                  <th>Visiting Member</th>
                  <th>Purpose</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="text-muted">
                        <span style={{ fontSize: '48px' }}>👥</span>
                        <p className="mt-2">No visitors found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor._id}>
                      <td className="ps-3">
                        <div>
                          <strong>{visitor.visitorName}</strong>
                          {visitor.visitorCNIC && (
                            <div className="small text-muted">
                              CNIC: {visitor.visitorCNIC}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {visitor.visitorPhone && (
                          <div>{visitor.visitorPhone}</div>
                        )}
                      </td>
                      <td>
                        {visitor.member ? (
                          <div>
                            <div>{visitor.member.name}</div>
                            <div className="small text-muted">
                              {visitor.member.room && `Room: ${visitor.member.room}`}
                              {visitor.member.bed && ` | Bed: ${visitor.member.bed}`}
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>{visitor.purpose}</td>
                      <td>
                        <div className="small">
                          {formatDate(visitor.inTime)}
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          {visitor.outTime ? formatDate(visitor.outTime) : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <Badge 
                          bg={visitor.status === 'IN' ? 'success' : 'secondary'}
                          className="px-3 py-1"
                        >
                          {visitor.status === 'IN' ? 'INSIDE' : 'CHECKED OUT'}
                        </Badge>
                      </td>
                      <td className="text-end pe-3">
                        <DropdownButton
                          variant="outline-secondary"
                          size="sm"
                          title="Actions"
                          align="end"
                        >
                          <Dropdown.Item 
                            onClick={() => {
                              setSelectedVisitor(visitor);
                              visitor.status === 'IN' 
                                ? setShowCheckOutModal(true)
                                : setShowDeleteModal(true);
                            }}
                          >
                            {visitor.status === 'IN' ? '🟢 Check-out' : '🗑️ Delete'}
                          </Dropdown.Item>
                          <Dropdown.Item 
                            onClick={() => handleViewDetails(visitor)}
                          >
                            👁️ View Details
                          </Dropdown.Item>
                        </DropdownButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Check-in Modal */}
      <Modal show={showCheckInModal} onHide={() => setShowCheckInModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>👤 Check-in Visitor</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCheckIn}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Visitor Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="visitorName"
                    value={formData.visitorName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter visitor name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="visitorPhone"
                    value={formData.visitorPhone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>CNIC</Form.Label>
                  <Form.Control
                    type="text"
                    name="visitorCNIC"
                    value={formData.visitorCNIC}
                    onChange={handleInputChange}
                    placeholder="Enter CNIC (optional)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Purpose *</Form.Label>
                  <Form.Control
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    placeholder="Meeting, Delivery, etc."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Member to Visit *</Form.Label>
                  <Form.Select
                    name="member"
                    value={formData.member}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Member</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.display}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Any additional notes..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckInModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Check-in Visitor
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Check-out Modal */}
      <Modal show={showCheckOutModal} onHide={() => setShowCheckOutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🟢 Check-out Visitor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVisitor && (
            <>
              <p>
                Are you sure you want to check out <strong>{selectedVisitor.visitorName}</strong>?
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Remarks (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Add remarks for check-out..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckOutModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCheckOut}>
            Check-out
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🗑️ Delete Visitor Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVisitor && (
            <>
              <Alert variant="warning">
                <strong>Warning:</strong> This action cannot be undone. 
                You can only delete visitors who have checked out.
              </Alert>
              <p>
                Are you sure you want to delete the visitor record for{' '}
                <strong>{selectedVisitor.visitorName}</strong>?
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Record
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>👤 Visitor Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVisitor && (
            <>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Visitor Name</h6>
                <p className="fs-5">{selectedVisitor.visitorName}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Phone</h6>
                <p>{selectedVisitor.visitorPhone || 'N/A'}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">CNIC</h6>
                <p>{selectedVisitor.visitorCNIC || 'N/A'}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Purpose</h6>
                <p>{selectedVisitor.purpose}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Member Visited</h6>
                {selectedVisitor.member ? (
                  <>
                    <p className="mb-1">{selectedVisitor.member.name}</p>
                    <p className="small text-muted">
                      {selectedVisitor.member.room && `Room: ${selectedVisitor.member.room}`}
                      {selectedVisitor.member.bed && ` | Bed: ${selectedVisitor.member.bed}`}
                    </p>
                  </>
                ) : (
                  <p>N/A</p>
                )}
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Check-in Time</h6>
                <p>{formatDate(selectedVisitor.inTime)}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Check-out Time</h6>
                <p>{selectedVisitor.outTime ? formatDate(selectedVisitor.outTime) : 'N/A'}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Status</h6>
                <Badge bg={selectedVisitor.status === 'IN' ? 'success' : 'secondary'}>
                  {selectedVisitor.status === 'IN' ? 'INSIDE' : 'CHECKED OUT'}
                </Badge>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Remarks</h6>
                <p>{selectedVisitor.remarks || 'No remarks'}</p>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">Logged By</h6>
                <p>{selectedVisitor.loggedBy?.fullName || 'System'}</p>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default Visitors;