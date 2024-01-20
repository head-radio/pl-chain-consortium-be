const marketplacesService = require("../service/marketplacesService");

const getNFTs = async (req, res) => {

    // #swagger.tags = ['Marketplace']
    // #swagger.description = 'API to retrive the list of NFT.'

    const { owner, page, itemsPerPage, category } = req.query;

    let response = await marketplacesService.getNFTs({
        owner: owner,
        page: page,
        itemsPerPage: itemsPerPage,
        category: category
    })
    res.status(response.status).json(response.body)

}

const executeNFTCreation = async (req, res) => {

    /*
    #swagger.tags = ['Marketplace']
    #swagger.description = 'API to create an NFT.'
    #swagger.parameters['CreateNFTRequest'] = {
        in: 'body',
        description: 'CreateNFT API',
        schema: {
            $ref: '#/definitions/CreateNFT'
        }
    }
    */

    try {
        let response = await marketplacesService.executeNFTCreation({
            ...{ email: req.user.email },
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

const executeNFTTransfer = async (req, res) => {

    // #swagger.tags = ['Marketplace']
    // #swagger.description = 'API to execute a session to buy an NFT.'

    let token = req.body.tokenId
    let price = req.body.price

    try {
        let response = await marketplacesService.executeNFTTransfer({
            ...{ email: req.user.email },
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

const getUserOperationOfNFTTransfer = async (req, res) => {

    // #swagger.tags = ['Marketplace']
    // #swagger.description = 'API to retrive the details of a userOperation related the NFT transfer done with account abstraction.'

    let sessionId = req.params.sessionId
    let userOperationHash = req.params.userOperationHash

    let response = await marketplacesService.getUserOperationOfNFTTransfer({
        sessionId: sessionId,
        userOperationHash: userOperationHash,
    })
    res.status(response.status).json(response.body)

}

const executeUploadImage = async (req, res) => {

    /*
    #swagger.tags = ['Marketplace']
    #swagger.parameters['UploadFileIPFS'] = {

        in: 'formData',
        name: 'files',
        type: 'file',
        description: 'The file to upload'

    }
    */

    try {
        console.log("> start executeUploadMultipart")
        let uploadFileToIPFSResponse = await marketplacesService.executeUploadImage({
            files: req.files
        });
        res.status(uploadFileToIPFSResponse.status).json(uploadFileToIPFSResponse.body)
    } catch (exception) {
        console.error(exception)
        res.status(400).send({
            error_code: "exception.error_code",
            message: "exception.message",
        });
    }

}

module.exports = {
    getNFTs,
    executeNFTCreation,
    executeNFTTransfer,
    getUserOperationOfNFTTransfer,
    executeUploadImage
};