import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { ROLE_CODE_MAP } from '../constants/roles';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error('Failed to parse stored user', e);
          }
          // We have a cached user → show UI immediately
          setLoading(false);
          // Then refresh the profile in the background
          try {
            const userData = await authService.getProfile();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // If the token is invalid, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } else {
          // No cached user → we must wait for the profile fetch
          try {
            const userData = await authService.getProfile();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            localStorage.removeItem('token');
            setToken(null);
          } finally {
            setLoading(false);
          }
        }
      } else {
        // No token → nothing to load
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token: authToken, user: userData } = response;

      localStorage.setItem('token', authToken);
      setToken(authToken);

      // Store the user immediately (login response may be incomplete)
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      // Fetch full profile in the background
      authService.getProfile()
        .then(fullProfile => {
          setUser(fullProfile);
          localStorage.setItem('user', JSON.stringify(fullProfile));
        })
        .catch(err => console.error('Background profile fetch failed', err));

      return { success: true, user: userData };
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
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const getUserRoleCode = () => {
    if (!user) return null;

    let rawRole = null;

    if (typeof user.role === 'object' && user.role !== null) {
      rawRole = user.role.code || user.role.name || null;
    } else {
      rawRole = user.role || null;
    }

    if (!rawRole) return null;

    const roleStr = rawRole.toString().trim();
    const lowerRole = roleStr.toLowerCase();
    const baseRole = lowerRole.replace(/_\d+$/, '');
    const mapped = ROLE_CODE_MAP[baseRole] || ROLE_CODE_MAP[lowerRole];
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

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    getUserRoleCode,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};