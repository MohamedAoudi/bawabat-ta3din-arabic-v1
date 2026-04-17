const userModel = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is accepted (except for admins)
    if (!user.is_accepted && user.role !== 'admin') {
      return res.status(403).json({ message: "Account pending approval by admin" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user (logged in user)
const getCurrentUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new user (trilingual: Arabic, English, French)
const createUser = async (req, res) => {
  try {
    const { nom_ar, nom_en, nom_fr, prenom_ar, prenom_en, prenom_fr, email, password, role, photo } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    // Check if email already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = await userModel.createUser({ 
      nom_ar, nom_en, nom_fr, 
      prenom_ar, prenom_en, prenom_fr, 
      email, password: hashedPassword, role, photo 
    });
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const updatedUser = await userModel.updateUser(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await userModel.deleteUser(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Google Login - Create or get user from Google
const googleLogin = async (req, res) => {
  try {
    const { email, displayName, photoURL, uid } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    let user = await userModel.getUserByEmail(email);

    if (!user) {
      // Create new user from Google data
      // Parse display name to get first name and last name
      const nameParts = displayName ? displayName.split(" ") : ["", ""];
      const prenom = nameParts[0] || "";
      const nom = nameParts.slice(1).join(" ") || "";

      user = await userModel.createUser({
        nom_ar: nom,
        nom_en: nom,
        nom_fr: nom,
        prenom_ar: prenom,
        prenom_en: prenom,
        prenom_fr: prenom,
        email: email,
        password: "google-oauth-placeholder", // Placeholder - not used for Google users
        role: "user",
        photo: photoURL || null,
        is_accepted: false // New users need admin approval
      });
    }

    // Check if user is accepted (except for admins)
    if (!user.is_accepted && user.role !== 'admin') {
      return res.status(403).json({ message: "Account pending approval by admin" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept user (admin approves)
const acceptUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await userModel.updateUser(req.params.id, { is_accepted: true });
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ message: "User accepted successfully", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject user (admin rejects)
const rejectUser = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userModel.deleteUser(req.params.id);
    res.json({ message: "User rejected and deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  loginUser,
  getAllUsers,
  getCurrentUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  googleLogin,
  acceptUser,
  rejectUser,
};