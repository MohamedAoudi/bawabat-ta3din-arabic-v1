const express = require("express");
const router = express.Router();
const yearlyPriceController = require("../Controllers/MineralPricesYearlyController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", yearlyPriceController.getAllYearlyPrices);
router.get("/:id", yearlyPriceController.getYearlyPriceById);
router.post("/", authenticateToken, yearlyPriceController.createYearlyPrice);
router.put("/:id", authenticateToken, yearlyPriceController.updateYearlyPrice);
router.delete("/:id", authenticateToken, authorizeRole("admin"), yearlyPriceController.deleteYearlyPrice);

module.exports = router;
