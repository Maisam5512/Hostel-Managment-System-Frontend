import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
// ROLES aur DEFAULT_ROUTES ko bhi import karein taake fallback use ho sake
import { ROLE_CODE_MAP, ROLES, DEFAULT_ROUTES } from '../constants/roles';

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
          setLoading(false);
          
          try {
            const userData = await authService.getProfile();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } else {
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
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

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

  // --- UPDATED LOGIC START ---
  const getUserRoleCode = () => {
    if (!user) return null;

    let rawRole = null;
    if (typeof user.role === 'object' && user.role !== null) {
      rawRole = user.role.code || user.role.name || null;
    } else {
      rawRole = user.role || null;
    }

    // Agar role bilkul missing hai, toh default Member assign kar dein
    if (!rawRole) return ROLES.MEMBER;

    const roleStr = rawRole.toString().trim();
    const lowerRole = roleStr.toLowerCase();
    const baseRole = lowerRole.replace(/_\d+$/, '');
    
    // Check karein ke mapped roles mein hai ya nahi
    const mapped = ROLE_CODE_MAP[baseRole] || ROLE_CODE_MAP[lowerRole];
    
    if (mapped) return mapped;

    // Agar role map nahi hua (matlab naya role hai), 
    // toh check karein ke kya iska koi default route exist karta hai
    const upperRole = roleStr.toUpperCase();
    if (DEFAULT_ROUTES[upperRole]) {
      return upperRole;
    }

    // Kuch bhi match na ho toh ROLES.MEMBER par fall back karein taake blank screen na aaye
    return ROLES.MEMBER; 
  };
  // --- UPDATED LOGIC END ---

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