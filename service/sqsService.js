const AWS = require('aws-sdk');
const utilityService = require('./utilityService')
const Constants = require('./../utility/Constants')

class sqsService {

  static async pushOnQueue(body) {

    let sqsAccessKeyId = await utilityService.getProperty(Constants.SQS_ACCESS_KEY_ID)
    let sqsSecretAccessKey = await utilityService.getProperty(Constants.SQS_SECRET_ACCESS_KEY)

    try {
      var sqs = new AWS.SQS({
        apiVersion: "2012-11-05",
        accessKeyId: sqsAccessKeyId,
        secretAccessKey: sqsSecretAccessKey,
        region: 'eu-south-1',
      });

      var params = {
        DelaySeconds: 10,
        MessageBody: JSON.stringify(body),
        QueueUrl: process.env.SQS_RECHARGE_WALLET
      };

      const data = await sqs.sendMessage(params).promise();
      console.log("Message sent, ID:", data.MessageId);

      return data

    } catch (err) {
      console.error("Error on pushOnQueue", err);
    }
  }

}

module.exports = sqsService;