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
const CommunityWhitelistRound = contract.fromArtifact('CommunityWhitelistRound');

describe("CommunityWhitelistRound", function () {
    beforeEach(async function () {
        this.timeout(0);
        dev = accounts[0];
        user = accounts[1];

        this.token = await SpectreERC20Token.new({from: dev});
        this.preSale = await CommunityWhitelistRound.new(this.token.address, {from: dev});
        await this.token.mint(dev, toWei('5'), {from: dev});
        await this.token.transfer(this.preSale.address, toWei('5'), {from: dev});

    });

    describe("Security", function () {
        it("Not whitelisted", async function () {
            await expectRevert(
                this.preSale.sendTransaction({from: dev, value: ONE})
                , "Not whitelisted");
        });
        it("The offering has already ended", async function () {
            const presaleStart = await this.preSale.presaleStart({from: dev});
            const getTimestamp = await this.preSale.getTimestamp({from: dev});
            await this.preSale.setWhitelistStatus(dev, true, {from: dev});

            await this.preSale.setStartEnd(presaleStart, getTimestamp, {from: dev});

            await expectRevert(
                this.preSale.sendTransaction({from: dev, value: ONE})
                , "The offering has already ended");
        });
        it("Insufficient funds sent", async function () {
            await this.preSale.setWhitelistStatus(dev, true, {from: dev});
            await expectRevert(
                this.preSale.sendTransaction({from: dev, value: toWei('0.0001')})
                , "Insufficient funds sent");
        });
    });

    describe("Buy", function () {
        it("buy and check balances", async function () {
            this.timeout(0);

            // how much ftm we wan to use in the buy
            const ftmAmount = toWei('50');

            // we get the timestamp from contract to make sure we set times correctly:
            const getTimestamp = parseInt((await this.preSale.getTimestamp()).toString());

            // now we start the presale now and end it in 60 seconds:
            await this.preSale.setStartEnd(getTimestamp, getTimestamp + 60, {from: dev});

            // we whitelist the test address:
            await this.preSale.setWhitelistStatus(dev, true, {from: dev});

            // we buy tokens:
            await this.preSale.sendTransaction({from: dev, value: ftmAmount});

            // get the amount of tokens bought:
            const tokens = (await this.preSale.tokens(dev)).toString();

            // get the price we bought:
            const presalePrice = (await this.preSale.presalePrice()).toString();

            // make sure we bought 50 ftm
            expect(fromWei(ftmAmount)).to.be.equal('50');

            // make sure that we bought at 25
            expect(fromWei(presalePrice)).to.be.equal('25');

            // we should have 2 tokens:
            expect(fromGwei(tokens)).to.be.equal('2');

        });
    });

    describe("claim & vest", function () {
        it("claim 50% and vest 50%", async function () {
            this.timeout(0);

            // how much ftm we wan to use in the buy
            const ftmAmount = toWei('20');

            // we get the timestamp from contract to make sure we set times correctly:
            let getTimestamp = parseInt((await this.preSale.getTimestamp()).toString());

            // now we start the presale now and end it in 60 seconds:
            await this.preSale.setStartEnd(getTimestamp, getTimestamp + 60, {from: dev});

            // we whitelist the test address:
            await this.preSale.setWhitelistStatus(dev, true, {from: dev});

            // we buy tokens:
            await this.preSale.sendTransaction({from: dev, value: ftmAmount});

            // we can buy only 40 tokens
            let presaleLimit = (await this.preSale.presaleLimit()).toString();
            expect(fromGwei(presaleLimit)).to.be.equal('40');

            // get amount of tokens we bought
            let tokens = (await this.preSale.tokens(dev)).toString();

            // get the price we bought
            const presalePrice = (await this.preSale.presalePrice()).toString();

            // we sought spent only 20 ftm
            expect(fromWei(ftmAmount)).to.be.equal('20');

            // we should bought at 25 ftm each
            expect(fromWei(presalePrice)).to.be.equal('25');

            // we must have 0.8 tokens
            expect(fromGwei(tokens)).to.be.equal('0.8');

            // advance time in 70 seconds to enable the vest:
            getTimestamp = parseInt((await this.preSale.getTimestamp()).toString());
            await time.increase(70);

            // we do the claim to get 50% in tokens and vest 50%
            await this.preSale.claim({from: dev});

            // after claim, we should have 0.4 tokens
            let receivedTokens = (await this.token.balanceOf(dev)).toString();
            expect(fromGwei(receivedTokens)).to.be.equal('0.4');

            // we should have 0.4 token vested now
            const vest = (await this.preSale.vest(dev)).toString();
            expect(fromGwei(vest)).to.be.equal('0.4');

            // our amount of tokens to vest must be 0
            tokens = (await this.preSale.tokens(dev)).toString();
            expect(fromGwei(tokens)).to.be.equal('0');

            // we should have 0 in vested amount free to get, we need to wait...
            let vestedAmount = (await this.preSale.vestedAmount(dev, getTimestamp)).toString();
            expect(fromGwei(vestedAmount)).to.be.equal('0');

            // we should not be able to claim now
            await expectRevert(this.preSale.claim({from: dev}), 'No tokens to claim');

            // now we advance for 60 days
            getTimestamp = await this.preSale.getTimestamp();

            // vesting start in 30 days, so we increase more 30 days:
            await time.increase(86400 * 60);

            // vestStart = await this.preSale.vestStart();
            getTimestamp = await this.preSale.getTimestamp();
            vestedAmount = (await this.preSale.vestedAmount(dev, getTimestamp)).toString();

            // we should release some tokens
            await this.preSale.release({from: dev});
            receivedTokens = (await this.token.balanceOf(dev)).toString();

            // we should get 1/6 of vested tokens, around 0.06666 after 30 days
            expect(parseInt(vestedAmount)).to.be.greaterThan(66660000 );

            // our balance should be 0.4+0.06666
            expect(parseInt(receivedTokens)).to.be.greaterThan(466660000);


        });
    });

});
