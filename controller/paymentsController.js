const paymentsService = require("../service/paymentsService");

const paymentsRechargeCheckoutSession = async (req, res) => {

    // #swagger.tags = ['Payments']
    // #swagger.description = 'API to create a customer that must be validated with the validation API.'

    let amount = req.body.amount
    let currency = req.body.currency

    try {
        let response = await paymentsService.createStripeCheckoutSession({
            email: req.user.email,
            amount: amount,
            currency: currency
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const paymentsRechargeByToken = async (req, res) => {

    // #swagger.tags = ['Payments']
    // #swagger.description = 'API to execute a recharge by SQS queue.'

    let token = req.params.token
    let payload = req.body

    try {
        console.log("> paymentsRechargeByToken - token", token)
        console.log("> paymentsRechargeByToken - payload", payload)
        let response = await paymentsService.paymentsRechargeByToken({
            token: token,
            payload: payload
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const paymentTransferToken = async (req, res) => {

    // #swagger.tags = ['Payments']
    // #swagger.description = 'API to execute a token transfer.'

    let from = req.body.from
    let to = req.body.to
    let amount = req.body.amount
    let sessionId = req.body.sessionId
    let ipfsURI = req.body.ipfsURI
    let nonce = req.body.nonce
    let name = req.body.name

    try {
        let response = await paymentsService.paymentTransferToken({
            ...{ email: req.user.email },
            ...req.body
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const getPaymentTransferToken = async (req, res) => {

    // #swagger.tags = ['Payments']
    // #swagger.description = 'API to retrive the details of a session token transfer.'

    let sessionId = req.params.sessionId

    let response = await paymentsService.getPaymentTransferToken({
        sessionId: sessionId,
    })
    res.status(response.status).json(response.body)

}

const getUserOperationOfPaymentTransferToken = async (req, res) => {

    // #swagger.tags = ['Payments']
    // #swagger.description = 'API to retrive the details of a userOperation related the payment done with account abstraction.'

    let sessionId = req.params.sessionId
    let userOperationHash = req.params.userOperationHash

    let response = await paymentsService.getUserOperationOfPaymentTransferToken({
        sessionId: sessionId,
        userOperationHash: userOperationHash,
    })
    res.status(response.status).json(response.body)

}

const paymentsRechargeCallback = async (req, res) => {

    // #swagger.tags = ['Payments']
    // #swagger.description = 'API to create a customer that must be validated with the validation API.'

    try {
        let response = await paymentsService.paymentsRechargeCallback(req.body)
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const getPaymentTransactions = async (req, res) => {

    // #swagger.tags = ['Payments']
    // #swagger.description = 'API to retrive the list of transaction given an address.'

    let address = req.params.address

    const { page, itemsPerPage } = req.query;

    let response = await paymentsService.getPaymentTransactions({
        address: address,
        page: page,
        itemsPerPage: itemsPerPage
    })
    res.status(response.status).json(response.body)

}

module.exports = {
    paymentsRechargeCheckoutSession,
    paymentsRechargeByToken,
    paymentTransferToken,
    getPaymentTransferToken,
    getUserOperationOfPaymentTransferToken,
    paymentsRechargeCallback,
    getPaymentTransactions
};