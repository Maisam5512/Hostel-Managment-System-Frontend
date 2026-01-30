import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import { useAuthHook } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { roomService } from '../services/roomService';
import { bedService } from '../services/bedService';
import { feeService } from '../services/feeService';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuthHook();
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    totalMembers: 0,
    activeMembers: 0,
    totalCollected: 124500,
    outstandingBalance: 18200,
  });
  const [loading, setLoading] = useState(true);
  const [recentCollections, setRecentCollections] = useState([
    { id: '#REC-9921', name: 'Aadit Sharma', room: '102', date: 'Jan 20, 2026', amount: '₹8,500', status: 'Paid' },
    { id: '#REC-9922', name: 'Usman Khan', room: '204', date: 'Jan 19, 2026', amount: '₹4,000', status: 'Partial' },
    { id: '#REC-9923', name: 'Hamza Ali', room: '108', date: 'Jan 18, 2026', amount: '₹8,500', status: 'Paid' },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const roomsResponse = await roomService.getAllRooms();
      const totalRooms = roomsResponse?.count || 0;
      const availableRooms = roomsResponse?.data?.filter(room => room.status === 'AVAILABLE').length || 0;
      
      const bedsResponse = await bedService.getAllBeds();
      const totalBeds = bedsResponse?.count || 0;
      const occupiedBeds = bedsResponse?.data?.filter(bed => bed.status === 'OCCUPIED').length || 0;
      
      setStats({
        ...stats,
        totalRooms,
        availableRooms,
        totalBeds,
        occupiedBeds,
        totalMembers: 120,
        activeMembers: 110,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  const statsCards = [
    { title: 'Total Rooms', value: stats.totalRooms, icon: '🏠', color: 'primary', subtitle: `${stats.availableRooms} available` },
    { title: 'Total Beds', value: stats.totalBeds, icon: '🛏️', color: 'success', subtitle: `${stats.occupiedBeds} occupied` },
    { title: 'Total Members', value: stats.totalMembers, icon: '👥', color: 'warning', subtitle: `${stats.activeMembers} active` },
    { title: 'Fee Collection', value: `₹${stats.totalCollected.toLocaleString()}`, icon: '💰', color: 'info', subtitle: 'This month' },
  ];

  const featureCards = [
    { title: 'Member Management', description: 'Manage residents and room allocations', icon: '👥', link: '/members' },
    { title: 'Room Allocation', description: 'Assign rooms and beds to members', icon: '🏠', link: '/rooms' },
    { title: 'Fee Collection', description: 'Collect and track payments', icon: '💰', link: '/fees' },
    { title: 'Reports', description: 'Generate system reports', icon: '📊', link: '/reports' },
  ];

  // Add this function in the Dashboard component
const fetchFeeStats = async () => {
  try {
    // In real app: const response = await feeService.getFeeSummary();
    const mockStats = {
      totalCollected: 124500,
      outstandingBalance: 18200,
      pendingPayments: 8,
      thisMonthCollection: 45000
    };
    
    setStats(prev => ({
      ...prev,
      totalCollected: mockStats.totalCollected,
      outstandingBalance: mockStats.outstandingBalance
    }));
  } catch (error) {
    console.error('Error fetching fee stats:', error);
  }
};

// Call fetchFeeStats in your useEffect
useEffect(() => {
  fetchDashboardData();
  fetchFeeStats(); // Add this line
}, []);

  return (
    <Layout>
      {/* Dashboard Header */}
      <div className="mb-3">
        <h2 className="text-dark mb-1">2026 Dashboard Overview</h2>
        <p className="text-muted mb-3">Welcome back, {user?.fullName || 'Admin'}!</p>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-3">
        {statsCards.map((stat, index) => (
          <Col md={3} key={index}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h6 className="text-muted mb-1 small">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                  </div>
                  <div className={`bg-${stat.color}-light p-2 rounded-circle`}>
                    <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                  </div>
                </div>
                <p className="text-muted small mb-0">{stat.subtitle}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-2">
        {/* Left Column - Features */}
        <Col lg={8}>
          {/* Feature Cards */}
          <Card className="border-0 shadow-sm mb-2">
            <Card.Body className="p-2">
              <h5 className="text-dark mb-2">Quick Access</h5>
              <Row>
                {featureCards.map((feature, index) => (
                  <Col md={6} key={index}>
                    <Card className="border mb-1" style={{ cursor: 'pointer' }} onClick={() => window.location.href = feature.link}>
                      <Card.Body className="p-2 d-flex align-items-center">
                        <div className="me-2">
                          <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                        </div>
                        <div>
                          <h6 className="mb-0 small">{feature.title}</h6>
                          <p className="text-muted small mb-0">{feature.description}</p>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Recent Fee Collections Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="text-dark mb-0">Recent Fee Collections</h5>
                <Badge bg="light" text="dark" className="px-2 py-1">
                  <span className="me-1">📅</span> Last 7 days
                </Badge>
              </div>
              
              <div className="table-responsive">
                <Table hover className="mb-0 small">
                  <thead className="bg-light">
                    <tr>
                      <th>Receipt ID</th>
                      <th>Member Name</th>
                      <th>Room</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCollections.map((collection, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{collection.id}</td>
                        <td>{collection.name}</td>
                        <td>{collection.room}</td>
                        <td>{collection.date}</td>
                        <td className="fw-bold">{collection.amount}</td>
                        <td>
                          <Badge bg={collection.status === 'Paid' ? 'success' : 'warning'} className="px-2 py-1">
                            {collection.status}
                          </Badge>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary py-0 px-2">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Financial Summary */}
        <Col lg={4}>
          {/* Outstanding Balance */}
          <Card className="border-0 shadow-sm mb-2">
            <Card.Body className="p-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-dark mb-0">Outstanding Balance</h6>
                <span className="text-danger">⚠️</span>
              </div>
              <h2 className="text-danger mb-1">₹{stats.outstandingBalance.toLocaleString()}</h2>
              <p className="text-muted small mb-2">8 members pending payment</p>
              <div>
                <button className="btn btn-sm btn-outline-danger w-100 py-1">
                  Send Reminders
                </button>
              </div>
            </Card.Body>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-sm mb-2">
            <Card.Body className="p-2">
              <h6 className="text-dark mb-2">System Status</h6>
              <div className="d-flex justify-content-between mb-1 small">
                <span className="text-muted">Database</span>
                <Badge bg="success" className="py-1 px-2">Connected</Badge>
              </div>
              <div className="d-flex justify-content-between mb-1 small">
                <span className="text-muted">API Services</span>
                <Badge bg="success" className="py-1 px-2">Online</Badge>
              </div>
              <div className="d-flex justify-content-between mb-1 small">
                <span className="text-muted">Uptime</span>
                <span className="fw-bold">99.8%</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Active Sessions</span>
                <span className="fw-bold">3</span>
              </div>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-2">
              <h6 className="text-dark mb-2">Quick Actions</h6>
              <div className="d-grid gap-1">
                <button className="btn btn-outline-orange py-1">
                  <span className="me-1">➕</span> Add New Member
                </button>
                <button className="btn btn-outline-orange py-1">
                  <span className="me-1">🏠</span> Allocate Room
                </button>
                <button className="btn btn-outline-orange py-1">
                  <span className="me-1">💰</span> Collect Fee
                </button>
                <button className="btn btn-outline-orange py-1">
                  <span className="me-1">📊</span> Generate Report
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default Dashboard;