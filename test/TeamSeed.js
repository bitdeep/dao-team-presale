const web3 = require('web3');
const {accounts, contract} = require('@openzeppelin/test-environment');
const {BN, expectRevert, time, expectEvent, constants} = require('@openzeppelin/test-helpers');
const chalk = require('chalk');

const magenta = function () {
    console.log(chalk.magenta(...arguments));
}
const green = function () {
    console.log(chalk.green(...arguments));
}
const blue = function () {
    console.log(chalk.blue(...arguments));
}
const red = function () {
    console.log(chalk.red(...arguments));
}
const yellow = function () {
    console.log(chalk.yellow(...arguments));
}
const cyan = function () {
    console.log(chalk.cyan(...arguments));
}
const yellowBright = function () {
    console.log(chalk.yellowBright(...arguments));
}

const toWei = function (v) {
    return web3.utils.toWei(v, 'ether');
}
const toGwei = function (v) {
    return web3.utils.toWei(v, 'gwei');
}

const fromWei = function (v) {
    return web3.utils.fromWei(v.toString(), 'ether');
}
const fromGwei = function (v) {
    return web3.utils.fromWei(v.toString(), 'gwei');
}

let user, dev;
const ONE = toWei('1');

const SpectreERC20Token = contract.fromArtifact('SpectreERC20Token');
const TeamSeed = contract.fromArtifact('TeamSeed');

describe("TeamSeed", function () {
    beforeEach(async function () {
        this.timeout(0);
        dev = accounts[0];
        user = accounts[1];

        this.token = await SpectreERC20Token.new({from: dev});
        this.presale = await TeamSeed.new(this.token.address, {from: dev});
        await this.token.mint(dev, toWei('5'), {from: dev});
        await this.token.transfer(this.presale.address, toWei('5'), {from: dev});

    });

    describe("Security", function () {
        it("Not whitelisted", async function () {
            await expectRevert(
                this.presale.sendTransaction({from: dev, value: ONE})
                , "Not whitelisted");
        });
        it("The offering has already ended", async function () {
            const presaleStart = await this.presale.presaleStart({from: dev});
            const getTimestamp = await this.presale.getTimestamp({from: dev});
            await this.presale.setWhitelistStatus(dev, true, {from: dev});

            await this.presale.setStartEnd(presaleStart, getTimestamp, {from: dev});

            await expectRevert(
                this.presale.sendTransaction({from: dev, value: ONE})
                , "The offering has already ended");
        });
        it("Insufficient funds sent", async function () {
            await this.presale.setWhitelistStatus(dev, true, {from: dev});
            await expectRevert(
                this.presale.sendTransaction({from: dev, value: toWei('0.0001')})
                , "Insufficient funds sent");
        });
    });

    describe("Buy", function () {
        it("buy and check balances", async function () {
            this.timeout(0);
            const ftmAmount = toWei('50');
            await this.presale.setWhitelistStatus(dev, true, {from: dev});
            await this.presale.sendTransaction({from: dev, value: ftmAmount});
            const tokens = (await this.presale.tokens(dev)).toString();
            const presalePrice = (await this.presale.presalePrice()).toString();
            expect(fromWei(ftmAmount)).to.be.equal('50');
            expect(fromWei(presalePrice)).to.be.equal('20');
            expect(fromGwei(tokens)).to.be.equal('2.5');
            // yellow('\tPaid amount: '+fromWei(ftmAmount)+" FTM." );
            // yellow('\tPresale price: '+fromWei(presalePrice) +" FTM." );
            // yellow('\tTokens received: '+fromGwei(tokens)+" tokens. " );
        });
    });

    describe("claim & vest", function () {
        it("claim 50% and vest 50%", async function () {
            this.timeout(0);
            const ftmAmount = toWei('20');
            await this.presale.setWhitelistStatus(dev, true, {from: dev});
            await this.presale.sendTransaction({from: dev, value: ftmAmount});
            let presaleMaxAllocation = (await this.presale.presaleMaxAllocation()).toString();
            let tokens = (await this.presale.tokens(dev)).toString();
            const presalePrice = (await this.presale.presalePrice()).toString();
            expect(fromWei(ftmAmount)).to.be.equal('20');
            expect(fromWei(presalePrice)).to.be.equal('20');
            expect(fromGwei(tokens)).to.be.equal('1');
            yellow('tokens='+tokens)
            yellow('presaleMaxAllocation='+presaleMaxAllocation)
            let getTimestamp = await this.presale.getTimestamp();
            await this.presale.claim({from: dev});
            const vest = (await this.presale.vest(dev)).toString();
            tokens = (await this.presale.tokens(dev)).toString();
            let vestedAmount = (await this.presale.vestedAmount(dev, getTimestamp)).toString();
            expect(fromGwei(vest)).to.be.equal('0.5');
            expect(fromGwei(tokens)).to.be.equal('0');
            expect(fromGwei(vestedAmount)).to.be.equal('0');
            let vestStart = await this.presale.vestStart();

            vestedAmount = (await this.presale.vestedAmount(dev, vestStart + (86400 * 7))).toString();
            expect(fromGwei(vestedAmount)).to.be.equal('0.5');
            let receivedTokens = (await this.token.balanceOf(dev)).toString();
            expect(fromGwei(receivedTokens)).to.be.equal('0.5');
            await expectRevert(this.presale.claim({from: dev}), 'No tokens to claim');

            this.presale.resetVest({from: dev});
            vestStart = await this.presale.vestStart();
            getTimestamp = await this.presale.getTimestamp();
            vestedAmount = (await this.presale.vestedAmount(dev, getTimestamp)).toString();
            await this.presale.release({from: dev});
            receivedTokens = (await this.token.balanceOf(dev)).toString();

            expect(fromGwei(vestedAmount)).to.be.equal('0.083333333');
            expect(fromGwei(receivedTokens)).to.be.equal('0.583333365');

            console.log('receivedTokens'+fromGwei(receivedTokens));

        });
    });

});
