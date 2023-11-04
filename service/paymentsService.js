const errorCode = require('../enum/errorEnum')
const Stripe = require("stripe")
const utilityService = require('./../service/utilityService')

const createCheckoutSession = async (request) => {

    try {
        const stripeSecretKey = await utilityService.getProperty("STRIPE_SECRET_KEY")
        const stripe = Stripe(stripeSecretKey);

        // Create or retrieve the Stripe Customer object associated with your user.
        let customer = await stripe.customers.create(); // This example just creates a new Customer every time

        // Create an ephemeral key for the Customer; this allows the app to display saved payment methods and save new ones
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2020-08-27' }
        );

        // Create a PaymentIntent with the payment amount, currency, and customer
        const paymentIntent = await stripe.paymentIntents.create({
            amount: request.amount,
            currency: request.currency,
            customer: customer.id
        });

        let response = {
            status: 200,
            body: {
                publishableKey: process.env.publishable_key,
                paymentIntent: paymentIntent.client_secret,
                customer: customer.id,
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

module.exports = {
    createCheckoutSession
};