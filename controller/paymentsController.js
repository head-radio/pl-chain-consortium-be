const paymentsService = require("../service/paymentsService");

const checkoutSession = async (req, res) => {

    // #swagger.tags = ['Payments']
    // #swagger.description = 'API to create a customer that must be validated with the validation API.'

    let email = req.body.email
    let amount = req.body.amount
    let currency = req.body.currency

    try {
        let response = await paymentsService.createCheckoutSession({
            email: email,
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

module.exports = {
    checkoutSession
};