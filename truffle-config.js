require('dotenv').config({path: '.env'});
const fs = require('fs');
const PRIVATE_KEY = fs.readFileSync(".secret").toString().trim();
const HDWalletProvider = require("@truffle/hdwallet-provider");
module.exports = {
    networks: {
        dev: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*"
        },
        ftm: {
            provider: () => new HDWalletProvider(
                {
                    privateKeys: [PRIVATE_KEY],
                    providerOrUrl: `wss://speedy-nodes-nyc.moralis.io/${process.env.MORALIS}/fantom/mainnet/ws`,
                    addressIndex: 0
                }),
            network_id: 1,
            networkCheckTimeout: 1000000,
            confirmations: 3,
            timeoutBlocks: 50000,
            websocket: true,
            skipDryRun: true
        },
        ftm_testnet: {
            provider: () => new HDWalletProvider(
                {
                    privateKeys: [PRIVATE_KEY],
                    providerOrUrl: `https://rpc.testnet.fantom.network`,
                    addressIndex: 0
                }),
            network_id: 4002,
            networkCheckTimeout: 1000000,
            confirmations: 3,
            timeoutBlocks: 50000,
            websocket: true,
            skipDryRun: true
        },
    },
    compilers: {
        solc: {
            version: "0.6.12",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    },
    plugins: [
        'truffle-plugin-verify'
    ],
    api_keys: {
        bscscan: process.env.bscscan,
        etherscan: process.env.etherscan
    },
    mocha: {
        enableTimeouts: false,
        before_timeout: 0
    }
};
