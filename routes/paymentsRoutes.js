const express = require('express');
const router = express.Router();
const {
    paymentsRechargeCheckoutSession,
    paymentsRechargeCallback
} = require('../controller/paymentsController');

const { isAuth } = require('../config/auth');

router.post('/payments/recharge', isAuth, paymentsRechargeCheckoutSession);
router.post('/payments/recharge/callback', paymentsRechargeCallback);

module.exports = router;