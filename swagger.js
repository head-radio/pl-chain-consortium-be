require('dotenv').config();

const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./routes/*.js']

let hostBased = process.env.REMOTE_HOST_BE_API;
let basePathConf = process.env.PL_CHAIN_BACKEND_CONTEXT_PATH
let localSchemes = ['http']

if (process.env.NODE_ENV == 'dev') {
    hostBased = process.env.REMOTE_HOST_BE_API_DEV;
    localSchemes = ['https']
}

console.log("set swagger host with " + hostBased + " and basepathconf " + basePathConf)
console.log("set swagger schemes with " + localSchemes)

const doc = {
    info: {
        version: "1.0.0",
        title: "pl-chain API",
        description: "Documentation for <b>pl-chain-consortium</b> integration provided by the <b>pl-chain S.p.a.</b>."
    },
    host: hostBased,
    basePath: basePathConf,
    schemes: localSchemes,
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            "name": "Customers",
            "description": "Customers service."
        },
    ],
    securityDefinitions: {

        Bearer: {
            type: "apiKey",
            name: "Authorization",
            in: "header"
        }

    },
    definitions: {
        Customer: {
            name: "Jhon Doe",
            email: "email@gmail.com",
        },
    }
}

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./app.js')
})