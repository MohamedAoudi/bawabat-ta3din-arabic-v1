const express = require("express");
const router = express.Router();
const worldProductionController = require("../Controllers/WorldProductionController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", worldProductionController.getAllWorldProductions);
router.get("/:id", worldProductionController.getWorldProductionById);
router.post("/", authenticateToken, worldProductionController.createWorldProduction);
router.put("/:id", authenticateToken, worldProductionController.updateWorldProduction);
router.delete("/:id", authenticateToken, authorizeRole("admin"), worldProductionController.deleteWorldProduction);

module.exports = router;
