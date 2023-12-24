const utilityService = require('./utilityService')
const Constants = require('./../utility/Constants')
const axios = require('axios').default;

class PlChainService {

    async createAccountAbstraction() {

        let responseG = new Object()

        let plChainBasePath = process.env.PL_CHAIN_BASE_PATH
        let plChainApiKey = await utilityService.getProperty(Constants.PL_CHAIN_API_KEY)
        let plChainContractId = process.env.PL_CHAIN_CONTRACT_ID
        let plChainProjectId = process.env.PL_CHAIN_PROJECT_ID
        let plChainChain = process.env.PL_CHAIN_CHAIN
        let plChainEncryptedWalletKey = await utilityService.getProperty(Constants.PL_CHAIN_ENCRYPTED_WALLET_KEY)

        let promise = new Promise((resolve, reject) => {
            axios.post(
                plChainBasePath + '/wallets/' + plChainChain + '/account-abstraction',
                {
                    projectId: plChainProjectId,
                    contractId: plChainContractId,
                    encryptedWalletKey: plChainEncryptedWalletKey
                },
                {
                    headers: {
                        'Authorization': 'API-KEY: ' + plChainApiKey,
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            )
                .then((response) => {
                    const responseG = {
                        body: response.data,
                        status: response.status
                    };
                    resolve(responseG);
                })
                .catch((error) => {
                    console.error(error)
                    const responseG = {
                        status: error.response.status,
                        message: error.response.statusText
                    };
                    reject(responseG);
                });
        });


        await promise.then(
            (response) => {
                console.log(response);
                responseG = response
            },
            (error) => {
                console.error(error);
                responseG = error
            });

        return responseG

    }

    async getUserBalance(address) {

        let responseG = new Object()

        console.log('> getUserBalance')

        let plChainBasePath = process.env.PL_CHAIN_BASE_PATH
        let plChainApiKey = await utilityService.getProperty(Constants.PL_CHAIN_API_KEY)
        let plChainConsortiumContractAddress = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ADDRESS
        let plChainProjectId = process.env.PL_CHAIN_PROJECT_ID
        let plChainConsortiumContractId = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ID
        let total = 0

        let promise = new Promise((resolve, reject) => {
            axios.post(plChainBasePath + '/contracts/execution/read-transaction',
                {
                    contractAddress: plChainConsortiumContractAddress,
                    projectId: plChainProjectId,
                    contractId: plChainConsortiumContractId,
                    total: total,
                    payload: {
                        function: "balanceOf",
                        inputsValue: [
                            address
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': 'API-KEY: ' + plChainApiKey,
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            )
                .then((response) => {
                    const responseG = {
                        body: response.data,
                        status: response.status
                    };
                    resolve(responseG);
                })
                .catch((error) => {
                    console.error(error)
                    const responseG = {
                        status: error.response.status,
                        message: error.response.statusText
                    };
                    reject(responseG);
                });
        });


        await promise.then(
            (response) => {
                console.log(response);
                responseG = response
            },
            (error) => {
                console.error(error);
                responseG = error
            });

        return responseG

    }

    async rechargeTransferToken(input) {

        console.log("> start rechargeTransferToken with input", JSON.stringify(input))
        let responseG = new Object()

        let plChainBasePath = process.env.PL_CHAIN_BASE_PATH
        let plChainApiKey = await utilityService.getProperty(Constants.PL_CHAIN_API_KEY)
        let plChainConsortiumContractAddress = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ADDRESS
        let plChainProjectId = process.env.PL_CHAIN_PROJECT_ID
        let plChainConsortiumContractId = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ID
        let plChainEncryptedWalletKey = await utilityService.getProperty(Constants.PL_CHAIN_ENCRYPTED_WALLET_KEY)

        let promise = new Promise((resolve, reject) => {
            axios.post(
                plChainBasePath + '/contracts/execution/write-transaction',
                {
                    contractAddress: plChainConsortiumContractAddress,
                    projectId: plChainProjectId,
                    contractId: plChainConsortiumContractId,
                    encryptedWalletKey: plChainEncryptedWalletKey,
                    total: 0,
                    payload: {
                        function: "rechargeToken",
                        inputsValue: [
                            input.aaAddress,
                            input.amount
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': 'API-KEY: ' + plChainApiKey,
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            )
                .then((response) => {
                    const responseG = {
                        body: response.data,
                        status: response.status
                    };
                    resolve(responseG);
                })
                .catch((error) => {
                    console.error(error)
                    const responseG = {
                        status: error.response.status,
                        message: error.response.statusText
                    };
                    reject(responseG);
                });
        });


        await promise.then(
            (response) => {
                console.log(response);
                responseG = response
            },
            (error) => {
                console.error(error);
                responseG = error
            });

        return responseG

    }

    async generatePaymentTransferTokenSession(input) {

        console.log("> start generatePaymentTransferTokenSession with input", JSON.stringify(input))
        let responseG = new Object()

        let plChainBasePath = process.env.PL_CHAIN_BASE_PATH
        let plChainApiKey = await utilityService.getProperty(Constants.PL_CHAIN_API_KEY)
        let plChainConsortiumContractAddress = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ADDRESS
        let plChainProjectId = process.env.PL_CHAIN_PROJECT_ID
        let plChainConsortiumContractId = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ID

        let promise = new Promise((resolve, reject) => {
            axios.post(
                plChainBasePath + '/sessions',
                {
                    contractAddress: plChainConsortiumContractAddress,
                    projectId: plChainProjectId,
                    contractId: plChainConsortiumContractId,
                    total: 0,
                    payload: {
                        function: "transferToken",
                        inputsValue: [
                            JSON.stringify(input)
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': 'API-KEY: ' + plChainApiKey,
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            )
                .then((response) => {
                    const responseG = {
                        body: response.data,
                        status: response.status
                    };
                    resolve(responseG);
                })
                .catch((error) => {
                    console.error(error)
                    const responseG = {
                        status: error.response.status,
                        message: error.response.statusText,
                        body: error.response.data
                    };
                    reject(responseG);
                });
        });


        await promise.then(
            (response) => {
                console.log(response);
                responseG = response
            },
            (error) => {
                console.error(error);
                responseG = error
            });

        return responseG

    }

    async executeUserOperation(input) {

        let responseG = new Object()

        let plChainBasePath = process.env.PL_CHAIN_BASE_PATH
        let plChainApiKey = await utilityService.getProperty(Constants.PL_CHAIN_API_KEY)
        let plChainChain = process.env.PL_CHAIN_CHAIN
        let plChainpaymasterContractId = process.env.PL_CHAIN_PAYMASTER_CONTRACT_ID

        let promise = new Promise((resolve, reject) => {
            axios.post(
                plChainBasePath + '/wallets/' + plChainChain + '/account-abstraction/user-operations',
                {
                    walletId: input.walletId,
                    sessionId: input.sessionId,
                    paymasterContractId: plChainpaymasterContractId
                },
                {
                    headers: {
                        'Authorization': 'API-KEY: ' + plChainApiKey,
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            )
                .then((response) => {
                    const responseG = {
                        body: response.data,
                        status: response.status
                    };
                    resolve(responseG);
                })
                .catch((error) => {
                    console.error(error)
                    const responseG = {
                        status: error.response.status,
                        message: error.response.statusText
                    };
                    reject(responseG);
                });
        });


        await promise.then(
            (response) => {
                console.log(response);
                responseG = response
            },
            (error) => {
                console.error(error);
                responseG = error
            });

        return responseG

    }

    async getPaymentTransferToken(input) {

        console.log("> start getPaymentTransferToken with input", JSON.stringify(input))
        let responseG = new Object()

        let plChainBasePath = process.env.PL_CHAIN_BASE_PATH
        let plChainApiKey = await utilityService.getProperty(Constants.PL_CHAIN_API_KEY)
        let plChainConsortiumContractAddress = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ADDRESS
        let plChainProjectId = process.env.PL_CHAIN_PROJECT_ID
        let plChainConsortiumContractId = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ID

        let promise = new Promise((resolve, reject) => {
            axios.post(
                plChainBasePath + '/contracts/execution/read-transaction',
                {
                    contractAddress: plChainConsortiumContractAddress,
                    projectId: plChainProjectId,
                    contractId: plChainConsortiumContractId,
                    payload: {
                        function: "getPayed",
                        inputsValue: [
                            input.sessionId
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': 'API-KEY: ' + plChainApiKey,
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            )
                .then((response) => {
                    const responseG = {
                        body: response.data,
                        status: response.status
                    };
                    resolve(responseG);
                })
                .catch((error) => {
                    console.error(error)
                    const responseG = {
                        status: error.response.status,
                        message: error.response.statusText,
                        body: error.response.data
                    };
                    reject(responseG);
                });
        });


        await promise.then(
            (response) => {
                console.log(response);
                responseG = response
            },
            (error) => {
                console.error(error);
                responseG = error
            });

        return responseG

    }

    async getUserOperationOfPaymentTransferToken(input) {

        console.log("> start getUserOperationOfPaymentTransferToken with input", JSON.stringify(input))
        let responseG = new Object()

        let plChainBasePath = process.env.PL_CHAIN_BASE_PATH
        let plChainApiKey = await utilityService.getProperty(Constants.PL_CHAIN_API_KEY)
        let plChainConsortiumContractAddress = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ADDRESS
        let plChainProjectId = process.env.PL_CHAIN_PROJECT_ID
        let plChainConsortiumContractId = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ID
        let plChainChain = process.env.PL_CHAIN_CHAIN

        let promise = new Promise((resolve, reject) => {
            axios.get(
                plChainBasePath + '/wallets/' + plChainChain + '/account-abstraction/user-operations/' + input.userOperationHash + '/receipt',
                {
                    headers: {
                        'Authorization': 'API-KEY: ' + plChainApiKey,
                        'accept': 'application/json',
                    }
                }
            )
                .then((response) => {
                    const responseG = {
                        body: response.data,
                        status: response.status
                    };
                    resolve(responseG);
                })
                .catch((error) => {
                    console.error(error)
                    const responseG = {
                        status: error.response.status,
                        message: error.response.statusText,
                        body: error.response.data
                    };
                    reject(responseG);
                });
        });


        await promise.then(
            (response) => {
                console.log(response);
                responseG = response
            },
            (error) => {
                console.error(error);
                responseG = error
            });

        return responseG

    }

    async getPaymentTransactions(input) {

        console.log("> start getPaymentTransactions with input", JSON.stringify(input))
        let responseG = new Object()

        let plChainBasePath = process.env.PL_CHAIN_BASE_PATH
        let plChainApiKey = await utilityService.getProperty(Constants.PL_CHAIN_API_KEY)
        let plChainConsortiumContractAddress = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ADDRESS
        let plChainProjectId = process.env.PL_CHAIN_PROJECT_ID
        let plChainConsortiumContractId = process.env.PL_CHAIN_CONSORTIUM_CONTRACT_ID

        let promise = new Promise((resolve, reject) => {
            axios.post(
                plChainBasePath + '/contracts/execution/read-transaction',
                {
                    contractAddress: plChainConsortiumContractAddress,
                    projectId: plChainProjectId,
                    contractId: plChainConsortiumContractId,
                    payload: {
                        function: "getTransactionsByAddress",
                        inputsValue: [
                            input.address
                        ]
                    }
                },
                {
                    headers: {
                        'Authorization': 'API-KEY: ' + plChainApiKey,
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            )
                .then((response) => {
                    const responseG = {
                        body: response.data,
                        status: response.status
                    };
                    resolve(responseG);
                })
                .catch((error) => {
                    console.error(error)
                    const responseG = {
                        status: error.response.status,
                        message: error.response.statusText,
                        body: error.response.data
                    };
                    reject(responseG);
                });
        });


        await promise.then(
            (response) => {
                console.log(response);
                responseG = response
            },
            (error) => {
                console.error(error);
                responseG = error
            });

        return responseG

    }

}

module.exports = PlChainService;
