// hooks/usePermission.js
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for permission checking.
 * - ADMIN always returns true.
 * - If still loading → returns false (safe).
 * - Permission check is case-sensitive.
 */
export const usePermission = () => {
  const { permissions, isAdmin, loading } = useAuth();

  const hasPermission = (permissionKey) => {
    // Prevent checks while auth is loading
    if (loading) return false;
    
    // ADMIN bypass – full access
    if (isAdmin) return true;
    
    // No permission key provided? treat as not required
    if (!permissionKey) return true;
    
    // Array check
    return Array.isArray(permissions) && permissions.includes(permissionKey);
  };

  return { hasPermission, permissions, isAdmin, loading };
};