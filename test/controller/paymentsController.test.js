const errorCode = require('../../enum/errorEnum')
const paymentsService = require('../../service/paymentsService');
const {
    checkoutSession
} = require('../../controller/paymentsController');

paymentsService.createCheckoutSession = jest.fn()

describe('paymentsController', () => {

    it('should create payment sessions', async () => {

        const mockReq = {
            body: {
                email: 'test@example.com',
                amount: 10,
                currency: 'EUR'
            },
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

        paymentsService.createCheckoutSession.mockResolvedValue(mockResponse);

        await checkoutSession(mockReq, mockRes);

        expect(paymentsService.createCheckoutSession).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
        expect(mockRes.json).toHaveBeenCalledWith(mockResponse.body);
    });

});