const express = require("express");
const router = express.Router();
const tradeTransactionsController = require("../Controllers/TradeTransactionsController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Public routes - get all trade transactions
router.get("/", tradeTransactionsController.getAllTradeTransactions);

// Public route - get trade transaction by ID
router.get("/:id", tradeTransactionsController.getTradeTransactionById);

// Public route - get trade transactions by country and year
router.get("/country/:countryId/year/:year", tradeTransactionsController.getTradeTransactionsByCountryYear);

// Public route - get trade transactions by type (import/export)
router.get("/type/:tradeType", tradeTransactionsController.getTradeTransactionsByType);

// Protected routes - requires authentication
// Create trade transaction (admin only)
router.post("/", authenticateToken, authorizeRole("admin"), tradeTransactionsController.createTradeTransaction);

// Update trade transaction (admin only)
router.put("/:id", authenticateToken, authorizeRole("admin"), tradeTransactionsController.updateTradeTransaction);

// Delete trade transaction (admin only)
router.delete("/:id", authenticateToken, authorizeRole("admin"), tradeTransactionsController.deleteTradeTransaction);

module.exports = router;
