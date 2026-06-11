const express = require("express");
const router = express.Router();
const countryController = require("../Controllers/CountryController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", countryController.getAllCountries);
router.get("/:id", countryController.getCountryById);
router.post("/", authenticateToken, countryController.createCountry);
router.put("/:id", authenticateToken, countryController.updateCountry);
router.delete("/:id", authenticateToken, authorizeRole("admin"), countryController.deleteCountry);

module.exports = router;
