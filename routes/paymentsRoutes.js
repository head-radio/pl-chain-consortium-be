const express = require('express');
const router = express.Router();
const {
    paymentsRechargeCheckoutSession,
    paymentsRechargeByToken,
    paymentTransferToken,
    getPaymentTransferToken,
    getUserOperationOfPaymentTransferToken,
    paymentsRechargeCallback,
    getPaymentTransactions
} = require('../controller/paymentsController');

const { isAuth } = require('../config/auth');

router.post('/payments/recharge', isAuth, paymentsRechargeCheckoutSession);
router.post('/payments/recharge/callback', paymentsRechargeCallback);
router.post('/payments/recharge/:token', paymentsRechargeByToken);
router.post('/payments/tokens', isAuth, paymentTransferToken)
router.get('/payments/tokens/:sessionId', getPaymentTransferToken)
router.get('/payments/tokens/:sessionId/user-operations/:userOperationHash', getUserOperationOfPaymentTransferToken)
router.get('/payments/transactions/:address', getPaymentTransactions)


module.exports = router;