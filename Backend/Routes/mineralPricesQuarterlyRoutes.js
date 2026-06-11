const express = require("express");
const router = express.Router();
const quarterlyPriceController = require("../Controllers/MineralPricesQuarterlyController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", quarterlyPriceController.getAllQuarterlyPrices);
router.get("/:id", quarterlyPriceController.getQuarterlyPriceById);
router.post("/", authenticateToken, quarterlyPriceController.createQuarterlyPrice);
router.put("/:id", authenticateToken, quarterlyPriceController.updateQuarterlyPrice);
router.delete("/:id", authenticateToken, authorizeRole("admin"), quarterlyPriceController.deleteQuarterlyPrice);

module.exports = router;
