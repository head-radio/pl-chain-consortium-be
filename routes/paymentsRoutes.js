const express = require('express');
const router = express.Router();
const {
    checkoutSession
} = require('../controller/paymentsController');

const { isAuth } = require('../config/auth');

router.post('/payments/recharge', isAuth, checkoutSession);

module.exports = router;