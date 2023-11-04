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
    getUserBalance
} = require('../controller/customersController');

const {
    emailVerificationLimit,
} = require('../config/others');

const { isAuth } = require('../config/auth');

router.post('/customers', emailVerificationLimit, verifyEmailAddress);
router.post('/customers/validate-email', validateEmailAndRegisterUser);
router.post('/customers/reset-password', resetPassword);
router.put('/customers/reset-password', resetPasswordConfirm);
router.post('/customers/login', login);
router.get('/customers', isAuth, getUser);
router.get('/customers/balance', isAuth, getUserBalance);
router.put('/customers', isAuth, updateUser);
router.delete('/customers', isAuth, deleteCustomers)

module.exports = router;