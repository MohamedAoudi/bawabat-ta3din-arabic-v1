const express = require("express");
const router = express.Router();
const arabProductionController = require("../Controllers/ArabProductionController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/", arabProductionController.getAllArabProductions);
router.get("/:id", arabProductionController.getArabProductionById);
router.post("/", authenticateToken, arabProductionController.createArabProduction);
router.put("/:id", authenticateToken, arabProductionController.updateArabProduction);
router.delete("/:id", authenticateToken, authorizeRole("admin"), arabProductionController.deleteArabProduction);

module.exports = router;
