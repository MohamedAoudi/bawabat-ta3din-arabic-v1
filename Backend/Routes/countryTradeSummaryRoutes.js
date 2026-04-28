const express = require("express");
const router = express.Router();
const countryTradeSummaryController = require("../Controllers/CountryTradeSummaryController");

router.get("/", countryTradeSummaryController.getAllCountryTradeSummaries);
router.get("/:countryId/:year/:tradeType", countryTradeSummaryController.getCountryTradeSummary);
router.post("/", countryTradeSummaryController.upsertCountryTradeSummary);
router.put("/:countryId/:year/:tradeType", countryTradeSummaryController.updateCountryTradeSummary);
router.delete("/:countryId/:year/:tradeType", countryTradeSummaryController.deleteCountryTradeSummary);

module.exports = router;
