const errorCode = require('../enum/errorEnum')
const customersService = require('./customersService')
const PlChainService = require('./PlChainService')

const getNFTs = async (input) => {

    let plChainService = new PlChainService()
    let getNFTsResponse = await plChainService.getNFTs({
        owner: input.owner,
        page: input.page,
        itemsPerPage: input.itemsPerPage,
        category: input.category
    })
    console.log('getNFTs', getNFTsResponse)

    let response = {
        status: getNFTsResponse.status,
        body: getNFTsResponse.body
    }

    return response

}


const executeUploadImage = async (input) => {

    try {

        console.log("> executeUploadImage")

        let plChainService = new PlChainService()

        let uploadFileToIPFSResponse = await plChainService.uploadFileToIPFSMultipart({
            files: input.files
        });

        let response = {
            status: uploadFileToIPFSResponse.status,
            body: uploadFileToIPFSResponse.body
        }

        return response

    } catch (exception) {

        console.error(exception)
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;

        throw exception;

    }

}

const executeNFTCreation = async (input) => {

    try {

        console.log("> executeNFTCreation - input:", JSON.stringify(input))

        let response = {}
        let customer = await customersService.getUser(input)

        let plChainService = new PlChainService()

        let uploadMetadataToIPFSResponse = await plChainService.uploadMetadataToIPFS({
            name: input.name,
            image: input.ipfsURL,
            category: input.category,
            description: input.description,
            attributes: input.attributes,
        });

        let generateNFTCreationSessionResponse = await plChainService.generateNFTCreationSession({
            tokenURI: uploadMetadataToIPFSResponse.body.ipfsURL,
            price: input.price,
            category: input.category,
        })

        if (generateNFTCreationSessionResponse.status != 200) {
            response = {
                status: generateNFTCreationSessionResponse.status,
                body: generateNFTCreationSessionResponse.body
            }
            return response
        }

        let executeUserOperationResponse = await plChainService.executeUserOperation({
            walletId: customer.body.accountAbstraction.walletId,
            sessionId: generateNFTCreationSessionResponse.body.sessionId
        })

        response = {
            status: executeUserOperationResponse.status,
            body: {
                ...executeUserOperationResponse.body,
                nftCreationSession: generateNFTCreationSessionResponse.body
            }
        }

        console.log("> executeNFTCreation - executeUserOperationResponse:", JSON.stringify(response))

        return response

    } catch (exception) {

        console.error(exception)
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;

        throw exception;

    }

}

const executeNFTTransfer = async (input) => {

    try {

        let response = {}
        let customer = await customersService.getUser(input)

        let plChainService = new PlChainService()
        let getNFTsResponse = await plChainService.generateNFTTransferSession({
            tokenId: input.tokenId,
            price: input.price
        })
        console.log('getNFTsResponse', getNFTsResponse)

        if (getNFTsResponse.status != 200) {
            response = {
                status: getNFTsResponse.status,
                body: getNFTsResponse.body
            }
            return response
        }

        let executeUserOperationResponse = await plChainService.executeUserOperation({
            walletId: customer.body.accountAbstraction.walletId,
            sessionId: getNFTsResponse.body.sessionId
        })

        response = {
            status: executeUserOperationResponse.status,
            body: executeUserOperationResponse.body
        }

        return response

    } catch (exception) {

        console.error(exception)
        exception.status = exception.status || 400
        exception.error_code = errorCode.errorEnum.invalid_data;

        throw exception;

    }

}

const getUserOperationOfNFTTransfer = async (input) => {

    let plChainService = new PlChainService()
    let getUserOperationOfNFTTransferResponse = await plChainService.getUserOperationReceipt(input)
    console.log('getUserOperationOfNFTTransfer', getUserOperationOfNFTTransferResponse)

    let response = {
        status: getUserOperationOfNFTTransferResponse.status,
        body: getUserOperationOfNFTTransferResponse.body
    }

    return response

}

module.exports = {
    getNFTs,
    executeUploadImage,
    executeNFTCreation,
    executeNFTTransfer,
    getUserOperationOfNFTTransfer
};