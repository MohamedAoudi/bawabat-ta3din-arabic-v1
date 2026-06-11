const express = require("express");
const router = express.Router();
const monthlyPriceController = require("../Controllers/MineralPricesMonthlyController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", monthlyPriceController.getAllMonthlyPrices);
router.get("/:id", monthlyPriceController.getMonthlyPriceById);
router.post("/", authenticateToken, monthlyPriceController.createMonthlyPrice);
router.put("/:id", authenticateToken, monthlyPriceController.updateMonthlyPrice);
router.delete("/:id", authenticateToken, authorizeRole("admin"), monthlyPriceController.deleteMonthlyPrice);

module.exports = router;
