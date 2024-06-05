const errorCode = require('../../enum/errorEnum')
const paymentsService = require('../../service/paymentsService');
const {
    paymentsRechargeCheckoutSession,
    paymentTransferToken,
    getPaymentTransferToken,
    getUserOperationOfPaymentTransferToken,
    paymentsRechargeCallback,
    getPaymentTransactions
} = require('../../controller/paymentsController');

paymentsService.createStripeCheckoutSession = jest.fn()
paymentsService.paymentTransferToken = jest.fn()
paymentsService.getPaymentTransferToken = jest.fn()
paymentsService.getUserOperationOfPaymentTransferToken = jest.fn()
paymentsService.paymentsRechargeCallback = jest.fn()
paymentsService.getPaymentTransactions = jest.fn()

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

    it('should execute payment transfer token', async () => {

        const mockReq = {
            user: {
                email: 'fsfa@gmail.com',
            },
            body: {
                to: "0xgrkgòlakfaòlfk",
                amount: "15",
                sessionId: "gflkgjdslfkg",
                ipfsURI: "fgkaklgjdfkl",
                nonce: "fkgjdlksgjdsl"
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockServiceResponse = {
            status: 200,
            body:
            {
            },
        };

        paymentsService.paymentTransferToken.mockResolvedValue(mockServiceResponse);

        await paymentTransferToken(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockServiceResponse.status);

    })

    it('should retrieve payment info from chain', async () => {

        const mockReq = {
            params: {
                sessionId: "gflkgjdslfkg",
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockServiceResponse = {
            status: 200,
            body:
            {
                payed: true,
                ipfsURI: 'ipfs://...'
            },
        };

        paymentsService.getPaymentTransferToken.mockResolvedValue(mockServiceResponse);

        await getPaymentTransferToken(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockServiceResponse.status);

    })

    it('should retrieve user-operations hash', async () => {

        const mockReq = {
            params: {
                sessionId: "gflkgjdslfkg",
                userOperationHash: '0xfsjglakgjldkgj'
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockServiceResponse = {
            status: 200,
            body:
            {
            },
        };

        paymentsService.getUserOperationOfPaymentTransferToken.mockResolvedValue(mockServiceResponse);

        await getUserOperationOfPaymentTransferToken(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockServiceResponse.status);

    })

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

    it('should retrieve transactions by address', async () => {

        const mockReq = {
            params: {
                address: "0xgd5fg4d654g65gretew6",
            },
            query: {
                page: 1,
                itemsPerPage: 20
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockServiceResponse = {
            status: 200,
            body: {
            },
        };

        paymentsService.getPaymentTransactions.mockResolvedValue(mockServiceResponse);

        await getPaymentTransactions(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockServiceResponse.status);

    })
});