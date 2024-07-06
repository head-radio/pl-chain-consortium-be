const errorCode = require('../../enum/errorEnum')
const circuitsService = require('../../service/circuitsService');
const {
    getCircuits,
    getCircuit,
    deleteCircuit,
    createCircuit,
    createEvent,
    deleteEvent
} = require('../../controller/circuitsController');

circuitsService.getCircuits = jest.fn()
circuitsService.getCircuit = jest.fn()
circuitsService.deleteCircuit = jest.fn()
circuitsService.createCircuit = jest.fn()
circuitsService.createEvent = jest.fn()
circuitsService.deleteEvent = jest.fn()

describe('circuitsController', () => {

    //npm test -- circuitsController -t retrieve
    it('should retrieve a circuit', async () => {

        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: {}
        };

        circuitsService.getCircuits.mockResolvedValue(mockResponse);

        await getCircuits(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    //npm test -- circuitsController -t retrieve
    it('should retrieve a circuit', async () => {

        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
            params: {
                tokenLayerAddress: "0xfsdkfsdakfhskadjf",
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: {}
        };

        circuitsService.getCircuit.mockResolvedValue(mockResponse);

        await getCircuit(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    //npm test -- circuitsController -t create
    it('should create a circuit', async () => {

        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
            body: {
                tokenLayerAddress: "0xfsdkfsdakfhskadjf",
                name: "name",
                description: "fsdlkfjs"
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: {}
        };

        circuitsService.createCircuit.mockResolvedValue(mockResponse);

        await createCircuit(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    //npm test -- circuitsController -t delete
    it('should delete a circuit', async () => {

        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
            params: {
                tokenLayerAddress: "0xfsdkfsdakfhskadjf",
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: {}
        };

        circuitsService.deleteCircuit.mockResolvedValue(mockResponse);

        await deleteCircuit(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    //npm test -- circuitsController -t create
    it('should delete an event', async () => {

        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
            params: {
                tokenLayerAddress: "0xfsdkfsdakfhskadjf",
                id: 0
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: {}
        };

        circuitsService.deleteEvent.mockResolvedValue(mockResponse);

        await deleteEvent(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

    //npm test -- circuitsController -t create
    it('should create an event', async () => {

        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
            params: {
                tokenLayerAddress: "0xfsdkfsdakfhskadjf"
            },
            body: {
                "date": "25 Giugno 2024",
                "image": "https://www.virginradio.it/userUpload/Schermata_20161031_a_193424.png",
                "organizer": "Associazione Musica Viva",
                "link": "https://example.com/prevendite",
                "description": "description fsoidjfsjfd fsidojfiosdfuiodsa fsdofiosdufosia fodsiufoisadfu",
                "location": "Teatro Verdi, Via Roma 1, Milano",
                "id": 0,
                "time": "19:00",
                "title": "Concerto di Musica",
                "contacts": "+39 123 456 7890",
                "info": "Un evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale."
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockResponse = {
            status: 200,
            body: {}
        };

        circuitsService.createEvent.mockResolvedValue(mockResponse);

        await createEvent(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockResponse.status);
    });

});
