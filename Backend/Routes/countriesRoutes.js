const express = require("express");
const router = express.Router();
const countriesController = require("../Controllers/CountriesController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", countriesController.getAllCountries);
router.get("/:id", countriesController.getCountryById);

router.post("/", authenticateToken, authorizeRole("admin"), countriesController.createCountry);
router.put("/:id", authenticateToken, authorizeRole("admin"), countriesController.updateCountry);
router.delete("/:id", authenticateToken, authorizeRole("admin"), countriesController.deleteCountry);

module.exports = router;
