const express = require("express");
const router = express.Router();
const analyticsController = require("../Controllers/AnalyticsController");

// Public, read-only dashboard data (no auth — same as the other GET listings).
router.get("/production", analyticsController.getProduction);
router.get("/trade", analyticsController.getTrade);

module.exports = router;
