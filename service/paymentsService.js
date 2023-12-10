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

const paymentTransferToken = async (input) => {

    try {
        let response = {}
        let customer = await customersService.getUser(input)

        let plChainService = new PlChainService()
        let generatePaymentTransferTokenSessionResponse = await plChainService.generatePaymentTransferTokenSession(input)
        console.log('generatePaymentTransferTokenSessionResponse', generatePaymentTransferTokenSessionResponse)

        if (generatePaymentTransferTokenSessionResponse.status != 200) {
            response = {
                status: generatePaymentTransferTokenSessionResponse.status,
                body: generatePaymentTransferTokenSessionResponse.body
            }
            return response
        }

        let executeUserOperationResponse = await plChainService.executeUserOperation({
            walletId: customer.body.accountAbstraction.walletId,
            sessionId: generatePaymentTransferTokenSessionResponse.body.sessionId
        })

        response = {
            status: executeUserOperationResponse.status,
            body: executeUserOperationResponse.body
        }

        return response

    } catch (exception) {

        console.error(exception)
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;

        throw exception;

    }

}

const getPaymentTransferToken = async (input) => {

    let plChainService = new PlChainService()
    let getPaymentTransferTokenResponse = await plChainService.getPaymentTransferToken({
        sessionId: input.sessionId,
    })
    console.log('getPaymentTransferTokenResponse', getPaymentTransferTokenResponse)

    let response = {
        status: getPaymentTransferTokenResponse.status,
        body: getPaymentTransferTokenResponse.body
    }

    return response

}

const getUserOperationOfPaymentTransferToken = async (input) => {

    let plChainService = new PlChainService()
    let getUserOperationOfPaymentTransferTokenResponse = await plChainService.getUserOperationOfPaymentTransferToken(input)
    console.log('getUserOperationOfPaymentTransferToken', getUserOperationOfPaymentTransferTokenResponse)

    let response = {
        status: getUserOperationOfPaymentTransferTokenResponse.status,
        body: getUserOperationOfPaymentTransferTokenResponse.body
    }

    return response

}

const paymentsRechargeCallback = async (input) => {

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

const getPaymentTransactions = async (input) => {

    let plChainService = new PlChainService()
    let getPaymentTransactionsResponse = await plChainService.getPaymentTransactions({
        address: input.address,
    })
    console.log('getPaymentTransactions', getPaymentTransactionsResponse)

    let response = {
        status: getPaymentTransactionsResponse.status,
        body: getPaymentTransactionsResponse.body
    }

    return response

}

module.exports = {
    createStripeCheckoutSession,
    paymentTransferToken,
    getPaymentTransferToken,
    getUserOperationOfPaymentTransferToken,
    paymentsRechargeCallback,
    getPaymentTransactions
};