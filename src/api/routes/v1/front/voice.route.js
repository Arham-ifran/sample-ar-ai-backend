const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/front/voice.controller");

router.route("/get-voice-dropdown-list").get(controller.getVoiceDropDown);
router.route("/listen").post(controller.listen);

module.exports = router;
