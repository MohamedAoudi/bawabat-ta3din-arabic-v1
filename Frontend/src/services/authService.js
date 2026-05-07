import { signInWithGoogle, logoutGoogle } from "./firebase";
import apiClient from "./apiClient";

const API_URL = "/users";

const setStoredUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
  // Same-tab updates: storage event doesn't fire in the same window,
  // so we emit a custom event to refresh UI (e.g., sidebar avatar).
  window.dispatchEvent(new Event("auth:user-updated"));
};

const setAuthSession = ({ token, user }) => {
  if (user) {
    setStoredUser(user);
  }

  if (token) {
    localStorage.setItem("token", token);
  }
};

// Register new user (trilingual: Arabic, English, French)
export const register = async (userData) => {
  const response = await apiClient.post(`${API_URL}/register`, userData);
  if (response.data) {
    setStoredUser(response.data);
  }
  return response.data;
};

// Login user
export const login = async (email, password) => {
  const response = await apiClient.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    setAuthSession(response.data);
  }
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth:user-updated"));
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
    const response = await apiClient.get(`${API_URL}/me`);
    if (response.data) {
      setStoredUser(response.data);
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
    const payload = {
      email: googleUser.email,
      displayName: googleUser.displayName,
      photoURL: googleUser.photoURL,
      uid: googleUser.uid,
    };

    const response = await apiClient.post(`${API_URL}/google-login`, payload);
    
    if (response.data.token) {
      setAuthSession(response.data);
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
  const response = await apiClient.put(`${API_URL}/${userId}/accept`);
  return response.data;
};

// Reject user (admin)
export const rejectUser = async (userId) => {
  const response = await apiClient.put(`${API_URL}/${userId}/reject`);
  return response.data;
};

// Update user profile
export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`${API_URL}/${userId}`, userData);
  return response.data;
};