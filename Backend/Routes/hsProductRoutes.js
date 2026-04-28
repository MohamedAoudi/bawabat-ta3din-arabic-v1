const express = require("express");
const router = express.Router();
const hsProductController = require("../Controllers/HSProductController");

router.get("/", hsProductController.getAllHSProducts);
router.get("/:code", hsProductController.getHSProductByCode);
router.post("/", hsProductController.createHSProduct);
router.put("/:code", hsProductController.updateHSProduct);
router.delete("/:code", hsProductController.deleteHSProduct);

module.exports = router;
