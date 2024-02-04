const express = require('express');
const router = express.Router();
const {
    verifyEmailAddress,
    validateEmailAndRegisterUser,
    resetPassword,
    resetPasswordConfirm,
    login,
    getUser,
    updateUser,
    deleteCustomers,
    getUserBalance,
    validatePinCode,
    bankOnBoarding,
    getBankOnBoarding,
    bankOnBoardingPayOff
} = require('../controller/customersController');

const {
    emailVerificationLimit,
} = require('../config/others');

const { isAuth } = require('../config/auth');

router.post('/customers', emailVerificationLimit, verifyEmailAddress);
router.post('/customers/validate-email', validateEmailAndRegisterUser);
router.post('/customers/validate-pin-code', isAuth, validatePinCode);
router.post('/customers/reset-password', resetPassword);
router.put('/customers/reset-password', resetPasswordConfirm);
router.post('/customers/login', login);
router.get('/customers', isAuth, getUser);
router.get('/customers/balance', isAuth, getUserBalance);
router.put('/customers', isAuth, updateUser);
router.delete('/customers', isAuth, deleteCustomers)
router.post('/customers/bank-onboarding', isAuth, bankOnBoarding);
router.get('/customers/bank-onboarding', isAuth, getBankOnBoarding);
router.post('/customers/bank-onboarding/pay-off', isAuth, bankOnBoardingPayOff);

module.exports = router;