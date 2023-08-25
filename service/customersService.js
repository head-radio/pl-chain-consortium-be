const errorCode = require('../enum/errorEnum')
const { signInToken, tokenForVerify } = require('../config/auth');
const auth = require('../config/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const utilityService = require('./utilityService')
const dynamoDBService = require('./dynamoDBService')

let min = 300000
let max = 999999

const verifyEmailAddressAndSendEmail = async (request) => {

    try {

        let isValidEmail = await utilityService.isValidEmail(request.email)

        if (isValidEmail === null) {

            let error = new Error('invalid_email')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_email;
            throw error;

        }

        let dynamoDBUser = await dynamoDBService.getCustomers(request)

        if (dynamoDBUser.isActive) {

            let error = new Error('email_already_exists')
            error.status = 400
            error.error_code = errorCode.errorEnum.email_already_exists;
            throw error;

        } else {

            let codeVerification = Math.floor(Math.random() * (max - min) + min)
            request.codeVerification = codeVerification

            const tokenVerification = await tokenForVerify(request);
            const emailUser = await utilityService.getProperty('EMAIL_USER')

            const body = {
                from: emailUser,
                to: `${request.email}`,
                subject: 'Email Activation',
                subject: 'Verify Your Email',
                html:
                    `<h2>Hello ${request.email}</h2>
                    <p>Verify your email address to complete the signup and login into your <strong>pl-chain-consortium</strong> account.</p>
                    <p style="margin-bottom:20px;">Copy the code and past it in the mobile application that is waiting. This code will expire in <strong> 15 minute</strong>.</p>
                    <a style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">${codeVerification}</a>
                    <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at plchaincontact@gmail.com</p>
                    <p style="margin-bottom:0px;">Thank you</p>
                    <strong>pl-chain Team</strong>
                    `,
            };

            await auth.sendEmail(body);

            await dynamoDBService.insertCustomers({
                email: request.email,
                tokenVerification: tokenVerification
            })

            let response = {
                status: 200,
                body: {
                    success: true,
                    message: 'Please check your email to verify!'
                }
            }

            return response
        }

    } catch (exception) {
        exception.status = exception.status || 500
        throw exception;
    }

}

const validateEmailAndRegisterUser = async (request) => {

    try {

        console.log("validateEmailAndRegisterUser with codeVerification  " + request.codeVerification)

        let dynamoDBUser = await dynamoDBService.getCustomers({ email: request.email })

        if (dynamoDBUser.isActive) {

            let error = new Error('email_already_verified')
            error.status = 400
            error.error_code = errorCode.errorEnum.email_already_verified;
            throw error;

        }

        if (request) {

            const jwtSecret = await utilityService.getProperty('JWT_SECRET')

            let promise = new Promise(function (resolve, reject) {

                jwt.verify(dynamoDBUser.tokenVerification, jwtSecret, async (err, decoded) => {

                    if (err) {

                        let error = new Error(err.message)
                        error.status = 400
                        error.error_code = errorCode.errorEnum.invalid_data;
                        reject(error)
                        return

                    }

                    if (!Object.is(decoded.codeVerification, request.codeVerification)) {

                        let error = new Error('invalid_code_verification')
                        error.status = 400
                        error.error_code = errorCode.errorEnum.invalid_code_verification;
                        reject(error)
                        return

                    }

                    let newUser = {
                        'name': decoded.name,
                        'email': decoded.email,
                        'createdAt': await utilityService.formattedTimestamp(new Date()),
                        'password': bcrypt.hashSync(decoded.password),
                        'language': 'EN',
                        'isActive': true
                    };

                    resolve(newUser)

                });

            })

            let responseReturn;
            let errorReturn;

            await promise.then(
                async result => {
                    await dynamoDBService.insertCustomers(result)
                    responseReturn = {
                        status: 200,
                        body: {
                            success: true,
                            message: 'Email verified! Please login now.'
                        }
                    }
                },
                error => {
                    errorReturn = error
                }
            );

            if (errorReturn) {
                console.error(errorReturn)
                throw errorReturn;

            }

            return responseReturn;
        }
    } catch (exception) {
        exception.status = exception.status || 500
        throw exception;
    }

}

const resetPassword = async (request) => {

    let isValidEmail = await utilityService.isValidEmail(request.email)

    if (isValidEmail === null) {
        let error = new Error('invalid_email')
        error.status = 400
        error.error_code = errorCode.errorEnum.invalid_email;
        throw error;
    }

    let dynamoDBUser = await dynamoDBService.getCustomers(request)

    if (await utilityService.isNotObjEmpty(dynamoDBUser)) {

        let codeVerification = Math.floor(Math.random() * (max - min) + min)
        request.codeVerification = codeVerification

        const tokenVerification = await tokenForVerify(request);
        dynamoDBUser.passwordTokenVerification = tokenVerification

        const emailUser = await utilityService.getProperty('EMAIL_USER')

        const body = {
            from: emailUser,
            to: `${request.email}`,
            subject: 'Reset Password',
            subject: 'Reset password',
            html:
                `<h2>Hello ${request.email}</h2>
                <p>Change your password and login into your <strong>pl-chain-consortium</strong> account.</p>
                <p style="margin-bottom:20px;">Copy the code and past it in the mobile application that is waiting. This code will expire in <strong> 15 minute</strong>.</p>
                <a style="background:#22c55e;color:white;border:1px solid #22c55e; padding: 10px 15px; border-radius: 4px; text-decoration:none;">${codeVerification}</a>
                <p style="margin-top: 35px;">If you did not initiate this request, please contact us immediately at plchaincontact@gmail.com</p>
                <p style="margin-bottom:0px;">Thank you</p>
                <strong>pl-chain Team</strong>
                `,
        };

        await auth.sendEmail(body);

        await dynamoDBService.insertCustomers(dynamoDBUser)

        let response = {
            status: 200,
            body: {
                success: true,
                message: 'Please check your email to verify and change password!'
            }
        }

        return response

    } else {

        let error = new Error('customers_not_exists')
        error.status = 400
        error.error_code = errorCode.errorEnum.customers_not_exists;
        throw error;

    }

}

const resetPasswordConfirm = async (request) => {

    console.log("resetPasswordConfirm with email " + request.email)

    try {

        let dynamoDBUser = await dynamoDBService.getCustomers({ email: request.email })

        if (await utilityService.isObjEmpty(dynamoDBUser)) {

            let error = new Error('customers_not_exists')
            error.status = 400
            error.error_code = errorCode.errorEnum.customers_not_exists;
            throw error;

        }

        if (request) {

            const jwtSecret = await utilityService.getProperty('JWT_SECRET')

            let promise = new Promise(function (resolve, reject) {

                jwt.verify(dynamoDBUser.passwordTokenVerification, jwtSecret, async (err, decoded) => {

                    if (err) {

                        let error = new Error(err.message)
                        error.status = 400
                        error.error_code = errorCode.errorEnum.invalid_data;
                        reject(error)
                        return

                    }

                    if (!Object.is(decoded.codeVerification, request.codeVerification)) {

                        let error = new Error('invalid_code_verification')
                        error.status = 400
                        error.error_code = errorCode.errorEnum.invalid_code_verification;
                        reject(error)
                        return

                    }

                    dynamoDBUser.password = bcrypt.hashSync(request.password)
                    dynamoDBUser.passwordTokenVerification = undefined

                    resolve(dynamoDBUser)

                });

            })

            let responseReturn;
            let errorReturn;

            await promise.then(
                async result => {
                    await dynamoDBService.insertCustomers(result)
                    responseReturn = {
                        status: 200,
                        body: {
                            success: true,
                            message: 'Password updated! Please login now.'
                        }
                    }
                },
                error => {
                    errorReturn = error
                }
            );

            if (errorReturn) {
                console.error(errorReturn)
                throw errorReturn;

            }

            return responseReturn;
        }
    } catch (exception) {
        exception.status = exception.status || 500
        throw exception;
    }

}

const login = async (request) => {

    try {
        let user = await dynamoDBService.getCustomers(request)
        console.log('user retrieved from dynamo db ' + JSON.stringify(user))
        if (
            user &&
            user.password &&
            bcrypt.compareSync(request.password, user.password)
        ) {
            const token = await signInToken(user);
            let newObj = new Object({
                token,
                name: user.name,
                email: user.email,
                language: user.language
            })
            let response = {
                status: 200,
                body: newObj
            }
            return response
        } else {
            let error = new Error('Invalid user or password!')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_username_and_password;
            throw error;
        }
    } catch (exception) {
        exception.status = exception.status || 500
        throw exception;
    }

}

const getUser = async (req) => {

    let user = await dynamoDBService.getCustomers({ email: req.email })

    let userObj = new Object({
        name: user.name,
        email: user.email,
        language: user.language,
        enableFingerprint: user.enableFingerprint,
        enablePush: user.enablePush,
    })

    let response = {
        status: 200,
        body: userObj
    }

    return response

}

const updateUser = async (request) => {

    let user = await dynamoDBService.getCustomers({ email: request.email })

    if (await utilityService.isObjEmpty(user)) {
        let error = new Error('Invalid user!')
        error.status = 400
        error.error_code = errorCode.errorEnum.invalid_data;
        throw error;
    }

    if (request.name) {
        user.name = request.name
    }

    if (request.enablePush != null) {
        user.enablePush = request.enablePush
    }

    if (request.enableFingerprint != null) {
        user.enableFingerprint = request.enableFingerprint
    }

    await dynamoDBService.insertCustomers(user)

    let userObj = new Object({
        name: user.name,
        email: user.email,
        language: user.language,
        enablePush: user.enablePush,
        enableFingerprint: user.enableFingerprint
    })

    let response = {
        status: 200,
        body: userObj
    }

    return response

}

const deleteCustomers = async (request) => {

    try {

        let dynamoDBUser = await dynamoDBService.getCustomers(request)

        await dynamoDBService.deleteCustomers(dynamoDBUser)

        let response = {
            status: 200,
            body: {
                success: true,
                message: 'Success deletion!'
            }
        }

        return response

    } catch (exception) {
        exception.status = exception.status || 500
        throw exception;
    }

}

module.exports = {
    verifyEmailAddressAndSendEmail,
    validateEmailAndRegisterUser,
    resetPassword,
    resetPasswordConfirm,
    login,
    getUser,
    updateUser,
    deleteCustomers
};