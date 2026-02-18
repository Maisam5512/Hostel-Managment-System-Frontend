import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';
import { memberService } from '../services/memberService';
import { bedService } from '../services/bedService';
import { roomService } from '../services/roomService';
import { bedAssignmentService } from '../services/bedAssignmentService';
import { dashboardService } from '../services/dashboardService';

// Icons
import {
  FaUsers, FaCheckCircle, FaHome, FaMoneyBillWave, FaUser,
  FaPhone, FaIdCard, FaBed, FaUtensils, FaHistory, FaEdit,
  FaTrash, FaPlus, FaFilter, FaTimes, FaDoorOpen, FaUserGraduate,
  FaCalendarAlt, FaUserTag, FaBan,
  FaExclamationTriangle, FaLeaf, FaHeartbeat
} from 'react-icons/fa';

const Members = () => {
  const { callApi, loading, error, data } = useApi();
  const [members, setMembers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Modals for success/error messages
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const [filterStatus, setFilterStatus] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [memberRoomDetails, setMemberRoomDetails] = useState({});

  // Create form
  const { values, handleChange, resetForm, setValues } = useForm({
    memberCode: '',
    fullName: '',
    aadhaarNumber: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    instituteName: '',
    address: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Edit form
  const editForm = useForm({
    fullName: '',
    phone: '',
    aadhaarNumber: '',
    guardianName: '',
    guardianPhone: '',
    instituteName: '',
    address: ''
  });

  const statusForm = useForm({
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchMembers();
    fetchRooms();
  }, []);

  // ---------- Helper: show message in modal ----------
  const showMessage = (title, message, isSuccess = true) => {
    setModalTitle(title);
    setModalMessage(message);
    if (isSuccess) {
      setShowSuccessModal(true);
    } else {
      setShowErrorModal(true);
    }
  };

  // ---------- Validation helpers ----------
  const isValidAadhaar = (aadhaar) => /^\d{12}$/.test(aadhaar);
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);
  const isValidName = (name) => /^[A-Za-z\s]+$/.test(name); // letters and spaces only

  // ---------- Input handlers with validation ----------
  const handlePhoneChange = (e, formField, formHook) => {
    const value = e.target.value.replace(/\D/g, ''); // remove non-digits
    if (value.length <= 10) {
      formHook.setValues({ ...formHook.values, [formField]: value });
    }
  };

  const handleAadhaarChange = (e, formHook) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      formHook.setValues({ ...formHook.values, aadhaarNumber: value });
    }
  };

  const handleGuardianNameChange = (e, formHook) => {
    const value = e.target.value.replace(/[^A-Za-z\s]/g, ''); // allow only letters and spaces
    formHook.setValues({ ...formHook.values, guardianName: value });
  };

  // For create form, we need to override handleChange to enforce rules
  const enhancedHandleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        setValues({ ...values, phone: digits });
      }
    } else if (name === 'aadhaarNumber') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 12) {
        setValues({ ...values, aadhaarNumber: digits });
      }
    } else if (name === 'guardianName') {
      const letters = value.replace(/[^A-Za-z\s]/g, '');
      setValues({ ...values, guardianName: letters });
    } else {
      handleChange(e);
    }
  };

  // For edit form, similar enhancements
  const enhancedEditHandleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        editForm.setValues({ ...editForm.values, phone: digits });
      }
    } else if (name === 'aadhaarNumber') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 12) {
        editForm.setValues({ ...editForm.values, aadhaarNumber: digits });
      }
    } else if (name === 'guardianName') {
      const letters = value.replace(/[^A-Za-z\s]/g, '');
      editForm.setValues({ ...editForm.values, guardianName: letters });
    } else {
      editForm.handleChange(e);
    }
  };

  // ---------- API Calls ----------
  const fetchMembers = async () => {
    try {
      const response = await memberService.getAllMembers();
      if (response.success) {
        const transformedMembers = response.data.map(member => ({
          _id: member._id,
          user: { 
            fullName: member.fullName, 
            email: member.email || `${member.memberCode?.toLowerCase()}@example.com`
          },
          registrationNumber: member.memberCode,
          fatherName: member.guardianName,
          phone: member.phone,
          aadhaarNumber: member.cnic || '',
          address: member.address,
          status: member.status,
          monthlyRent: 15000,
          totalDue: 0,
          messEnabled: true,
          dietPreference: 'NORMAL',
          guardianName: member.guardianName,
          guardianPhone: member.guardianPhone,
          instituteName: member.instituteName,
          joiningDate: member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A',
          leaveDate: member.leaveDate ? new Date(member.leaveDate).toLocaleDateString() : null,
          fullName: member.fullName,
          memberCode: member.memberCode,
          isActive: member.isActive,
          currentRoomId: member.currentRoomId,
          currentBedId: member.currentBedId,
          cnic: member.cnic
        }));
        
        setMembers(transformedMembers);
        await fetchMemberRoomDetails(transformedMembers);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setMembers([]);
    }
  };

  const fetchMemberRoomDetails = async (memberList) => {
    const details = {};
    
    for (const member of memberList) {
      try {
        const assignmentsResponse = await bedAssignmentService.getBedAssignmentsByMember(member._id);
        if (assignmentsResponse.success && assignmentsResponse.data) {
          const activeAssignment = assignmentsResponse.data.find(
            assignment => assignment.status === 'ACTIVE'
          );
          
          if (activeAssignment) {
            details[member._id] = {
              roomInfo: {
                roomNumber: activeAssignment.room_Id?.roomNumber || 'Unknown',
                floor: activeAssignment.room_Id?.floor || 'N/A'
              },
              bedInfo: {
                bedNumber: activeAssignment.bed_Id?.bedNumber || 'Unknown',
                status: activeAssignment.bed_Id?.status || 'Unknown'
              }
            };
          }
        }
      } catch (err) {
        console.error(`Error fetching assignments for member ${member._id}:`, err);
        
        if (member.currentBedId) {
          try {
            const bedResponse = await bedService.getBedById(member.currentBedId);
            if (bedResponse.success && bedResponse.data) {
              details[member._id] = {
                bedInfo: {
                  bedNumber: bedResponse.data.bedNumber,
                  status: bedResponse.data.status
                }
              };
              
              if (bedResponse.data.room_Id && bedResponse.data.room_Id._id) {
                const roomResponse = await roomService.getRoomById(bedResponse.data.room_Id._id);
                if (roomResponse.success && roomResponse.data) {
                  details[member._id].roomInfo = {
                    roomNumber: roomResponse.data.roomNumber,
                    floor: roomResponse.data.floor
                  };
                }
              }
            }
          } catch (bedErr) {
            console.error(`Error fetching bed details for member ${member._id}:`, bedErr);
          }
        }
      }
    }
    
    setMemberRoomDetails(details);
  };

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      if (response.success) {
        setRooms(response.data.filter(room => room.isActive));
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setRooms([]);
    }
  };

  const fetchAssignmentHistory = async (memberId) => {
    try {
      const response = await bedAssignmentService.getBedAssignmentsByMember(memberId);
      if (response.success) {
        setAssignmentHistory(response.data);
      } else {
        setAssignmentHistory([]);
      }
    } catch (err) {
      console.error('Error fetching assignment history:', err);
      setAssignmentHistory([]);
    }
  };

  // Handle create – with validation
  const handleCreateMember = async (formData) => {
    // Validate fields
    if (!isValidAadhaar(formData.aadhaarNumber)) {
      showMessage('Validation Error', 'Aadhaar number must be exactly 12 digits.', false);
      return;
    }
    if (!isValidPhone(formData.phone)) {
      showMessage('Validation Error', 'Phone number must be exactly 10 digits.', false);
      return;
    }
    if (!isValidName(formData.guardianName)) {
      showMessage('Validation Error', 'Guardian name must contain only letters and spaces.', false);
      return;
    }

    try {
      const memberData = {
        memberCode: formData.memberCode,
        fullName: formData.fullName,
        cnic: formData.aadhaarNumber,
        phone: formData.phone,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone || formData.phone,
        instituteName: formData.instituteName || 'Not Specified',
        address: formData.address || '',
        joinDate: formData.joinDate
      };

      const response = await memberService.createMember(memberData);
      
      if (response.success) {
        showMessage('Success', 'Member created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchMembers();
        dashboardService.refreshDashboardStats().catch(console.error);
      } else {
        showMessage('Error', response.message || 'Failed to create member.', false);
      }
    } catch (err) {
      console.error('Error creating member:', err);
      showMessage('Error', err.message || 'Error creating member', false);
    }
  };

  // Handle edit – with validation
  const handleEditMember = async (formData) => {
    if (!isValidAadhaar(formData.aadhaarNumber)) {
      showMessage('Validation Error', 'Aadhaar number must be exactly 12 digits.', false);
      return;
    }
    if (!isValidPhone(formData.phone)) {
      showMessage('Validation Error', 'Phone number must be exactly 10 digits.', false);
      return;
    }
    if (!isValidName(formData.guardianName)) {
      showMessage('Validation Error', 'Guardian name must contain only letters and spaces.', false);
      return;
    }

    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        cnic: formData.aadhaarNumber,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        instituteName: formData.instituteName,
        address: formData.address
      };

      const response = await memberService.updateMember(selectedMember._id, updateData);
      
      if (response.success) {
        showMessage('Success', 'Member updated successfully!');
        setShowEditModal(false);
        setSelectedMember(null);
        fetchMembers();
        dashboardService.refreshDashboardStats().catch(console.error);
      } else {
        showMessage('Error', response.message || 'Failed to update member.', false);
      }
    } catch (err) {
      console.error('Error updating member:', err);
      showMessage('Error', err.message || 'Error updating member', false);
    }
  };

  const handleUpdateStatus = async (formData) => {
    try {
      const response = await memberService.updateMemberStatus(selectedMember._id, formData.status);
      
      if (response.success) {
        showMessage('Success', `Member status updated to ${formData.status} successfully!`);
        setShowStatusModal(false);
        setSelectedMember(null);
        fetchMembers();
        dashboardService.refreshDashboardStats().catch(console.error);
      } else {
        showMessage('Error', response.message || 'Failed to update status.', false);
      }
    } catch (err) {
      console.error('Error updating member status:', err);
      showMessage('Error', err.message || 'Error updating member status', false);
    }
  };

  const handleDeleteMember = async () => {
    try {
      const response = await memberService.deleteMember(selectedMember._id);
      
      if (response.success) {
        showMessage('Success', 'Member deactivated successfully!');
        setShowDeleteModal(false);
        setSelectedMember(null);
        fetchMembers();
        await dashboardService.refreshDashboardStats();
      } else {
        showMessage('Error', response.message || 'Failed to deactivate member.', false);
      }
    } catch (err) {
      console.error('Error deleting member:', err);
      showMessage('Error', err.message || 'Error deleting member', false);
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    editForm.setValues({
      fullName: member.fullName || member.user?.fullName || '',
      phone: member.phone || '',
      aadhaarNumber: member.aadhaarNumber || '',
      guardianName: member.guardianName || '',
      guardianPhone: member.guardianPhone || member.phone || '',
      instituteName: member.instituteName || '',
      address: member.address || ''
    });
    setShowEditModal(true);
  };

  const openStatusModal = (member) => {
    setSelectedMember(member);
    statusForm.setValues({ status: member.status || 'ACTIVE' });
    setShowStatusModal(true);
  };

  const openHistoryModal = async (member) => {
    setSelectedMember(member);
    await fetchAssignmentHistory(member._id);
    setShowHistoryModal(true);
  };

  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', color: 'success', icon: <FaCheckCircle /> },
    { value: 'ON_LEAVE', label: 'On Leave', color: 'warning', icon: <FaBan /> },
    { value: 'LEFT', label: 'Left', color: 'secondary', icon: <FaDoorOpen /> }
  ];

  const dietOptions = [
    { value: 'NORMAL', label: 'Normal', icon: <FaUtensils /> },
    { value: 'VEG', label: 'Vegetarian', icon: <FaLeaf /> },
    { value: 'DIABETIC', label: 'Diabetic', icon: <FaHeartbeat /> }
  ];

  const filteredMembers = members.filter(member => {
    if (filterStatus && member.status !== filterStatus) return false;
    if (filterRoom && member.currentRoomId !== filterRoom) return false;
    return true;
  });

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
                <FaPlus className="me-2" /> Add New Member
              </Button>
            </div>
          </Col>
        </Row>

        {/* Success/Error Modals (instead of banners) */}
        <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-success">
              <FaCheckCircle className="me-2" /> {modalTitle}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{modalMessage}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={() => setShowSuccessModal(false)}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <FaExclamationTriangle className="me-2" /> {modalTitle}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{modalMessage}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => setShowErrorModal(false)}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Stats Cards (unchanged) */}
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
                    <FaUsers size={20} />
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
                    <h6 className="text-muted mb-1">With Rooms</h6>
                    <h3 className="mb-0">{Object.keys(memberRoomDetails).length}</h3>
                  </div>
                  <div className="bg-info-light p-2 rounded-circle">
                    <FaHome size={20} className="text-info" />
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
                    <FaMoneyBillWave size={20} className="text-danger" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters (unchanged) */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label><FaFilter className="me-1" /> Filter by Status</Form.Label>
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
              <Form.Label><FaHome className="me-1" /> Filter by Room</Form.Label>
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
              <FaTimes className="me-1" /> Clear Filters
            </Button>
          </Col>
        </Row>

        {/* Members Table (unchanged) */}
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
                        <th>Aadhaar Number</th>
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
                          <td colSpan="9" className="text-center py-4">
                            No members found
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((member) => {
                          const statusOption = statusOptions.find(s => s.value === member.status);
                          const dietOption = dietOptions.find(d => d.value === member.dietPreference);
                          const memberDetails = memberRoomDetails[member._id];
                          
                          return (
                            <tr key={member._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    <div className="bg-orange text-white rounded-circle d-flex align-items-center justify-content-center" 
                                      style={{ width: '36px', height: '36px' }}>
                                      {(member.fullName || member.user?.fullName || 'M').charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="fw-bold">{member.fullName || member.user?.fullName || 'Unknown'}</div>
                                    <div className="small text-muted">
                                      <FaUserGraduate className="me-1" size={10} />
                                      Institute: {member.instituteName || 'Not specified'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <Badge bg="secondary" className="px-2 py-1 mb-1">
                                    {member.registrationNumber || member.memberCode || `M-${member._id?.slice(-4).toUpperCase()}`}
                                  </Badge>
                                  <div className="small text-muted">
                                    <FaCalendarAlt className="me-1" size={10} />
                                    Joined: {member.joiningDate || 'N/A'}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div><FaPhone className="me-1" size={10} /> {member.phone || 'N/A'}</div>
                                  <div className="small text-muted">
                                    <FaUser className="me-1" size={10} />
                                    Guardian: {member.guardianName || 'N/A'}
                                  </div>
                                  <div className="small text-muted">
                                    <FaPhone className="me-1" size={10} />
                                    {member.guardianPhone || 'No guardian phone'}
                                  </div>
                                </div>
                              </td>
                              <td>
                                {member.aadhaarNumber ? (
                                  <span><FaIdCard className="me-1" /> {member.aadhaarNumber}</span>
                                ) : (
                                  <span className="text-muted">N/A</span>
                                )}
                              </td>
                              <td>
                                <div>
                                  {memberDetails ? (
                                    <>
                                      <Badge bg="info" className="px-2 py-1 mb-1">
                                        <FaHome className="me-1" /> Room: {memberDetails.roomInfo?.roomNumber || 'Unknown'}
                                      </Badge>
                                      <div className="small mt-1">
                                        {memberDetails.bedInfo ? (
                                          <Badge bg="primary" className="px-1 py-0">
                                            <FaBed className="me-1" /> Bed: {memberDetails.bedInfo.bedNumber}
                                          </Badge>
                                        ) : (
                                          <span className="text-warning">No bed details</span>
                                        )}
                                      </div>
                                      <div className="small text-muted">
                                        Floor: {memberDetails.roomInfo?.floor || 'N/A'}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-danger">No room assigned</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-bold">₹{member.monthlyRent?.toLocaleString() || '15,000'}</div>
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
                                {member.leaveDate && (
                                  <div className="small text-muted mt-1">
                                    Left: {member.leaveDate}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="d-flex flex-column gap-1">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => openEditModal(member)}
                                  >
                                    <FaEdit className="me-1" /> Edit
                                  </Button>
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => openHistoryModal(member)}
                                  >
                                    <FaHistory className="me-1" /> History
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => openStatusModal(member)}
                                  >
                                    <FaUserTag className="me-1" /> Status
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => openDeleteModal(member)}
                                  >
                                    <FaTrash className="me-1" /> Delete
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

      {/* Create Member Modal – with enhanced input handlers */}
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
                  <Form.Label>Member Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="memberCode"
                    value={values.memberCode}
                    onChange={handleChange}
                    placeholder="e.g., M-0001, REG001"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={values.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Aadhaar Number * (12 digits)</Form.Label>
                  <Form.Control
                    type="text"
                    name="aadhaarNumber"
                    value={values.aadhaarNumber}
                    onChange={enhancedHandleChange}
                    placeholder="Enter 12-digit Aadhaar"
                    maxLength="12"
                    required
                  />
                  <Form.Text className="text-muted">
                    {values.aadhaarNumber.length}/12 digits
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
                    onChange={enhancedHandleChange}
                    placeholder="e.g., 9876543210"
                    maxLength="10"
                    required
                  />
                  <Form.Text className="text-muted">
                    {values.phone.length}/10 digits
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guardian's Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardianName"
                    value={values.guardianName}
                    onChange={enhancedHandleChange}
                    placeholder="Enter guardian's name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guardian's Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardianPhone"
                    value={values.guardianPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      if (digits.length <= 10) {
                        setValues({ ...values, guardianPhone: digits });
                      }
                    }}
                    placeholder="e.g., 9876543210"
                    maxLength="10"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institute Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="instituteName"
                    value={values.instituteName}
                    onChange={handleChange}
                    placeholder="Enter institute/college name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Join Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="joinDate"
                    value={values.joinDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
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

      {/* Edit Member Modal – with enhanced input handlers */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Member: {selectedMember?.fullName || selectedMember?.user?.fullName}</Modal.Title>
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
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={editForm.values.fullName}
                    onChange={editForm.handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number * (10 digits)</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={editForm.values.phone}
                    onChange={enhancedEditHandleChange}
                    maxLength="10"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Aadhaar Number * (12 digits)</Form.Label>
                  <Form.Control
                    type="text"
                    name="aadhaarNumber"
                    value={editForm.values.aadhaarNumber}
                    onChange={enhancedEditHandleChange}
                    maxLength="12"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guardian's Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardianName"
                    value={editForm.values.guardianName}
                    onChange={enhancedEditHandleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guardian's Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardianPhone"
                    value={editForm.values.guardianPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      if (digits.length <= 10) {
                        editForm.setValues({ ...editForm.values, guardianPhone: digits });
                      }
                    }}
                    maxLength="10"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Institute Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="instituteName"
                    value={editForm.values.instituteName}
                    onChange={editForm.handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
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

      {/* Change Status Modal (unchanged) */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Member Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <div className="mb-3">
              <p>Member: <strong>{selectedMember.fullName || selectedMember.user?.fullName}</strong></p>
              <p>Registration: <Badge bg="secondary">{selectedMember.registrationNumber || selectedMember.memberCode}</Badge></p>
              <p>Current Status: 
                <Badge bg={statusOptions.find(s => s.value === selectedMember.status)?.color || 'secondary'} className="ms-2">
                  {statusOptions.find(s => s.value === selectedMember.status)?.icon} {selectedMember.status}
                </Badge>
              </p>
              {selectedMember.aadhaarNumber && (
                <p><FaIdCard className="me-1" /> Aadhaar: {selectedMember.aadhaarNumber}</p>
              )}
              {memberRoomDetails[selectedMember._id] && (
                <p><FaHome className="me-1" /> Current Room: {memberRoomDetails[selectedMember._id]?.roomInfo?.roomNumber || 'Unknown'}</p>
              )}
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
            <div className="alert alert-info">
              <small>
                <strong>Note:</strong> Changing status to "LEFT" will automatically unassign bed and room.
              </small>
            </div>
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

      {/* Assignment History Modal (unchanged) */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Assignment History for {selectedMember?.fullName || selectedMember?.user?.fullName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {assignmentHistory.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No assignment history found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Room/Bed</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Assigned By</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentHistory.map((assignment) => (
                    <tr key={assignment._id}>
                      <td>{assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Active'}</td>
                      <td>
                        {assignment.room_Id?.roomNumber || 'N/A'} / {assignment.bed_Id?.bedNumber || 'N/A'}
                      </td>
                      <td>₹{assignment.rentAtAssignment?.toLocaleString() || '0'}</td>
                      <td>
                        <Badge bg={assignment.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {assignment.status}
                        </Badge>
                      </td>
                      <td>{assignment.assignedBy?.fullName || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal (unchanged) */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Deactivate Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <div className="mb-3">
              <Alert variant="warning">
                <h5><FaExclamationTriangle className="me-2" /> Deactivate Member</h5>
                <p>Are you sure you want to deactivate member <strong>{selectedMember.fullName || selectedMember.user?.fullName}</strong>?</p>
                <p className="mb-0">This will mark the member as inactive in the system. The member can be reactivated later.</p>
              </Alert>
              <div className="small text-muted">
                <p><strong>Member Details:</strong></p>
                <p>Registration: {selectedMember.registrationNumber || selectedMember.memberCode}</p>
                {selectedMember.aadhaarNumber && (
                  <p><FaIdCard className="me-1" /> Aadhaar: {selectedMember.aadhaarNumber}</p>
                )}
                <p>Status: {selectedMember.status}</p>
                {memberRoomDetails[selectedMember._id] && (
                  <p><FaHome className="me-1" /> Current Room: {memberRoomDetails[selectedMember._id]?.roomInfo?.roomNumber || 'Unknown'}</p>
                )}
              </div>
            </div>
          )}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteMember} disabled={loading}>
              {loading ? 'Deactivating...' : 'Deactivate Member'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Members;


