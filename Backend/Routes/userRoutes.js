const express = require("express");
const router = express.Router();
const userController = require("../Controllers/UserController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "photo-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  }
});

// Public routes (no authentication required)
router.post("/login", userController.loginUser);
router.post("/register", userController.createUser);
router.post("/google-login", userController.googleLogin);

// Protected routes - requires authentication
router.get("/", authenticateToken, userController.getAllUsers);
router.get("/me", authenticateToken, userController.getCurrentUser);
router.get("/:id", authenticateToken, userController.getUserById);
router.put("/:id", authenticateToken, userController.updateUserProfile);
router.post("/upload-photo", authenticateToken, upload.single("photo"), userController.uploadPhoto);

// Protected routes - requires admin role
router.delete("/:id", authenticateToken, authorizeRole("admin"), userController.deleteUser);

// Admin routes for user approval
router.put("/:id/accept", authenticateToken, authorizeRole("admin"), userController.acceptUser);
router.put("/:id/reject", authenticateToken, authorizeRole("admin"), userController.rejectUser);

module.exports = router;