const {expect} = require("chai");
const {ethers} = require("hardhat");
const log = console.log;
const toWei = (v) => ethers.utils.parseUnits(v, 'ether').toString();
const fromWei = (v) => ethers.utils.formatUnits(v, 'ether').toString();
const toGwei = (v) => ethers.utils.parseUnits(v, 'gwei').toString();
const fromGwei = (v) => ethers.utils.formatUnits(v, 'gwei').toString();

let devAddress, userAddress, user, dev;
let token, presale;
const ONE = toWei('1');

beforeEach(async () => {
    [dev, user] = await ethers.getSigners();
    devAddress = dev.address;
    userAddress = user.address;
    const SpectreERC20Token = await ethers.getContractFactory("SpectreERC20Token");
    token = await SpectreERC20Token.deploy();
    await token.deployed();

    const teamPresale = await ethers.getContractFactory("teamPresale");
    presale = await teamPresale.deploy(token.address);
    await presale.deployed();

});

describe("Security", async() => {
    it("Insufficient funds sent", async function () {
        await presale.setWhitelistStatus(devAddress, true);
        await expect(
            dev.sendTransaction({to: presale.address, value: toWei('0.009')})
        ).to.be.revertedWith("Insufficient funds sent");
    });
    it("Not whitelisted", async function () {
        await expect(
            dev.sendTransaction({to: presale.address, value: ONE})
        ).to.be.revertedWith("Not whitelisted");
    });
    it("The offering has already ended", async function () {
        await presale.setWhitelistStatus(devAddress, true);
        await expect(
            dev.sendTransaction({to: presale.address, value: ONE})
        ).to.be.revertedWith("The offering has already ended");
    });
});
/*
describe("Buy", async() => {
    it("buy tokens", async function () {
        await presale.setWhitelistStatus(devAddress, true);
        await dev.sendTransaction({to: presale.address, value: toWei('100')});
    });
});
*/
