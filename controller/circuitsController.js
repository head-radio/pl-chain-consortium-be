const circuitsService = require("../service/circuitsService");

const getCircuits = async (req, res) => {

    // #swagger.tags = ['Circuits']
    // #swagger.description = 'API to retrive the list of circuits.'

    let response = await circuitsService.getCircuits()
    res.status(response.status).json(response.body)

}

const getCircuit = async (req, res) => {

    // #swagger.tags = ['Circuits']
    // #swagger.description = 'API to retrieve info about tokenLayer circuit on blockchain.'

    let tokenLayerAddress = req.params.tokenLayerAddress

    try {
        let response = await circuitsService.getCircuit({
            ...{email: req.user.email},
            ...{tokenLayerAddress: tokenLayerAddress}
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}


const createCircuit = async (req, res) => {

    // #swagger.tags = ['Circuits']
    // #swagger.description = 'API to create a tokenLayer circuit on blockchain.'

    let tokenLayerAddress = req.body.tokenLayerAddress
    let name = req.body.nameCircuit
    let description = req.body.description

    try {
        let response = await circuitsService.createCircuit({
            ...{email: req.user.email},
            ...req.body
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const deleteCircuit = async (req, res) => {

    // #swagger.tags = ['Circuits']
    // #swagger.description = 'API to delete a tokenLayer circuit on blockchain.'

    let tokenLayerAddress = req.params.tokenLayerAddress

    try {
        let response = await circuitsService.deleteCircuit({
            ...{email: req.user.email},
            ...{tokenLayerAddress: tokenLayerAddress}
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const createEvent = async (req, res) => {

    // #swagger.tags = ['Circuits']
    // #swagger.description = 'API to create info events about tokenLayer circuit on blockchain.'

    let tokenLayerAddress = req.params.tokenLayerAddress

    let id = req.body.id
    let title = req.body.title
    let description = req.body.description
    let date = req.body.date
    let time = req.body.time
    let location = req.body.location
    let contacts = req.body.contacts
    let info = req.body.info
    let organizer = req.body.organizer
    let link = req.body.link
    let image = req.body.image

    try {
        let response = await circuitsService.createEvent({
            ...{email: req.user.email},
            ...{tokenLayerAddress: tokenLayerAddress},
            ...{
                event: {
                    id: id,
                    title: title,
                    description: description,
                    date: date,
                    time: time,
                    location: location,
                    contacts: contacts,
                    info: info,
                    organizer: organizer,
                    link: link,
                    image: image
                }
            }
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
    }

}

const deleteEvent = async (req, res) => {

    // #swagger.tags = ['Circuits']
    // #swagger.description = 'API to delete an event from a tokenLayer circuit on blockchain.'

    let tokenLayerAddress = req.params.tokenLayerAddress
    let id = req.params.id

    try {
        let response = await circuitsService.deleteEvent({
            ...{email: req.user.email},
            ...{tokenLayerAddress: tokenLayerAddress},
            ...{id: id}
        })
        res.status(response.status).json(response.body)
    } catch (exception) {
        res.status(exception.status).send({
            error_code: exception.error_code,
            message: exception.message,
        });
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