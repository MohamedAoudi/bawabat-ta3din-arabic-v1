const express = require("express");
const router = express.Router();
const mineralProductionController = require("../Controllers/MineralProductionController");

router.get("/", mineralProductionController.getAllMineralProduction);
router.get("/:id", mineralProductionController.getMineralProductionById);
router.post("/", mineralProductionController.createMineralProduction);
router.put("/:id", mineralProductionController.updateMineralProduction);
router.delete("/:id", mineralProductionController.deleteMineralProduction);

module.exports = router;
