const web3 = require('web3');
const {accounts, contract} = require('@openzeppelin/test-environment');
const {BN, expectRevert, time, expectEvent, constants} = require('@openzeppelin/test-helpers');
const chalk = require('chalk');

const magenta = () => console.log(chalk.magenta(...arguments));
const green = () => console.log(chalk.green(...arguments));
const blue = () => console.log(chalk.blue(...arguments));
const red = () => console.log(chalk.red(...arguments));
const yellow = () => console.log(chalk.yellow(...arguments));
const cyan = () => console.log(chalk.cyan(...arguments));
const yellowBright = () => console.log(chalk.yellowBright(...arguments));

const toWei = (v) => web3.utils.toWei(v, 'ether');
const fromWei = (v) => web3.utils.toWei(v, 'ether');
const toGwei = (v) => web3.utils.toWei(v, 'gwei');
const fromGwei = (v) => web3.utils.toWei(v, 'gwei');

let user, dev;
const ONE = toWei('1');

const SpectreERC20Token = contract.fromArtifact('SpectreERC20Token');
const TeamPresale = contract.fromArtifact('TeamPresale');

describe("Security", async () => {
    beforeEach(async () => {
        this.timeout(0);
        [dev, user] = accounts;

        this.token = await SpectreERC20Token.new({from: dev});
        this.presale = await TeamPresale.new({from: dev});

        await this.token.deployed();
        await this.presale.deployed();
    });
    describe("Buy", async () => {
        it("buy and check balances", async function () {
            this.timeout(0);
            await presale.setWhitelistStatus(dev, true);
            const presaleStart = await presale.presaleStart();
            const presaleEnd = await presale.presaleEnd();
            const getTimestamp = await presale.getTimestamp();
            console.log(presaleStart.toString(), presaleEnd.toString(), getTimestamp.toString());
            const args = {
                from: dev,
                to: presale.address,
                value: fromWei('1')
            };
            console.log(args);
            await dev.sendTransaction(args);
        });
    });
});
/*
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
        await dev.sendTransaction({to: presale.address, value: ONE});
        // await expect(
        //     dev.sendTransaction({to: presale.address, value: ONE})
        // ).to.be.revertedWith("The offering has already ended");
    });
});

 */



