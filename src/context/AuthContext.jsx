import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { ROLE_CODE_MAP } from '../constants/roles'; // <-- new import

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const isAuthenticated = !!token;

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token: authToken, user: userData } = response;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      
      const fullUserProfile = await authService.getProfile();
      setUser(fullUserProfile);
      
      return { success: true, user: fullUserProfile };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // ========== ROLE HELPERS ==========
  
const getUserRoleCode = () => {
  if (!user) return null;

  let rawRole = null;

  // 1. Extract raw role value
  if (typeof user.role === 'object' && user.role !== null) {
    rawRole = user.role.code || user.role.name || null;
  } else {
    rawRole = user.role || null; // string from login response
  }

  if (!rawRole) return null;

  // 2. Normalize: lowercase, trim
  const roleStr = rawRole.toString().trim();
  const lowerRole = roleStr.toLowerCase();

  // 3. Remove any trailing numeric suffix like _01, _02 etc.
  //    (this regex matches underscore followed by one or more digits at the end)
  const baseRole = lowerRole.replace(/_\d+$/, '');

  // 4. Look up in map – first try baseRole, then fallback to full lowerRole
  const mapped = ROLE_CODE_MAP[baseRole] || ROLE_CODE_MAP[lowerRole];

  // 5. Return mapped constant or original uppercase (as fallback)
  return mapped || roleStr.toUpperCase();
};

  const hasRole = (roleCode) => {
    const userRole = getUserRoleCode();
    return userRole === roleCode;
  };

  const hasAnyRole = (roleCodes) => {
    const userRole = getUserRoleCode();
    return roleCodes.includes(userRole);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    // role helpers
    getUserRoleCode,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};