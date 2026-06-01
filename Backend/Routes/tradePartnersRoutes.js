const express = require("express");
const router = express.Router();
const tradePartnersController = require("../Controllers/TradePartnersController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Public routes - get all trade partners
router.get("/", tradePartnersController.getAllTradePartners);

// Public route - get trade partner by ID
router.get("/:id", tradePartnersController.getTradePartnerById);

// Protected routes - requires authentication
// Create trade partner (admin only)
router.post("/", authenticateToken, authorizeRole("admin"), tradePartnersController.createTradePartner);

// Update trade partner (admin only)
router.put("/:id", authenticateToken, authorizeRole("admin"), tradePartnersController.updateTradePartner);

// Delete trade partner (admin only)
router.delete("/:id", authenticateToken, authorizeRole("admin"), tradePartnersController.deleteTradePartner);

module.exports = router;
