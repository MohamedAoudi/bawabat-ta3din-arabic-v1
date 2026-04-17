import axios from "axios";
import { signInWithGoogle, logoutGoogle } from "./firebase";

const API_URL = "http://localhost:5000/api/users";

// Configure axios interceptor to add token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Register new user (trilingual: Arabic, English, French)
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Check if user is admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === "admin";
};

// Refresh current user data from server (to get updated photo)
export const refreshCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`);
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    }
  } catch (error) {
    console.error("Error refreshing user:", error);
    return getCurrentUser();
  }
};

// Login with Google
export const loginWithGoogle = async () => {
  try {
    const googleUser = await signInWithGoogle();
    
    // Send Google user data to backend to create or get user
    const response = await axios.post(`${API_URL}/google-login`, {
      email: googleUser.email,
      displayName: googleUser.displayName,
      photoURL: googleUser.photoURL,
      uid: googleUser.uid
    });
    
    if (response.data.token) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// Logout including Google
export const logoutWithGoogle = async () => {
  try {
    await logoutGoogle();
  } catch (error) {
    console.error("Google logout error:", error);
  }
  logout();
};

// Accept user (admin)
export const acceptUser = async (userId) => {
  const response = await axios.put(`${API_URL}/${userId}/accept`);
  return response.data;
};

// Reject user (admin)
export const rejectUser = async (userId) => {
  const response = await axios.put(`${API_URL}/${userId}/reject`);
  return response.data;
};