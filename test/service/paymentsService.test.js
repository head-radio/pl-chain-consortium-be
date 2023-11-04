// stripe.tests.js
const { Stripe } = require('stripe');
const { createCheckoutSession } = require("./../../service/paymentsService");

describe("createCheckoutSession", () => {
    it("should create a checkout session", async () => {
        const request = {
            amount: 1000, // Replace with your test data
            currency: "usd", // Replace with your test data
        };

        //
        const createCustomerMock = jest.fn(() => ({
            id: "customer_id",
        }));
        Stripe.prototype.customers = {
            create: createCustomerMock,
        };

        //
        const createEphemeralKeysMock = jest.fn(() => (
            { customer: "customer.id" },
            { apiVersion: '2020-08-27' }
        ));
        Stripe.prototype.ephemeralKeys = {
            create: createEphemeralKeysMock,
        };

        //
        const createPaymentIntentsMock = jest.fn(() => (
            {
                amount: 10,
                currency: 'EUR',
                customer: "customer.id"
            }
        ));
        Stripe.prototype.paymentIntents = {
            create: createPaymentIntentsMock,
        };

        const response = await createCheckoutSession(request);

        expect(response.status).toBe(200);
        expect(response.body.publishableKey).toBe(process.env.publishable_key); // Replace with your test data
        expect(response.body.customer).toBe("customer_id");
    });
});
