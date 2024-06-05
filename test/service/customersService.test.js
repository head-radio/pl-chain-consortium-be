const errorCode = require('../../enum/errorEnum');
const {
    verifyEmailAddressAndSendEmail,
    validateEmailAndRegisterUser,
    resetPassword,
    resetPasswordConfirm,
    login,
    getUser,
    updateUser,
    deleteCustomers,
    getUserBalance,
    validatePinCode,
    bankOnBoarding,
    getBankOnBoarding,
    bankOnBoardingPayOff
} = require('../../service/customersService');
const dynamoDBService = require('../../service/dynamoDBService');
const bcrypt = require('bcryptjs');

let auth = require('../../config/auth');

dynamoDBService.getCustomers = jest.fn()
dynamoDBService.insertCustomers = jest.fn()
dynamoDBService.deleteCustomers = jest.fn()
auth.sendEmail = jest.fn()

const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
const mockAxios = new MockAdapter(axios);

const { Stripe } = require('stripe');

describe('customersService', () => {

    afterEach(() => {
        mockAxios.reset();
    });

    it('should send a verification email', async () => {
        const mockReq = {
            email: 'test@example.com',
            password: 'password',
            name: 'Test User',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {};

        let expectedResponse = {
            status: 200,
            body: {
                success: true,
                message: 'Please check your email to verify!'
            }
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);
        dynamoDBService.insertCustomers.mockResolvedValue();
        auth.sendEmail.mockResolvedValue()

        let response = await verifyEmailAddressAndSendEmail(mockReq, mockRes);

        expect(dynamoDBService.getCustomers).toHaveBeenCalledWith(mockReq);
        expect(auth.sendEmail).toHaveBeenCalledTimes(1)
        expect(expectedResponse).toEqual(response)

    });

    it('should send a verification email - exception', async () => {
        const mockReq = {
            email: 'test@example.com',
            password: 'password',
            name: 'Test User',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            name: 'Test User',
            isActive: true
        };

        let expectedResponse = {
            status: 400
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        let response

        try {
            response = await verifyEmailAddressAndSendEmail(mockReq, mockRes);
        } catch (exception) {
            response = exception
        }

        expect(dynamoDBService.getCustomers).toHaveBeenCalledWith(mockReq);
        expect(expectedResponse.status).toEqual(response.status)

    });

    it('should send a verification email - exception invalid email', async () => {
        const mockReq = {
            email: 'testexample.com',
            password: 'password',
            name: 'Test User',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {};

        let expectedResponse = {
            status: 400
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        let response

        try {
            response = await verifyEmailAddressAndSendEmail(mockReq, mockRes);
        } catch (exception) {
            response = exception
        }

        expect(expectedResponse.status).toEqual(response.status)

    });

    //npm test -- customersService -t abstraction
    it('should validate email and register user and create account abstraction', async () => {
        const mockReq = {
            email: 'test@example.com',
            codeVerification: 123456
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            ...mockReq,
            password: 'fuckedpwd'
        };

        const tokenVerification = await auth.tokenForVerify(mockGetCustomers);

        let expectedResponse = {
            status: 200,
            body: {
                success: true,
                message: 'Email verified! Please login now.'
            }
        }

        dynamoDBService.getCustomers.mockResolvedValue({
            ...mockGetCustomers,
            tokenVerification: tokenVerification
        });

        dynamoDBService.insertCustomers.mockResolvedValue();

        const createAccountAbstractionResponse = {
            body: {
                walletId: "11152483e7817391ff67d82cd03e5b63",
                address: "0x268DBF3079139106da490F816B30a47E04d0b523",
                privateKey: "0xbf79bd315046f57ca7c0731210e1b20a79aee575ca2c129636118a36b30fb43e",
                mnemonic: {
                    phrase: "urban still stage aerobic alone differ funny vague length today pitch couple",
                    path: "m/44'/60'/0'/0/0",
                    locale: "en"
                },
                aaAddres: "0x39E78606860c8395428551487BbE59248D262082",
                web3ProviderCode: "POL_TEST",
                contractId: "4375dfbbdaff556d6f99a5cf",
                projectId: "679ce380c4595d54f7c82a87d3274f8b",
                email: "xxxx@gmail.com"
            },
            status: 200,
        };

        // Mock the Axios POST request
        mockAxios.onPost().reply(200, createAccountAbstractionResponse);

        //
        const createCustomerMock = jest.fn(() => ({
            id: "customer_id",
        }));
        Stripe.prototype.customers = {
            create: createCustomerMock,
        };

        let response = await validateEmailAndRegisterUser(mockReq, mockRes);

        expect(expectedResponse).toEqual(response)
    });

    //npm test -- customersService -t abstraction
    it('should validate email and register user and create account abstraction error', async () => {
        const mockReq = {
            email: 'test@example.com',
            codeVerification: 123456
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            ...mockReq,
            password: 'fuckedpwd'
        };

        const tokenVerification = await auth.tokenForVerify(mockGetCustomers);

        let expectedResponse = {
            status: 400,
            body: {
                success: false,
                message: 'Error during account abstraction creation.'
            }
        }

        dynamoDBService.getCustomers.mockResolvedValue({
            ...mockGetCustomers,
            tokenVerification: tokenVerification
        });

        dynamoDBService.insertCustomers.mockResolvedValue();

        ///////////////////////////////////

        const createAccountAbstractionResponse = {
            body: {},
            status: 400,
        };

        // Mock the Axios POST request
        mockAxios.onPost().reply(400, createAccountAbstractionResponse);

        ///////////////////////////

        let response = await validateEmailAndRegisterUser(mockReq, mockRes);

        expect(expectedResponse).toEqual(response)
    });

    it('should validate email and register user - exception - user already active', async () => {
        const mockReq = {
            email: 'test@example.com',
            codeVerification: 123456
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            ...mockReq,
            password: 'fuckedpwd',
            isActive: true
        };

        const tokenVerification = await auth.tokenForVerify(mockGetCustomers);

        let expectedResponse = {
            status: 400,
            message: 'email_already_verified'
        }

        dynamoDBService.getCustomers.mockResolvedValue({
            ...mockGetCustomers,
            tokenVerification: tokenVerification
        });

        let response
        try {
            response = await validateEmailAndRegisterUser(mockReq, mockRes);
        } catch (exception) {
            response = exception
        }

        expect(expectedResponse.status).toEqual(response.status)
        expect(expectedResponse.message).toEqual(response.message)
    });

    it('should validate email and register user - exception - token expired', async () => {
        const mockReq = {
            email: 'test@example.com',
            codeVerification: 123456
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            ...mockReq,
            password: 'fuckedpwd',
        };

        let expectedResponse = {
            status: 400,
            message: 'invalid signature'
        }

        dynamoDBService.getCustomers.mockResolvedValue({
            ...mockGetCustomers,
            tokenVerification: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYW5nZWxvbmFtZSIsImVtYWlsIjoiYW5nZWxvLnBhbmljaGVsbGFAZ21haWwuY29tIiwicGFzc3dvcmQiOiJhbmdlbG8iLCJjb2RlVmVyaWZpY2F0aW9uIjo2MTc0MjIsImlhdCI6MTY5MjI3OTQzOCwiZXhwIjoxNjkyMjgwMzM4fQ.6rlSHHDgGRUED2pguf7TpRMjS-WH6zB4LELrcBBDvlk'
        });

        let response
        try {
            response = await validateEmailAndRegisterUser(mockReq, mockRes);
        } catch (exception) {
            response = exception
        }

        expect(expectedResponse.status).toEqual(response.status)
        expect(expectedResponse.message).toEqual(response.message)
    });

    it('should validate email and register user - exception - invalid code verification', async () => {
        const mockReq = {
            email: 'test@example.com',
            codeVerification: 123456
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            codeVerification: 123422,
            password: 'fuckedpwd',
        };

        const tokenVerification = await auth.tokenForVerify(mockGetCustomers);

        let expectedResponse = {
            status: 400,
            message: 'invalid_code_verification'
        }

        dynamoDBService.getCustomers.mockResolvedValue({
            ...mockGetCustomers,
            tokenVerification: tokenVerification
        });

        let response
        try {
            response = await validateEmailAndRegisterUser(mockReq, mockRes);
        } catch (exception) {
            response = exception
        }

        expect(expectedResponse.status).toEqual(response.status)
        expect(expectedResponse.message).toEqual(response.message)
    });

    it('should reset password', async () => {
        const mockReq = {
            email: 'test@example.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            ...mockReq,
            name: 'name',
            password: 'jsdklfjlsakfdjlskfjlsdkfjlsakdf'
        };

        let expectedResponse = {
            status: 200,
            body: {
                success: true,
                message: 'Please check your email to verify and change password!'
            }
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);
        dynamoDBService.insertCustomers.mockResolvedValue();
        auth.sendEmail.mockResolvedValue()

        let response = await resetPassword(mockReq, mockRes);

        expect(dynamoDBService.getCustomers).toHaveBeenCalledWith(mockReq);
        expect(expectedResponse).toEqual(response)

    });

    it('should reset password - exception - invalid email', async () => {
        const mockReq = {
            email: 'testexample.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        let expectedResponse = {
            status: 400,
        }

        let response;
        try {
            response = await resetPassword(mockReq, mockRes)
        } catch (exception) {
            response = exception
        }

        expect(expectedResponse.status).toEqual(response.status)

    });

    it('should reset password - exception - customer not exists', async () => {
        const mockReq = {
            email: 'test@example.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {};

        let expectedResponse = {
            status: 400,
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        let response
        try {
            response = await resetPassword(mockReq, mockRes)
        } catch (exception) {
            response = exception
        }

        expect(dynamoDBService.getCustomers).toHaveBeenCalledWith(mockReq);
        expect(expectedResponse.status).toEqual(response.status)

    });

    it('should reset password and confirm', async () => {
        const mockReq = {
            email: 'test@example.com',
            password: 'newpwd',
            codeVerification: 123456
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            ...mockReq,
            password: 'fuckedpwd'
        };

        const tokenVerification = await auth.tokenForVerify(mockGetCustomers);

        let expectedResponse = {
            status: 200,
            body: {
                success: true,
                message: 'Password updated! Please login now.'
            }
        }

        dynamoDBService.getCustomers.mockResolvedValue({
            ...mockGetCustomers,
            passwordTokenVerification: tokenVerification
        });

        dynamoDBService.insertCustomers.mockResolvedValue();

        let response = await resetPasswordConfirm(mockReq, mockRes);

        expect(expectedResponse).toEqual(response)
    });

    it('should reset password and confirm - exception - customer not exists', async () => {
        const mockReq = {
            email: 'test@example.com',
            password: 'newpwd',
            codeVerification: 123456
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {};

        let expectedResponse = {
            status: 400,
            message: 'customers_not_exists'
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        let response
        try {
            response = await resetPasswordConfirm(mockReq, mockRes)
        } catch (exception) {
            response = exception
        }

        expect(expectedResponse.status).toEqual(response.status)
        expect(expectedResponse.message).toEqual(response.message)

    });

    it('should reset password and confirm - exception - invalid token', async () => {
        const mockReq = {
            email: 'test@example.com',
            password: 'newpwd',
            codeVerification: 123456
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            ...mockReq,
            password: 'fuckedpwd'
        };

        let expectedResponse = {
            status: 400,
            message: 'invalid signature'
        }

        dynamoDBService.getCustomers.mockResolvedValue({
            ...mockGetCustomers,
            passwordTokenVerification: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYW5nZWxvbmFtZSIsImVtYWlsIjoiYW5nZWxvLnBhbmljaGVsbGFAZ21haWwuY29tIiwicGFzc3dvcmQiOiJhbmdlbG8iLCJjb2RlVmVyaWZpY2F0aW9uIjo2MTc0MjIsImlhdCI6MTY5MjI3OTQzOCwiZXhwIjoxNjkyMjgwMzM4fQ.6rlSHHDgGRUED2pguf7TpRMjS-WH6zB4LELrcBBDvlk'

        });

        let response
        try {
            response = await resetPasswordConfirm(mockReq, mockRes)
        } catch (exception) {
            response = exception
        }

        expect(expectedResponse.status).toEqual(response.status)
        expect(expectedResponse.message).toEqual(response.message)
    });

    it('should reset password and confirm - exception - invalid code verification', async () => {
        const mockReq = {
            email: 'test@example.com',
            password: 'newpwd',
            codeVerification: 123456
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            ...mockReq,
            codeVerification: 123412,
            password: 'fuckedpwd'
        };

        const tokenVerification = await auth.tokenForVerify(mockGetCustomers);

        let expectedResponse = {
            status: 400,
            message: 'invalid_code_verification'
        }

        dynamoDBService.getCustomers.mockResolvedValue({
            ...mockGetCustomers,
            passwordTokenVerification: tokenVerification
        });

        let response
        try {
            response = await resetPasswordConfirm(mockReq, mockRes)
        } catch (exception) {
            response = exception
        }

        expect(expectedResponse.status).toEqual(response.status)
        expect(expectedResponse.message).toEqual(response.message)
    });

    it('should login', async () => {
        const mockReq = {
            email: 'test@example.com',
            password: 'password',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            password: bcrypt.hashSync(mockReq.password),
            accountAbstraction: {
                aaAddres: "0Xer64e6wr54tete6w"
            }
        };

        let expectedResponse = {
            status: 200,
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        let response = await login(mockReq, mockRes);

        expect(expectedResponse.status).toEqual(response.status)
    });

    it('should login - exception', async () => {
        const mockReq = {
            email: 'test@example.com',
            password: 'password',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            password: bcrypt.hashSync(mockReq.password + 'sldkfjaslkf'),
        };

        let expectedResponse = {
            status: 400,
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        let response
        try {
            response = await login(mockReq, mockRes)
        } catch (exception) {
            response = exception
        }

        expect(expectedResponse.status).toEqual(response.status)
    });

    it('should getUser', async () => {
        const mockReq = {
            email: 'test@example.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            language: 'IT'
        };

        let expectedResponse = {
            status: 200,
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        let response = await getUser(mockReq, mockRes);

        expect(expectedResponse.status).toEqual(response.status)
    });

    it('should update user', async () => {
        const mockReq = {
            email: 'test@example.com',
            name: 'Test User',
            enablePush: true,
            enableFingerprint: false
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
        };

        let expectedResponse = {
            status: 200,
            body: mockReq
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);
        dynamoDBService.insertCustomers.mockResolvedValue();

        let response = await updateUser(mockReq, mockRes);

        expect(dynamoDBService.getCustomers).toHaveBeenCalledWith({ email: mockReq.email });
        expect(expectedResponse).toEqual(response)

    });

    it('should update user - exception - user not exists', async () => {
        const mockReq = {
            email: 'test@example.com',
            name: 'Test User',
            enablePush: true,
            enableFingerprint: false
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {};

        let expectedResponse = {
            status: 400,
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);
        dynamoDBService.insertCustomers.mockResolvedValue();

        let response
        try {
            response = await updateUser(mockReq, mockRes)
        } catch (exception) {
            response = exception
        }

        expect(dynamoDBService.getCustomers).toHaveBeenCalledWith({ email: mockReq.email });
        expect(expectedResponse.status).toEqual(response.status)

    });

    it('should delete user', async () => {
        const mockReq = {
            email: 'test@example.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        let expectedResponse = {
            status: 200,
            body: {
                success: true,
                message: 'Success deletion!'
            }
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockReq);
        dynamoDBService.deleteCustomers.mockResolvedValue();

        let response = await deleteCustomers(mockReq, mockRes);

        expect(dynamoDBService.getCustomers).toHaveBeenCalledWith(mockReq);
        expect(expectedResponse).toEqual(response)

    });

    //npm test -- customersService -t balance
    it('should get user info balance', async () => {

        const mockReq = {
            email: 'test@example.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            isActive: true,
            password: "$2a$10$v5jqTDuXag5pw0EwiKzV8ewkqM8x8J9BSSl2zMPRUFk.bKeZorQ0u",
            createdAt: "2023-11-04 10:59:24",
            accountAbstraction: {
                walletId: "1a459690ac067b7a1ada813dd3356383",
                privateKey: "0x2f0da9284853c5bec5d986718c0482e95627f4876b9962b45cd0fdd93e92c903",
                address: "0x037A3089219e5D4c46d780A28699e55055C4B776",
                aaAddres: "0xFaC346cD3105E052cEc7595F6203c41c9bfA9118",
                contractId: "4375dfbbdaff556d6f99a5cf",
                projectId: "679ce380c4595d54f7c82a87d3274f8b",
                email: "angelo.panichella@gmail.com"
            },
            email: "angelo.panichella@gmail.com",
            name: "angelo",
            language: "EN"
        };

        let expectedResponse = {
            status: 200,
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        const getBalance = {
            body: {
                "tuple-0": "50"
            },
            status: 200,
        };

        // Mock the Axios POST request
        mockAxios.onPost().reply(400, getBalance);

        let response = await getUserBalance(mockReq, mockRes);

        expect(expectedResponse.status).toEqual(response.status)

    });

    //npm test -- customersService -t pinCodeValidation
    it('should validate user pinCodeValidation', async () => {

        const mockReq = {
            email: 'test@example.com',
            pinCodeValidation: '[1,2,3,4]',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            pinCodeValidationHash: '7bd4c63ba2cdadb060f5730e7bf66a30',
        };

        let expectedResponse = {
            status: 200,
            body: mockReq
        }

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        let response = await validatePinCode(mockReq, mockRes);

        expect(dynamoDBService.getCustomers).toHaveBeenCalledWith({ email: mockReq.email });
        expect(expectedResponse.status).toEqual(response.status)

    });

    //npm test -- customersService -t bankOnBoarding
    it("should process the bankOnBoarding of user", async () => {

        let accountLinkURL = "https://........."

        const mockReq = {
            email: 'test@example.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
        };

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        //
        const Accounts = jest.fn(() => (
            {
                acct_id: "12345678",
            }
        ));
        Stripe.prototype.accounts = {
            create: Accounts,
        };
        const AccountLinks = jest.fn(() => (
            {
                url: accountLinkURL,
            }
        ));
        Stripe.prototype.accountLinks = {
            create: AccountLinks,
        };

        let response = await bankOnBoarding(mockReq, mockRes);

        expect(response.status).toBe(200);
        expect(response.body.accountLink).toEqual(accountLinkURL)
    });

    //npm test -- customersService -t bankOnBoarding of user with stripeAccountId
    it("should process the bankOnBoarding of user with stripeAccountId already exists and charges_enabled false", async () => {

        let accountLinkURL = "https://........."

        const mockReq = {
            email: 'test@example.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            stripeAccountId: '7bd4c63ba2cdadb060f5730e7bf66a30',
        };

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        //
        const Accounts = jest.fn(() => (
            {
                acct_id: "12345678",
                charges_enabled: false
            }
        ));
        Stripe.prototype.accounts = {
            retrieve: Accounts,
        };
        const AccountLinks = jest.fn(() => (
            {
                url: accountLinkURL,
            }
        ));
        Stripe.prototype.accountLinks = {
            create: AccountLinks,
        };

        let response = await bankOnBoarding(mockReq, mockRes);

        expect(response.status).toBe(200);
        expect(response.body.accountLink).toEqual(accountLinkURL)
    });

    //npm test -- customersService -t bankOnBoarding of user with stripeAccountId
    it("should process the bankOnBoarding of user with stripeAccountId already exists and charges_enabled true", async () => {

        let accountLinkURL = "https://........."

        const mockReq = {
            email: 'test@example.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            stripeAccountId: '7bd4c63ba2cdadb060f5730e7bf66a30',
        };

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        //
        const Accounts = jest.fn(() => (
            {
                acct_id: "12345678",
                charges_enabled: true
            }
        ));
        const AccountLinks = jest.fn(() => (
            {
                url: accountLinkURL,
            }
        ));
        Stripe.prototype.accounts = {
            retrieve: Accounts,
            createLoginLink: AccountLinks
        };

        let response = await bankOnBoarding(mockReq, mockRes);

        expect(response.status).toBe(200);
        expect(response.body.accountLink).toEqual(accountLinkURL)
    });

    //npm test -- customersService -t getBankOnBoarding
    it("should process the getBankOnBoarding of user", async () => {

        const mockReq = {
            email: 'test@example.com',
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            stripeAccountId: "fsdfkjsjkafhakj"
        };

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        //
        const Accounts = jest.fn(() => (
            {
                acct_id: "12345678",
                charges_enabled: true
            }
        ));
        Stripe.prototype.accounts = {
            retrieve: Accounts,
        };

        // Mock the Axios POST request
        mockAxios.onPost().reply(200, {});

        let response = await getBankOnBoarding(mockReq, mockRes);

        expect(response.status).toBe(200);
    });

    //npm test -- customersService -t bankOnBoardingPayOff
    it("should process the bankOnBoardingPayOff of user", async () => {

        const mockReq = {
            email: 'test@example.com',
            amount: "20"
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            stripeAccountId: '7bd4c63ba2cdadb060f5730e7bf66a30',
            accountAbstraction: {
                walletId: "1a459690ac067b7a1ada813dd3356383",
                privateKey: "0x2f0da9284853c5bec5d986718c0482e95627f4876b9962b45cd0fdd93e92c903",
                address: "0x037A3089219e5D4c46d780A28699e55055C4B776",
                aaAddres: "0xFaC346cD3105E052cEc7595F6203c41c9bfA9118",
                contractId: "4375dfbbdaff556d6f99a5cf",
                projectId: "679ce380c4595d54f7c82a87d3274f8b",
                email: "angelo.panichella@gmail.com"
            },
        };

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        //
        const Transfers = jest.fn(() => (
            {
                acct_id: "12345678",
                charges_enabled: true
            }
        ));
        Stripe.prototype.transfers = {
            create: Transfers,
        };

        const Balance = jest.fn(() => (
            {
                balance : 100
            }
        ));
        Stripe.prototype.balance = {
            retrieve: Balance,
        };

        // Mock the Axios POST request
        mockAxios.onPost(/\/read-transaction$/).reply(200, [{
            "tuple-0": "200"
        }]);

        // Mock the Axios POST request
        mockAxios.onPost(/\/write-transaction$/).reply(200, {});

        let response = await bankOnBoardingPayOff(mockReq, mockRes);

        expect(response.status).toBe(200);
    });

    //npm test -- customersService -t "should process the bankOnBoardingPayOff of user exception"
    it("should process the bankOnBoardingPayOff of user exception", async () => {

        const mockReq = {
            email: 'test@example.com',
            amount: "4000"
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCustomers = {
            email: 'test@example.com',
            stripeAccountId: '7bd4c63ba2cdadb060f5730e7bf66a30',
            accountAbstraction: {
                walletId: "1a459690ac067b7a1ada813dd3356383",
                privateKey: "0x2f0da9284853c5bec5d986718c0482e95627f4876b9962b45cd0fdd93e92c903",
                address: "0x037A3089219e5D4c46d780A28699e55055C4B776",
                aaAddres: "0xFaC346cD3105E052cEc7595F6203c41c9bfA9118",
                contractId: "4375dfbbdaff556d6f99a5cf",
                projectId: "679ce380c4595d54f7c82a87d3274f8b",
                email: "angelo.panichella@gmail.com"
            },
        };

        dynamoDBService.getCustomers.mockResolvedValue(mockGetCustomers);

        //
        const Transfers = jest.fn(() => (
            {
                acct_id: "12345678",
                charges_enabled: true
            }
        ));
        Stripe.prototype.transfers = {
            create: Transfers,
        };

        // Mock the Axios POST request
        mockAxios.onPost(/\/read-transaction$/).reply(200, [{
            "tuple-0": "200"
        }]);

        let exception
        try {
            await bankOnBoardingPayOff(mockReq, mockRes)
        } catch (ex) {
            exception = ex
        }
        expect(exception.message).toEqual("Insufficient amount!");

    });

});
