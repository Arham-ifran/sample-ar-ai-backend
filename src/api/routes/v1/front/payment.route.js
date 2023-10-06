const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/front/payment.controller");

router.route("/get-payment").get(controller.getPayment);
router.route("/create-payment").post(controller.payment);
router.route("/cancel-subscription").get(controller.cancelSubscription);

module.exports = router;
