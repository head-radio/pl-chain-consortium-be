// stripe.tests.js
const { Stripe } = require('stripe');
const {
    getNFTs
} = require("../../service/marketplacesService");

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

});
