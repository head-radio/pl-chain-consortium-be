const errorCode = require('../enum/errorEnum')
const { signInToken, tokenForVerify } = require('../config/auth');
const auth = require('../config/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Stripe = require('stripe')

const utilityService = require('./utilityService')
const dynamoDBService = require('./dynamoDBService')

const PlChainService = require('./PlChainService');
const Constants = require('../utility/Constants');

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

                    // stripe creation customer
                    const stripeSecretKey = await utilityService.getProperty(Constants.STRIPE_SECRET_KEY)
                    const stripe = Stripe(stripeSecretKey);
                    let customer = await stripe.customers.create({
                        email: result.email,
                        description: result.email,
                    })
                    result.stripeCustomerId = customer.id

                    // create account abstraction
                    let plChainService = new PlChainService()
                    let createAccountAbstractionResponse = await plChainService.createAccountAbstraction()
                    console.log('createAccountAbstractionResponse', createAccountAbstractionResponse)

                    if (createAccountAbstractionResponse.status == 200) {

                        result.accountAbstraction = createAccountAbstractionResponse.body

                        await dynamoDBService.insertCustomers(result)
                        responseReturn = {
                            status: 200,
                            body: {
                                success: true,
                                message: 'Email verified! Please login now.'
                            }
                        }

                    } else {

                        responseReturn = {
                            status: 400,
                            body: {
                                success: false,
                                message: 'Error during account abstraction creation.'
                            }
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

                    dynamoDBUser.password = bcrypt.hashSync(decoded.password)
                    dynamoDBUser.passwordTokenVerification = undefined

                    resolve(dynamoDBUser)

                });

            })

            let responseReturn
            let errorReturn

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
                async error => {
                    dynamoDBUser.passwordTokenVerification = undefined
                    await dynamoDBService.insertCustomers(dynamoDBUser)
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
                language: user.language,
                accountAbstraction: {
                    aaAddress: user.accountAbstraction.aaAddress
                },
                pinCodeValidationHash: user.pinCodeValidationHash
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

    let response = {
        status: 200,
        body: { ...user }
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

    if (request.pinCodeValidation != null) {
        const pinCodeValidationHash = crypto.createHash('md5').update(request.pinCodeValidation.toString()).digest("hex")
        user.pinCodeValidationHash = pinCodeValidationHash
    }

    if (request.stripeAccountId) {
        user.stripeAccountId = request.stripeAccountId
    }

    await dynamoDBService.insertCustomers(user)

    let userObj = new Object({
        name: user.name,
        email: user.email,
        language: user.language,
        enablePush: user.enablePush,
        enableFingerprint: user.enableFingerprint,
        pinCodeValidation: user.pinCodeValidation
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

const getUserBalance = async (req) => {

    let user = await dynamoDBService.getCustomers({ email: req.email })

    let plChainService = new PlChainService()
    let getUserBalanceResponse = await plChainService.getUserBalance(user.accountAbstraction.aaAddress)

    let response = {
        status: 200,
        body: getUserBalanceResponse.body
    }

    return response

}

const validatePinCode = async (req) => {

    let user = await dynamoDBService.getCustomers({ email: req.email })

    if (await utilityService.isObjEmpty(user)) {
        let error = new Error('Invalid user!')
        error.status = 400
        error.error_code = errorCode.errorEnum.invalid_data;
        throw error;
    }

    const pinCodeValidationHash = crypto.createHash('md5').update(req.pinCodeValidation.toString()).digest("hex")
    console.log('> validatePinCode - pinCodeValidationHash', pinCodeValidationHash)

    if (pinCodeValidationHash != user.pinCodeValidationHash) {
        let error = new Error('Invalid Pin Code Validation!')
        error.status = 400
        error.error_code = errorCode.errorEnum.invalid_data;
        throw error;
    }

    let response = {
        status: 200,
        body: user
    }

    return response

}

const bankOnBoarding = async (req) => {

    try {

        console.log("> start bankOnBoarding - email", req.email)

        let customerResponse = await getUser({ email: req.email })

        if (await utilityService.isObjEmpty(customerResponse.body)) {
            let error = new Error('Invalid user!')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_data;
            throw error;
        }

        const stripeSecretKey = await utilityService.getProperty(Constants.STRIPE_SECRET_KEY)
        const stripe = Stripe(stripeSecretKey);

        let accountLink = new Object()

        if (customerResponse.body.stripeAccountId) {
            let retriveAccount = await stripe.accounts.retrieve(customerResponse.body.stripeAccountId)
            console.log("> customerService - bankOnBoarding - stripeAccountId for the user " + customerResponse.body.email
                + " is already exists and it is " + customerResponse.body.stripeAccountId
                + " and oboarding_status is " + retriveAccount.charges_enabled)
            if (retriveAccount.charges_enabled) {
                accountLink = await stripe.accounts.createLoginLink(customerResponse.body.stripeAccountId)
            } else {
                accountLink = await stripe.accountLinks.create({
                    account: customerResponse.body.stripeAccountId,
                    refresh_url: "https://www.pl-chain.com",
                    return_url: "https://www.pl-chain.com",
                    type: "account_onboarding",
                });
                console.log("> accountLink", accountLink)
            }
        } else {
            console.log("> customerService - bankOnBoarding - stripeAccountId for the user " + customerResponse.body.email + " not exists - start to create it ...")
            const account = await stripe.accounts.create({
                email: customerResponse.body.email,
                type: "express",
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });
            console.log("> customerService - bankOnBoarding - account", account)
            customerResponse.body.stripeAccountId = account.id
            updateUser(customerResponse.body)

            accountLink = await stripe.accountLinks.create({
                account: customerResponse.body.stripeAccountId,
                refresh_url: "https://www.pl-chain.com",
                return_url: "https://www.pl-chain.com",
                type: "account_onboarding",
            });
            console.log("> accountLink", accountLink)
        }

        let response = {
            status: 200,
            body: {
                accountLink: accountLink.url
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

const getBankOnBoarding = async (request) => {

    try {

        console.log("> start getBankOnBoarding", request)

        let stripeDetails = new Object()

        let customer = await dynamoDBService.getCustomers({ email: request.email })

        if (customer?.stripeAccountId) {
            const stripeSecretKey = await utilityService.getProperty(Constants.STRIPE_SECRET_KEY)
            const stripe = Stripe(stripeSecretKey);
            const account = await stripe.accounts.retrieve(customer?.stripeAccountId);
            console.log("> getUser - stripe account", account)
            stripeDetails.account = account
        }

        let response = {
            status: 200,
            body: { ...customer, stripeDetails }
        }

        return response

    } catch (exception) {

        console.error(exception)
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;

        throw exception;

    }

}

const bankOnBoardingPayOff = async (input) => {

    try {

        console.log("> start bankOnBoardingPayOff", JSON.stringify(input))

        let customer = await getUser(input)

        // check existing user
        if (await utilityService.isObjEmpty(customer.body)) {
            let error = new Error('Invalid user!')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_data;
            throw error;
        }

        // check the user must be onboarded on stripe account
        if (await utilityService.isObjEmpty(customer.body.stripeAccountId)) {
            let error = new Error('User has no stripeAccountId!')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_data;
            throw error;
        }

        const stripeSecretKey = await utilityService.getProperty(Constants.STRIPE_SECRET_KEY)
        const stripe = Stripe(stripeSecretKey);

        let balanceResponse = await getUserBalance(input)
        console.log("> balance", JSON.stringify(balanceResponse))

        // balance must be available
        if (balanceResponse.status != 200) {
            let error = new Error('Fail to retrieve balance!')
            error.status = 400
            error.error_code = errorCode.errorEnum.unexpected_error;
            throw error;
        }

        let balance = balanceResponse.body[0]["tuple-0"]
        console.log("> rawBalance is ", balance)

        // check data input
        if (await utilityService.isObjEmpty(input.amount)) {
            let error = new Error('Invalid amount!')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_data;
            throw error;
        }

        // check the balance must be greater than the input amount
        if (parseFloat(input.amount) > parseFloat(balance)) {
            let error = new Error('Insufficient amount!')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_data;
            throw error;
        }

        //////////////////
        let plChainService = new PlChainService()
        let payOffBurnTokenResponse = await plChainService.payOffBurnToken({
            address: customer.body.accountAbstraction.aaAddress,
            amount: input.amount
        })
        console.log('payOffBurnTokenResponse', payOffBurnTokenResponse)

        let isBurnedSuccess = (payOffBurnTokenResponse.status == 200)

        let transferStripe = new Object()
        if (isBurnedSuccess) {
            // call stripe to transfer cash
            transferStripe = await stripe.transfers.create({
                amount: input.amount,
                currency: "eur",
                destination: customer.body.stripeAccountId,
            });
        }

        let response = {
            status: payOffBurnTokenResponse.status,
            body: { ...payOffBurnTokenResponse.body, transferStripe }
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
};