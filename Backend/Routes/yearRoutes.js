const express = require("express");
const router = express.Router();
const yearController = require("../Controllers/YearController");

router.get("/", yearController.getAllYears);
router.get("/:year", yearController.getYearByValue);
router.post("/", yearController.createYear);
router.put("/:year", yearController.updateYear);
router.delete("/:year", yearController.deleteYear);

module.exports = router;
