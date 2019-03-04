const Management = artifacts.require("ico.contracts/Management.sol");
const LockupContract = artifacts.require("ico.contracts/tests/LockupContractTest.sol");
const Utils = require("../utils");
const BigNumber = require("bignumber.js");

// Permission keys
const CAN_LOCK_TOKENS = 3;
const EXCLUDED_ADDRESSES = 8;

contract("LockupContract", accounts => {
    describe("log", () => {
        it("log function updates values in lockedAmount", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                10,// _initialUnlock,
                100, // _releasePeriod
                management.address
            );
            let starting = parseInt(new Date().getTime() / 1000);

            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            await token.log(accounts[2], 1000, starting)
                .then(Utils.receiptShouldSucceed);

            let result = await token.lockedAmount.call(accounts[2], 0);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 1);
            await assert.equal(new BigNumber(result).valueOf(), 900, "lockedBalance is not equal");

            await token.log(accounts[2], 2000, starting)
                .then(Utils.receiptShouldSucceed);

            result = await token.lockedAmount.call(accounts[2], 2);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 3);
            await assert.equal(new BigNumber(result).valueOf(), 1800, "lockedBalance is not equal")
        });

        it("only agent can run log function", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                10,// _initialUnlock,
                100, // _releasePeriod
                management.address
            );
            let starting = parseInt(new Date().getTime() / 1000);

            let result = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(result.valueOf(), false, "lockupAgents is not equal");
            result = await management.permissions.call(accounts[1], CAN_LOCK_TOKENS);
            await assert.equal(result.valueOf(), false, "lockupAgents is not equal");

            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            await management.setPermission(accounts[1], CAN_LOCK_TOKENS, true, {from: accounts[3]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            result = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(result.valueOf(), true, "lockupAgents is not equal");
            result = await management.permissions.call(accounts[1], CAN_LOCK_TOKENS);
            await assert.equal(result.valueOf(), false, "lockupAgents is not equal");

            await token.log(accounts[2], 1000, starting)
                .then(Utils.receiptShouldSucceed);

            await token.log(accounts[2], 1000, starting, {from: accounts[1]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("zero initial unlock", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                0,// _initialUnlock,
                100, // _releasePeriod
                management.address
            );
            let starting = parseInt(new Date().getTime() / 1000 - 100);

            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let result = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(result.valueOf(), true, "lockupAgents is not equal");

            await token.log(accounts[2], 1000, starting)
                .then(Utils.receiptShouldSucceed);
            result = await token.lockedAmount.call(accounts[2], 0);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 1);
            await assert.equal(new BigNumber(result).valueOf(), 1000, "lockedBalance is not equal");

            result = await token.allowedBalance.call(
                accounts[2],
                starting,
                1000
            );
            await assert.equal((result).valueOf(), 0, "allowedBalance is not equal");

            // 1000*1*100/3600
            result = await token.allowedBalance.call(
                accounts[2],
                starting + 100,
                1000
            );
            await assert.equal((result).valueOf(), 27, "allowedBalance is not equal");

            // 1000*2*100/3600
            result = await token.allowedBalance.call(
                accounts[2],
                starting + 200,
                1000
            );
            await assert.equal((result).valueOf(), 55, "allowedBalance is not equal");
        });

        it("zero releasePeriod", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                0,// _initialUnlock,
                0, // _releasePeriod
                management.address
            );
            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let result = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(result.valueOf(), true, "lockupAgents is not equal");

            let starting = parseInt(new Date().getTime() / 1000);
            await token.log(accounts[2], 1000, starting)
                .then(Utils.receiptShouldSucceed);
            result = await token.lockedAmount.call(accounts[2], 0);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 1);
            await assert.equal(new BigNumber(result).valueOf(), 1000, "lockedBalance is not equal");

            // 1000*1*100/3600
            result = await token.allowedBalance.call(
                accounts[2],
                starting + 100,
                1000
            );
            await assert.equal((result).valueOf(), 0, "allowedBalance is not equal");

            result = await token.allowedBalance.call(
                accounts[2],
                starting + 3700,
                1000
            );
            await assert.equal((result).valueOf(), 1000, "allowedBalance is not equal");
        });

        it("inital unlock is working properly", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                2,// _initialUnlock,
                0, // _releasePeriod
                management.address
            );
            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let lockupAgents = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(lockupAgents.valueOf(), true, "lockupAgents is not equal");

            let starting = parseInt(new Date().getTime() / 1000);
            await token.log(accounts[2], 1000, starting)
                .then(Utils.receiptShouldSucceed);
            let result = await token.lockedAmount.call(accounts[2], 0);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 1);
            await assert.equal(new BigNumber(result).valueOf(), 980, "lockedBalance is not equal");

            await token.log(accounts[2], 100, starting + 500)
                .then(Utils.receiptShouldSucceed);
            let allowedBalance = await token.allowedBalance.call(
                accounts[2],
                starting,
                1100
            );
            await assert.equal(new BigNumber(allowedBalance).valueOf(), 22, "allowedBalance is not equal")
        });
    });

    describe("isTransferAllowed", () => {
        it("should allow to transfer as transfer amount is less than unlocked", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                20,// _initialUnlock,
                100, // _releasePeriod
                management.address
            );
            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let lockupAgents = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(lockupAgents.valueOf(), true, "lockupAgents is not equal");

            let starting = parseInt(new Date().getTime() / 1000 - 3600);

            await token.log(accounts[2], 1000, starting)
                .then(Utils.receiptShouldSucceed);

            let result = await token.lockedAmount.call(accounts[2], 0);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 1);
            await assert.equal(new BigNumber(result).valueOf(), 800, "lockedBalance is not equal");

            let allowedBalance = await token.allowedBalance.call(
                accounts[2],
                new BigNumber(starting),
                1000
            );
            await assert.equal(new BigNumber(allowedBalance).valueOf(), 200, "allowedBalance is not equal");

            result = await token.isTransferAllowedTest.call(
                accounts[2],
                100,
                starting,
                1000
            );
            await assert.equal(result.valueOf(), true, "isTransferAllowedAllocation is not equal")
        });

        it("should allow to transfer as lockup period is finished", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                20,// _initialUnlock,
                100, // _releasePeriod
                management.address
            );
            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let lockupAgents = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(lockupAgents.valueOf(), true, "lockupAgents is not equal");

            let starting = parseInt(new Date().getTime() / 1000 - 3600);

            await token.log(accounts[2], 1000, starting)
                .then(Utils.receiptShouldSucceed);

            let result = await token.lockedAmount.call(accounts[2], 0);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 1);
            await assert.equal(new BigNumber(result).valueOf(), 800, "lockedBalance is not equal");

            let allowedBalance = await token.allowedBalance.call(
                accounts[2],
                new BigNumber(starting).add(3600),
                1000
            );
            await assert.equal(new BigNumber(allowedBalance).valueOf(), 1000, "allowedBalance is not equal");

            result = await token.isTransferAllowedTest.call(
                accounts[2],
                100,
                new BigNumber(starting).add(3600),
                1000
            );
            await assert.equal(result.valueOf(), true, "isTransferAllowedAllocation is not equal")
        });

        it("should not allow to transfer as locked amount = 0", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                20,// _initialUnlock,
                100, // _releasePeriod
                management.address
            );
            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let lockupAgents = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(lockupAgents.valueOf(), true, "lockupAgents is not equal");

            let starting = parseInt(new Date().getTime() / 1000 - 3600);

            await token.log(accounts[2], 0, starting)
                .then(Utils.receiptShouldSucceed);

            let result = await token.lockedAmount.call(accounts[2], 0);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 1);
            await assert.equal(new BigNumber(result).valueOf(), 0, "lockedBalance is not equal");

            result = await token.isTransferAllowedTest.call(
                accounts[2],
                100,
                new BigNumber(starting),
                1000
            );
            await assert.equal(result.valueOf(), false, "isTransferAllowedAllocation is not equal")
        });

        it("should allow to transfer to excluded address", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                20,// _initialUnlock,
                100, // _releasePeriod
                management.address
            );
            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let lockupAgents = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(lockupAgents.valueOf(), true, "lockupAgents is not equal");

            let starting = parseInt(new Date().getTime() / 1000 - 3600);

            await token.log(accounts[2], 1000, starting)
                .then(Utils.receiptShouldSucceed);

            let result = await token.lockedAmount.call(accounts[2], 0);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 1);
            await assert.equal(new BigNumber(result).valueOf(), 800, "lockedBalance is not equal");

            await management.setPermission(accounts[2], EXCLUDED_ADDRESSES, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(await management.permissions.call(accounts[2], EXCLUDED_ADDRESSES),
                true, "getExcludedAddress is not equal");

            let allowedBalance = await token.allowedBalance.call(
                accounts[2],
                new BigNumber(starting),
                1000
            );
            await assert.equal(new BigNumber(allowedBalance).valueOf(), 1000, "allowedBalance is not equal");

            result = await token.isTransferAllowedTest.call(
                accounts[2],
                1000,
                starting,
                1000
            );
            await assert.equal(result.valueOf(), true, "isTransferAllowedAllocation is not equal")
        });

        it("should allow to transfer as balance was not locked", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                20,// _initialUnlock,
                100, // _releasePeriod
                management.address
            );
            let starting = parseInt(new Date().getTime() / 1000 - 3600);
            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let lockupAgents = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(lockupAgents.valueOf(), true, "lockupAgents is not equal");

            let allowedBalance = await token.allowedBalance.call(
                accounts[2],
                new BigNumber(starting),
                1000
            );
            await assert.equal(new BigNumber(allowedBalance).valueOf(), 1000, "allowedBalance is not equal");

            result = await token.isTransferAllowedTest.call(
                accounts[2],
                100,
                new BigNumber(starting),
                1000
            );
            await assert.equal(result.valueOf(), true, "isTransferAllowedAllocation is not equal")
        });

        it("should not allow to transfer as transfer amount is bigger than unlocked", async () => {
            let management = await Management.new();
            let token = await LockupContract.new(
                3600,// _lockPeriod,
                20,// _initialUnlock,
                100, // _releasePeriod
                management.address
            );
            await management.setPermission(accounts[0], CAN_LOCK_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let lockupAgents = await management.permissions.call(accounts[0], CAN_LOCK_TOKENS);
            await assert.equal(lockupAgents.valueOf(), true, "lockupAgents is not equal");

            let starting = parseInt(new Date().getTime() / 1000 - 3600);

            await token.log(accounts[2], 1000, starting)
                .then(Utils.receiptShouldSucceed);

            let result = await token.lockedAmount.call(accounts[2], 0);
            await assert.equal(new BigNumber(result).valueOf(), starting, "startingAt is not equal");
            result = await token.lockedAmount.call(accounts[2], 1);
            await assert.equal(new BigNumber(result).valueOf(), 800, "lockedBalance is not equal");

            let allowedBalance = await token.allowedBalance.call(
                accounts[2],
                new BigNumber(starting),
                1000
            );
            await assert.equal(new BigNumber(allowedBalance).valueOf(), 200, "allowedBalance is not equal");

            result = await token.isTransferAllowedTest.call(
                accounts[2],
                500,
                starting,
                1000
            );
            await assert.equal(result.valueOf(), false, "isTransferAllowedAllocation is not equal")
        });
    });
});
