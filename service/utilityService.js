require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const secretsManager = require('./secretsManager')

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

  console.log('> start getProperty for input: ' + input)
  console.log('> process.env.NODE_ENV: ' + process.env.NODE_ENV)
  console.log('> process.env.SECRETS_NAME: ' + process.env.SECRETS_NAME)
  console.log('> process.env.REGION: ' + process.env.REGION)

  if (process.env.NODE_ENV == 'local' || process.env.NODE_ENV == 'test') {
    value = process.env[input]
  } else {
    let secrets = await secretsManager.getSecret(process.env.SECRETS_NAME, process.env.REGION);
    let jsonSecrets = JSON.parse(secrets)
    console.log('> secrets: ' + jsonSecrets)
    value = jsonSecrets[input]
  }

  console.log('> end getProperty for input: ' + input + ' - result value: ' + value)

  return value

}

module.exports = {
  isValidEmail,
  timeDifference,
  isObjEmpty,
  isNotObjEmpty,
  formattedTimestamp,
  getProperty
};