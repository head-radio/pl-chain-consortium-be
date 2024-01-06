// stripe.tests.js
const { Stripe } = require('stripe');
const { createStripeCheckoutSession,
    paymentsRechargeCallback,
    paymentTransferToken,
    getPaymentTransferToken,
    getUserOperationOfPaymentTransferToken,
    getPaymentTransactions
} = require("./../../service/paymentsService");

const customersService = require('./../../service/customersService')
customersService.getUser = jest.fn()

const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
const mockAxios = new MockAdapter(axios);

describe("paymentsService", () => {

    beforeEach(() => {
        console.log('beforeEach')
    });
    afterEach(() => {
        console.log('afterEach')
        jest.clearAllMocks();
    });

    it("should create a checkout session", async () => {

        const request = {
            amount: 1000, // Replace with your test data
            currency: "usd", // Replace with your test data
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

        customersService.getUser.mockResolvedValue({
            status: 200,
            body: {
                stripeCustomerId: "customer_id",
                accountAbstraction: {
                    aaAddress: '0Xfdgdgfds',
                    walletId: 'lkjflsakdjfaslkf'
                }
            }
        });

        const response = await createStripeCheckoutSession(request);

        expect(response.status).toBe(200);
        expect(response.body.publishableKey).toBe(process.env.publishable_key); // Replace with your test data
        expect(response.body.customer).toBe("customer_id");
    });

    it("should process the callback from stripe", async () => {

        const request = {
            id: "evt_3O90djDoI0Ba3DbI3NmN9CLw",
            data: {
                object: {
                    id: "ch_3O90djDoI0Ba3DbI3nFsDbFU",
                    object: "charge",
                    amount: 3000,
                    metadata: {
                        walletId: "969171fc9073e407cf72957cc49e3892",
                        aaAddress: "0xe3F34B3883636D9a23dd694B15a14c97602A73b6",
                        email: "angelo.panichella@gmail.com"
                    },
                }
            },
            type: "charge.succeeded"
        };

        // Mock the Axios POST request
        mockAxios.onPost().reply(200, {});

        const response = await paymentsRechargeCallback(request);

        expect(response.status).toBe(200);
        expect(response.body.isTransferSuccess).toBe(true);
    });

    it("should process the callback from stripeand get error during recharge", async () => {

        const request = {
            id: "evt_3O90djDoI0Ba3DbI3NmN9CLw",
            data: {
                object: {
                    id: "ch_3O90djDoI0Ba3DbI3nFsDbFU",
                    object: "charge",
                    amount: 3000,
                    metadata: {
                        walletId: "969171fc9073e407cf72957cc49e3892",
                        aaAddress: "0xe3F34B3883636D9a23dd694B15a14c97602A73b6",
                        email: "angelo.panichella@gmail.com"
                    },
                }
            },
            type: "charge.succeeded"
        };

        // Mock the Axios POST request
        mockAxios.onPost().reply(400, {});

        const response = await paymentsRechargeCallback(request);

        expect(response.status).toBe(400);
        expect(response.body.isTransferSuccess).toBe(false);
    });


    it("should execute paymentTransferToken", async () => {

        const request = {
            email: 'fsdkfjsalkf@gmail.com',
            to: "0xgrkgòlakfaòlfk",
            amount: "15",
            sessionId: "gflkgjdslfkg",
            ipfsURI: "fgkaklgjdfkl",
            nonce: "fkgjdlksgjdsl"
        };

        customersService.getUser.mockResolvedValue({
            status: 200,
            body: {
                stripeCustomerId: "customer_id",
                accountAbstraction: {
                    aaAddress: '0Xfdgdgfds',
                    walletId: 'lkjflsakdjfaslkf'
                }
            }
        });

        mockAxios.onPost().reply(200, {});

        const response = await paymentTransferToken(request);
        expect(response.status).toBe(200);

    });

    it("should execute getPaymentTransferToken", async () => {

        const request = {
            sessionId: "gflkgjdslfkg",
        };

        mockAxios.onGet().reply(200, {});

        const response = await getPaymentTransferToken(request);
        expect(response.status).toBe(200);

    });

    it("should execute getUserOperationOfPaymentTransferToken", async () => {

        const request = {
            sessionId: "gflkgjdslfkg",
            userOperationHash: '0xgdklgjdlkgjdls'
        };

        mockAxios.onGet().reply(200, {});

        const response = await getUserOperationOfPaymentTransferToken(request);
        expect(response.status).toBe(200);

    });

    it("should execute getUserOperationOfPaymentTransferToken - exception", async () => {

        const request = {
            sessionId: "gflkgjdslfkg",
            userOperationHash: '0xgdklgjdlkgjdls'
        };

        mockAxios.onGet().reply(400, {});

        const response = await getUserOperationOfPaymentTransferToken(request);
        expect(response.status).toBe(400);

    });

    it("should execute getPaymentTransactions", async () => {

        const request = {
            address: "0xf456s4fs56af4a65sdf4a6s5df",
        };

        mockAxios.onGet().reply(200, {});

        const response = await getPaymentTransactions(request);
        expect(response.status).toBe(200);

    });

});
