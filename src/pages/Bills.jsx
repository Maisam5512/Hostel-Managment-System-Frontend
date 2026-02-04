import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Form, Modal, Alert,
  Badge, Dropdown, InputGroup, Tab, Nav, ProgressBar, Tooltip, OverlayTrigger
} from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaRupeeSign, FaFileInvoice, FaCalendarAlt, FaUser, FaReceipt } from 'react-icons/fa';
import { MdPayment, MdRefresh } from 'react-icons/md';
import Layout from '../components/layout/Layout';
import { billService } from '../services/billService';
import { memberService } from '../services/memberService';
import { useAuth } from '../context/AuthContext';
import '../styles/Bills.css';


const Bills = () => {
  const { user } = useAuth();
  
  const [bills, setBills] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statistics, setStatistics] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    partial: 0,
    totalAmount: 0,
    collectedAmount: 0,
    pendingAmount: 0
  });
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected bill state
  const [selectedBill, setSelectedBill] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    member: '',
    billMonth: '',
    status: ''
  });
  
  // Form state for creating bill
  const [billForm, setBillForm] = useState({
    member: '',
    billMonth: getCurrentMonth(),
    extraItems: [{ title: '', amount: '' }],
    remarks: ''
  });
  
  // Form state for payment
  const [paymentForm, setPaymentForm] = useState({
    amount: ''
  });
  
  // Form state for editing bill (ONLY remarks can be edited according to API)
  const [editForm, setEditForm] = useState({
    remarks: ''
  });
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('all');

  function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /* ================= FETCH FUNCTIONS ================= */
  
  const fetchMembers = useCallback(async () => {
    try {
      const res = await memberService.getAllMembers();
      const membersList = res?.data || res || [];
      setMembers(membersList.filter(m => m.isActive));
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError(`Failed to load members: ${err.message}`);
    }
  }, []);
  
  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (filters.member) params.member = filters.member;
      if (filters.billMonth) params.billMonth = filters.billMonth;
      if (filters.status) params.status = filters.status;
      
      const response = await billService.getAll(params);
      
      if (response && response.success !== false) {
        const billsData = response.data || response;
        setBills(Array.isArray(billsData) ? billsData : []);
        calculateStatistics(billsData);
      } else {
        setError(response?.message || 'Failed to fetch bills');
        setBills([]);
      }
    } catch (err) {
      console.error('Error in fetchBills:', err);
      setError(err.message || 'Failed to fetch bills. Please check server connection.');
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  /* ================= EFFECTS ================= */
  
  useEffect(() => {
    fetchBills();
    fetchMembers();
  }, [fetchBills, fetchMembers]);
  
  useEffect(() => {
    if (activeTab === 'all') {
      setFilters(prev => ({ ...prev, status: '' }));
    } else if (activeTab === 'unpaid') {
      setFilters(prev => ({ ...prev, status: 'UNPAID' }));
    } else if (activeTab === 'partial') {
      setFilters(prev => ({ ...prev, status: 'PARTIAL' }));
    } else if (activeTab === 'paid') {
      setFilters(prev => ({ ...prev, status: 'PAID' }));
    }
  }, [activeTab]);
  
  /* ================= HELPER FUNCTIONS ================= */
  
  const calculateStatistics = (billsData) => {
    const stats = {
      total: billsData.length || 0,
      paid: 0,
      unpaid: 0,
      partial: 0,
      totalAmount: 0,
      collectedAmount: 0,
      pendingAmount: 0
    };
    
    if (Array.isArray(billsData)) {
      billsData.forEach(bill => {
        stats.totalAmount += bill.totalAmount || 0;
        stats.collectedAmount += bill.paidAmount || 0;
        stats.pendingAmount += bill.dueAmount || 0;
        
        if (bill.status === 'PAID') stats.paid++;
        else if (bill.status === 'UNPAID') stats.unpaid++;
        else if (bill.status === 'PARTIAL') stats.partial++;
      });
    }
    
    setStatistics(stats);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };
  
  const getStatusBadge = (status) => {
    const variants = {
      'UNPAID': 'danger',
      'PARTIAL': 'warning',
      'PAID': 'success'
    };
    return variants[status] || 'secondary';
  };
  
  const getMemberName = (member) => {
    if (!member) return 'N/A';
    if (typeof member === 'object') {
      return member.fullName || 'N/A';
    }
    return member;
  };
  
  const getMemberCode = (member) => {
    if (!member) return '';
    if (typeof member === 'object') {
      return member.memberCode || '';
    }
    return '';
  };
  
  const renderTooltip = (text) => (
    <Tooltip id="button-tooltip">
      {text}
    </Tooltip>
  );
  
  /* ================= FORM HANDLERS ================= */
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBillFormChange = (e) => {
    const { name, value } = e.target;
    setBillForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleExtraItemChange = (index, field, value) => {
    setBillForm(prev => {
      const updatedItems = [...prev.extraItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'amount' ? (parseFloat(value) || '') : value
      };
      return {
        ...prev,
        extraItems: updatedItems
      };
    });
  };
  
  const addExtraItemRow = () => {
    setBillForm(prev => ({
      ...prev,
      extraItems: [...prev.extraItems, { title: '', amount: '' }]
    }));
  };
  
  const removeExtraItemRow = (index) => {
    setBillForm(prev => ({
      ...prev,
      extraItems: prev.extraItems.filter((_, i) => i !== index)
    }));
  };
  
  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: parseFloat(value) || ''
    }));
  };
  
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  /* ================= ACTION HANDLERS ================= */
  
  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setLoadingAction(true);
      
      if (!billForm.member) {
        setError('Please select a member');
        setLoadingAction(false);
        return;
      }
      
      const billData = {
        member: billForm.member,
        billMonth: billForm.billMonth,
        remarks: billForm.remarks || ''
      };
      
      const validExtraItems = billForm.extraItems.filter(
        item => item.title && item.amount && item.amount > 0
      );
      
      if (validExtraItems.length > 0) {
        billData.extraItems = validExtraItems.map(item => ({
          title: item.title,
          amount: parseFloat(item.amount)
        }));
      }
      
      const response = await billService.create(billData);
      
      if (response && response.success !== false) {
        setSuccess(response.message || 'Bill created successfully!');
        setShowCreateModal(false);
        
        setBillForm({
          member: '',
          billMonth: getCurrentMonth(),
          extraItems: [{ title: '', amount: '' }],
          remarks: ''
        });
        
        fetchBills();
      } else {
        setError(response?.message || 'Failed to create bill');
      }
    } catch (err) {
      console.error('Error in handleCreateBill:', err);
      setError(err.message || 'Failed to create bill. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };
  
  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowViewModal(true);
  };
  
  const handleEditBill = (bill) => {
    setSelectedBill(bill);
    setEditForm({
      remarks: bill.remarks || ''
    });
    setShowEditModal(true);
  };
  
  const handleUpdateBill = async () => {
    try {
      setError('');
      setSuccess('');
      setLoadingAction(true);
      
      // According to API, only remarks can be updated
      const updateData = {
        remarks: editForm.remarks || ''
      };
      
      const response = await billService.update(selectedBill._id, updateData);
      
      if (response && response.success !== false) {
        setSuccess('Bill updated successfully!');
        setShowEditModal(false);
        setSelectedBill(null);
        fetchBills();
      } else {
        setError(response?.message || 'Failed to update bill');
      }
    } catch (err) {
      console.error('Error in handleUpdateBill:', err);
      setError(err.message || 'Failed to update bill');
    } finally {
      setLoadingAction(false);
    }
  };
  
  const handleAddPayment = (bill) => {
    setSelectedBill(bill);
    setPaymentForm({
      amount: bill.dueAmount || 0
    });
    setShowPaymentModal(true);
  };
  
  const handleSubmitPayment = async () => {
    try {
      setError('');
      setSuccess('');
      setLoadingAction(true);
      
      if (!paymentForm.amount || paymentForm.amount <= 0) {
        setError('Please enter a valid payment amount');
        setLoadingAction(false);
        return;
      }
      
      const response = await billService.addPayment(selectedBill._id, paymentForm.amount);
      
      if (response && response.success !== false) {
        setSuccess('Payment added successfully!');
        setShowPaymentModal(false);
        setSelectedBill(null);
        setPaymentForm({ amount: '' });
        fetchBills();
      } else {
        setError(response?.message || 'Failed to add payment');
      }
    } catch (err) {
      console.error('Error in handleSubmitPayment:', err);
      setError(err.message || 'Failed to add payment');
    } finally {
      setLoadingAction(false);
    }
  };
  
  const handleDeleteBill = (bill) => {
    setSelectedBill(bill);
    setShowDeleteModal(true);
    setError('');
    setSuccess('');
  };
  
  const handleConfirmDelete = async () => {
    try {
      setError('');
      setSuccess('');
      setLoadingAction(true);
      
      const response = await billService.delete(selectedBill._id);
      
      // CRITICAL FIX: Properly check API response
      // Successful delete: { success: true, message: "Bill deleted successfully" }
      // Failed delete: { success: false, message: "Bill with payments cannot be deleted" }
      
      if (response && response.success === true) {
        // SUCCESS: Bill deleted
        setSuccess(response.message || 'Bill deleted successfully!');
        
        // Update local state immediately for better UX
        setBills(prev => prev.filter(bill => bill._id !== selectedBill._id));
        
        // Recalculate statistics
        calculateStatistics(bills.filter(bill => bill._id !== selectedBill._id));
        
        // Close modal after showing success message
        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedBill(null);
        }, 1500);
        
      } else {
        // FAILURE: Bill cannot be deleted (has payments)
        const errorMsg = response?.message || 'Bill cannot be deleted. It may have payments recorded.';
        setError(errorMsg);
        
        // Keep modal open to show the error message
        // Don't close the modal when deletion fails
      }
      
    } catch (err) {
      console.error('Error in handleConfirmDelete:', err);
      
      // Handle different error formats
      let errorMsg = 'Failed to delete bill';
      
      if (err && typeof err === 'object') {
        if (err.message) {
          errorMsg = err.message;
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.success === false && err.message) {
          // This is the server's error response { success: false, message: "..." }
          errorMsg = err.message;
        }
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      
      setError(errorMsg);
      
      // Close modal for network errors, keep open for payment errors
      if (!errorMsg.toLowerCase().includes('payment') && 
          !errorMsg.toLowerCase().includes('cannot be deleted')) {
        setTimeout(() => {
          setShowDeleteModal(false);
        }, 1500);
      }
    } finally {
      setLoadingAction(false);
    }
  };
  
  const handleClearFilters = () => {
    setFilters({
      member: '',
      billMonth: '',
      status: ''
    });
    setActiveTab('all');
  };
  
  const refreshData = () => {
    fetchBills();
    fetchMembers();
  };
  
  /* ================= RENDER COMPONENTS ================= */
  
  const renderStatusCards = () => (
    <Row className="mb-4 g-2">
      <Col lg={4} md={6}>
        <Card className="border-0 shadow-sm hover-lift">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Paid Bills</h6>
                <h3 className="mb-0 text-success">{statistics.paid}</h3>
              </div>
              <Badge bg="success" className="fs-6 px-3 py-2">
                {((statistics.paid / statistics.total) * 100 || 0).toFixed(1)}%
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col lg={4} md={6}>
        <Card className="border-0 shadow-sm hover-lift">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Unpaid Bills</h6>
                <h3 className="mb-0 text-danger">{statistics.unpaid}</h3>
              </div>
              <Badge bg="danger" className="fs-6 px-3 py-2">
                {((statistics.unpaid / statistics.total) * 100 || 0).toFixed(1)}%
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col lg={4} md={12}>
        <Card className="border-0 shadow-sm hover-lift">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Partial Payments</h6>
                <h3 className="mb-0 text-warning">{statistics.partial}</h3>
              </div>
              <Badge bg="warning" className="fs-6 px-3 py-2">
                {((statistics.partial / statistics.total) * 100 || 0).toFixed(1)}%
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderFilters = () => (
    <Card className="shadow-sm mb-4">
      <Card.Body className="p-3">
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small text-muted mb-1">
                <FaUser className="me-2" /> Member
              </Form.Label>
              <Form.Select
                name="member"
                value={filters.member}
                onChange={handleFilterChange}
                size="sm"
              >
                <option value="">All Members</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.memberCode} - {member.fullName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small text-muted mb-1">
                <FaCalendarAlt className="me-2" /> Bill Month
              </Form.Label>
              <Form.Control
                type="month"
                name="billMonth"
                value={filters.billMonth}
                onChange={handleFilterChange}
                size="sm"
              />
            </Form.Group>
          </Col>
          
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small text-muted mb-1">Status</Form.Label>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                size="sm"
              >
                <option value="">All Status</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={3} className="d-flex gap-2">
            <OverlayTrigger
              placement="top"
              overlay={renderTooltip('Clear all filters')}
            >
              <Button
                variant="outline-secondary"
                onClick={handleClearFilters}
                className="flex-grow-1"
                size="sm"
              >
                Clear
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={renderTooltip('Refresh data')}
            >
              <Button
                variant="outline-orange"
                onClick={refreshData}
                className="px-3"
                size="sm"
              >
                <MdRefresh />
              </Button>
            </OverlayTrigger>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  return (
    <div className="bills-page">
    <Layout>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              <div className="bg-orange bg-opacity-10 p-3 rounded-circle me-3">
                <FaFileInvoice size={28} className="text-orange" />
              </div>
              <div>
                <h2 className="text-orange mb-0">Billing Management</h2>
                <p className="text-muted mb-0">Generate and manage member bills, track payments</p>
              </div>
            </div>
          </Col>
          <Col className="text-end">
            <Button
              variant="orange"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 shadow-sm"
            >
              <FaFileInvoice className="me-2" />
              Generate Bill
            </Button>
          </Col>
        </Row>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible className="shadow-sm">
            <div className="d-flex align-items-center">
              <div className="alert-icon me-3">
                <div className="bg-danger rounded-circle p-2">
                  <span className="text-white">!</span>
                </div>
              </div>
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          </Alert>
        )}

        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} dismissible className="shadow-sm">
            <div className="d-flex align-items-center">
              <div className="alert-icon me-3">
                <div className="bg-success rounded-circle p-2">
                  <span className="text-white">✓</span>
                </div>
              </div>
              <div>
                <strong>Success:</strong> {success}
              </div>
            </div>
          </Alert>
        )}

        
        {renderStatusCards()}

        {/* Filters */}
        {renderFilters()}

        {/* Tabs and Table */}
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
              <div className="border-bottom">
                <Nav variant="tabs" className="px-3 pt-3">
                  <Nav.Item>
                    <Nav.Link eventKey="all" className="border-0 pb-3">
                      <span className={`px-3 py-2 rounded ${activeTab === 'all' ? 'bg-orange text-white' : 'text-muted'}`}>
                        All Bills ({statistics.total})
                      </span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="unpaid" className="border-0 pb-3">
                      <span className={`px-3 py-2 rounded ${activeTab === 'unpaid' ? 'bg-danger text-white' : 'text-muted'}`}>
                        Unpaid ({statistics.unpaid})
                      </span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="partial" className="border-0 pb-3">
                      <span className={`px-3 py-2 rounded ${activeTab === 'partial' ? 'bg-warning text-white' : 'text-muted'}`}>
                        Partial ({statistics.partial})
                      </span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="paid" className="border-0 pb-3">
                      <span className={`px-3 py-2 rounded ${activeTab === 'paid' ? 'bg-success text-white' : 'text-muted'}`}>
                        Paid ({statistics.paid})
                      </span>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-orange" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading bills data...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-4">Bill #</th>
                        <th>Member</th>
                        <th>Month</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Generated On</th>
                        <th className="text-center pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-5">
                            <div className="text-muted py-4">
                              <FaFileInvoice size={48} className="mb-3 opacity-25" />
                              <p className="mb-1 fs-5">No bills found</p>
                              <small>Generate your first bill using the "Generate Bill" button</small>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        bills.map(bill => (
                          <tr key={bill._id} className="align-middle">
                            <td className="ps-4">
                              <div className="fw-bold">#{bill.billNumber}</div>
                              <small className="text-muted">{bill._id?.substring(bill._id.length - 6)}</small>
                            </td>
                            <td>
                              <div className="fw-bold">{getMemberName(bill.member)}</div>
                              <small className="text-muted">{getMemberCode(bill.member)}</small>
                            </td>
                            <td>
                              <Badge bg="light" text="dark" className="px-3 py-2">
                                {bill.billMonth}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <div className="fw-bold">{formatCurrency(bill.totalAmount)}</div>
                                <div className="small d-flex justify-content-between">
                                  <span className="text-success">Paid: {formatCurrency(bill.paidAmount)}</span>
                                  <span className="text-danger">Due: {formatCurrency(bill.dueAmount)}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge bg={getStatusBadge(bill.status)} className="px-3 py-2">
                                {bill.status}
                              </Badge>
                            </td>
                            <td style={{ width: '150px' }}>
                              <ProgressBar className="mt-1" style={{ height: '6px' }}>
                                <ProgressBar 
                                  variant="success" 
                                  now={((bill.paidAmount / bill.totalAmount) * 100) || 0} 
                                />
                              </ProgressBar>
                              <small className="text-muted">
                                {((bill.paidAmount / bill.totalAmount) * 100 || 0).toFixed(0)}% Paid
                              </small>
                            </td>
                            <td>
                              <small>{formatDate(bill.createdAt)}</small>
                            </td>
                            <td className="text-center pe-4">
                              <div className="d-flex gap-2 justify-content-center">
                                <OverlayTrigger overlay={renderTooltip('View Details')}>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleViewBill(bill)}
                                  >
                                    <FaEye />
                                  </Button>
                                </OverlayTrigger>
                                
                                {bill.status !== 'PAID' && (
                                  <>
                                    <OverlayTrigger overlay={renderTooltip('Edit Remarks')}>
                                      <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => handleEditBill(bill)}
                                      >
                                        <FaEdit />
                                      </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger overlay={renderTooltip('Add Payment')}>
                                      <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => handleAddPayment(bill)}
                                      >
                                        <MdPayment />
                                      </Button>
                                    </OverlayTrigger>
                                  </>
                                )}
                                
                                <OverlayTrigger overlay={renderTooltip(
                                  bill.paidAmount > 0 
                                    ? 'Bills with payments cannot be deleted' 
                                    : 'Delete Bill'
                                )}>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDeleteBill(bill)}
                                    disabled={bill.paidAmount > 0}
                                  >
                                    <FaTrash />
                                  </Button>
                                </OverlayTrigger>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Tab.Container>
          </Card.Body>
        </Card>

        {/* ================= MODALS ================= */}

        {/* Create Bill Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title>
              <div className="d-flex align-items-center">
                <div className="bg-orange bg-opacity-10 p-2 rounded-circle me-3">
                  <FaFileInvoice className="text-orange" />
                </div>
                <div>
                  <h5 className="mb-0">Generate New Bill</h5>
                  <small className="text-muted">Create bill with auto-calculated charges</small>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateBill}>
            <Modal.Body className="pt-0">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <FaUser className="me-2" /> Select Member *
                </Form.Label>
                <Form.Select
                  name="member"
                  value={billForm.member}
                  onChange={handleBillFormChange}
                  required
                  className="form-control-lg"
                >
                  <option value="">Choose member...</option>
                  {members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.memberCode} - {member.fullName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <FaCalendarAlt className="me-2" /> Bill Month *
                </Form.Label>
                <Form.Control
                  type="month"
                  name="billMonth"
                  value={billForm.billMonth}
                  onChange={handleBillFormChange}
                  required
                  className="form-control-lg"
                />
                <Form.Text className="text-muted">
                  Bill will include room rent (if assigned) and all unbilled food orders
                </Form.Text>
              </Form.Group>

              <Card className="border mb-3">
                <Card.Header className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Extra Items (Optional)</span>
                    <Button
                      variant="outline-success"
                      size="sm"
                      type="button"
                      onClick={addExtraItemRow}
                    >
                      + Add Item
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {billForm.extraItems.map((item, index) => (
                    <Row key={index} className="mb-3 align-items-center">
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          placeholder="Item title (e.g., Late Fine, Damage Charges)"
                          value={item.title}
                          onChange={(e) => handleExtraItemChange(index, 'title', e.target.value)}
                          className="form-control-lg"
                        />
                      </Col>
                      <Col md={4}>
                        <InputGroup className="form-control-lg">
                          <InputGroup.Text className="bg-light">₹</InputGroup.Text>
                          <Form.Control
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) => handleExtraItemChange(index, 'amount', e.target.value)}
                          />
                        </InputGroup>
                      </Col>
                      <Col md={2}>
                        {billForm.extraItems.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="lg"
                            onClick={() => removeExtraItemRow(index)}
                            className="w-100"
                          >
                            ×
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </Card.Body>
              </Card>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Remarks (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="remarks"
                  value={billForm.remarks}
                  onChange={handleBillFormChange}
                  placeholder="Additional notes or remarks..."
                  className="form-control-lg"
                />
              </Form.Group>

              <Alert variant="info" className="border-0 bg-light">
                <div className="d-flex">
                  <div className="me-3">
                    <div className="bg-info bg-opacity-10 p-2 rounded-circle">
                      <FaFileInvoice className="text-info" />
                    </div>
                  </div>
                  <div>
                    <strong>Note:</strong> This bill will automatically include:
                    <ul className="mb-0 mt-2">
                      <li>Room rent from active bed assignment (if any)</li>
                      <li>All unbilled food orders for this member</li>
                      <li>Extra items added above</li>
                    </ul>
                  </div>
                </div>
              </Alert>
            </Modal.Body>
            <Modal.Footer className="border-top-0">
              <Button variant="light" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="orange" type="submit" disabled={loadingAction}>
                {loadingAction ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating...
                  </>
                ) : (
                  'Generate Bill'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* View Bill Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                  <FaFileInvoice className="text-primary" />
                </div>
                <div>
                  <h5 className="mb-0">Bill Details</h5>
                  <small className="text-muted">#{selectedBill?.billNumber}</small>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-0">
            {selectedBill && (
              <>
                <Row className="mb-4">
                  <Col md={6}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h6 className="text-muted mb-3">Member Information</h6>
                        <div className="mb-2">
                          <strong>Name:</strong> {getMemberName(selectedBill.member)}
                        </div>
                        <div className="mb-2">
                          <strong>Member Code:</strong> {getMemberCode(selectedBill.member)}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h6 className="text-muted mb-3">Bill Information</h6>
                        <div className="mb-2">
                          <strong>Bill Month:</strong> {selectedBill.billMonth}
                        </div>
                        <div className="mb-2">
                          <strong>Generated On:</strong> {formatDate(selectedBill.createdAt)}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <h6 className="text-muted mb-3">Bill Items</h6>
                <Table bordered className="mb-4">
                  <thead className="bg-light">
                    <tr>
                      <th>Item</th>
                      <th className="text-end">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.title}</td>
                        <td className="text-end fw-bold">{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <th>Total Amount</th>
                      <th className="text-end">{formatCurrency(selectedBill.totalAmount)}</th>
                    </tr>
                    <tr>
                      <td>Paid Amount</td>
                      <td className="text-end text-success">{formatCurrency(selectedBill.paidAmount)}</td>
                    </tr>
                    <tr>
                      <th>Due Amount</th>
                      <th className="text-end text-danger">{formatCurrency(selectedBill.dueAmount)}</th>
                    </tr>
                  </tfoot>
                </Table>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Payment Progress</strong>
                    <Badge bg={getStatusBadge(selectedBill.status)} className="px-3 py-2">
                      {selectedBill.status}
                    </Badge>
                  </div>
                  <ProgressBar className="mb-2" style={{ height: '10px' }}>
                    <ProgressBar 
                      variant="success" 
                      now={((selectedBill.paidAmount / selectedBill.totalAmount) * 100) || 0} 
                    />
                  </ProgressBar>
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">
                      {((selectedBill.paidAmount / selectedBill.totalAmount) * 100 || 0).toFixed(1)}% Paid
                    </small>
                    <small className="text-muted">
                      ₹{selectedBill.paidAmount.toLocaleString()} of ₹{selectedBill.totalAmount.toLocaleString()}
                    </small>
                  </div>
                </div>

                {selectedBill.remarks && (
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Remarks</h6>
                      <p className="mb-0">{selectedBill.remarks}</p>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-top-0">
            <Button variant="light" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            {selectedBill?.status !== 'PAID' && (
              <>
                <Button 
                  variant="warning" 
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditBill(selectedBill);
                  }}
                >
                  <FaEdit className="me-2" />
                  Edit Remarks
                </Button>
                <Button 
                  variant="orange" 
                  onClick={() => {
                    setShowViewModal(false);
                    handleAddPayment(selectedBill);
                  }}
                >
                  <MdPayment className="me-2" />
                  Add Payment
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>

        {/* Edit Bill Modal - SIMPLIFIED to only edit remarks */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                  <FaEdit className="text-warning" />
                </div>
                <div>
                  <h5 className="mb-0">Edit Bill Remarks</h5>
                  <small className="text-muted">Bill #{selectedBill?.billNumber}</small>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-0">
            {selectedBill && (
              <>
                <Alert variant="info" className="border-0 bg-light mb-3">
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="bg-info bg-opacity-10 p-2 rounded-circle">
                        <FaFileInvoice className="text-info" />
                      </div>
                    </div>
                    <div>
                      <strong>Note:</strong> Only remarks can be updated for bills. 
                      Bill items (room rent, mess charges, extra items) are auto-calculated and cannot be modified.
                    </div>
                  </div>
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Remarks</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="remarks"
                    value={editForm.remarks}
                    onChange={handleEditFormChange}
                    placeholder="Update bill remarks..."
                    className="form-control-lg"
                  />
                </Form.Group>

                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-muted mb-2">Bill Information</h6>
                    <div className="mb-2">
                      <strong>Member:</strong> {getMemberName(selectedBill.member)}
                    </div>
                    <div className="mb-2">
                      <strong>Bill Month:</strong> {selectedBill.billMonth}
                    </div>
                    <div className="mb-2">
                      <strong>Total Amount:</strong> {formatCurrency(selectedBill.totalAmount)}
                    </div>
                    <div>
                      <strong>Status:</strong> <Badge bg={getStatusBadge(selectedBill.status)}>{selectedBill.status}</Badge>
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-top-0">
            <Button variant="light" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="orange" 
              onClick={handleUpdateBill}
              disabled={loadingAction || editForm.remarks === selectedBill?.remarks}
            >
              {loadingAction ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                'Update Remarks'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add Payment Modal */}
        <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                  <MdPayment className="text-success" />
                </div>
                <div>
                  <h5 className="mb-0">Add Payment</h5>
                  <small className="text-muted">Record payment for bill</small>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-0">
            {selectedBill && (
              <>
                <Card className="border-0 bg-light mb-3">
                  <Card.Body>
                    <div className="mb-2">
                      <strong>Bill #{selectedBill.billNumber}</strong>
                    </div>
                    <div className="mb-2">
                      Member: {getMemberName(selectedBill.member)}
                    </div>
                    <div className="mb-2 d-flex justify-content-between">
                      <span>Total Amount:</span>
                      <span className="fw-bold">{formatCurrency(selectedBill.totalAmount)}</span>
                    </div>
                    <div className="mb-2 d-flex justify-content-between">
                      <span>Already Paid:</span>
                      <span className="text-success">{formatCurrency(selectedBill.paidAmount)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">Due Amount:</span>
                      <span className="fw-bold text-danger">{formatCurrency(selectedBill.dueAmount)}</span>
                    </div>
                  </Card.Body>
                </Card>

                <Form.Group>
                  <Form.Label className="fw-bold">Payment Amount (₹)</Form.Label>
                  <InputGroup className="form-control-lg">
                    <InputGroup.Text className="bg-light">₹</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="amount"
                      min="1"
                      max={selectedBill.dueAmount}
                      step="1"
                      value={paymentForm.amount}
                      onChange={handlePaymentFormChange}
                      placeholder="Enter payment amount"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Maximum: {formatCurrency(selectedBill.dueAmount)}
                  </Form.Text>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-top-0">
            <Button variant="light" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="orange" 
              onClick={handleSubmitPayment}
              disabled={!paymentForm.amount || paymentForm.amount <= 0 || loadingAction}
            >
              {loadingAction ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                'Add Payment'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title>
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                  <FaTrash className="text-danger" />
                </div>
                <div>
                  <h5 className="mb-0">Confirm Delete</h5>
                  <small className="text-muted">This action cannot be undone</small>
                </div>
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-0">
            {selectedBill && (
              <>
                <Alert variant="danger" className="border-0 bg-danger bg-opacity-10">
                  <div className="d-flex">
                    <div className="me-3">
                      <FaTrash className="text-danger" />
                    </div>
                    <div>
                      <strong>Warning:</strong> Deleting this bill will remove it permanently!
                    </div>
                  </div>
                </Alert>
                
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Bill #{selectedBill.billNumber}</strong>
                    </div>
                    <div className="mb-2">
                      <strong>Member:</strong> {getMemberName(selectedBill.member)}
                    </div>
                    <div className="mb-2">
                      <strong>Bill Month:</strong> {selectedBill.billMonth}
                    </div>
                    <div className="mb-2">
                      <strong>Total Amount:</strong> {formatCurrency(selectedBill.totalAmount)}
                    </div>
                    <div className="mb-2">
                      <strong>Status:</strong> {selectedBill.status}
                    </div>
                    <div className="mb-2">
                      <strong>Paid Amount:</strong> {formatCurrency(selectedBill.paidAmount)}
                    </div>
                    {selectedBill.paidAmount > 0 && (
                      <Alert variant="warning" className="mt-3 mb-0 py-2">
                        <div className="d-flex align-items-center">
                          <span className="me-2">⚠️</span>
                          <small>
                            <strong>Note:</strong> This bill has payments recorded. Bills with payments cannot be deleted.
                          </small>
                        </div>
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                {error && (
                  <Alert variant="danger" className="mt-3">
                    <div className="d-flex align-items-center">
                      <span className="me-2">❌</span>
                      <div>
                        <strong>Error:</strong> {error}
                      </div>
                    </div>
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-top-0">
            <Button 
              variant="light" 
              onClick={() => setShowDeleteModal(false)}
              disabled={loadingAction}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmDelete}
              disabled={loadingAction || selectedBill?.paidAmount > 0}
            >
              {loadingAction ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                'Delete Bill'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
    </div>
  );
};

export default Bills;