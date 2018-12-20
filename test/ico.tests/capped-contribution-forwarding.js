const CappedDistributedDirectContributionForwarder = artifacts
    .require("ico.contracts/contribution/CappedDistributedDirectContributionForwarder.sol");
const Management = artifacts.require("ico.contracts/Management.sol");
const Utils = require("../utils");
const BigNumber = require("bignumber.js");

// Precision for BigNumber (1e18)
const precision = new BigNumber("1000000000000000000");
// Precision for USD (1e5)
const usdPrecision = new BigNumber("100000");
const etherHolder = web3.eth.accounts[9];
const applicatureHolder = web3.eth.accounts[8];

contract("CappedDistributedDirectContributionForwarder", function (accounts) {
    let management,
        contributionForwarder;

    beforeEach(async function () {
        management = await Management.new();
        contributionForwarder = await CappedDistributedDirectContributionForwarder.new(
            new BigNumber("100").mul(usdPrecision),
            [applicatureHolder, etherHolder],
            [
                new BigNumber("1").mul(usdPrecision),
                new BigNumber("99").mul(usdPrecision)
            ],
            [
                new BigNumber("1000").mul(usdPrecision),
                new BigNumber("0.75").mul(usdPrecision),
                new BigNumber("99.25").mul(usdPrecision),
                new BigNumber("1000").mul(usdPrecision),
                new BigNumber("0.5").mul(usdPrecision),
                new BigNumber("99.5").mul(usdPrecision),
                new BigNumber("0").mul(usdPrecision),
                new BigNumber("0"),
                new BigNumber("0")
            ],
            management.address
        );
    });

    it("check state & flow", async function () {
        await contributionForwarder.forward({value: web3.toWei("0.000000000001", "ether")})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await Utils.checkState({contributionForwarder}, {
            contributionForwarder: {
                capCollected: 0,
                currentCap: 0,
                proportionAbsMax: new BigNumber("100").mul(usdPrecision),
                weiCollected: 0,
                weiForwarded: 0
            },
        });
        let ethHolderBalance = await Utils.getEtherBalance(etherHolder).valueOf();
        let applicatureBalance = await Utils.getEtherBalance(applicatureHolder).valueOf();

        let capData = await contributionForwarder.caps.call(0);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("0").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        capData = await contributionForwarder.caps.call(1);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("0").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        capData = await contributionForwarder.caps.call(2);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("0").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("0").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        await contributionForwarder.processForward(
            new BigNumber("500").mul(usdPrecision).valueOf(),
            { value: new BigNumber("0.5").mul(precision).valueOf() }
        )
            .then(Utils.receiptShouldSucceed);

        let ethHolderBalanceIs = new BigNumber(await Utils.getEtherBalance(etherHolder))
            .sub(ethHolderBalance).valueOf();

        let ethHolderBalanceShouldBe = new BigNumber("0.5")
            .mul(precision)
            .mul(99)
            .div(100)
            .valueOf();

        await assert.equal(
            ethHolderBalanceIs,
            ethHolderBalanceShouldBe,
            "ethHolderBalance is not equal"
        );

        let applicatureBalanceIs = new BigNumber(await Utils.getEtherBalance(applicatureHolder))
            .sub(applicatureBalance)
            .valueOf();

        let applicatureBalanceShouldBe = new BigNumber("0.5")
            .mul(precision)
            .mul(1)
            .div(100)
            .valueOf();

        await assert.equal(
            applicatureBalanceIs,
            applicatureBalanceShouldBe,
            "applicatureBalance is not equal"
        );

        capData = await contributionForwarder.caps.call(0);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("500").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        await Utils.checkState({contributionForwarder}, {
            contributionForwarder: {
                capCollected: new BigNumber("500").mul(usdPrecision).valueOf(),
                currentCap: 0,
                proportionAbsMax: new BigNumber("100").mul(usdPrecision),
                weiCollected: new BigNumber("0.5").mul(precision).valueOf(),
                weiForwarded: new BigNumber("0.5").mul(precision).valueOf()
            },
        });

        ethHolderBalance = await Utils.getEtherBalance(etherHolder).valueOf();
        applicatureBalance = await Utils.getEtherBalance(applicatureHolder).valueOf();

        await contributionForwarder.processForward(
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            { value: new BigNumber("1").mul(precision).valueOf() }
        )
            .then(Utils.receiptShouldSucceed);

        const divisionError = 1;

        ethHolderBalanceIs = new BigNumber(await Utils.getEtherBalance(etherHolder))
            .sub(ethHolderBalance)
            .valueOf();

        ethHolderBalanceShouldBe = new BigNumber(1)
            .add(new BigNumber("0.5").mul(precision).mul(99).div(100))
            .add(new BigNumber("0.5").mul(precision).mul(99.25).div(100))
            .valueOf();

        await assert.equal(
            ethHolderBalanceIs,
            ethHolderBalanceShouldBe - divisionError,
            "ethHolderBalance is not equal"
        );

        applicatureBalanceIs = new BigNumber(await Utils.getEtherBalance(applicatureHolder))
            .sub(applicatureBalance)
            .valueOf();

        applicatureBalanceShouldBe = new BigNumber(1)
            .add(new BigNumber("0.5").mul(precision).mul(1).div(100))
            .add(new BigNumber("0.5").mul(precision).mul(0.75).div(100))
            .valueOf();

        await assert.equal(
            applicatureBalanceIs,
            applicatureBalanceShouldBe - divisionError,
            "applicatureBalance is not equal"
        );

        capData = await contributionForwarder.caps.call(0);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        capData = await contributionForwarder.caps.call(1);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("500").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        await Utils.checkState({contributionForwarder}, {
            contributionForwarder: {
                capCollected: new BigNumber("1500").mul(usdPrecision).valueOf(),
                currentCap: 1,
                proportionAbsMax: new BigNumber("100").mul(usdPrecision),
                weiCollected: new BigNumber("1.5").mul(precision).valueOf(),
                weiForwarded: new BigNumber("1.5").mul(precision).valueOf()
            },
        });

        ethHolderBalance = await Utils.getEtherBalance(etherHolder).valueOf();
        applicatureBalance = await Utils.getEtherBalance(applicatureHolder).valueOf();

        await contributionForwarder.processForward(
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            { from: accounts[1], value: new BigNumber("1").mul(precision).valueOf() }
        )
            .then(Utils.receiptShouldSucceed);

        ethHolderBalanceIs = new BigNumber(await Utils.getEtherBalance(etherHolder))
            .sub(ethHolderBalance)
            .valueOf();

        ethHolderBalanceShouldBe = new BigNumber(1)
            .add(new BigNumber("0.5").mul(precision).mul(99.25).div(100))
            .add(new BigNumber("0.5").mul(precision).mul(99.5).div(100))
            .valueOf();

        await assert.equal(
            ethHolderBalanceIs,
            ethHolderBalanceShouldBe - divisionError,
            "ethHolderBalance is not equal"
        );

        applicatureBalanceIs = new BigNumber(await Utils.getEtherBalance(applicatureHolder))
            .sub(applicatureBalance)
            .valueOf();

        applicatureBalanceShouldBe = new BigNumber(1)
            .add(new BigNumber("0.5").mul(precision).mul(0.75).div(100))
            .add(new BigNumber("0.5").mul(precision).mul(0.5).div(100))
            .valueOf();

        await assert.equal(
            applicatureBalanceIs,
            applicatureBalanceShouldBe - divisionError,
            "applicatureBalance is not equal"
        );

        capData = await contributionForwarder.caps.call(0);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        capData = await contributionForwarder.caps.call(1);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        capData = await contributionForwarder.caps.call(2);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("0").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("500").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        await Utils.checkState({contributionForwarder}, {
            contributionForwarder: {
                capCollected: new BigNumber("2500").mul(usdPrecision).valueOf(),
                currentCap: 2,
                proportionAbsMax: new BigNumber("100").mul(usdPrecision),
                weiCollected: new BigNumber("2.5").mul(precision).valueOf(),
                weiForwarded: new BigNumber("2.5").mul(precision).valueOf()
            },
        });

        ethHolderBalance = await Utils.getEtherBalance(etherHolder).valueOf();
        applicatureBalance = await Utils.getEtherBalance(applicatureHolder).valueOf();

        await contributionForwarder.processForward(
            new BigNumber("2000").mul(usdPrecision).valueOf(),
            { from: accounts[2], value: new BigNumber("2").mul(precision).valueOf() }
        )
            .then(Utils.receiptShouldSucceed);

        ethHolderBalanceIs = new BigNumber(await Utils.getEtherBalance(etherHolder))
            .sub(ethHolderBalance)
            .valueOf();

        ethHolderBalanceShouldBe = new BigNumber("2")
            .mul(precision)
            .mul(99.5)
            .div(100)
            .valueOf();

        await assert.equal(
            ethHolderBalanceIs,
            ethHolderBalanceShouldBe - divisionError,
            "ethHolderBalance is not equal"
        );

        applicatureBalanceIs = new BigNumber(await Utils.getEtherBalance(applicatureHolder))
            .sub(applicatureBalance)
            .valueOf();

        applicatureBalanceShouldBe = new BigNumber("2")
            .mul(precision)
            .mul(0.5)
            .div(100)
            .valueOf();

        await assert.equal(
            applicatureBalanceIs,
            applicatureBalanceShouldBe - divisionError,
            "applicatureBalance is not equal"
        );

        capData = await contributionForwarder.caps.call(0);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        capData = await contributionForwarder.caps.call(1);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        capData = await contributionForwarder.caps.call(2);

        await assert.equal(
            new BigNumber(capData[0]).valueOf(),
            new BigNumber("0").mul(usdPrecision).valueOf(),
            "total is not equal"
        );

        await assert.equal(
            new BigNumber(capData[1]).valueOf(),
            new BigNumber("2500").mul(usdPrecision).valueOf(),
            "collected is not equal"
        );

        await Utils.checkState({contributionForwarder}, {
            contributionForwarder: {
                capCollected: new BigNumber("4500").mul(usdPrecision).valueOf(),
                currentCap: 2,
                proportionAbsMax: new BigNumber("100").mul(usdPrecision),
                weiCollected: new BigNumber("4.5").mul(precision).valueOf(),
                weiForwarded: new BigNumber("4.5").mul(precision).valueOf()
            },
        });
    });
});
