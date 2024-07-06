const errorCode = require('../enum/errorEnum')
const dynamoDBService = require('./dynamoDBService')
const PlChainService = require('./PlChainService')
const utilityService = require("./utilityService")

const getCircuits = async (input) => {

    let plChainService = new PlChainService()

    console.log('> getCircuits')

    let getCircuits = await dynamoDBService.getAllCircuits()
    console.log("> getCircuits", getCircuits)

    let circuits = {}
    circuits.list = getCircuits

    return {
        status: 200,
        body: circuits
    }

}

const getCircuit = async (input) => {

    console.log('> getCircuit')

    let getCircuit = await dynamoDBService.getCircuits(input)
    console.log("> getCircuit", getCircuit)

    return {
        status: 200,
        body: getCircuit
    }

}

const createCircuit = async (input) => {

    try {

        console.log("> createCircuit with input", input)

        if (input.tokenLayerAddress == null) {

            let error = new Error('invalid_blockchain_address')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_blockchain_address;
            throw error;

        }

        if (input.nameCircuit == null) {

            let error = new Error('nameCircuit is null')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_data;
            throw error;

        }

        if (input.email == null) {

            let error = new Error('email is null')
            error.status = 400
            error.error_code = errorCode.errorEnum.invalid_data;
            throw error;

        }

        let plChainService = new PlChainService()

        console.log('createCircuit')

        input.id = input.tokenLayerAddress
        let creationCircuitResult = await dynamoDBService.insertCircuits(input)

        console.log("> creationCircuitResult", creationCircuitResult)

        return {
            status: 200,
            body: creationCircuitResult
        }

    } catch (exception) {

        console.error(exception)
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;

        throw exception;

    }

}

const deleteCircuit = async (input) => {

    try {

        console.log("> deleteCircuit with input", input)

        let getCircuit = await dynamoDBService.getCircuits(input)
        console.log("> getCircuit", getCircuit)

        if (input.email !== getCircuit.email) {

            let error = new Error('user not owned of contract ' + input.tokenLayerAddress)
            error.status = 400
            error.error_code = errorCode.errorEnum.not_owned;
            throw error;

        }

        let deleteCircuitResult = await dynamoDBService.deleteCircuits(getCircuit)

        console.log("> deleteCircuit", deleteCircuitResult)

        return {
            status: 200,
            body: deleteCircuitResult
        }

    } catch (exception) {

        console.error(exception)
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;

        throw exception;

    }

}

const createEvent = async (input) => {

    console.log('> createEvent with input', input)

    let circuit = await dynamoDBService.getCircuits(input)
    console.log("> circuit", circuit)

    let events = []
    if (circuit.events != null) {
        events = circuit.events
    }
    events.push(input.event)

    circuit.events = events

    await dynamoDBService.insertCircuits(circuit)

    return {
        status: 200,
        body: circuit
    }

}

const deleteEvent = async (input) => {

    console.log('> deleteEvent with input', input)

    let circuit = await dynamoDBService.getCircuits(input)
    console.log("> circuit", circuit)

    const events = circuit.events;

    events.splice(input.eventId, 1);

    circuit.events = events

    await dynamoDBService.insertCircuits(circuit)

    return {
        status: 200,
        body: circuit
    }
}

module.exports = {
    getCircuits,
    getCircuit,
    createCircuit,
    deleteCircuit,
    createEvent,
    deleteEvent
};