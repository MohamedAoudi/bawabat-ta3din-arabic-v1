const express = require("express");
const router = express.Router();
const userController = require("../Controllers/UserController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.post("/login", userController.loginUser);
router.post("/register", userController.createUser);

// Protected routes - requires authentication
router.get("/", authenticateToken, userController.getAllUsers);
router.get("/:id", authenticateToken, userController.getUserById);

// Protected routes - requires admin role
router.put("/:id", authenticateToken, authorizeRole("admin"), userController.updateUser);
router.delete("/:id", authenticateToken, authorizeRole("admin"), userController.deleteUser);

module.exports = router;