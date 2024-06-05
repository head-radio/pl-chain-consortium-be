require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const secretsManager = require('./secretsManager')
const jwt = require('jsonwebtoken');
const Constants = require('./../utility/Constants')
const errorCode = require('../enum/errorEnum')

const isValidEmail = async (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    );
};

const timeDifference = async (date1, date2) => {
  var difference = date1.getTime() - date2.getTime();
  var secondsDifference = Math.floor(difference / 1000);
  return secondsDifference
}

const isObjEmpty = async (obj) => {
  return Object.keys(obj).length === 0;
}

const isNotObjEmpty = async (obj) => {
  return Object.keys(obj).length !== 0;
}

const formattedTimestamp = async (input) => {
  const date = input.toISOString().split('T')[0];
  const time = input.toTimeString().split(' ')[0];
  return `${date} ${time}`
}

const getProperty = async (input) => {

  let value

  /*
  console.log('> start getProperty for input: ' + input
    + ' > process.env.NODE_ENV: ' + process.env.NODE_ENV
    + ' > process.env.SECRETS_NAME: ' + process.env.SECRETS_NAME
    + ' > process.env.REGION: ' + process.env.REGION)
  */
 
  if (process.env.NODE_ENV == 'local' || process.env.NODE_ENV == 'test') {
    value = process.env[input]
  } else {
    let secrets = await secretsManager.getSecret(process.env.SECRETS_NAME, process.env.REGION);
    let jsonSecrets = JSON.parse(secrets)
    //console.log('> secrets: ' + jsonSecrets)
    value = jsonSecrets[input]
  }

  //console.log('> end getProperty for input: ' + input + ' - result value: ' + value)

  return value

}

const generateTokenFromInput = async (request) => {
  const jwtSecret = await getProperty(Constants.JWT_SECRET)
  return jwt.sign(
    request,
    jwtSecret,
    { expiresIn: '2d' }
  );
};

const verifyToken = async (token) => {

  const jwtSecret = await getProperty(Constants.JWT_SECRET)

  let promise = new Promise(function (resolve, reject) {

    jwt.verify(token, jwtSecret, async (err, decoded) => {

      if (err) {

        let error = new Error(err.message)
        error.status = 400
        error.error_code = errorCode.errorEnum.invalid_signature;
        reject(error)
        return

      }

      resolve(decoded)

    });

  })

  let responseReturn;
  let errorReturn;

  await promise.then(
    async result => {
      responseReturn = result
    },
    error => {
      errorReturn = error
    }
  );

  return [responseReturn, errorReturn]

}

module.exports = {
  isValidEmail,
  timeDifference,
  isObjEmpty,
  isNotObjEmpty,
  formattedTimestamp,
  getProperty,
  generateTokenFromInput,
  verifyToken
};