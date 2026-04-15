import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const getUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Get profile error:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginIdentifier, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: loginIdentifier, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToken(data.data.token);
        setUser(data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token);
        }
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToken(data.data.token);
        setUser(data.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token);
        }
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Registration failed', errors: data.errors };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const checkUsername = async (username) => {
    try {
      const response = await fetch(`${API_URL}/auth/check-username/${username}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Check username error:', error);
      return { available: false, message: 'Network error' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser({ ...user, ...data.data });
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const uploadProfilePic = async (imageBlob) => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'profile.jpg');

      const response = await fetch(`${API_URL}/user/profile-pic`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser({ ...user, profilePic: data.data.profilePic });
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Upload profile pic error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  // ADMIN FUNCTIONS
  const adminGetUsers = async (search = '', role = 'all') => {
    try {
      const response = await fetch(`${API_URL}/admin/users?search=${search}&role=${role}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminUpdateUser = async (id, userData) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminDeleteUser = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminGetCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminUpdateCourse = async (id, courseData) => {
    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${API_URL}/admin/courses/${id}` : `${API_URL}/admin/courses`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminDeleteCourse = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminGetInquiries = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/inquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminUpdateInquiry = async (id, inquiryData) => {
    try {
      const response = await fetch(`${API_URL}/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(inquiryData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminDeleteInquiry = async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminGetStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminGetSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const adminUpdateSettings = async (settingsData) => {
    try {
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    checkUsername,
    updateProfile,
    uploadProfilePic,
    changePassword,
    adminGetUsers,
    adminUpdateUser,
    adminDeleteUser,
    adminGetCourses,
    adminUpdateCourse,
    adminDeleteCourse,
    adminGetInquiries,
    adminUpdateInquiry,
    adminDeleteInquiry,
    adminGetStats,
    adminGetSettings,
    adminUpdateSettings,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    BASE_URL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
