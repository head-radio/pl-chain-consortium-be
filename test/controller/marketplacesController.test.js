const errorCode = require('../../enum/errorEnum')
const marketplacesService = require('../../service/marketplacesService');
const {
    getNFTs
} = require('../../controller/marketplacesController');

marketplacesService.getNFTs = jest.fn()

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
});