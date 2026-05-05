const express = require("express");
const router = express.Router();
const tradeTransactionController = require("../Controllers/TradeTransactionController");

router.get("/", tradeTransactionController.getAllTradeTransactions);
router.get("/analytics/critical-exports", tradeTransactionController.getCriticalMineralExportsAnalytics);
router.get("/:id", tradeTransactionController.getTradeTransactionById);
router.post("/", tradeTransactionController.createTradeTransaction);
router.put("/:id", tradeTransactionController.updateTradeTransaction);
router.delete("/:id", tradeTransactionController.deleteTradeTransaction);

module.exports = router;
