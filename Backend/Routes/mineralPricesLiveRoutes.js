const express = require("express");
const router = express.Router();
const livePriceController = require("../Controllers/MineralPricesLiveController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", livePriceController.getAllLivePrices);
router.get("/:id", livePriceController.getLivePriceById);
router.post("/", authenticateToken, livePriceController.createLivePrice);
router.put("/:id", authenticateToken, livePriceController.updateLivePrice);
router.delete("/:id", authenticateToken, authorizeRole("admin"), livePriceController.deleteLivePrice);

module.exports = router;
