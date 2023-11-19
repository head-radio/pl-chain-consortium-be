const express = require('express');
const router = express.Router();
const {
    paymentsRechargeCheckoutSession,
    paymentTransferToken,
    getPaymentTransferToken,
    getUserOperationOfPaymentTransferToken,
    paymentsRechargeCallback
} = require('../controller/paymentsController');

const { isAuth } = require('../config/auth');

router.post('/payments/recharge', isAuth, paymentsRechargeCheckoutSession);
router.post('/payments/tokens', isAuth, paymentTransferToken)
router.get('/payments/tokens/:sessionId', getPaymentTransferToken)
router.get('/payments/tokens/:sessionId/user-operations/:userOperationHash', getUserOperationOfPaymentTransferToken)
router.post('/payments/recharge/callback', paymentsRechargeCallback);

module.exports = router;