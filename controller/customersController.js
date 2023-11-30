const customersService = require("../service/customersService");

const verifyEmailAddress = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'API to create a customer that must be validated with the validation API.'

    console.log("verifyEmailAddress with " + req.body.email)

    try {
        let response = await customersService.verifyEmailAddressAndSendEmail({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

};

const validateEmailAndRegisterUser = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'Validate email by verification code and completed the registration.'

    try {
        let response = await customersService.validateEmailAndRegisterUser({
            email: req.body.email,
            codeVerification: req.body.codeVerification
        })
        res.status(response.status).send(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const resetPassword = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'Request password reset.'

    try {
        let response = await customersService.resetPassword({
            email: req.body.email,
            password: req.body.password
        })
        res.status(response.status).send(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const resetPasswordConfirm = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'Reset password confirmation.'

    try {
        let response = await customersService.resetPasswordConfirm({
            email: req.body.email,
            codeVerification: req.body.codeVerification
        })
        res.status(response.status).send(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const login = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'Login API.'

    try {
        let request = new Object({
            email: req.body.email,
            password: req.body.password,
            ip: req.socket.remoteAddress
        })
        let response = await customersService.login(request)
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const getUser = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'Get Users Info API.'

    let response = await customersService.getUser(req.user)
    res.status(response.status).send(response.body)

}

const updateUser = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'Update Users Info API.'

    console.log("updateUser with " + req.user.email)

    try {
        let response = await customersService.updateUser({
            email: req.user.email,
            name: req.body.name,
            enablePush: req.body.enablePush,
            enableFingerprint: req.body.enableFingerprint,
            pinCodeValidation: req.body.pinCodeValidation
        })
        res.status(response.status).send(response.body)
    } catch (exception) {
        console.error(exception)
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const deleteCustomers = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'API to create a customer that must be validated with the validation API.'

    console.log("deleteCustomers with " + req.user.email)

    try {
        let response = await customersService.deleteCustomers({
            email: req.user.email
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

};

const getUserBalance = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'Get Users Balance Info API.'

    console.log("getUserBalance with " + req.user.email)

    try {
        let response = await customersService.getUserBalance(req.user)
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const validatePinCode = async (req, res) => {

    // #swagger.tags = ['Customers']
    // #swagger.description = 'Validate PIN Code API.'

    console.log("validatePinCode with " + req.user.email)

    try {
        let response = await customersService.validatePinCode({
            email: req.user.email,
            pinCodeValidation: req.body.pinCodeValidation,
        })
        res.status(response.status).send(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}


module.exports = {
    verifyEmailAddress,
    validateEmailAndRegisterUser,
    resetPassword,
    resetPasswordConfirm,
    login,
    getUser,
    updateUser,
    deleteCustomers,
    getUserBalance,
    validatePinCode
};