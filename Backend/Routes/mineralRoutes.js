const express = require("express");
const router = express.Router();
const mineralController = require("../Controllers/MineralController");

router.get("/", mineralController.getAllMinerals);
router.get("/:id", mineralController.getMineralById);
router.post("/", mineralController.createMineral);
router.put("/:id", mineralController.updateMineral);
router.delete("/:id", mineralController.deleteMineral);

module.exports = router;
