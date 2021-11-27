require('dotenv').config({path: '.env'});
module.exports = {
    networks: {
        dev: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*"
        },
    },
    compilers: {
        solc: {
            version: "0.8.7",
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
