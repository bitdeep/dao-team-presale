const TeamSeed = artifacts.require("TeamSeed");
// truffle migrate --f 1 --to 1 --network ftm_testnet
// truffle run verify MasterChef --network ftm_testnet
module.exports = async function  (deployer, network, accounts) {
  const token = '0x5d600AB61b6F99c2c01A4277246E7dCE2390A1f2';
  await deployer.deploy(TeamSeed, token);
};
