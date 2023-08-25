const errorCode = require('../../enum/errorEnum')
const customersService = require('../../service/customersService');
const {
    verifyEmailAddress,
    validateEmailAndRegisterUser,
    updateUser,
    deleteCustomers,
    getUser,
    resetPassword,
    resetPasswordConfirm,
    login
} = require('../../controller/customersController');

customersService.verifyEmailAddressAndSendEmail = jest.fn()
customersService.validateEmailAndRegisterUser = jest.fn()
customersService.resetPassword = jest.fn()
customersService.resetPasswordConfirm = jest.fn()
customersService.updateUser = jest.fn()
customersService.deleteCustomers = jest.fn()
customersService.getUser = jest.fn()
customersService.login = jest.fn()

describe('customersController', () => {

    it('should send a verification email', async () => {
        const mockReq = {
            body: {
                email: 'test@example.com',
                password: 'password',
                name: 'Test User',
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: { message: 'Email sent successfully' },
        };

        customersService.verifyEmailAddressAndSendEmail.mockResolvedValue(mockResponse);

        await verifyEmailAddress(mockReq, mockRes);

        expect(customersService.verifyEmailAddressAndSendEmail).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
        expect(mockRes.json).toHaveBeenCalledWith(mockResponse.body);
    });

    it('should validation code and register user', async () => {
        const mockReq = {
            body: {
                email: 'test@example.com',
                codeVerification: 123456,
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: { message: 'Email verified! Please login now.' },
        };

        customersService.validateEmailAndRegisterUser.mockResolvedValue(mockResponse);

        await validateEmailAndRegisterUser(mockReq, mockRes);

        expect(customersService.validateEmailAndRegisterUser).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    it('should validation code and register user - exception', async () => {
        const mockReq = {
            body: {
                email: 'test@example.com',
                codeVerification: 123456,
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 400
        };

        customersService.validateEmailAndRegisterUser.mockImplementation(() => {
            let error = new Error('email_already_verified')
            error.status = 400
            error.error_code = errorCode.errorEnum.email_already_verified;
            throw error;
        });

        await validateEmailAndRegisterUser(mockReq, mockRes);

        expect(customersService.validateEmailAndRegisterUser).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    it('should reset password', async () => {
        const mockReq = {
            body: {
                email: 'test@gmail.com'
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
        };

        customersService.resetPassword.mockResolvedValue(mockResponse);

        await resetPassword(mockReq, mockRes);

        expect(customersService.resetPassword).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    it('should reset password confirm', async () => {
        const mockReq = {
            body: {
                email: 'test@gmail.com',
                password: 'newpassword',
                codeVerification: 123456
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
        };

        customersService.resetPasswordConfirm.mockResolvedValue(mockResponse);

        await resetPasswordConfirm(mockReq, mockRes);

        expect(customersService.resetPasswordConfirm).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    it('should login', async () => {
        const mockReq = {
            body: {
                email: 'test@example.com',
                password: 'password',
            },
            socket: {
                ip: '1.1.1.1'
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: { token: 'fldkfjlakjalkfjkslfjlfjlsakfjal' },
        };

        customersService.login.mockResolvedValue(mockResponse);

        await login(mockReq, mockRes);

        expect(customersService.login).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
        expect(mockRes.json).toHaveBeenCalledWith(mockResponse.body);
    });

    it('should get user infos', async () => {
        const mockReq = {
            user: {
                email: 'test@example.com',
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: {
                email: 'test@example.com',
                name: 'test name'
            },
        };

        customersService.getUser.mockResolvedValue(mockResponse);

        await getUser(mockReq, mockRes);

        expect(customersService.getUser).toHaveBeenCalledWith(mockReq.user);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    it('should update user', async () => {
        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
            body: {
                email: email_test,
                name: 'Test User Name',
                enablePush: true,
                enableFingerprint: true
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: {
                name: 'Test User Name',
                enablePush: true
            }
        };

        customersService.updateUser.mockResolvedValue(mockResponse);

        await updateUser(mockReq, mockRes);

        expect(customersService.updateUser).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    it('should delete customers', async () => {
        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: {
                success: true,
                message: 'Success deletion!'
            }
        };

        customersService.deleteCustomers.mockResolvedValue(mockResponse);

        await deleteCustomers(mockReq, mockRes);

        expect(customersService.deleteCustomers).toHaveBeenCalledWith(mockReq.user);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    it('should delete customers - exception', async () => {
        const mockReq = {
            user: {
                email: 'test@example.com',
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 400
        };

        customersService.deleteCustomers.mockImplementation(() => {
            let error = new Error('test error')
            error.status = 400
            throw error;
        });

        await deleteCustomers(mockReq, mockRes);

        expect(customersService.deleteCustomers).toHaveBeenCalledWith(mockReq.user);
        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });


});
