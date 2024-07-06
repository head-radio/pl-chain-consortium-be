const errorCode = require('../../enum/errorEnum');
const {
    getCircuits,
    getCircuit,
    createCircuit,
    deleteCircuit,
    createEvent,
    deleteEvent
} = require('../../service/circuitsService');

const dynamoDBService = require('../../service/dynamoDBService');

dynamoDBService.getCircuits = jest.fn()
dynamoDBService.insertCircuits = jest.fn()
dynamoDBService.getAllCircuits = jest.fn()
dynamoDBService.deleteCircuits = jest.fn()

describe('circuitsService', () => {

    afterEach(() => {
    });

    //npm test -- circuitsService -t "should retrieve"
    it("should retrieve circuits info", async () => {

        const mockReq = {};

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCircuits = [{
            "nameCircuit": "Circuito Bergamo Lugano",
            "description": "Lugano",
            "id": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45",
            "email": "test@gmail.com",
            "tokenLayerAddress": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        }];

        dynamoDBService.getAllCircuits.mockResolvedValue(mockGetCircuits);

        let response = await getCircuits(mockReq, mockRes)

        expect(response.status).toBe(200);
        expect(response.body.list.length).toBe(1)

    });

    //npm test -- circuitsService -t "should retrieve"
    it("should retrieve circuit", async () => {

        const mockReq = {
            email: 'test@example.com',
            tokenLayerAddress: "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCircuit = {
            "nameCircuit": "Circuito Bergamo Lugano",
            "description": "Lugano",
            "id": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45",
            "email": "test@gmail.com",
            "tokenLayerAddress": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        dynamoDBService.getCircuits.mockResolvedValue(mockGetCircuit);

        let response = await getCircuit(mockReq, mockRes)

        expect(response.status).toBe(200);
        expect(response.body.tokenLayerAddress).toBe("0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45")

    });

    //npm test -- circuitsService -t "should create"
    it("should create circuit", async () => {

        const mockReq = {
            email: 'test@example.com',
            nameCircuit: "Circuito Bergamo Lugano",
            description: "Lugano",
            tokenLayerAddress: "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const insertCircuit = {
            "nameCircuit": "Circuito Bergamo Lugano",
            "description": "Lugano",
            "id": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45",
            "email": "test@gmail.com",
            "tokenLayerAddress": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        dynamoDBService.insertCircuits.mockResolvedValue(insertCircuit);

        let response = await createCircuit(mockReq, mockRes)

        expect(response.status).toBe(200);
        expect(response.body.tokenLayerAddress).toBe("0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45")
        expect(response.body.id).toBe("0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45")

    });

    //npm test -- circuitsService -t "should create"
    it("should create circuit with exception", async () => {

        const mockReq = {
            description: "Lugano",
            tokenLayerAddress: "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const insertCircuit = {
            "nameCircuit": "Circuito Bergamo Lugano",
            "description": "Lugano",
            "id": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45",
            "email": "test@gmail.com",
            "tokenLayerAddress": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        dynamoDBService.insertCircuits.mockResolvedValue(insertCircuit);

        let response
        try {
            response = await createCircuit(mockReq, mockRes)
        } catch (error) {
            response = error
        }
        expect(response.status).toBe(400);

    });

    //npm test -- circuitsService -t "should delete"
    it("should delete circuit", async () => {

        const mockReq = {
            email: 'test@example.com',
            tokenLayerAddress: "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const getCircuitMock = {
            "nameCircuit": "Circuito Bergamo Lugano",
            "description": "Lugano",
            "id": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45",
            "email": mockReq.email,
            "tokenLayerAddress": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        dynamoDBService.getCircuits.mockResolvedValue(getCircuitMock);

        dynamoDBService.deleteCircuits.mockResolvedValue(getCircuitMock)

        let response = await deleteCircuit(mockReq, mockRes)

        expect(response.status).toBe(200);

    });

    //npm test -- circuitsService -t "should delete"
    it("should delete circuit with exception", async () => {

        const mockReq = {
            email: 'test@example.com',
            tokenLayerAddress: "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const getCircuitMock = {
            "nameCircuit": "Circuito Bergamo Lugano",
            "description": "Lugano",
            "id": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45",
            "email": "fsdfjlskfjlsa@gmail.com",
            "tokenLayerAddress": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        dynamoDBService.getCircuits.mockResolvedValue(getCircuitMock);

        dynamoDBService.deleteCircuits.mockResolvedValue(getCircuitMock)

        let response
        try {
            response = await deleteCircuit(mockReq, mockRes)
        } catch (error) {
            response = error
        }
        expect(response.status).toBe(400);

    });

    //npm test -- circuitsService -t "should create"
    it("should create event", async () => {

        const mockReq = {
            email: 'test@example.com',
            event: {
                "id": 1,
                "title": "Concerto di Musica",
                "description": "description fsoidjfsjfd fsidojfiosdfuiodsa fsdofiosdufosia fodsiufoisadfu",
                "date": "25 Giugno 2024",
                "time": "19:00",
                "location": "Teatro Verdi, Via Roma 1, Milano",
                "contacts": "+39 123 456 7890",
                "info": "Un evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.\nUn evento imperdibile con i migliori artisti della scena musicale attuale.",
                "organizer": "Associazione Musica Viva",
                "link": "https://example.com/prevendite",
                "image": "https://www.virginradio.it/userUpload/Schermata_20161031_a_193424.png"
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCircuit = {
            "nameCircuit": "Circuito Bergamo Lugano",
            "description": "Lugano",
            "id": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45",
            "email": "test@gmail.com",
            "tokenLayerAddress": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR45"
        };

        dynamoDBService.getCircuits.mockResolvedValue(mockGetCircuit);

        let response = await createEvent(mockReq, mockRes)

        expect(response.status).toBe(200);

    });

    //npm test -- circuitsService -t "should delete"
    it("should delete event", async () => {

        const mockReq = {
            email: 'test@example.com',
            id: 0
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockGetCircuit = {
            "nameCircuit": "Circuito Como Bamba",
            "description": "Como",
            "id": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR23",
            "email": "test@gmail.com",
            "events": [
                {
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
                }
            ],
            "tokenLayerAddress": "0x8FD1873245c0C2fE48dB87e4f098F91cE0E2dR23"
        };

        dynamoDBService.getCircuits.mockResolvedValue(mockGetCircuit);

        let response = await deleteEvent(mockReq, mockRes)

        expect(response.status).toBe(200);
        expect(response.body.events.length).toBe(0);

    });

});
