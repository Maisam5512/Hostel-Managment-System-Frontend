import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ROLES } from './constants/roles';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Rooms from './pages/Rooms';
import Permissions from './pages/Permissions';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Beds from './pages/Bed';
import BedAssignments from './pages/BedAssignments';
import FoodItems from './pages/FoodItems';
import FoodOrders from './pages/FoodOrders';
import Bills from './pages/Bills';
import Visitors from './pages/Visitors';
import ProtectedRoute from './components/common/ProtectedRoute';

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* ADMIN only */}
      <Route path="/members" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <Members />
        </ProtectedRoute>
      } />
      <Route path="/rooms" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <Rooms />
        </ProtectedRoute>
      } />
      <Route path="/beds" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <Beds />
        </ProtectedRoute>
      } />
      <Route path="/bed-assignments" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <BedAssignments />
        </ProtectedRoute>
      } />
      <Route path="/permissions" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <Permissions />
        </ProtectedRoute>
      } />
      <Route path="/roles" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <Roles />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <Users />
        </ProtectedRoute>
      } />

      {/* ADMIN + ACCOUNTANT */}
      <Route path="/bills" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ACCOUNTANT]}>
          <Bills />
        </ProtectedRoute>
      } />

      {/* ADMIN + MESS_INCHARGE */}
      <Route path="/food-items" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MESS_INCHARGE]}>
          <FoodItems />
        </ProtectedRoute>
      } />
      <Route path="/food-orders" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MESS_INCHARGE]}>
          <FoodOrders />
        </ProtectedRoute>
      } />

      {/* ADMIN + SECURITY */}
      <Route path="/visitors" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SECURITY]}>
          <Visitors />
        </ProtectedRoute>
      } />

      {/* DASHBOARD – any authenticated user */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;