const errorCode = require('../../enum/errorEnum');
const {
    verifyEmailAddressAndSendEmail,
    validateEmailAndRegisterUser,
    resetPassword,
    resetPasswordConfirm,
    login,
    getUser,
    updateUser,
    deleteCustomers
} = require('../../service/customersService');
const dynamoDBService = require('../../service/dynamoDBService');
const bcrypt = require('bcryptjs');

let auth = require('../../config/auth');

dynamoDBService.getCustomers = jest.fn()
dynamoDBService.insertCustomers = jest.fn()
dynamoDBService.deleteCustomers = jest.fn()
auth.sendEmail = jest.fn()

describe('customersService', () => {

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

    it('should validate email and register user', async () => {
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

});
