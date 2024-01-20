// stripe.tests.js
const { Stripe } = require('stripe');
const {
    getNFTs,
    executeUploadImage,
    executeNFTCreation,
    executeNFTTransfer,
    getUserOperationOfNFTTransfer
} = require("../../service/marketplacesService");

const customersService = require('./../../service/customersService')
customersService.getUser = jest.fn()

const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
const mockAxios = new MockAdapter(axios);

describe("marketplacesService", () => {

    beforeEach(() => {
        console.log('beforeEach')
    });
    afterEach(() => {
        console.log('afterEach')
        jest.clearAllMocks();
    });

    it("should execute getNFTs", async () => {

        const request = {
            owner: "owner",
            page: "page",
            itemsPerPage: "itemsPerPage"
        };

        mockAxios.onPost().reply(200, {});

        const response = await getNFTs(request);
        expect(response.status).toBe(200);

    });

    //npm test -- marketplacesService -t upload
    it("should upload image toIPFS", async () => {

        const request = {
            files: [
            ]
        };

        mockAxios.onPost().reply(200, {});

        const response = await executeUploadImage(request);
        expect(response.status).toBe(200);

    });

    //npm test -- marketplacesService -t creation
    it("should execute NFT creation", async () => {

        const request = {
            name: "input.name",
            image: "input.ipfsURL",
            category: "input.category",
            description: "input.description",
            attributes: "input.attributes",
        };

        customersService.getUser.mockResolvedValue({
            status: 200,
            body: {
                stripeCustomerId: "customer_id",
                accountAbstraction: {
                    aaAddress: '0Xfdgdgfds',
                    walletId: 'lkjflsakdjfaslkf'
                }
            }
        });

        mockAxios.onPost().reply(200, {});

        const response = await executeNFTCreation(request);
        expect(response.status).toBe(200);

    });

    //npm test -- marketplacesService -t creation
    it("should execute NFT creation exception", async () => {

        const request = {
            name: "input.name",
            image: "input.ipfsURL",
            category: "input.category",
            description: "input.description",
            attributes: "input.attributes",
        };

        customersService.getUser.mockResolvedValue({
            status: 200,
            body: {
                stripeCustomerId: "customer_id",
                accountAbstraction: {
                    aaAddress: '0Xfdgdgfds',
                    walletId: 'lkjflsakdjfaslkf'
                }
            }
        });

        mockAxios.onPost().reply(400, {});

        const response = await executeNFTCreation(request);
        expect(response.status).toBe(400);

    });

    //npm test -- marketplacesService -t execute
    it("should execute NFT transfer", async () => {

        const request = {
            tokenId: 123,
            price: 250
        };

        customersService.getUser.mockResolvedValue({
            status: 200,
            body: {
                stripeCustomerId: "customer_id",
                accountAbstraction: {
                    aaAddress: '0Xfdgdgfds',
                    walletId: 'lkjflsakdjfaslkf'
                }
            }
        });

        mockAxios.onPost().reply(200, {});

        const response = await executeNFTTransfer(request);
        expect(response.status).toBe(200);

    });

    //npm test -- marketplacesService -t execute
    it("should execute NFT transfer exception", async () => {

        const request = {
            tokenId: 123,
            price: 250
        };

        customersService.getUser.mockResolvedValue({
            status: 200,
            body: {
                stripeCustomerId: "customer_id",
                accountAbstraction: {
                    aaAddress: '0Xfdgdgfds',
                    walletId: 'lkjflsakdjfaslkf'
                }
            }
        });

        mockAxios.onPost().reply(400, {});

        const response = await executeNFTTransfer(request);
        expect(response.status).toBe(400);

    });

    it("should execute getUserOperationOfNFTTransfer", async () => {

        const request = {
            sessionId: "gflkgjdslfkg",
            userOperationHash: '0xgdklgjdlkgjdls'
        };

        mockAxios.onGet().reply(200, {});

        const response = await getUserOperationOfNFTTransfer(request);
        expect(response.status).toBe(200);

    });

});
