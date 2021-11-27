module.exports = {
  networks: {
    dev: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*",
    },
  },
  mocha: {
    timeout: 0
  },
  compilers: {
    solc: {
      version: "0.8.7",
      settings: {
       optimizer: {
         enabled: true,
         runs: 200
       },
      }
    }
  },
};
