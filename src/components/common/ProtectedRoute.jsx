import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { DEFAULT_ROUTES } from '../../constants/roles';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, hasAnyRole, getUserRoleCode } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check them
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    // User is authenticated but not authorized → redirect to their default route
    const role = getUserRoleCode();
    const defaultRoute = DEFAULT_ROUTES[role] || '/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;