const ExchangeContract = artifacts.require("ico.contracts/pricing/ExchangeContract.sol");
const ExchangeContractTest = artifacts.require("ico.contracts/tests/ExchangeContractTest.sol");
const Management = artifacts.require("ico.contracts/Management.sol");
const Utils = require("../utils");
const BigNumber = require("bignumber.js");

// Permission keys
const CAN_UPDATE_PRICE = 4;

contract("ExchangeContract", function (accounts) {
    it("create contract, set token price", async function () {
        let management = await Management.new();
        let token = await ExchangeContract.new(management.address, new BigNumber(308), 5);
        let result = await token.etherPriceInCurrency.call();

        await assert.equal(new BigNumber(result).valueOf(), 308, "etherPriceInCurrency is not equal");

        await management.setPermission(accounts[0], CAN_UPDATE_PRICE, true)
            .then(Utils.receiptShouldSucceed);

        let canUpdatePricePermission = await management.permissions.call(accounts[0], CAN_UPDATE_PRICE);
        assert.equal(canUpdatePricePermission, true, "user has not got permission to update price");

        await token.setEtherInCurrency("307.65000")
            .then(Utils.receiptShouldSucceed);

        result = await token.etherPriceInCurrency.call();
        await assert.equal(new BigNumber(result).valueOf(), 30765000, "etherPriceInCurrency is not equal");

        await token.setEtherInCurrency("307.85000", {from: accounts[2]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        result = await token.etherPriceInCurrency.call();
        await assert.equal(new BigNumber(result).valueOf(), 30765000, "etherPriceInCurrency is not equal");

        await management.setPermission(accounts[2], CAN_UPDATE_PRICE, true)
            .then(Utils.receiptShouldSucceed);

        canUpdatePricePermission = await management.permissions.call(accounts[2], CAN_UPDATE_PRICE);
        assert.equal(canUpdatePricePermission, true, "user has not got permission to update price");

        await token.setEtherInCurrency("307.75000", {from: accounts[2]})
            .then(Utils.receiptShouldSucceed);

        result = await token.etherPriceInCurrency.call();
        await assert.equal(new BigNumber(result).valueOf(), 30775000, "etherPriceInCurrency is not equal");
    });

    it("create contract, shoudn\"t has an ability to set token price in wrong format", async function () {
        let management = await Management.new();

        let token = await ExchangeContract.new(
            management.address,
            new BigNumber(308),
            5
        );

        let result = await token.etherPriceInCurrency.call();
        assert.equal(await result.valueOf(), 308, "etherPriceInCurrency is not equal");

        await management.setPermission(accounts[0], CAN_UPDATE_PRICE, true)
            .then(Utils.receiptShouldSucceed);

        const userCanUpdatePrice = await management.permissions.call(accounts[0], CAN_UPDATE_PRICE);
        assert.equal(userCanUpdatePrice, true, "user has not got permission to update price");

        await token.setEtherInCurrency("307.6500")
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        assert.equal(await result.valueOf(), 308, "etherPriceInCurrency is not equal");
    });

    it("check parseInt without decimals", async function () {
        let management = await Management.new();

        let token = await ExchangeContractTest.new(
            management.address,
            new BigNumber(30800000),
            5
        );

        let result = await token.etherPriceInCurrency.call();
        await assert.equal(await result.valueOf(), 30800000, "etherPriceInUSD is not equal");

        let intResult = await token.parseIntTest("307.6500", 0);
        await assert.equal(intResult.valueOf(), 307, "int is not equal")
    });

    it("check parseInt with decimals and without a comma", async function () {
        let management = await Management.new();

        let token = await ExchangeContractTest.new(
            management.address,
            new BigNumber(30800000),
            5
        );

        let result = await token.etherPriceInCurrency.call();
        await assert.equal(await result.valueOf(), 30800000, "etherPriceInUSD is not equal");

        let intResult = await token.parseIntTest("30765", 5);
        await assert.equal(intResult.valueOf(), 3076500000, "int is not equal")
    });
});
