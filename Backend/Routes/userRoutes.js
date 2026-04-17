const express = require("express");
const router = express.Router();
const userController = require("../Controllers/UserController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.post("/login", userController.loginUser);
router.post("/register", userController.createUser);
router.post("/google-login", userController.googleLogin);

// Protected routes - requires authentication
router.get("/", authenticateToken, userController.getAllUsers);
router.get("/me", authenticateToken, userController.getCurrentUser);
router.get("/:id", authenticateToken, userController.getUserById);

// Protected routes - requires admin role
router.put("/:id", authenticateToken, authorizeRole("admin"), userController.updateUser);
router.delete("/:id", authenticateToken, authorizeRole("admin"), userController.deleteUser);

// Admin routes for user approval
router.put("/:id/accept", authenticateToken, authorizeRole("admin"), userController.acceptUser);
router.put("/:id/reject", authenticateToken, authorizeRole("admin"), userController.rejectUser);

module.exports = router;