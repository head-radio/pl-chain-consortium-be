const errorCode = require('../enum/errorEnum')
const Stripe = require("stripe")
const utilityService = require('./utilityService')
const customersService = require('./customersService')
const Constants = require('./../utility/Constants')
const PlChainService = require('./PlChainService')
const sqsService = require('./sqsService')
const dynamoDBService = require('./dynamoDBService')

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
                walletId: customer.body.accountAbstraction.walletId,
                token: await utilityService.generateTokenFromInput(request)
            }
        });

        let response = {
            status: 200,
            body: {
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

const paymentsRechargeByToken = async (input) => {

    let status = 400
    let isTransferSuccess = false

    console.log("> paymentsRechargeByToken", input)
    let objectSaved = await dynamoDBService.getSqsMessages({ token: input.token })
    console.log("> paymentsRechargeByToken - objectSaved", objectSaved)

    // check if token session is already exists in the database
    if (objectSaved?.processed) {
        let exception = new Object()
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;
        exception.message = "token already processed"
        throw exception
    }

    // transfer token if only a charge.succeeded
    if (input?.payload?.type == "charge.succeeded") {
        let plChainService = new PlChainService()
        let rechargeTransferTokenResponse = await plChainService.rechargeTransferToken({
            aaAddress: input.payload.data.object.metadata.aaAddress,
            amount: input.payload.data.object.amount
        })
        console.log('rechargeTransferTokenResponse', rechargeTransferTokenResponse)

        isTransferSuccess = (rechargeTransferTokenResponse.status == 200)
        status = rechargeTransferTokenResponse.status

        input.payload.processed = true
        dynamoDBService.insertSqsMessages(input.payload)
    }

    let response = {
        status: status,
        body: {
            isTransferSuccess: isTransferSuccess,
            info: input?.payload?.type
        }
    }

    return response

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
    let getUserOperationOfPaymentTransferTokenResponse = await plChainService.getUserOperationReceipt(input)
    console.log('getUserOperationOfPaymentTransferToken', getUserOperationOfPaymentTransferTokenResponse)

    let response = {
        status: getUserOperationOfPaymentTransferTokenResponse.status,
        body: getUserOperationOfPaymentTransferTokenResponse.body
    }

    return response

}

const paymentsRechargeCallback = async (input) => {

    console.log("> start paymentsRechargeCallback ...")

    let token = input.data.object.metadata.token
    const [responseVerifier, errorVerifier] = await utilityService.verifyToken(token)

    // check correct signature
    if (errorVerifier) {
        console.error("errorVerifier", errorVerifier)
        let exception = new Object()
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_signature;
        exception.message = errorVerifier
        throw exception;
    }

    console.log("> before retrieve token sqs")
    let objectSaved = await dynamoDBService.getSqsMessages({ token: token })
    console.log("> after retrieve token sqs", objectSaved)

    // check if token session is already exists in the database
    if (objectSaved?.processed) {
        let exception = new Object()
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;
        exception.message = "token already processed"
        throw exception;
    }

    // push data on a queue
    input.token = token
    let pushOnQueueData = await sqsService.pushOnQueue(input);
    // take messageId of the push
    input.MessageId = pushOnQueueData.MessageId

    //save data on database
    dynamoDBService.insertSqsMessages(input)

    let response = {
        status: 200
    }

    return response

}

const getPaymentTransactions = async (input) => {

    let plChainService = new PlChainService()
    let getPaymentTransactionsResponse = await plChainService.getPaymentTransactions({
        address: input.address,
        page: input.page,
        itemsPerPage: input.itemsPerPage
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
    paymentsRechargeByToken,
    paymentTransferToken,
    getPaymentTransferToken,
    getUserOperationOfPaymentTransferToken,
    paymentsRechargeCallback,
    getPaymentTransactions
};