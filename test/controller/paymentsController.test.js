const errorCode = require('../../enum/errorEnum')
const paymentsService = require('../../service/paymentsService');
const {
    paymentsRechargeCheckoutSession,
    paymentsRechargeCallback
} = require('../../controller/paymentsController');

paymentsService.createStripeCheckoutSession = jest.fn()
paymentsService.paymentsRechargeCallback = jest.fn()

describe('paymentsController', () => {

    it('should create payment sessions', async () => {

        const mockReq = {
            body: {
                amount: 10,
                currency: 'EUR'
            },
            user: {
                email: 'randomemail'
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body:
            {
                publishableKey: "publishableKey",
                paymentIntent: "paymentIntent.client_secret",
                customer: "customer.id",
                ephemeralKey: "ephemeralKey.secret"
            },
        };

        paymentsService.createStripeCheckoutSession.mockResolvedValue(mockResponse);

        await paymentsRechargeCheckoutSession(mockReq, mockRes);

        expect(paymentsService.createStripeCheckoutSession).toHaveBeenCalledWith({
            email: 'randomemail',
            amount: 10,
            currency: 'EUR'
        });
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
        expect(mockRes.json).toHaveBeenCalledWith(mockResponse.body);
    });

    it('should receive callback from stripe', async () => {

        const mockReq = {
            body: {
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
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body:
            {
                isTransferSuccess: true,
                info: "charge.succeeded"
            },
        };

        paymentsService.paymentsRechargeCallback.mockResolvedValue(mockResponse);

        await paymentsRechargeCallback(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith(mockResponse.body);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);

    })


});