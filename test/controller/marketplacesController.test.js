const errorCode = require('../../enum/errorEnum')
const marketplacesService = require('../../service/marketplacesService');
const {
    getNFTs,
    executeNFTCreation,
    executeNFTTransfer,
    getUserOperationOfNFTTransfer,
    executeUploadImage
} = require('../../controller/marketplacesController');

marketplacesService.getNFTs = jest.fn()
marketplacesService.executeNFTCreation = jest.fn()
marketplacesService.executeNFTTransfer = jest.fn()
marketplacesService.getUserOperationOfNFTTransfer = jest.fn()
marketplacesService.executeUploadImage = jest.fn()

describe('marketplacesController', () => {

    it('should retrieve NFTs', async () => {

        const mockReq = {
            query: {
                owner: "owner",
                page: 1,
                itemsPerPage: 20
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockServiceResponse = {
            status: 200,
            body: [
                {
                    "tokenId": "1",
                    "tokenURI": "fuckedURI",
                    "owner": "0x1e810EfFBb3cDd03FaaDa74716b09B5C2C490F4C",
                    "price": "1000",
                    "chainId": "80001",
                    "tokenType": "ERC721"
                }
            ],
        };

        marketplacesService.getNFTs.mockResolvedValue(mockServiceResponse);

        await getNFTs(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockServiceResponse.status);

    })

    //npm test -- marketplacesController -t execute
    it('should execute NFT creation', async () => {

        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
            body: {
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockServiceResponse = {
            status: 200,
            body: {
            },
        };

        marketplacesService.executeNFTCreation.mockResolvedValue(mockServiceResponse);

        await executeNFTCreation(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockServiceResponse.status);

    })

    it('should execute NFT transfer', async () => {

        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
            body: {
            },
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockServiceResponse = {
            status: 200,
            body: {
            },
        };

        marketplacesService.executeNFTTransfer.mockResolvedValue(mockServiceResponse);

        await executeNFTTransfer(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockServiceResponse.status);

    })

    it('should get user operation of NFT transfer', async () => {

        const mockReq = {
            params: {
                sessionId: "gflkgjdslfkg",
                userOperationHash: '0xfsjglakgjldkgj'
            }
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockServiceResponse = {
            status: 200,
            body: {
            },
        };

        marketplacesService.getUserOperationOfNFTTransfer.mockResolvedValue(mockServiceResponse);

        await getUserOperationOfNFTTransfer(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockServiceResponse.status);

    })

    it('should upload Image to IPFS', async () => {

        let email_test = 'test@gmail.com'
        const mockReq = {
            user: {
                email: email_test
            },
            files: [{
            }],
        };

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        const mockServiceResponse = {
            status: 200,
            body: {
            },
        };

        marketplacesService.executeUploadImage.mockResolvedValue(mockServiceResponse);

        await executeUploadImage(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(mockServiceResponse.status);

    })

});