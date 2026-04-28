const express = require("express");
const router = express.Router();
const tradePartnerController = require("../Controllers/TradePartnerController");

router.get("/", tradePartnerController.getAllTradePartners);
router.get("/:id", tradePartnerController.getTradePartnerById);
router.post("/", tradePartnerController.createTradePartner);
router.put("/:id", tradePartnerController.updateTradePartner);
router.delete("/:id", tradePartnerController.deleteTradePartner);

module.exports = router;
