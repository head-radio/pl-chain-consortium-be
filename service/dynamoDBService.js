const AWS = require('aws-sdk');

const errorCode = require('../enum/errorEnum')
const utilityService = require('./utilityService')

let plChainCustomersTable = "pl-chain-customers"
let plChainSqsMessagesTable = "pl-chain-sqs-messages"

const getCustomers = async (input) => {

  var params = {
    TableName: plChainCustomersTable,
    Key: {
      email: input.email
    }
  };

  return await executeGet(params);

};

const getSqsMessages = async (input) => {

  var params = {
    TableName: plChainSqsMessagesTable,
    Key: {
      token: input.token
    }
  };

  return await executeGet(params);

};

const insertCustomers = async (input) => {

  var params = {
    TableName: plChainCustomersTable,
    Item: input
  };

  return await executeInsert(params);

};

const insertSqsMessages = async (input) => {

  var params = {
    TableName: plChainSqsMessagesTable,
    Item: input
  };

  return await executeInsert(params);

};

const deleteCustomers = async (input) => {

  var params = {
    TableName: plChainCustomersTable,
    Key: {
      email: input.email
    }
  };

  return await executeDelete(params);

};

const deleteSqsMessages = async (input) => {

  var params = {
    TableName: plChainSqsMessagesTable,
    Key: {
      token: input.token
    }
  };

  return await executeDelete(params);

};

///////////////////////////////////////////

const executeGet = async (params) => {

  let start = new Date()

  let response = new Object()

  let promiseGet = new Promise(async function (resolve, reject) {
    let docClient = await initDocClientConfig()
    docClient.get(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  await promiseGet.then(
    result => {
      response = new Object(result.Item)
    },
    error => {
      console.error(error)
      response.error = error
    }
  );

  let end = new Date()
  let diff = await utilityService.timeDifference(end, start)
  //console.log('executeGet > the difference in seconds is ' + diff)

  if (response.error) {
    let error = new Error('db_connection_error')
    error.error_code = errorCode.errorEnum.db_connection_error;
    error.message = response.error
    error.status = 500
    throw error;
  }

  return response

}

const executeInsert = async (params) => {

  let response = new Object()

  let promiseInsertData = new Promise(async function (resolve, reject) {
    let docClient = await initDocClientConfig()
    docClient.put(params, function (err, data) {
      if (err) {
        reject(false);
      } else {
        resolve(true);
      }
    });
  });

  await promiseInsertData.then(
    result => {
      console.log(result)
    },
    error => {
      console.error(error)
      response.error = error
    }
  );

  if (response.error) {
    let error = new Error('db_connection_error')
    error.error_code = errorCode.errorEnum.db_connection_error;
    error.message = response.error
    error.status = 500
    throw error;
  }

}

const executeDelete = async (params) => {

  let promiseInsertData = new Promise(async function (resolve, reject) {
    let docClient = await initDocClientConfig()
    docClient.delete(params, function (err, data) {
      if (err) {
        console.error(err)
        reject(false);
      } else {
        resolve(true);
      }
    });
  });

  await promiseInsertData.then(
    result => console.log(result),
    error => console.log(error)
  );

}

const initDocClientConfig = async () => {

  const accessKeyId = await utilityService.getProperty('ACCESS_KEY_ID')
  const secretAccessKey = await utilityService.getProperty('SECRET_ACCESS_KEY')

  let dynamoConf = {
    region: process.env.REGION,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  }

  if (process.env.NODE_ENV == 'local') {
    dynamoConf.endpoint = process.env.DYNAMO_DB_ENDPOINT
  }

  AWS.config.update(dynamoConf);

  var docClient = new AWS.DynamoDB.DocumentClient()

  return docClient

}

module.exports = {
  getCustomers,
  getSqsMessages,
  insertCustomers,
  insertSqsMessages,
  deleteCustomers,
  deleteSqsMessages
};
