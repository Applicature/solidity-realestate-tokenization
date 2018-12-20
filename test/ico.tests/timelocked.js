const Management = artifacts.require("ico.contracts/Management.sol");
const TimeLocked = artifacts.require("ico.contracts/tests/TimeLockedTokenTest.sol");
const Allocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const Utils = require("../utils.js");
const BigNumber = require("bignumber.js");

// Contract keys
const CONTRACT_TOKEN = 1;
const CONTRACT_ALLOCATOR = 4;

// Permission keys
const CAN_MINT_TOKENS = 0;
const CAN_INTERACT_WITH_ALLOCATOR = 5;
const EXCLUDED_ADDRESSES = 8;

// Precision for BigNumber (1e18)
const precision = new BigNumber("1000000000000000000");

let icoSince = parseInt(new Date().getTime() / 1000) - 3600;
let icoTill = parseInt(new Date().getTime() / 1000) + 3600;

contract("TimeLocked", accounts => {
    let allocator;
    let management;

    beforeEach(async function () {
        management = await Management.new();

        allocator = await Allocator.new(new BigNumber("10000").mul(precision), management.address);

        await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
            .then(Utils.receiptShouldSucceed);

        const allocatorContractAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

        assert.equal(
            allocatorContractAddress,
            allocator.address,
            "allocator address is not equal"
        );

        await management.setPermission(allocator.address, CAN_MINT_TOKENS, true)
            .then(Utils.receiptShouldSucceed);

        const allocatorPermissionToMintTokens = await management
            .permissions
            .call(allocator.address, CAN_MINT_TOKENS);

        assert.equal(
            allocatorPermissionToMintTokens,
            true,
            "allocator has not got permission to mint tokens"
        );

        await management.setPermission(accounts[0], CAN_INTERACT_WITH_ALLOCATOR, true)
            .then(Utils.receiptShouldSucceed);

        const userPermissionToInteractWithAllocator = await management
            .permissions
            .call(accounts[0], CAN_INTERACT_WITH_ALLOCATOR);

        assert.equal(
            userPermissionToInteractWithAllocator,
            true,
            "user has not got permission to interact with allocator"
        );
    });

    describe("check TimeLocked", async function () {
        it("should be locked", async () => {
            const timeLocked = await TimeLocked.new(icoTill, 0, 0, true, management.address);

            await timeLocked.shouldBeLocked()
                .then(Utils.receiptShouldSucceed);

            await timeLocked.shouldBeUnLocked()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("should be unlocked", async () => {
            const timeLocked = await TimeLocked.new(icoSince, 0, 0, true, management.address);

            await timeLocked.shouldBeUnLocked()
                .then(Utils.receiptShouldSucceed);

            await timeLocked.shouldBeLocked()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed)
        });
    });

    describe("check TimeLockedToken", async function () {
        it("check how transfer depends on time", async () => {
            const timeLocked = await TimeLocked.new(
                icoTill,
                new BigNumber("10000").mul(precision),
                0,
                true,
                management.address
            );

            await management.registerContract(CONTRACT_TOKEN, timeLocked.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                timeLocked.address,
                "token address is not equal"
            );

            await assert.equal((await timeLocked.time.call()).valueOf(), icoTill, "time is not equal");

            await allocator.allocate(
                accounts[1],
                new BigNumber("100").mul(precision),
                0
            )
                .then(Utils.receiptShouldSucceed);

            let prevTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                prevTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let prevTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                prevTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await timeLocked.transfer(
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let currentTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await timeLocked.updateTime(icoSince)
                .then(Utils.receiptShouldSucceed);

            await timeLocked.transfer(
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldSucceed);

            currentTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance1 is not equal"
            );

            currentTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance2 is not equal"
            );
        });

        it("check excluded address while transfer", async () => {
            const timeLocked = await TimeLocked.new(
                icoTill,
                new BigNumber("10000").mul(precision),
                0,
                true,
                management.address
            );

            await management.registerContract(CONTRACT_TOKEN, timeLocked.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                timeLocked.address,
                "token address is not equal"
            );

            await assert.equal((await timeLocked.time.call()).valueOf(), icoTill, "time is not equal");

            await allocator.allocate(
                accounts[1],
                new BigNumber("100").mul(precision),
                0
            )
                .then(Utils.receiptShouldSucceed);

            let prevTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                prevTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let prevTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                prevTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await timeLocked.transfer(
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let currentTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await management.setPermission(accounts[1], EXCLUDED_ADDRESSES, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(accounts[1], EXCLUDED_ADDRESSES),
                true,
                "getExcludedAddress is not equal"
            );

            await timeLocked.transfer(
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldSucceed);

            currentTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance1 is not equal"
            );

            currentTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance2 is not equal"
            );
        });

        it("check how transferFrom depends on time", async () => {
            const timeLocked = await TimeLocked.new(
                icoTill,
                new BigNumber("10000").mul(precision),
                0,
                true,
                management.address
            );

            await management.registerContract(CONTRACT_TOKEN, timeLocked.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                timeLocked.address,
                "token address is not equal"
            );

            await assert.equal(
                (await timeLocked.time.call()).valueOf(),
                icoTill,
                "time is not equal"
            );

            await allocator.allocate(accounts[1], new BigNumber("100").mul(precision), 0)
                .then(Utils.receiptShouldSucceed);

            let prevTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                prevTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let prevTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                prevTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await timeLocked.approve(
                accounts[3],
                new BigNumber("100").mul(precision).valueOf(),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                (await timeLocked.allowance.call(accounts[1], accounts[3])).valueOf(),
                100 * precision,
                "allowance is not equal"
            );

            await timeLocked.transferFrom(
                accounts[1],
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[3] }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let currentTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await timeLocked.updateTime(icoSince)
                .then(Utils.receiptShouldSucceed);

            await timeLocked.transferFrom(
                accounts[1],
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[3] }
            )
                .then(Utils.receiptShouldSucceed);

            currentTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance1 is not equal"
            );

            currentTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance2 is not equal"
            );
        });

        it("check excluded address while transferFrom", async () => {
            const timeLocked = await TimeLocked.new(
                icoTill,
                new BigNumber("10000").mul(precision),
                0,
                true,
                management.address
            );

            await management.registerContract(CONTRACT_TOKEN, timeLocked.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                timeLocked.address,
                "token address is not equal"
            );

            await assert.equal(
                (await timeLocked.time.call()).valueOf(),
                icoTill,
                "time is not equal"
            );

            await allocator.allocate(
                accounts[1],
                new BigNumber("100").mul(precision),
                0
            )
                .then(Utils.receiptShouldSucceed);

            let prevTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                prevTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let prevTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                prevTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await timeLocked.approve(
                accounts[3],
                new BigNumber("100").mul(precision).valueOf(),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                (await timeLocked.allowance.call(accounts[1], accounts[3])).valueOf(),
                100 * precision,
                "allowance is not equal"
            );

            await timeLocked.transferFrom(
                accounts[1],
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[3] }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let currentTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await management.setPermission(accounts[1], EXCLUDED_ADDRESSES, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(accounts[1], EXCLUDED_ADDRESSES),
                true,
                "getExcludedAddress is not equal"
            );

            await timeLocked.transferFrom(
                accounts[1],
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[3] }
            )
                .then(Utils.receiptShouldSucceed);

            currentTokenBalance1 = await timeLocked.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance1 is not equal"
            );

            currentTokenBalance2 = await timeLocked.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance2 is not equal"
            );
        });
    });
});
