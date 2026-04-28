const express = require("express");
const router = express.Router();
const countryProductionSummaryController = require("../Controllers/CountryProductionSummaryController");

router.get("/", countryProductionSummaryController.getAllCountryProductionSummaries);
router.get("/:countryId/:year/:mineralId", countryProductionSummaryController.getCountryProductionSummary);
router.post("/", countryProductionSummaryController.upsertCountryProductionSummary);
router.put("/:countryId/:year/:mineralId", countryProductionSummaryController.updateCountryProductionSummary);
router.delete("/:countryId/:year/:mineralId", countryProductionSummaryController.deleteCountryProductionSummary);

module.exports = router;
