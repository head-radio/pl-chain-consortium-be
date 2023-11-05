const errorCode = require('../enum/errorEnum')
const Stripe = require("stripe")
const utilityService = require('./utilityService')
const customersService = require('./customersService')
const Constants = require('./../utility/Constants')
const PlChainService = require('./PlChainService')

const createStripeCheckoutSession = async (request) => {

    try {
        const stripeSecretKey = await utilityService.getProperty(Constants.STRIPE_SECRET_KEY)
        const stripe = Stripe(stripeSecretKey);

        let customer = await customersService.getUser(request)
        console.log('> customer retrieved', customer)
        console.log('> stripeCustomerId', customer.body.stripeCustomerId)

        // Create an ephemeral key for the Customer; this allows the app to display saved payment methods and save new ones
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.body.stripeCustomerId },
            { apiVersion: '2020-08-27' }
        );

        // Create a PaymentIntent with the payment amount, currency, and customer
        const paymentIntent = await stripe.paymentIntents.create({
            amount: request.amount,
            currency: request.currency,
            customer: customer.body.stripeCustomerId,
            metadata: {
                email: customer.body.email,
                aaAddress: customer.body.accountAbstraction.aaAddress,
                walletId: customer.body.accountAbstraction.walletId
            }
        });

        let response = {
            status: 200,
            body: {
                publishableKey: process.env.publishable_key,
                paymentIntent: paymentIntent.client_secret,
                customer: customer.body.stripeCustomerId,
                ephemeralKey: ephemeralKey.secret
            }
        }

        return response

    } catch (exception) {

        console.error(exception)
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;

        throw exception;

    }
}

const paymentsRechargeCallback = async (input) => {

    // create account abstraction


    let isTransferSuccess = false
    let status = 400

    // TODO: calculate stripe signature to avoid recharge attack
    if (input.type == "charge.succeeded") {
        let plChainService = new PlChainService()
        let rechargeTransferTokenResponse = await plChainService.rechargeTransferToken({
            aaAddress: input.data.object.metadata.aaAddress,
            amount: input.data.object.amount
        })
        console.log('rechargeTransferTokenResponse', rechargeTransferTokenResponse)

        isTransferSuccess = (rechargeTransferTokenResponse.status == 200)
        status = rechargeTransferTokenResponse.status
    }

    let response = {
        status: status,
        body: {
            isTransferSuccess: isTransferSuccess,
            info: input.type
        }
    }

    return response

}

module.exports = {
    createStripeCheckoutSession,
    paymentsRechargeCallback
};