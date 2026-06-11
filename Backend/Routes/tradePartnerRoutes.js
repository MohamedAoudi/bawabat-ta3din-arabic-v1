const express = require("express");
const router = express.Router();
const tradePartnerController = require("../Controllers/TradePartnerController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", tradePartnerController.getAllTradePartners);
router.get("/:id", tradePartnerController.getTradePartnerById);
router.post("/", authenticateToken, tradePartnerController.createTradePartner);
router.put("/:id", authenticateToken, tradePartnerController.updateTradePartner);
router.delete("/:id", authenticateToken, authorizeRole("admin"), tradePartnerController.deleteTradePartner);

module.exports = router;
