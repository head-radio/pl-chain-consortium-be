const marketplacesService = require("../service/marketplacesService");

const getNFTs = async (req, res) => {

    // #swagger.tags = ['Marketplace']
    // #swagger.description = 'API to retrive the list of NFT.'

    const { owner, page, itemsPerPage } = req.query;

    let response = await marketplacesService.getNFTs({
        owner: owner,
        page: page,
        itemsPerPage: itemsPerPage
    })
    res.status(response.status).json(response.body)

}

module.exports = {
    getNFTs
};