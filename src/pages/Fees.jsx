import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, Tabs, Tab, InputGroup } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { useForm } from '../hooks/useForm';
import { feeService } from '../services/feeService';
import { memberService } from '../services/memberService';
import { roomService } from '../services/roomService';

const Fees = () => {
  const { callApi, loading, error, data } = useApi();
  const [fees, setFees] = useState([]);
  const [members, setMembers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerateFeeModal, setShowGenerateFeeModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);

  const paymentForm = useForm({
    amount: 0,
    paymentMethod: 'CASH',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const feeForm = useForm({
    memberId: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    amount: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Monthly Hostel Fee',
    lateFee: 0
  });

  useEffect(() => {
    fetchFees();
    fetchMembers();
    fetchRooms();
  }, []);

  // Mock data for development
  const mockFees = [
    {
      _id: '1',
      member: {
        _id: 'm1',
        user: { fullName: 'John Doe', email: 'john@example.com' },
        registrationNumber: 'REG001'
      },
      month: '2026-01',
      amount: 15000,
      paidAmount: 15000,
      dueDate: '2026-01-30',
      status: 'PAID',
      payments: [
        {
          amount: 15000,
          paymentMethod: 'CASH',
          paymentDate: '2026-01-15',
          transactionId: 'TXN001'
        }
      ],
      createdAt: '2026-01-01'
    },
    {
      _id: '2',
      member: {
        _id: 'm2',
        user: { fullName: 'Jane Smith', email: 'jane@example.com' },
        registrationNumber: 'REG002'
      },
      month: '2026-01',
      amount: 15000,
      paidAmount: 10000,
      dueDate: '2026-01-30',
      status: 'PARTIAL',
      payments: [
        {
          amount: 10000,
          paymentMethod: 'BANK_TRANSFER',
          paymentDate: '2026-01-20',
          transactionId: 'TXN002'
        }
      ],
      createdAt: '2026-01-01'
    },
    {
      _id: '3',
      member: {
        _id: 'm3',
        user: { fullName: 'Bob Wilson', email: 'bob@example.com' },
        registrationNumber: 'REG003'
      },
      month: '2026-01',
      amount: 12000,
      paidAmount: 0,
      dueDate: '2026-01-30',
      status: 'PENDING',
      payments: [],
      createdAt: '2026-01-01'
    }
  ];

  const mockMembers = [
    {
      _id: 'm1',
      user: { fullName: 'John Doe', email: 'john@example.com' },
      registrationNumber: 'REG001',
      monthlyRent: 15000,
      totalDue: 0,
      currentRoom: { roomNumber: 'A-101' }
    },
    {
      _id: 'm2',
      user: { fullName: 'Jane Smith', email: 'jane@example.com' },
      registrationNumber: 'REG002',
      monthlyRent: 15000,
      totalDue: 5000,
      currentRoom: { roomNumber: 'A-102' }
    },
    {
      _id: 'm3',
      user: { fullName: 'Bob Wilson', email: 'bob@example.com' },
      registrationNumber: 'REG003',
      monthlyRent: 12000,
      totalDue: 12000,
      currentRoom: { roomNumber: 'B-101' }
    }
  ];

  const fetchFees = async () => {
    try {
      // In real app: const response = await feeService.getAllFees();
      // For now, use mock data
      setFees(mockFees);
    } catch (err) {
      console.error('Error fetching fees:', err);
      setFees(mockFees); // Fallback to mock data
    }
  };

  const fetchMembers = async () => {
    try {
      // In real app: const response = await memberService.getAllMembers();
      setMembers(mockMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
      setMembers(mockMembers);
    }
  };

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

  const handleRecordPayment = async (formData) => {
    try {
      // In real app: await feeService.recordPayment(selectedFee._id, formData);
      const mockResponse = { success: true, message: 'Payment recorded successfully' };
      
      if (mockResponse.success) {
        setSuccessMessage('Payment recorded successfully!');
        setShowPaymentModal(false);
        paymentForm.resetForm();
        fetchFees();
        fetchMembers(); // Update member's total due
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error recording payment:', err);
    }
  };

  const handleGenerateFee = async (formData) => {
    try {
      // In real app: await feeService.createFee(formData);
      const mockResponse = { success: true, message: 'Fee generated successfully' };
      
      if (mockResponse.success) {
        setSuccessMessage('Fee generated successfully!');
        setShowGenerateFeeModal(false);
        feeForm.resetForm();
        fetchFees();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error generating fee:', err);
    }
  };

  const handleGenerateInvoice = async (fee) => {
    try {
      setSelectedFee(fee);
      // In real app: const response = await feeService.generateInvoice(fee._id);
      const mockInvoice = {
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        member: fee.member,
        month: fee.month,
        amount: fee.amount,
        paidAmount: fee.paidAmount,
        balance: fee.amount - fee.paidAmount,
        dueDate: fee.dueDate,
        items: [
          { description: 'Monthly Hostel Rent', amount: fee.amount * 0.8 },
          { description: 'Mess Charges', amount: fee.amount * 0.2 },
          { description: 'Electricity', amount: 500 },
          { description: 'Water Charges', amount: 300 }
        ],
        payments: fee.payments,
        generatedDate: new Date().toISOString().split('T')[0]
      };
      setInvoiceData(mockInvoice);
      setShowInvoiceModal(true);
    } catch (err) {
      console.error('Error generating invoice:', err);
    }
  };

  const handleSendReminder = async (member) => {
    if (window.confirm(`Send payment reminder to ${member.user.fullName}?`)) {
      try {
        // In real app: await feeService.sendReminder(member._id);
        setSuccessMessage(`Payment reminder sent to ${member.user.fullName}!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error sending reminder:', err);
      }
    }
  };

  const handleDeleteFee = async () => {
    try {
      // In real app: await feeService.deleteFee(selectedFee._id);
      const mockResponse = { success: true, message: 'Fee record deleted successfully' };
      
      if (mockResponse.success) {
        setSuccessMessage('Fee record deleted successfully!');
        setShowDeleteModal(false);
        setSelectedFee(null);
        fetchFees();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting fee:', err);
    }
  };

  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    const remaining = fee.amount - fee.paidAmount;
    paymentForm.setValues({
      amount: remaining,
      paymentMethod: 'CASH',
      transactionId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: `Payment for ${fee.month}`
    });
    setShowPaymentModal(true);
  };

  const openGenerateFeeModal = (member) => {
    setSelectedMember(member);
    feeForm.setValues({
      memberId: member._id,
      month: new Date().toISOString().slice(0, 7),
      amount: member.monthlyRent || 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Monthly Hostel Fee',
      lateFee: 0
    });
    setShowGenerateFeeModal(true);
  };

  const openDeleteModal = (fee) => {
    setSelectedFee(fee);
    setShowDeleteModal(true);
  };

  const handleMemberChange = (memberId) => {
    const member = members.find(m => m._id === memberId);
    if (member) {
      feeForm.setValues({
        ...feeForm.values,
        memberId: member._id,
        amount: member.monthlyRent || 0
      });
    }
  };

  const statusOptions = [
    { value: 'PAID', label: 'Paid', color: 'success', icon: '✅' },
    { value: 'PARTIAL', label: 'Partial', color: 'warning', icon: '⚠️' },
    { value: 'PENDING', label: 'Pending', color: 'danger', icon: '⏰' },
    { value: 'OVERDUE', label: 'Overdue', color: 'danger', icon: '❗' }
  ];

  const paymentMethodOptions = [
    { value: 'CASH', label: 'Cash', icon: '💵' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦' },
    { value: 'CHEQUE', label: 'Cheque', icon: '📄' },
    { value: 'ONLINE', label: 'Online Payment', icon: '🌐' },
    { value: 'CARD', label: 'Credit/Debit Card', icon: '💳' }
  ];

  const months = [
    '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
    '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'
  ];

  // Calculate statistics
  const calculateStats = () => {
    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
    const totalPending = totalAmount - totalPaid;
    const pendingFees = fees.filter(fee => fee.status !== 'PAID').length;
    
    return {
      totalAmount,
      totalPaid,
      totalPending,
      pendingFees,
      collectionRate: totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0
    };
  };

  const stats = calculateStats();

  // Filter fees based on active tab and filters
  const filteredFees = fees.filter(fee => {
    // Tab filtering
    if (activeTab === 'pending' && fee.status === 'PAID') return false;
    if (activeTab === 'overdue' && fee.status !== 'OVERDUE') return false;
    if (activeTab === 'paid' && fee.status !== 'PAID') return false;
    
    // Search filtering
    if (searchTerm && !fee.member.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !fee.member.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Month filtering
    if (filterMonth && fee.month !== filterMonth) return false;
    
    // Status filtering
    if (filterStatus && fee.status !== filterStatus) return false;
    
    return true;
  });

  // Filter members with pending dues
  const membersWithDues = members.filter(member => member.totalDue > 0);

  if (loading && fees.length === 0) {
    return (
      <Layout>
        <LoadingSpinner message="Loading fee records..." />
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
                <h2 className="text-dark mb-1">Fee & Billing Management</h2>
                <p className="text-muted">Manage hostel fees, payments, and invoices</p>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-orange" 
                  onClick={() => setShowGenerateFeeModal(true)}
                  className="d-flex align-items-center"
                >
                  <span className="me-2">📄</span> Generate Fee
                </Button>
                <Button 
                  variant="orange" 
                  onClick={() => window.print()}
                  className="d-flex align-items-center"
                >
                  <span className="me-2">🖨️</span> Print Report
                </Button>
              </div>
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
                    <h6 className="text-muted mb-1">Total Collection</h6>
                    <h3 className="mb-0">₹{stats.totalPaid.toLocaleString()}</h3>
                  </div>
                  <div className="bg-success-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>💰</span>
                  </div>
                </div>
                <p className="text-muted small mb-0">
                  Collection Rate: <strong>{stats.collectionRate}%</strong>
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Pending Amount</h6>
                    <h3 className="mb-0">₹{stats.totalPending.toLocaleString()}</h3>
                  </div>
                  <div className="bg-warning-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>⏰</span>
                  </div>
                </div>
                <p className="text-muted small mb-0">
                  <strong>{stats.pendingFees}</strong> pending fees
                </p>
              </Card.Body>
            </Card>
          </Col>
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
                <p className="text-muted small mb-0">
                  <strong>{membersWithDues.length}</strong> with dues
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">This Month</h6>
                    <h3 className="mb-0">
                      ₹{fees
                        .filter(f => f.month === new Date().toISOString().slice(0, 7))
                        .reduce((sum, f) => sum + f.amount, 0)
                        .toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-info-light p-2 rounded-circle">
                    <span style={{ fontSize: '20px' }}>📅</span>
                  </div>
                </div>
                <p className="text-muted small mb-0">
                  {new Date().toLocaleString('default', { month: 'long' })}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs and Filters */}
        <Row className="mb-3">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-0"
                  >
                    <Tab eventKey="all" title={
                      <span>
                        <span className="me-1">📋</span> All Fees
                      </span>
                    } />
                    <Tab eventKey="pending" title={
                      <span>
                        <span className="me-1">⏰</span> Pending
                        <Badge bg="warning" className="ms-2">{fees.filter(f => f.status !== 'PAID').length}</Badge>
                      </span>
                    } />
                    <Tab eventKey="overdue" title={
                      <span>
                        <span className="me-1">❗</span> Overdue
                        <Badge bg="danger" className="ms-2">{fees.filter(f => f.status === 'OVERDUE').length}</Badge>
                      </span>
                    } />
                    <Tab eventKey="paid" title={
                      <span>
                        <span className="me-1">✅</span> Paid
                        <Badge bg="success" className="ms-2">{fees.filter(f => f.status === 'PAID').length}</Badge>
                      </span>
                    } />
                    <Tab eventKey="members" title={
                      <span>
                        <span className="me-1">👥</span> Members with Dues
                        <Badge bg="danger" className="ms-2">{membersWithDues.length}</Badge>
                      </span>
                    } />
                  </Tabs>
                </div>

                <Row>
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>
                        <span>🔍</span>
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Search by name or registration..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                    >
                      <option value="">All Months</option>
                      {months.map(month => (
                        <option key={month} value={month}>
                          {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2} className="d-flex align-items-center justify-content-end">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setSearchTerm('');
                        setFilterMonth('');
                        setFilterStatus('');
                      }}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Fees Table */}
        {activeTab !== 'members' && (
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Member Details</th>
                          <th>Month</th>
                          <th>Amount</th>
                          <th>Paid</th>
                          <th>Balance</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFees.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-4">
                              No fee records found
                            </td>
                          </tr>
                        ) : (
                          filteredFees.map((fee) => {
                            const statusOption = statusOptions.find(s => s.value === fee.status);
                            const balance = fee.amount - fee.paidAmount;
                            const isOverdue = new Date(fee.dueDate) < new Date() && balance > 0;
                            
                            return (
                              <tr key={fee._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="me-2">
                                      <div className="bg-orange text-white rounded-circle d-flex align-items-center justify-content-center" 
                                        style={{ width: '36px', height: '36px' }}>
                                        {fee.member.user.fullName?.charAt(0).toUpperCase() || 'M'}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="fw-bold">{fee.member.user.fullName}</div>
                                      <div className="small text-muted">
                                        {fee.member.registrationNumber} • Room: {fee.member.currentRoom?.roomNumber || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <Badge bg="info" className="px-2 py-1">
                                    {new Date(fee.month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="fw-bold">₹{fee.amount.toLocaleString()}</div>
                                </td>
                                <td>
                                  <div className="fw-bold text-success">₹{fee.paidAmount.toLocaleString()}</div>
                                </td>
                                <td>
                                  <div className={`fw-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                                    ₹{balance.toLocaleString()}
                                  </div>
                                </td>
                                <td>
                                  <div className={isOverdue ? 'text-danger fw-bold' : ''}>
                                    {new Date(fee.dueDate).toLocaleDateString()}
                                    {isOverdue && <span className="ms-1">❗</span>}
                                  </div>
                                </td>
                                <td>
                                  <Badge 
                                    bg={statusOption?.color || 'secondary'} 
                                    className="px-2 py-1"
                                  >
                                    {statusOption?.icon} {fee.status}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="d-flex flex-column gap-1">
                                    {balance > 0 && (
                                      <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => openPaymentModal(fee)}
                                      >
                                        💰 Collect
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => handleGenerateInvoice(fee)}
                                    >
                                      📄 Invoice
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => openDeleteModal(fee)}
                                      disabled={fee.paidAmount > 0}
                                    >
                                      🗑️ Delete
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
        )}

        {/* Members with Dues Table */}
        {activeTab === 'members' && (
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Member Details</th>
                          <th>Room</th>
                          <th>Monthly Rent</th>
                          <th>Total Due</th>
                          <th>Last Payment</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {membersWithDues.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4">
                              No members with pending dues
                            </td>
                          </tr>
                        ) : (
                          membersWithDues.map((member) => {
                            const memberFees = fees.filter(f => f.member._id === member._id);
                            const lastPayment = memberFees
                              .flatMap(f => f.payments)
                              .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0];
                            
                            return (
                              <tr key={member._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="me-2">
                                      <div className="bg-orange text-white rounded-circle d-flex align-items-center justify-content-center" 
                                        style={{ width: '36px', height: '36px' }}>
                                        {member.user.fullName?.charAt(0).toUpperCase() || 'M'}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="fw-bold">{member.user.fullName}</div>
                                      <div className="small text-muted">
                                        {member.registrationNumber} • {member.user.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <Badge bg="info" className="px-2 py-1">
                                    {member.currentRoom?.roomNumber || 'N/A'}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="fw-bold">₹{member.monthlyRent?.toLocaleString()}</div>
                                </td>
                                <td>
                                  <div className="fw-bold text-danger">₹{member.totalDue?.toLocaleString()}</div>
                                </td>
                                <td>
                                  {lastPayment ? (
                                    <div>
                                      <div>₹{lastPayment.amount.toLocaleString()}</div>
                                      <div className="small text-muted">
                                        {new Date(lastPayment.paymentDate).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-warning">No payments</span>
                                  )}
                                </td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => {
                                        const memberFee = fees.find(f => 
                                          f.member._id === member._id && 
                                          f.amount - f.paidAmount > 0
                                        );
                                        if (memberFee) {
                                          openPaymentModal(memberFee);
                                        } else {
                                          // Create a new fee record
                                          openGenerateFeeModal(member);
                                        }
                                      }}
                                    >
                                      💰 Collect
                                    </Button>
                                    <Button
                                      variant="outline-warning"
                                      size="sm"
                                      onClick={() => handleSendReminder(member)}
                                    >
                                      📧 Remind
                                    </Button>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => openGenerateFeeModal(member)}
                                    >
                                      📄 Generate Fee
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
        )}

        {/* Quick Stats Footer */}
        <Row className="mt-3">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <Row>
                  <Col md={3} className="text-center">
                    <div className="small text-muted">Total Records</div>
                    <div className="h4 mb-0">{fees.length}</div>
                  </Col>
                  <Col md={3} className="text-center">
                    <div className="small text-muted">Total Amount</div>
                    <div className="h4 mb-0">₹{stats.totalAmount.toLocaleString()}</div>
                  </Col>
                  <Col md={3} className="text-center">
                    <div className="small text-muted">Collection Rate</div>
                    <div className="h4 mb-0">{stats.collectionRate}%</div>
                  </Col>
                  <Col md={3} className="text-center">
                    <div className="small text-muted">Avg. Payment Time</div>
                    <div className="h4 mb-0">5 days</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Record Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Record Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFee && (
            <div className="mb-3">
              <p>Member: <strong>{selectedFee.member.user.fullName}</strong></p>
              <p>Month: <Badge bg="info">{selectedFee.month}</Badge></p>
              <p>Total Amount: <strong>₹{selectedFee.amount.toLocaleString()}</strong></p>
              <p>Already Paid: <strong className="text-success">₹{selectedFee.paidAmount.toLocaleString()}</strong></p>
              <p>Balance Due: <strong className="text-danger">₹{(selectedFee.amount - selectedFee.paidAmount).toLocaleString()}</strong></p>
              <hr />
            </div>
          )}
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleRecordPayment(paymentForm.values);
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Payment Amount (₹) *</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={paymentForm.values.amount}
                onChange={paymentForm.handleChange}
                min="1"
                max={selectedFee ? selectedFee.amount - selectedFee.paidAmount : 999999}
                required
              />
              <Form.Text className="text-muted">
                Maximum: ₹{selectedFee ? (selectedFee.amount - selectedFee.paidAmount).toLocaleString() : '0'}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method *</Form.Label>
              <Form.Select
                name="paymentMethod"
                value={paymentForm.values.paymentMethod}
                onChange={paymentForm.handleChange}
                required
              >
                {paymentMethodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Transaction ID</Form.Label>
              <Form.Control
                type="text"
                name="transactionId"
                value={paymentForm.values.transactionId}
                onChange={paymentForm.handleChange}
                placeholder="e.g., TXN123456"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Date *</Form.Label>
              <Form.Control
                type="date"
                name="paymentDate"
                value={paymentForm.values.paymentDate}
                onChange={paymentForm.handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={paymentForm.values.notes}
                onChange={paymentForm.handleChange}
                placeholder="Additional notes about this payment..."
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? 'Processing...' : '💰 Record Payment'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Generate Fee Modal */}
      <Modal show={showGenerateFeeModal} onHide={() => setShowGenerateFeeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generate Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleGenerateFee(feeForm.values);
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Select Member *</Form.Label>
              <Form.Select
                name="memberId"
                value={feeForm.values.memberId}
                onChange={(e) => handleMemberChange(e.target.value)}
                required
              >
                <option value="">Select a member</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.user.fullName} ({member.registrationNumber}) - ₹{member.monthlyRent}/month
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Month *</Form.Label>
                  <Form.Control
                    type="month"
                    name="month"
                    value={feeForm.values.month}
                    onChange={feeForm.handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={feeForm.values.dueDate}
                    onChange={feeForm.handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Amount (₹) *</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={feeForm.values.amount}
                onChange={feeForm.handleChange}
                min="1"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Late Fee (₹)</Form.Label>
              <Form.Control
                type="number"
                name="lateFee"
                value={feeForm.values.lateFee}
                onChange={feeForm.handleChange}
                min="0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={feeForm.values.description}
                onChange={feeForm.handleChange}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowGenerateFeeModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Generating...' : '📄 Generate Fee'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Invoice Modal */}
      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Invoice #{invoiceData?.invoiceNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {invoiceData && (
            <div className="invoice-container">
              {/* Invoice Header */}
              <div className="text-center mb-4">
                <h3 className="text-orange">🏨 HOSTEL MANAGEMENT SYSTEM</h3>
                <p className="text-muted mb-0">Hostel Fee Invoice</p>
              </div>

              {/* Invoice Details */}
              <Row className="mb-4">
                <Col md={6}>
                  <div className="border p-3 rounded">
                    <h6 className="border-bottom pb-2">Bill To:</h6>
                    <p className="mb-1"><strong>{invoiceData.member.user.fullName}</strong></p>
                    <p className="mb-1">Registration: {invoiceData.member.registrationNumber}</p>
                    <p className="mb-1">Room: {invoiceData.member.currentRoom?.roomNumber || 'N/A'}</p>
                    <p className="mb-0">Email: {invoiceData.member.user.email}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="border p-3 rounded">
                    <h6 className="border-bottom pb-2">Invoice Details:</h6>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Invoice #:</span>
                      <strong>{invoiceData.invoiceNumber}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Month:</span>
                      <strong>{new Date(invoiceData.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Due Date:</span>
                      <strong>{new Date(invoiceData.dueDate).toLocaleDateString()}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-0">
                      <span>Generated:</span>
                      <strong>{new Date(invoiceData.generatedDate).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Invoice Items */}
              <div className="table-responsive mb-4">
                <Table bordered>
                  <thead className="bg-light">
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th className="text-end">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.description}</td>
                        <td className="text-end">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2} className="text-end"><strong>Total:</strong></td>
                      <td className="text-end"><strong>₹{invoiceData.amount.toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-end"><strong>Paid:</strong></td>
                      <td className="text-end text-success"><strong>₹{invoiceData.paidAmount.toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="text-end"><strong>Balance Due:</strong></td>
                      <td className="text-end text-danger"><strong>₹{invoiceData.balance.toLocaleString()}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {/* Payment History */}
              {invoiceData.payments.length > 0 && (
                <div className="mb-4">
                  <h6 className="border-bottom pb-2">Payment History:</h6>
                  <div className="table-responsive">
                    <Table size="sm" bordered>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Method</th>
                          <th>Transaction ID</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.payments.map((payment, index) => (
                          <tr key={index}>
                            <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                            <td>{payment.paymentMethod}</td>
                            <td>{payment.transactionId || 'N/A'}</td>
                            <td className="text-end">₹{payment.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Invoice Footer */}
              <div className="border-top pt-3 text-center">
                <p className="text-muted small mb-2">
                  Thank you for your payment. Please keep this invoice for your records.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                    🖨️ Print Invoice
                  </Button>
                  <Button variant="outline-success" size="sm" onClick={() => {
                    if (invoiceData.balance > 0) {
                      setShowInvoiceModal(false);
                      const fee = fees.find(f => f._id === selectedFee?._id);
                      if (fee) openPaymentModal(fee);
                    }
                  }}>
                    💰 Pay Now
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowInvoiceModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Fee Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFee && (
            <div className="mb-3">
              <Alert variant="danger">
                <h5>⚠️ Warning!</h5>
                <p>Are you sure you want to delete fee record for <strong>{selectedFee.member.user.fullName}</strong>?</p>
                <p className="mb-0">
                  Month: {selectedFee.month} | Amount: ₹{selectedFee.amount.toLocaleString()}
                </p>
              </Alert>
              <div className="small text-muted">
                <p><strong>Note:</strong> This action cannot be undone. If payments have been recorded, this record cannot be deleted.</p>
              </div>
            </div>
          )}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteFee} 
              disabled={loading || (selectedFee?.paidAmount || 0) > 0}
            >
              {loading ? 'Deleting...' : 'Delete Record'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default Fees;