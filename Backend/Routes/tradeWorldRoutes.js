const express = require("express");
const router = express.Router();
const tradeWorldController = require("../Controllers/TradeWorldController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", tradeWorldController.getAllTradeWorld);
router.get("/:id", tradeWorldController.getTradeWorldById);
router.post("/", authenticateToken, tradeWorldController.createTradeWorld);
router.put("/:id", authenticateToken, tradeWorldController.updateTradeWorld);
router.delete("/:id", authenticateToken, authorizeRole("admin"), tradeWorldController.deleteTradeWorld);

module.exports = router;
