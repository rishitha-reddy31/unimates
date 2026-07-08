// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize axios defaults and check token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 AuthProvider initializing, token:', token ? 'Present' : 'Missing');
    
    if (token) {
      // Set the token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Token set in axios defaults');
      
      // Fetch user data
      fetchUser(token);
    } else {
      console.log('⚠️ No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      console.log('🔄 Fetching user data with token...');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`);
      console.log('✅ User data received:', res.data);
      
      // Handle the response structure - adjust based on your /me endpoint
      const userData = res.data.data?.user || res.data.user || res.data;
      setUser(userData);
      
      // Also store in localStorage for backup
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('❌ Failed to fetch user:', error.response?.data || error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('📤 Sending login request...');
      
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password
      });

      console.log('📥 Login response:', res.data);

      // Handle different response structures
      let user, token;
      
      if (res.data.data) {
        // Structure: { data: { user, token } }
        user = res.data.data.user;
        token = res.data.data.token;
      } else {
        // Structure: { user, token } at root
        user = res.data.user;
        token = res.data.token;
      }
      
      if (!user || !token) {
        console.error('❌ Missing user or token in response:', res.data);
        toast.error('Invalid server response');
        return { success: false };
      }
      
      // Save token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user in state
      setUser(user);
      console.log('✅ User set in AuthContext:', user);
      
      toast.success('Logged in successfully!');
      navigate('/feed');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registration data being sent:', JSON.stringify(userData, null, 2));
      
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, userData);
      
      console.log('✅ Registration response:', res.data);
      
      // Handle different response structures
      let user, token;
      
      if (res.data.data) {
        // Structure 1: { data: { user, token } }
        user = res.data.data.user || res.data.data;
        token = res.data.data.token;
      } else {
        // Structure 2: { user, token } at root
        user = res.data.user;
        token = res.data.token;
      }
      
      // If still not found, try alternate paths
      if (!user && res.data.data) {
        user = {
          id: res.data.data.id,
          username: res.data.data.username,
          email: res.data.data.email,
          role: res.data.data.role,
          collegeId: res.data.data.collegeId,
          isVerified: res.data.data.isVerified
        };
        token = res.data.data.token;
      }
      
      if (!user || !token) {
        console.error('❌ Missing user or token in response:', res.data);
        toast.error('Invalid server response');
        return { success: false };
      }
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ Token saved to localStorage:', token.substring(0, 20) + '...');
      
      // Set token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user in state
      setUser(user);
      
      toast.success('Registration successful!');
      navigate('/suggestions');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Registration error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error
      });
      
      // Show the exact error message from server
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error('Registration failed. Please check your details.');
      }
      
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('token')) {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear everything
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  /**
   * Update user function - updates both state and localStorage
   * This ensures changes are persisted and available immediately
   */
  const updateUser = (updatedUserData) => {
    // Merge with existing user data to preserve any fields not in updatedUserData
    const mergedUser = {
      ...user,
      ...updatedUserData,
      // Ensure nested objects are properly merged if needed
      skills: updatedUserData.skills || user?.skills || [],
      interests: updatedUserData.interests || user?.interests || [],
      hobbies: updatedUserData.hobbies || user?.hobbies || [],
      projects: updatedUserData.projects || user?.projects || [],
      achievements: updatedUserData.achievements || user?.achievements || []
    };
    
    // Update state
    setUser(mergedUser);
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(mergedUser));
    
    console.log('✅ User updated in context:', mergedUser);
    
    return mergedUser;
  };

  /**
   * Refresh user data from server - ensures we have the latest data
   * Call this after any profile update to sync with server
   */
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found, cannot refresh user');
        return false;
      }

      console.log('🔄 Refreshing user data from server...');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`);
      
      // Handle different response structures
      const userData = res.data.data?.user || res.data.user || res.data;
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ User data refreshed:', userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to refresh user:', error.response?.data || error.message);
      
      // If token is invalid, logout
      if (error.response?.status === 401) {
        logout();
      }
      
      return false;
    }
  };

  /**
   * Get fresh user data without updating state
   * Useful for checking current data without side effects
   */
  const getFreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`);
      return res.data.data?.user || res.data.user || res.data;
    } catch (error) {
      console.error('❌ Failed to get fresh user data:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    getFreshUserData,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};