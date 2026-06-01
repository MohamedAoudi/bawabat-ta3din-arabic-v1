const express = require("express");
const router = express.Router();
const mineralsController = require("../Controllers/MineralsController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Public routes - get all minerals
router.get("/", mineralsController.getAllMinerals);

// Public route - get mineral by ID
router.get("/:id", mineralsController.getMineralById);

// Protected routes - requires authentication
// Create mineral (admin only)
router.post("/", authenticateToken, authorizeRole("admin"), mineralsController.createMineral);

// Update mineral (admin only)
router.put("/:id", authenticateToken, authorizeRole("admin"), mineralsController.updateMineral);

// Delete mineral (admin only)
router.delete("/:id", authenticateToken, authorizeRole("admin"), mineralsController.deleteMineral);

module.exports = router;
