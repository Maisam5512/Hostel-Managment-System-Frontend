import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Rooms from './pages/Rooms';
import Fees from './pages/Fees';
import Permissions from './pages/Permissions';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Beds from './pages/Bed';
import BedAssignments from './pages/BedAssignments';
import ProtectedRoute from './components/common/ProtectedRoute';

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/members" element={
        <ProtectedRoute>
          <Members />
        </ProtectedRoute>
      } />
      
      <Route path="/rooms" element={
        <ProtectedRoute>
          <Rooms />
        </ProtectedRoute>
      } />
      
      <Route path="/fees" element={
        <ProtectedRoute>
          <Fees />
        </ProtectedRoute>
      } />
      
      <Route path="/permissions" element={
        <ProtectedRoute>
          <Permissions />
        </ProtectedRoute>
      } />
      
      <Route path="/roles" element={
        <ProtectedRoute>
          <Roles />
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      
      <Route path="/beds" element={
        <ProtectedRoute>
          <Beds />
        </ProtectedRoute>
      } />

      <Route path="/bed-assignments" element={
        <ProtectedRoute>
          <BedAssignments />
        </ProtectedRoute>
      } />
      
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all - redirect to dashboard */}
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