// import React, { useState, useEffect } from 'react';
// import { Row, Col, Card, Badge, Button, Alert, ProgressBar } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';                 // 👈 required for redirect
// import Layout from '../components/layout/Layout';
// import { useAuthHook } from '../hooks/useAuth';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import { dashboardService } from '../services/dashboardService';
// import { ROLES, DEFAULT_ROUTES } from '../constants/roles';    // 👈 MUST be imported

// const Dashboard = () => {
//   const { user, loading: authLoading, hasRole } = useAuthHook();
//   const navigate = useNavigate();                               // 👈 required
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [stats, setStats] = useState(null);

//   // ---------- ONLY ADMIN CAN ACCESS DASHBOARD ----------
//   const redirectNonAdmin = () => {
//     const roleCode = hasRole(ROLES.ACCOUNTANT) ? ROLES.ACCOUNTANT :
//                      hasRole(ROLES.MESS_INCHARGE) ? ROLES.MESS_INCHARGE :
//                      hasRole(ROLES.SECURITY) ? ROLES.SECURITY :
//                      hasRole(ROLES.MEMBER) ? ROLES.MEMBER :
//                      hasRole(ROLES.MANAGER) ? ROLES.MANAGER : null;
//     const defaultRoute = DEFAULT_ROUTES[roleCode] || '/bills';
//     navigate(defaultRoute, { replace: true });
//   };

//   const fetchDashboardStats = async () => {
//     // 👇 EARLY EXIT – non‑admin users never call the API
//     if (!hasRole(ROLES.ADMIN)) {
//       redirectNonAdmin();
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await dashboardService.getDashboardStats();
      
//       if (response.success && response.data) {
//         setStats(response.data);
//       } else {
//         setError('Failed to load dashboard statistics');
//       }
//     } catch (err) {
//       console.error('Error fetching dashboard stats:', err);

//       // Handle 403 / permission errors (should not happen due to early exit, but safe)
//       if (err.message?.includes('403') || 
//           err.message?.includes('Access denied') || 
//           err.message?.includes('permission')) {
//         redirectNonAdmin();
//         return;
//       }
      
//       // Other error types
//       if (err.message?.includes('Network error')) {
//         setError('Cannot connect to server. Please check your internet connection.');
//       } else if (err.message?.includes('401') || err.message?.includes('Session expired')) {
//         setError('Your session has expired. Please login again.');
//       } else if (err.message?.includes('404')) {
//         setError('Dashboard data not available yet. Please refresh to generate stats.');
//       } else {
//         setError(err.message || 'Failed to load dashboard data');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshDashboardStats = async () => {
//     if (!hasRole(ROLES.ADMIN)) {
//       redirectNonAdmin();
//       return;
//     }
//     try {
//       setRefreshing(true);
//       const response = await dashboardService.refreshDashboardStats();
//       if (response.success && response.data) {
//         setStats(response.data);
//         setError(null);
//       } else {
//         setError('Failed to refresh dashboard');
//       }
//     } catch (err) {
//       console.error('Error refreshing dashboard:', err);
//       setError(err.message || 'Failed to refresh dashboard');
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardStats();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------- LOADING STATE ----------
//   if (authLoading || (loading && !stats && hasRole(ROLES.ADMIN))) {
//     return (
//       <Layout>
//         <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
//           <LoadingSpinner />
//         </div>
//       </Layout>
//     );
//   }

//   // ---------- NON‑ADMIN USERS – REDIRECT (FALLBACK) ----------
//   if (!hasRole(ROLES.ADMIN)) {
//     redirectNonAdmin();
//     return null;
//   }

//   // ---------- ERROR STATE (ADMIN ONLY) ----------
//   if (error && !stats) {
//     return (
//       <Layout>
//         <div className="mb-4">
//           <h2 className="text-dark mb-1">Dashboard Overview</h2>
//           <p className="text-muted mb-3">Welcome back, {user?.fullName || 'Admin'}!</p>
//         </div>
//         <Card className="border-0 shadow-sm">
//           <Card.Body className="text-center py-5">
//             <div className="mb-4">
//               <span style={{ fontSize: '64px' }}>📊</span>
//             </div>
//             <h4 className="text-danger mb-3">Unable to Load Dashboard</h4>
//             <p className="text-muted mb-4">{error}</p>
//             <div className="d-flex justify-content-center gap-3">
//               <Button variant="primary" onClick={fetchDashboardStats} disabled={loading}>
//                 Retry
//               </Button>
//               <Button variant="outline-primary" onClick={refreshDashboardStats} disabled={refreshing}>
//                 {refreshing ? 'Refreshing...' : 'Generate Stats'}
//               </Button>
//             </div>
//           </Card.Body>
//         </Card>
//       </Layout>
//     );
//   }

//   // ---------- ADMIN DASHBOARD RENDERING (UNCHANGED) ----------
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount || 0);
//   };

//   const mainStatsCards = [
//     {
//       title: 'Total Members',
//       value: stats?.members?.total || 0,
//       icon: '👥',
//       color: 'primary',
//       subtitle: `${stats?.members?.active || 0} active`,
//       progress: stats?.members?.total ? (stats.members.active / stats.members.total) * 100 : 0
//     },
//     {
//       title: 'Rooms',
//       value: stats?.rooms?.totalRooms || 0,
//       icon: '🏠',
//       color: 'success',
//       subtitle: `${stats?.rooms?.availableRooms || 0} available`,
//       progress: stats?.rooms?.totalRooms ? ((stats.rooms.totalRooms - stats.rooms.availableRooms) / stats.rooms.totalRooms) * 100 : 0
//     },
//     {
//       title: 'Beds',
//       value: stats?.beds?.totalBeds || 0,
//       icon: '🛏️',
//       color: 'warning',
//       subtitle: `${stats?.beds?.occupiedBeds || 0} occupied`,
//       progress: stats?.beds?.totalBeds ? (stats.beds.occupiedBeds / stats.beds.totalBeds) * 100 : 0
//     },
//     {
//       title: 'Total Revenue',
//       value: formatCurrency(stats?.billing?.totalRevenue || 0),
//       icon: '💰',
//       color: 'info',
//       subtitle: `${formatCurrency(stats?.billing?.totalDue || 0)} pending`,
//       progress: stats?.billing?.totalRevenue ? (stats.billing.totalRevenue / (stats.billing.totalRevenue + stats.billing.totalDue)) * 100 : 0
//     },
//   ];

//   const messStatsCards = [
//     { title: "Today's Orders", value: stats?.mess?.todayOrders || 0, icon: '📝', color: 'primary' },
//     { title: "Today's Revenue", value: formatCurrency(stats?.mess?.todayRevenue || 0), icon: '💰', color: 'success' },
//     { title: 'Month Revenue', value: formatCurrency(stats?.mess?.monthRevenue || 0), icon: '📈', color: 'warning' },
//   ];

//   const billingStats = {
//     paid: stats?.billing?.paidBills || 0,
//     unpaid: stats?.billing?.unpaidBills || 0,
//     partial: stats?.billing?.partialBills || 0,
//     total: stats?.billing?.totalBills || 0
//   };

//   const visitorStats = {
//     today: stats?.visitors?.todayVisitors || 0,
//     inside: stats?.visitors?.currentlyInside || 0
//   };

//   const bedAssignmentStats = {
//     active: stats?.bedAssignments?.active || 0,
//     closed: stats?.bedAssignments?.closed || 0
//   };

//   const userRoles = stats?.users?.byRole || [];

//   return (
//     <Layout>
//       <div className="mb-4">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <div>
//             <h2 className="text-dark mb-1">Dashboard Overview</h2>
//             <p className="text-muted mb-0">
//               Welcome back, <strong>{user?.fullName || 'Admin'}</strong>!
//               {stats?.lastUpdatedAt && (
//                 <span className="ms-3 text-muted small">
//                   Last updated: {formatDate(stats.lastUpdatedAt)}
//                 </span>
//               )}
//             </p>
//           </div>
//           <Button 
//             variant="outline-primary" 
//             size="sm"
//             onClick={refreshDashboardStats}
//             disabled={refreshing}
//             className="d-flex align-items-center gap-2"
//           >
//             {refreshing ? (
//               <>
//                 <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//                 Refreshing...
//               </>
//             ) : (
//               <>
//                 <span>🔄</span>
//                 Refresh Stats
//               </>
//             )}
//           </Button>
//         </div>

//         {error && (
//           <Alert variant="warning" dismissible onClose={() => setError(null)} className="mb-3">
//             {error}
//           </Alert>
//         )}
//       </div>

//       <Row className="g-3 mb-4">
//         {mainStatsCards.map((stat, index) => (
//           <Col xl={3} lg={6} md={6} key={index}>
//             <Card className="border-0 shadow-sm h-100">
//               <Card.Body className="p-3">
//                 <div className="d-flex justify-content-between align-items-start mb-3">
//                   <div>
//                     <h6 className="text-muted mb-1">{stat.title}</h6>
//                     <h3 className="mb-0">{stat.value}</h3>
//                     <p className="text-muted small mb-2 mt-1">{stat.subtitle}</p>
//                   </div>
//                   <div className={`bg-${stat.color}-light p-3 rounded-circle`}>
//                     <span style={{ fontSize: '24px' }}>{stat.icon}</span>
//                   </div>
//                 </div>
//                 <ProgressBar 
//                   now={stat.progress} 
//                   variant={stat.color}
//                   className="mb-0"
//                   style={{ height: '4px' }}
//                 />
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       <Row className="g-3">
//         <Col lg={8}>
//           <Card className="border-0 shadow-sm mb-3">
//             <Card.Body className="p-3">
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h5 className="text-dark mb-0">Mess Statistics</h5>
//                 <Badge bg="light" text="dark" className="px-3 py-2">🍽️ Daily Report</Badge>
//               </div>
//               <Row>
//                 {messStatsCards.map((stat, index) => (
//                   <Col md={4} key={index}>
//                     <Card className="border">
//                       <Card.Body className="p-3 text-center">
//                         <div className="mb-2">
//                           <span style={{ fontSize: '28px' }}>{stat.icon}</span>
//                         </div>
//                         <h6 className="text-muted mb-1 small">{stat.title}</h6>
//                         <h4 className="mb-0">{stat.value}</h4>
//                       </Card.Body>
//                     </Card>
//                   </Col>
//                 ))}
//               </Row>
//             </Card.Body>
//           </Card>

//           <Card className="border-0 shadow-sm mb-3">
//             <Card.Body className="p-3">
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h5 className="text-dark mb-0">Billing Summary</h5>
//                 <Badge bg="light" text="dark" className="px-3 py-2">
//                   Total Bills: {billingStats.total}
//                 </Badge>
//               </div>
              
//               <Row className="mb-3">
//                 <Col md={4}>
//                   <div className="text-center p-3 border rounded">
//                     <h6 className="text-success mb-1">Paid</h6>
//                     <h3 className="mb-0">{billingStats.paid}</h3>
//                     <div className="mt-2">
//                       <Badge bg="success" className="px-3 py-1">
//                         {billingStats.total > 0 ? Math.round((billingStats.paid / billingStats.total) * 100) : 0}%
//                       </Badge>
//                     </div>
//                   </div>
//                 </Col>
//                 <Col md={4}>
//                   <div className="text-center p-3 border rounded">
//                     <h6 className="text-danger mb-1">Unpaid</h6>
//                     <h3 className="mb-0">{billingStats.unpaid}</h3>
//                     <div className="mt-2">
//                       <Badge bg="danger" className="px-3 py-1">
//                         {billingStats.total > 0 ? Math.round((billingStats.unpaid / billingStats.total) * 100) : 0}%
//                       </Badge>
//                     </div>
//                   </div>
//                 </Col>
//                 <Col md={4}>
//                   <div className="text-center p-3 border rounded">
//                     <h6 className="text-warning mb-1">Partial</h6>
//                     <h3 className="mb-0">{billingStats.partial}</h3>
//                     <div className="mt-2">
//                       <Badge bg="warning" className="px-3 py-1">
//                         {billingStats.total > 0 ? Math.round((billingStats.partial / billingStats.total) * 100) : 0}%
//                       </Badge>
//                     </div>
//                   </div>
//                 </Col>
//               </Row>
              
//               <div className="row align-items-center">
//                 <Col md={6}>
//                   <div className="d-flex justify-content-between mb-2">
//                     <span className="text-muted">Total Revenue</span>
//                     <span className="fw-bold text-success">{formatCurrency(stats?.billing?.totalRevenue || 0)}</span>
//                   </div>
//                   <div className="d-flex justify-content-between">
//                     <span className="text-muted">Total Due</span>
//                     <span className="fw-bold text-danger">{formatCurrency(stats?.billing?.totalDue || 0)}</span>
//                   </div>
//                 </Col>
//                 <Col md={6}>
//                   <div className="d-grid">
//                     <Button variant="outline-primary" size="sm" onClick={() => window.location.href = '/bills'}>
//                       📋 View All Bills
//                     </Button>
//                   </div>
//                 </Col>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col lg={4}>
//           <Card className="border-0 shadow-sm mb-3">
//             <Card.Body className="p-3">
//               <h6 className="text-dark mb-3">👤 User Statistics</h6>
//               <div className="d-flex justify-content-between mb-3">
//                 <div className="text-center">
//                   <h4 className="mb-0">{stats?.users?.total || 0}</h4>
//                   <small className="text-muted">Total Users</small>
//                 </div>
//                 <div className="text-center">
//                   <h4 className="mb-0">{stats?.users?.active || 0}</h4>
//                   <small className="text-muted">Active Users</small>
//                 </div>
//               </div>
//               {userRoles.length > 0 && (
//                 <>
//                   <h6 className="text-dark mb-2">Users by Role</h6>
//                   <div className="table-responsive">
//                     <table className="table table-sm mb-0">
//                       <thead>
//                         <tr>
//                           <th>Role</th>
//                           <th className="text-end">Count</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {userRoles.map((roleStat, index) => (
//                           <tr key={index}>
//                             <td><Badge bg="secondary" className="px-2 py-1">{roleStat.role}</Badge></td>
//                             <td className="text-end fw-bold">{roleStat.count}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </>
//               )}
//             </Card.Body>
//           </Card>

//           <Row className="g-2 mb-3">
//             <Col md={6}>
//               <Card className="border-0 shadow-sm h-100">
//                 <Card.Body className="p-3">
//                   <h6 className="text-dark mb-3">👥 Visitors</h6>
//                   <div className="text-center">
//                     <h2 className="mb-0">{visitorStats.today}</h2>
//                     <small className="text-muted">Today's Visitors</small>
//                   </div>
//                   <div className="text-center mt-3">
//                     <Badge bg="info" className="px-3 py-2">{visitorStats.inside} Currently Inside</Badge>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//             <Col md={6}>
//               <Card className="border-0 shadow-sm h-100">
//                 <Card.Body className="p-3">
//                   <h6 className="text-dark mb-3">🛏️ Bed Assignments</h6>
//                   <div className="text-center">
//                     <h2 className="mb-0">{bedAssignmentStats.active}</h2>
//                     <small className="text-muted">Active Assignments</small>
//                   </div>
//                   <div className="text-center mt-3">
//                     <Badge bg="secondary" className="px-3 py-2">{bedAssignmentStats.closed} Closed</Badge>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>

//           <Card className="border-0 shadow-sm">
//             <Card.Body className="p-3">
//               <h6 className="text-dark mb-3">⚡ Quick Actions</h6>
//               <div className="d-grid gap-2">
//                 <Button variant="outline-dark" size="sm" className="d-flex align-items-center justify-content-between py-2"
//                   onClick={() => window.location.href = '/members'}>
//                   <span>👥 Manage Members</span>
//                   <span className="text-muted">→</span>
//                 </Button>
//                 <Button variant="outline-dark" size="sm" className="d-flex align-items-center justify-content-between py-2"
//                   onClick={() => window.location.href = '/rooms'}>
//                   <span>🏠 Allocate Rooms</span>
//                   <span className="text-muted">→</span>
//                 </Button>
//                 <Button variant="outline-dark" size="sm" className="d-flex align-items-center justify-content-between py-2"
//                   onClick={() => window.location.href = '/beds'}>
//                   <span>🛏️ Manage Beds</span>
//                   <span className="text-muted">→</span>
//                 </Button>
//                 <Button variant="outline-dark" size="sm" className="d-flex align-items-center justify-content-between py-2"
//                   onClick={() => window.location.href = '/food-orders'}>
//                   <span>🍽️ Food Orders</span>
//                   <span className="text-muted">→</span>
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Layout>
//   );
// };

// export default Dashboard;













import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuthHook } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { dashboardService } from '../services/dashboardService';
import { ROLES, DEFAULT_ROUTES } from '../constants/roles';

// Icons
import {
  FaUsers, FaHome, FaBed, FaMoneyBillWave, FaClipboardList,
  FaChartLine, FaUtensils, FaUser, FaUserFriends, FaDoorOpen,
  FaExchangeAlt, FaSyncAlt, FaEye, FaPlusCircle, FaListAlt
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, loading: authLoading, hasRole } = useAuthHook();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Redirect non‑admin users
  const redirectNonAdmin = () => {
    const roleCode = hasRole(ROLES.ACCOUNTANT) ? ROLES.ACCOUNTANT :
                     hasRole(ROLES.MESS_INCHARGE) ? ROLES.MESS_INCHARGE :
                     hasRole(ROLES.SECURITY) ? ROLES.SECURITY :
                     hasRole(ROLES.MEMBER) ? ROLES.MEMBER :
                     hasRole(ROLES.MANAGER) ? ROLES.MANAGER : null;
    const defaultRoute = DEFAULT_ROUTES[roleCode] || '/bills';
    navigate(defaultRoute, { replace: true });
  };

  const fetchDashboardStats = async () => {
    if (!hasRole(ROLES.ADMIN)) {
      redirectNonAdmin();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getDashboardStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError('Failed to load dashboard statistics');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      if (err.message?.includes('403') || 
          err.message?.includes('Access denied') || 
          err.message?.includes('permission')) {
        redirectNonAdmin();
        return;
      }
      if (err.message?.includes('Network error')) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else if (err.message?.includes('401') || err.message?.includes('Session expired')) {
        setError('Your session has expired. Please login again.');
      } else if (err.message?.includes('404')) {
        setError('Dashboard data not available yet. Please refresh to generate stats.');
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboardStats = async () => {
    if (!hasRole(ROLES.ADMIN)) {
      redirectNonAdmin();
      return;
    }
    try {
      setRefreshing(true);
      const response = await dashboardService.refreshDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
        setError(null);
      } else {
        setError('Failed to refresh dashboard');
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
      setError(err.message || 'Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authLoading || (loading && !stats && hasRole(ROLES.ADMIN))) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!hasRole(ROLES.ADMIN)) {
    redirectNonAdmin();
    return null;
  }

  if (error && !stats) {
    return (
      <Layout>
        <div className="mb-4">
          <h2 className="text-dark mb-1">Dashboard Overview</h2>
          <p className="text-muted mb-3">Welcome back, {user?.fullName || 'Admin'}!</p>
        </div>
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="mb-4">
              <FaChartLine size={64} className="text-muted" />
            </div>
            <h4 className="text-danger mb-3">Unable to Load Dashboard</h4>
            <p className="text-muted mb-4">{error}</p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="primary" onClick={fetchDashboardStats} disabled={loading}>
                Retry
              </Button>
              <Button variant="outline-primary" onClick={refreshDashboardStats} disabled={refreshing}>
                {refreshing ? 'Refreshing...' : 'Generate Stats'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Layout>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const mainStatsCards = [
    {
      title: 'Total Members',
      value: stats?.members?.total || 0,
      icon: <FaUsers />,
      color: 'primary',
      subtitle: `${stats?.members?.active || 0} active`,
      progress: stats?.members?.total ? (stats.members.active / stats.members.total) * 100 : 0
    },
    {
      title: 'Rooms',
      value: stats?.rooms?.totalRooms || 0,
      icon: <FaHome />,
      color: 'success',
      subtitle: `${stats?.rooms?.availableRooms || 0} available`,
      progress: stats?.rooms?.totalRooms ? ((stats.rooms.totalRooms - stats.rooms.availableRooms) / stats.rooms.totalRooms) * 100 : 0
    },
    {
      title: 'Beds',
      value: stats?.beds?.totalBeds || 0,
      icon: <FaBed />,
      color: 'warning',
      subtitle: `${stats?.beds?.occupiedBeds || 0} occupied`,
      progress: stats?.beds?.totalBeds ? (stats.beds.occupiedBeds / stats.beds.totalBeds) * 100 : 0
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.billing?.totalRevenue || 0),
      icon: <FaMoneyBillWave />,
      color: 'info',
      subtitle: `${formatCurrency(stats?.billing?.totalDue || 0)} pending`,
      progress: stats?.billing?.totalRevenue ? (stats.billing.totalRevenue / (stats.billing.totalRevenue + stats.billing.totalDue)) * 100 : 0
    },
  ];

  const messStatsCards = [
    { title: "Today's Orders", value: stats?.mess?.todayOrders || 0, icon: <FaClipboardList />, color: 'primary' },
    { title: "Today's Revenue", value: formatCurrency(stats?.mess?.todayRevenue || 0), icon: <FaMoneyBillWave />, color: 'success' },
    { title: 'Month Revenue', value: formatCurrency(stats?.mess?.monthRevenue || 0), icon: <FaChartLine />, color: 'warning' },
  ];

  const billingStats = {
    paid: stats?.billing?.paidBills || 0,
    unpaid: stats?.billing?.unpaidBills || 0,
    partial: stats?.billing?.partialBills || 0,
    total: stats?.billing?.totalBills || 0
  };

  const visitorStats = {
    today: stats?.visitors?.todayVisitors || 0,
    inside: stats?.visitors?.currentlyInside || 0
  };

  const bedAssignmentStats = {
    active: stats?.bedAssignments?.active || 0,
    closed: stats?.bedAssignments?.closed || 0
  };

  const userRoles = stats?.users?.byRole || [];

  return (
    <Layout>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="text-dark mb-1">Dashboard Overview</h2>
            <p className="text-muted mb-0">
              Welcome back, <strong>{user?.fullName || 'Admin'}</strong>!
              {stats?.lastUpdatedAt && (
                <span className="ms-3 text-muted small">
                  Last updated: {formatDate(stats.lastUpdatedAt)}
                </span>
              )}
            </p>
          </div>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={refreshDashboardStats}
            disabled={refreshing}
            className="d-flex align-items-center gap-2"
          >
            {refreshing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Refreshing...
              </>
            ) : (
              <>
                <FaSyncAlt />
                Refresh Stats
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="warning" dismissible onClose={() => setError(null)} className="mb-3">
            {error}
          </Alert>
        )}
      </div>

      <Row className="g-3 mb-4">
        {mainStatsCards.map((stat, index) => (
          <Col xl={3} lg={6} md={6} key={index}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="text-muted mb-1">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                    <p className="text-muted small mb-2 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`bg-${stat.color}-light p-3 rounded-circle`}>
                    <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                  </div>
                </div>
                <ProgressBar 
                  now={stat.progress} 
                  variant={stat.color}
                  className="mb-0"
                  style={{ height: '4px' }}
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-dark mb-0">Mess Statistics</h5>
                <Badge bg="light" text="dark" className="px-3 py-2">
                  <FaUtensils className="me-1" /> Daily Report
                </Badge>
              </div>
              <Row>
                {messStatsCards.map((stat, index) => (
                  <Col md={4} key={index}>
                    <Card className="border">
                      <Card.Body className="p-3 text-center">
                        <div className="mb-2">
                          <span style={{ fontSize: '28px' }}>{stat.icon}</span>
                        </div>
                        <h6 className="text-muted mb-1 small">{stat.title}</h6>
                        <h4 className="mb-0">{stat.value}</h4>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-dark mb-0">Billing Summary</h5>
                <Badge bg="light" text="dark" className="px-3 py-2">
                  <FaListAlt className="me-1" /> Total Bills: {billingStats.total}
                </Badge>
              </div>
              
              <Row className="mb-3">
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <h6 className="text-success mb-1">Paid</h6>
                    <h3 className="mb-0">{billingStats.paid}</h3>
                    <div className="mt-2">
                      <Badge bg="success" className="px-3 py-1">
                        {billingStats.total > 0 ? Math.round((billingStats.paid / billingStats.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <h6 className="text-danger mb-1">Unpaid</h6>
                    <h3 className="mb-0">{billingStats.unpaid}</h3>
                    <div className="mt-2">
                      <Badge bg="danger" className="px-3 py-1">
                        {billingStats.total > 0 ? Math.round((billingStats.unpaid / billingStats.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border rounded">
                    <h6 className="text-warning mb-1">Partial</h6>
                    <h3 className="mb-0">{billingStats.partial}</h3>
                    <div className="mt-2">
                      <Badge bg="warning" className="px-3 py-1">
                        {billingStats.total > 0 ? Math.round((billingStats.partial / billingStats.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <div className="row align-items-center">
                <Col md={6}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total Revenue</span>
                    <span className="fw-bold text-success">{formatCurrency(stats?.billing?.totalRevenue || 0)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Total Due</span>
                    <span className="fw-bold text-danger">{formatCurrency(stats?.billing?.totalDue || 0)}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-grid">
                    <Button variant="outline-primary" size="sm" onClick={() => window.location.href = '/bills'}>
                      <FaEye className="me-1" /> View All Bills
                    </Button>
                  </div>
                </Col>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="p-3">
              <h6 className="text-dark mb-3"><FaUser className="me-2" />User Statistics</h6>
              <div className="d-flex justify-content-between mb-3">
                <div className="text-center">
                  <h4 className="mb-0">{stats?.users?.total || 0}</h4>
                  <small className="text-muted">Total Users</small>
                </div>
                <div className="text-center">
                  <h4 className="mb-0">{stats?.users?.active || 0}</h4>
                  <small className="text-muted">Active Users</small>
                </div>
              </div>
              {userRoles.length > 0 && (
                <>
                  <h6 className="text-dark mb-2">Users by Role</h6>
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Role</th>
                          <th className="text-end">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userRoles.map((roleStat, index) => (
                          <tr key={index}>
                            <td><Badge bg="secondary" className="px-2 py-1">{roleStat.role}</Badge></td>
                            <td className="text-end fw-bold">{roleStat.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>

          <Row className="g-2 mb-3">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <h6 className="text-dark mb-3"><FaUserFriends className="me-2" />Visitors</h6>
                  <div className="text-center">
                    <h2 className="mb-0">{visitorStats.today}</h2>
                    <small className="text-muted">Today's Visitors</small>
                  </div>
                  <div className="text-center mt-3">
                    <Badge bg="info" className="px-3 py-2">{visitorStats.inside} Currently Inside</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <h6 className="text-dark mb-3"><FaBed className="me-2" />Bed Assignments</h6>
                  <div className="text-center">
                    <h2 className="mb-0">{bedAssignmentStats.active}</h2>
                    <small className="text-muted">Active Assignments</small>
                  </div>
                  <div className="text-center mt-3">
                    <Badge bg="secondary" className="px-3 py-2">{bedAssignmentStats.closed} Closed</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <h6 className="text-dark mb-3"><FaExchangeAlt className="me-2" />Quick Actions</h6>
              <div className="d-grid gap-2">
                <Button variant="outline-dark" size="sm" className="d-flex align-items-center justify-content-between py-2"
                  onClick={() => window.location.href = '/members'}>
                  <span><FaUsers className="me-2" />Manage Members</span>
                  <span className="text-muted">→</span>
                </Button>
                <Button variant="outline-dark" size="sm" className="d-flex align-items-center justify-content-between py-2"
                  onClick={() => window.location.href = '/rooms'}>
                  <span><FaHome className="me-2" />Allocate Rooms</span>
                  <span className="text-muted">→</span>
                </Button>
                <Button variant="outline-dark" size="sm" className="d-flex align-items-center justify-content-between py-2"
                  onClick={() => window.location.href = '/beds'}>
                  <span><FaBed className="me-2" />Manage Beds</span>
                  <span className="text-muted">→</span>
                </Button>
                <Button variant="outline-dark" size="sm" className="d-flex align-items-center justify-content-between py-2"
                  onClick={() => window.location.href = '/food-orders'}>
                  <span><FaUtensils className="me-2" />Food Orders</span>
                  <span className="text-muted">→</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default Dashboard;