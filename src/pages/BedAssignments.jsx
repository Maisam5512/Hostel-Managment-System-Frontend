// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, Dropdown } from 'react-bootstrap';
// import Layout from '../components/layout/Layout';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import { bedAssignmentService } from '../services/bedAssignmentService';
// import { memberService } from '../services/memberService';
// import { bedService } from '../services/bedService';

// const BedAssignments = () => {
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
  
//   // Modal states
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showCloseModal, setShowCloseModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedAssignment, setSelectedAssignment] = useState(null);
  
//   // Filter states
//   const [filterStatus, setFilterStatus] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // Form states for new assignment
//   const [members, setMembers] = useState([]);
//   const [availableBeds, setAvailableBeds] = useState([]);
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [selectedBed, setSelectedBed] = useState(null);
//   const [remarks, setRemarks] = useState('');
  
//   // Fetch data on component mount
//   useEffect(() => {
//     fetchAssignments();
//     fetchMembers();
//     fetchAvailableBeds();
//   }, []);
  
//   const fetchAssignments = async () => {
//     try {
//       setLoading(true);
//       const response = await bedAssignmentService.getAllBedAssignments();
//       if (response.success) {
//         // Fetch additional details for each assignment
//         const assignmentsWithDetails = await Promise.all(
//           response.data.map(async (assignment) => {
//             // Get member details
//             const memberResponse = await memberService.getMemberById(assignment.member_Id._id);
//             // Get bed details
//             const bedResponse = await bedService.getBedById(assignment.bed_Id._id);
            
//             return {
//               ...assignment,
//               memberDetails: memberResponse.data,
//               bedDetails: bedResponse.data
//             };
//           })
//         );
//         setAssignments(assignmentsWithDetails);
//       }
//     } catch (err) {
//       setError('Failed to load bed assignments: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const fetchMembers = async () => {
//     try {
//       const response = await memberService.getAllMembers();
//       if (response.success) {
//         setMembers(response.data);
//       }
//     } catch (err) {
//       console.error('Error fetching members:', err);
//     }
//   };
  
//   const fetchAvailableBeds = async () => {
//     try {
//       const response = await bedService.getAllBeds();
//       if (response.success) {
//         const available = response.data.filter(bed => 
//           bed.status === 'AVAILABLE' && bed.isActive
//         );
//         setAvailableBeds(available);
//       }
//     } catch (err) {
//       console.error('Error fetching available beds:', err);
//     }
//   };
  
//   const handleCreateAssignment = async () => {
//     try {
//       if (!selectedMember || !selectedBed) {
//         setError('Please select both member and bed');
//         return;
//       }
      
//       const assignmentData = {
//         member_Id: selectedMember._id,
//         bed_Id: selectedBed._id,
//         remarks: remarks
//       };
      
//       const response = await bedAssignmentService.createBedAssignment(assignmentData);
      
//       if (response.success) {
//         setSuccessMessage('Bed assignment created successfully!');
//         setShowCreateModal(false);
//         resetCreateForm();
//         fetchAssignments(); // Refresh the list
//         fetchAvailableBeds(); // Refresh available beds
//         setTimeout(() => setSuccessMessage(''), 3000);
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to create assignment');
//       setTimeout(() => setError(''), 3000);
//     }
//   };
  
//   const handleCloseAssignment = async () => {
//     try {
//       const response = await bedAssignmentService.closeBedAssignment(selectedAssignment._id);
      
//       if (response.success) {
//         setSuccessMessage('Bed assignment closed successfully!');
//         setShowCloseModal(false);
//         setSelectedAssignment(null);
//         fetchAssignments(); // Refresh the list
//         fetchAvailableBeds(); // Refresh available beds
//         setTimeout(() => setSuccessMessage(''), 3000);
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to close assignment');
//       setTimeout(() => setError(''), 3000);
//     }
//   };
  
//   const handleDeleteAssignment = async () => {
//     try {
//       const response = await bedAssignmentService.deleteBedAssignment(selectedAssignment._id);
      
//       if (response.success) {
//         setSuccessMessage('Bed assignment deleted successfully!');
//         setShowDeleteModal(false);
//         setSelectedAssignment(null);
//         fetchAssignments(); // Refresh the list
//         setTimeout(() => setSuccessMessage(''), 3000);
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to delete assignment');
//       setTimeout(() => setError(''), 3000);
//     }
//   };
  
//   const resetCreateForm = () => {
//     setSelectedMember(null);
//     setSelectedBed(null);
//     setRemarks('');
//   };
  
//   const openCreateModal = () => {
//     resetCreateForm();
//     setShowCreateModal(true);
//   };
  
//   const openCloseModal = (assignment) => {
//     setSelectedAssignment(assignment);
//     setShowCloseModal(true);
//   };
  
//   const openDeleteModal = (assignment) => {
//     setSelectedAssignment(assignment);
//     setShowDeleteModal(true);
//   };
  
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'ACTIVE':
//         return <Badge bg="success">Active</Badge>;
//       case 'CLOSED':
//         return <Badge bg="secondary">Closed</Badge>;
//       default:
//         return <Badge bg="warning">{status}</Badge>;
//     }
//   };
  
//   const filteredAssignments = assignments.filter(assignment => {
//     // Filter by status
//     if (filterStatus && assignment.status !== filterStatus) return false;
    
//     // Filter by search term
//     if (searchTerm) {
//       const searchLower = searchTerm.toLowerCase();
//       const memberName = assignment.memberDetails?.fullName?.toLowerCase() || '';
//       const memberCode = assignment.memberDetails?.memberCode?.toLowerCase() || '';
//       const roomNumber = assignment.room_Id?.roomNumber?.toLowerCase() || '';
//       const bedNumber = assignment.bedDetails?.bedNumber?.toLowerCase() || '';
      
//       return (
//         memberName.includes(searchLower) ||
//         memberCode.includes(searchLower) ||
//         roomNumber.includes(searchLower) ||
//         bedNumber.includes(searchLower)
//       );
//     }
    
//     return true;
//   });
  
//   if (loading && assignments.length === 0) {
//     return (
//       <Layout>
//         <LoadingSpinner message="Loading bed assignments..." />
//       </Layout>
//     );
//   }
  
//   return (
//     <Layout>
//       <Container fluid>
//         {/* Header */}
//         <Row className="mb-4">
//           <Col>
//             <div className="d-flex justify-content-between align-items-center">
//               <div>
//                 <h2 className="text-dark mb-1">Bed Assignments</h2>
//                 <p className="text-muted">Manage bed assignments and allocations</p>
//               </div>
//               <Button 
//                 variant="orange" 
//                 onClick={openCreateModal}
//                 className="d-flex align-items-center"
//               >
//                 <span className="me-2">+</span> New Assignment
//               </Button>
//             </div>
//           </Col>
//         </Row>
        
//         {/* Success Message */}
//         {successMessage && (
//           <Row className="mb-3">
//             <Col>
//               <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
//                 {successMessage}
//               </Alert>
//             </Col>
//           </Row>
//         )}
        
//         {/* Error Message */}
//         {error && (
//           <Row className="mb-3">
//             <Col>
//               <Alert variant="danger" onClose={() => setError('')} dismissible>
//                 {error}
//               </Alert>
//             </Col>
//           </Row>
//         )}
        
//         {/* Stats Cards */}
//         <Row className="mb-4">
//           <Col md={3}>
//             <Card className="border-0 shadow-sm">
//               <Card.Body className="p-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <h6 className="text-muted mb-1">Total Assignments</h6>
//                     <h3 className="mb-0">{assignments.length}</h3>
//                   </div>
//                   <div className="bg-primary-light p-2 rounded-circle">
//                     <span style={{ fontSize: '20px' }}>📋</span>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={3}>
//             <Card className="border-0 shadow-sm">
//               <Card.Body className="p-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <h6 className="text-muted mb-1">Active</h6>
//                     <h3 className="mb-0">{assignments.filter(a => a.status === 'ACTIVE').length}</h3>
//                   </div>
//                   <div className="bg-success-light p-2 rounded-circle">
//                     <span style={{ fontSize: '20px' }}>✅</span>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={3}>
//             <Card className="border-0 shadow-sm">
//               <Card.Body className="p-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <h6 className="text-muted mb-1">Closed</h6>
//                     <h3 className="mb-0">{assignments.filter(a => a.status === 'CLOSED').length}</h3>
//                   </div>
//                   <div className="bg-secondary-light p-2 rounded-circle">
//                     <span style={{ fontSize: '20px' }}>🔒</span>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={3}>
//             <Card className="border-0 shadow-sm">
//               <Card.Body className="p-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <h6 className="text-muted mb-1">Available Beds</h6>
//                     <h3 className="mb-0">{availableBeds.length}</h3>
//                   </div>
//                   <div className="bg-info-light p-2 rounded-circle">
//                     <span style={{ fontSize: '20px' }}>🛏️</span>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
        
//         {/* Filters */}
//         <Row className="mb-3">
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Filter by Status</Form.Label>
//               <Form.Select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//               >
//                 <option value="">All Status</option>
//                 <option value="ACTIVE">Active</option>
//                 <option value="CLOSED">Closed</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={4}>
//             <Form.Group>
//               <Form.Label>Search</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Search by member, room, or bed..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </Form.Group>
//           </Col>
//           <Col md={4} className="d-flex align-items-end justify-content-end">
//             <Button 
//               variant="outline-secondary" 
//               onClick={() => {
//                 setFilterStatus('');
//                 setSearchTerm('');
//               }}
//               className="me-2"
//             >
//               Clear Filters
//             </Button>
//             <Button 
//               variant="outline-primary" 
//               onClick={fetchAssignments}
//             >
//               Refresh
//             </Button>
//           </Col>
//         </Row>
        
//         {/* Assignments Table */}
//         <Row>
//           <Col>
//             <Card className="border-0 shadow-sm">
//               <Card.Body className="p-0">
//                 <div className="table-responsive">
//                   <Table hover className="mb-0">
//                     <thead className="bg-light">
//                       <tr>
//                         <th>Assignment ID</th>
//                         <th>Member Details</th>
//                         <th>Room/Bed</th>
//                         <th>Dates</th>
//                         <th>Rent</th>
//                         <th>Status</th>
//                         <th>Assigned By</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredAssignments.length === 0 ? (
//                         <tr>
//                           <td colSpan="8" className="text-center py-4">
//                             No assignments found
//                           </td>
//                         </tr>
//                       ) : (
//                         filteredAssignments.map((assignment) => (
//                           <tr key={assignment._id}>
//                             <td>
//                               <div className="small text-muted">
//                                 {assignment._id.slice(-6).toUpperCase()}
//                               </div>
//                             </td>
//                             <td>
//                               <div>
//                                 <div className="fw-bold">{assignment.memberDetails?.fullName}</div>
//                                 <div className="small text-muted">
//                                   {assignment.memberDetails?.memberCode} • {assignment.memberDetails?.phone}
//                                 </div>
//                                 <div className="small">
//                                   {assignment.memberDetails?.instituteName}
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <div>
//                                 <div className="fw-bold">
//                                   Room: {assignment.room_Id?.roomNumber || 'N/A'}
//                                 </div>
//                                 <div className="small text-muted">
//                                   Bed: {assignment.bedDetails?.bedNumber || 'N/A'}
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <div>
//                                 <div className="small">
//                                   <strong>Start:</strong> {new Date(assignment.startDate).toLocaleDateString()}
//                                 </div>
//                                 <div className="small">
//                                   <strong>End:</strong> {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Ongoing'}
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <div className="fw-bold">
//                                 ₹{assignment.rentAtAssignment?.toLocaleString()}
//                               </div>
//                               <div className="small text-muted">
//                                 per bed/month
//                               </div>
//                             </td>
//                             <td>
//                               {getStatusBadge(assignment.status)}
//                               <div className="small mt-1">
//                                 {assignment.billable ? (
//                                   <Badge bg="success" className="px-1 py-0">Billable</Badge>
//                                 ) : (
//                                   <Badge bg="secondary" className="px-1 py-0">Non-Billable</Badge>
//                                 )}
//                               </div>
//                             </td>
//                             <td>
//                               <div className="small">
//                                 {assignment.assignedBy?.fullName || 'System'}
//                                 <div className="text-muted">
//                                   {new Date(assignment.createdAt).toLocaleDateString()}
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <Dropdown>
//                                 <Dropdown.Toggle variant="outline-secondary" size="sm" id="dropdown-basic">
//                                   Actions
//                                 </Dropdown.Toggle>
//                                 <Dropdown.Menu>
//                                   {assignment.status === 'ACTIVE' && (
//                                     <Dropdown.Item onClick={() => openCloseModal(assignment)}>
//                                       🚪 Close Assignment
//                                     </Dropdown.Item>
//                                   )}
//                                   <Dropdown.Item onClick={() => openDeleteModal(assignment)}>
//                                     🗑️ Delete
//                                   </Dropdown.Item>
//                                   <Dropdown.Divider />
//                                   <Dropdown.Item>
//                                     📋 View Details
//                                   </Dropdown.Item>
//                                   <Dropdown.Item>
//                                     ✏️ Edit Remarks
//                                   </Dropdown.Item>
//                                 </Dropdown.Menu>
//                               </Dropdown>
//                               {assignment.remarks && (
//                                 <div className="small text-muted mt-1">
//                                   <em>"{assignment.remarks}"</em>
//                                 </div>
//                               )}
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </Table>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
      
//       {/* Create Assignment Modal */}
//       <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Create New Bed Assignment</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <h6 className="mb-3 border-bottom pb-2">Select Member</h6>
//             <Form.Group className="mb-3">
//               <Form.Label>Member *</Form.Label>
//               <Form.Select
//                 value={selectedMember?._id || ''}
//                 onChange={(e) => {
//                   const member = members.find(m => m._id === e.target.value);
//                   setSelectedMember(member);
//                 }}
//                 required
//               >
//                 <option value="">Select a member</option>
//                 {members
//                   .filter(member => member.isActive && member.status === 'ACTIVE')
//                   .map(member => (
//                     <option key={member._id} value={member._id}>
//                       {member.memberCode} - {member.fullName} ({member.instituteName})
//                     </option>
//                   ))
//                 }
//               </Form.Select>
//               {selectedMember && (
//                 <div className="mt-2 p-2 bg-light rounded">
//                   <div className="small">
//                     <strong>Selected Member:</strong> {selectedMember.fullName}
//                   </div>
//                   <div className="small">
//                     <strong>CNIC:</strong> {selectedMember.cnic}
//                   </div>
//                   <div className="small">
//                     <strong>Phone:</strong> {selectedMember.phone}
//                   </div>
//                 </div>
//               )}
//             </Form.Group>
            
//             <h6 className="mb-3 border-bottom pb-2 mt-4">Select Bed</h6>
//             <Form.Group className="mb-3">
//               <Form.Label>Available Beds *</Form.Label>
//               <Form.Select
//                 value={selectedBed?._id || ''}
//                 onChange={(e) => {
//                   const bed = availableBeds.find(b => b._id === e.target.value);
//                   setSelectedBed(bed);
//                 }}
//                 required
//               >
//                 <option value="">Select an available bed</option>
//                 {availableBeds.map(bed => (
//                   <option key={bed._id} value={bed._id}>
//                     Bed {bed.bedNumber} in Room {bed.room_Id?.roomNumber} (Floor {bed.room_Id?.floor})
//                   </option>
//                 ))}
//               </Form.Select>
//               {selectedBed && (
//                 <div className="mt-2 p-2 bg-light rounded">
//                   <div className="small">
//                     <strong>Selected Bed:</strong> {selectedBed.bedNumber}
//                   </div>
//                   <div className="small">
//                     <strong>Room:</strong> {selectedBed.room_Id?.roomNumber}
//                   </div>
//                   <div className="small">
//                     <strong>Floor:</strong> {selectedBed.room_Id?.floor}
//                   </div>
//                 </div>
//               )}
//             </Form.Group>
            
//             <h6 className="mb-3 border-bottom pb-2 mt-4">Additional Information</h6>
//             <Form.Group className="mb-3">
//               <Form.Label>Remarks (Optional)</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 value={remarks}
//                 onChange={(e) => setRemarks(e.target.value)}
//                 placeholder="Enter any remarks about this assignment..."
//               />
//             </Form.Group>
            
//             <div className="alert alert-info">
//               <small>
//                 <strong>Note:</strong> This will automatically update:
//                 <ul className="mb-0 mt-1">
//                   <li>Bed status to OCCUPIED</li>
//                   <li>Member's current bed and room assignment</li>
//                   <li>Member status to ACTIVE</li>
//                   <li>Room status to FULL if all beds are occupied</li>
//                 </ul>
//               </small>
//             </div>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
//             Cancel
//           </Button>
//           <Button 
//             variant="primary" 
//             onClick={handleCreateAssignment}
//             disabled={!selectedMember || !selectedBed}
//           >
//             Create Assignment
//           </Button>
//         </Modal.Footer>
//       </Modal>
      
//       {/* Close Assignment Modal */}
//       <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Close Bed Assignment</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedAssignment && (
//             <div>
//               <Alert variant="warning">
//                 <h5>⚠️ Close Assignment</h5>
//                 <p>Are you sure you want to close this bed assignment?</p>
//                 <p className="mb-0">This will free up the bed and update member status to ON_LEAVE.</p>
//               </Alert>
//               <div className="p-3 bg-light rounded">
//                 <p><strong>Member:</strong> {selectedAssignment.memberDetails?.fullName}</p>
//                 <p><strong>Room/Bed:</strong> {selectedAssignment.room_Id?.roomNumber} / {selectedAssignment.bedDetails?.bedNumber}</p>
//                 <p><strong>Assignment Start:</strong> {new Date(selectedAssignment.startDate).toLocaleDateString()}</p>
//                 <p><strong>Rent:</strong> ₹{selectedAssignment.rentAtAssignment?.toLocaleString()} per month</p>
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowCloseModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="warning" onClick={handleCloseAssignment}>
//             Close Assignment
//           </Button>
//         </Modal.Footer>
//       </Modal>
      
//       {/* Delete Assignment Modal */}
//       <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Delete Bed Assignment</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedAssignment && (
//             <div>
//               <Alert variant="danger">
//                 <h5>🗑️ Delete Assignment</h5>
//                 <p>Are you sure you want to delete this bed assignment?</p>
//                 <p className="mb-0"><strong>Note:</strong> Only closed assignments can be deleted.</p>
//               </Alert>
//               <div className="p-3 bg-light rounded">
//                 <p><strong>Member:</strong> {selectedAssignment.memberDetails?.fullName}</p>
//                 <p><strong>Status:</strong> {selectedAssignment.status}</p>
//                 <p><strong>Created:</strong> {new Date(selectedAssignment.createdAt).toLocaleDateString()}</p>
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//             Cancel
//           </Button>
//           <Button 
//             variant="danger" 
//             onClick={handleDeleteAssignment}
//             disabled={selectedAssignment?.status === 'ACTIVE'}
//           >
//             Delete Assignment
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Layout>
//   );
// };

// export default BedAssignments;











import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, Dropdown } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { bedAssignmentService } from '../services/bedAssignmentService';
import { memberService } from '../services/memberService';
import { bedService } from '../services/bedService';
import { roomService } from '../services/roomService';

const BedAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
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
                                  <Dropdown.Item disabled>
                                    📋 View Details
                                  </Dropdown.Item>
                                  <Dropdown.Item disabled>
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
    </Layout>
  );
};

export default BedAssignments;