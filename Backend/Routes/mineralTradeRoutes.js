const express = require("express");
const router = express.Router();
const mineralTradeController = require("../Controllers/MineralTradeController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", mineralTradeController.getAllMineralTrades);
router.get("/:id", mineralTradeController.getMineralTradeById);
router.post("/", authenticateToken, mineralTradeController.createMineralTrade);
router.put("/:id", authenticateToken, mineralTradeController.updateMineralTrade);
router.delete("/:id", authenticateToken, authorizeRole("admin"), mineralTradeController.deleteMineralTrade);

module.exports = router;
