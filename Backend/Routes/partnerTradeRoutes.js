const express = require("express");
const router = express.Router();
const partnerTradeController = require("../Controllers/PartnerTradeController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", partnerTradeController.getAllPartnerTrades);
router.get("/:id", partnerTradeController.getPartnerTradeById);
router.post("/", authenticateToken, partnerTradeController.createPartnerTrade);
router.put("/:id", authenticateToken, partnerTradeController.updatePartnerTrade);
router.delete("/:id", authenticateToken, authorizeRole("admin"), partnerTradeController.deletePartnerTrade);

module.exports = router;
