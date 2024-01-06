const errorCode = require('../enum/errorEnum')
const Stripe = require("stripe")
const utilityService = require('./utilityService')
const customersService = require('./customersService')
const Constants = require('../utility/Constants')
const PlChainService = require('./PlChainService')

const getNFTs = async (input) => {

    let plChainService = new PlChainService()
    let getNFTsResponse = await plChainService.getNFTs({
        owner: input.owner,
        page: input.page,
        itemsPerPage: input.itemsPerPage
    })
    console.log('getNFTs', getNFTsResponse)

    let response = {
        status: getNFTsResponse.status,
        body: getNFTsResponse.body
    }

    return response

}

module.exports = {
    getNFTs
};