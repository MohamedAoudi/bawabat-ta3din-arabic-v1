const express = require("express");
const router = express.Router();
const bilateralTradeController = require("../Controllers/BilateralTradeController");

router.get("/", bilateralTradeController.getAllBilateralTrade);
router.get("/:id", bilateralTradeController.getBilateralTradeById);
router.post("/", bilateralTradeController.createBilateralTrade);
router.put("/:id", bilateralTradeController.updateBilateralTrade);
router.delete("/:id", bilateralTradeController.deleteBilateralTrade);

module.exports = router;
