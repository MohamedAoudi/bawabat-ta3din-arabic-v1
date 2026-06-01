const express = require("express");
const router = express.Router();
const countriesController = require("../Controllers/CountriesController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Public routes - get all countries
router.get("/", countriesController.getAllCountries);

// Public route - get country by ID
router.get("/:id", countriesController.getCountryById);

// Protected routes - requires authentication
// Create country (admin only)
router.post("/", authenticateToken, authorizeRole("admin"), countriesController.createCountry);

// Update country (admin only)
router.put("/:id", authenticateToken, authorizeRole("admin"), countriesController.updateCountry);

// Delete country (admin only)
router.delete("/:id", authenticateToken, authorizeRole("admin"), countriesController.deleteCountry);

module.exports = router;
