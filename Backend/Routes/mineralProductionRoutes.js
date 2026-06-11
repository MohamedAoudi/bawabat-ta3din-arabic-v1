const express = require("express");
const router = express.Router();
const mineralProductionController = require("../Controllers/MineralProductionController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", mineralProductionController.getAllMinerals);
router.get("/:id", mineralProductionController.getMineralById);
router.post("/", authenticateToken, mineralProductionController.createMineral);
router.put("/:id", authenticateToken, mineralProductionController.updateMineral);
router.delete("/:id", authenticateToken, authorizeRole("admin"), mineralProductionController.deleteMineral);

module.exports = router;
