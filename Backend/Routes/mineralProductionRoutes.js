const express = require("express");
const router = express.Router();
const mineralProductionController = require("../Controllers/MineralProductionController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Public routes - get all mineral production records
router.get("/", mineralProductionController.getAllMineralProduction);

// Public route - get mineral production by ID
router.get("/:id", mineralProductionController.getMineralProductionById);

// Public route - get mineral production by country and year
router.get("/country/:countryId/year/:year", mineralProductionController.getMineralProductionByCountryYear);

// Protected routes - requires authentication
// Create mineral production (admin only)
router.post("/", authenticateToken, authorizeRole("admin"), mineralProductionController.createMineralProduction);

// Update mineral production (admin only)
router.put("/:id", authenticateToken, authorizeRole("admin"), mineralProductionController.updateMineralProduction);

// Delete mineral production (admin only)
router.delete("/:id", authenticateToken, authorizeRole("admin"), mineralProductionController.deleteMineralProduction);

module.exports = router;
