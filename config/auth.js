require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const errorCode = require("../enum/errorEnum")
const utilityService = require('./../service/utilityService')
const Constants = require('./../utility/Constants')

const signInToken = async (user) => {
  const jwtSecret = await utilityService.getProperty(Constants.JWT_SECRET)
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      imalisteningge: user.image,
      admin: user.admin,
      userss2sToken: user.userss2sToken
    },
    jwtSecret,
    {
      expiresIn: '2d',
    }
  );
};

const userss2sTokenRegistration = async (userss2s) => {
  const jwtSecret = await utilityService.getProperty(Constants.JWT_SECRET)
  return jwt.sign(
    {
      _id: userss2s._id,
      email: userss2s.email,
      userss2sSessionId: userss2s.userss2sSessionId,
      contractAddress: userss2s.contractAddress,
      projectId: userss2s.projectId,
      admin: false,
      userss2s: true,
    },
    jwtSecret,
    {
      expiresIn: '3m',
    }
  );
};

const tokenForVerify = async (request) => {
  const jwtSecret = await utilityService.getProperty(Constants.JWT_SECRET)
  return jwt.sign(
    {
      name: request.name,
      email: request.email,
      password: request.password,
      codeVerification: request.codeVerification
    },
    jwtSecret,
    { expiresIn: '15m' }
  );
};

const isAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  const jwtSecret = await utilityService.getProperty(Constants.JWT_SECRET)
  req.authorization = authorization
  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

const sendEmail = async (body) => {

  const emailUser = await utilityService.getProperty(Constants.EMAIL_USER)
  const emailPass = await utilityService.getProperty(Constants.EMAIL_PASS)

  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    service: process.env.SERVICE,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  let promiseGet = new Promise(function (resolve, reject) {

    transporter.verify(function (err, success) {
      if (err) {
        console.log(err.message);
        let error = new Error(`Error happen when verify ${err.message}`)
        error.error_code = errorCode.errorEnum.smtp_service_provider_error;
        reject(err);
      } else {
        console.log('Server is ready to take our messages');
        transporter.sendMail(body, (err, data) => {
          if (err) {
            console.log(err.message);
            let error = new Error(`Error happen when sending email ${err.message}`)
            error.error_code = errorCode.errorEnum.smtp_service_provider_error;
            reject(err);
          } else {
            resolve(data);
          }
        });
      }
    });
  })

  await promiseGet.then(
    result => {
      console.log(result)
    },
    error => console.error(error)
  );

}

module.exports = {
  signInToken,
  userss2sTokenRegistration,
  tokenForVerify,
  isAuth,
  sendEmail,
};
