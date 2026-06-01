const express = require("express");
const router = express.Router();
const yearsController = require("../Controllers/YearsController");

// Public route - get all available years
router.get("/", yearsController.getAllYears);

module.exports = router;
