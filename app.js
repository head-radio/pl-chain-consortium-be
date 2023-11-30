require('dotenv').config();

const serverless = require('serverless-http');

const express = require('express')
const useragent = require('express-useragent');

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')

const customersRoutes = require('./routes/customersRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');

// best practice dependencies
const compression = require('compression');
const helmet = require('helmet');
//

const app = express()

// cors origin
const cors = require("cors")
app.use(cors({
  origin: "*"
}))
console.log("set CORS with *")

let lbBasePath = process.env.PL_CHAIN_BACKEND_CONTEXT_PATH

// browser detection
app.use(useragent.express());

//
app.use(compression()); //Compress all routes
app.use(helmet());
//

//
app.use(express.json({ limit: '50mb' }));
//

app.use(lbBasePath + '/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.use(lbBasePath, customersRoutes);
app.use(lbBasePath, paymentsRoutes)

const httpServer = require("http").Server(app)

httpServer.listen(process.env.PORT || 3000, () => {
  console.log('listening on port ' + (process.env.PORT || 3000));
})

const handler = serverless(app)

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  //console.log('Before handler with set context')
  const result = await handler(event, context)
  //console.log('After handler')
  return result
}