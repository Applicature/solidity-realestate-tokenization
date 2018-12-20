const Management = artifacts.require("ico.contracts/Management.sol");
const PausableToken = artifacts.require("ico.contracts/tests/PausableTokenTest.sol");
const Allocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const Utils = require("../utils");
const BigNumber = require("bignumber.js");

// Contract keys
const CONTRACT_TOKEN = 1;
const CONTRACT_ALLOCATOR = 4;

// Permission keys
const CAN_MINT_TOKENS = 0;
const CAN_INTERACT_WITH_ALLOCATOR = 5;
const CAN_PAUSE_TOKENS = 7

// Precision for BigNumber (1e18)
const precision = new BigNumber("1000000000000000000");

contract("PausableToken", accounts => {
    let allocator;
    let management;

    beforeEach(async function () {
        management = await Management.new();
        allocator = await Allocator.new(new BigNumber("10000").mul(precision), management.address);

        await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
            .then(Utils.receiptShouldSucceed);

        const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

        assert.equal(
            contractAllocatorAddress,
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

        await management.setPermission(accounts[0], CAN_PAUSE_TOKENS, true)
            .then(Utils.receiptShouldSucceed);

        const userPermissionToPauseTokens = await management
            .permissions
            .call(accounts[0], CAN_PAUSE_TOKENS);

        assert.equal(
            userPermissionToPauseTokens,
            true,
            "user has not got permission to pause tokens"
        );
    });

    describe("check PausableToken", async function () {
        it("should be paused after deploy", async () => {
            const pausable = await PausableToken.new(management.address, 0, 0, true, true);

            await pausable.shouldBePaused()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBeUnPaused()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("should be unpaused after deploy", async () => {
            const pausable = await PausableToken.new(management.address, 0, 0, true, false);

            await pausable.shouldBeUnPaused()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBePaused()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed)
        });

        it("should be unpaused after unpause function call", async () => {
            const pausable = await PausableToken.new(management.address, 0, 0, true, true);

            await pausable.shouldBePaused()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBeUnPaused()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await pausable.unpause({from: accounts[2]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await pausable.shouldBePaused()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBeUnPaused()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await pausable.unpause()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBeUnPaused()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBePaused()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed)
        });

        it("should be paused after pause function call", async () => {
            const pausable = await PausableToken.new(management.address, 0, 0, true, false);

            await pausable.shouldBeUnPaused()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBePaused()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await pausable.pause({from: accounts[2]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await pausable.shouldBeUnPaused()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBePaused()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await pausable.pause()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBePaused()
                .then(Utils.receiptShouldSucceed);

            await pausable.shouldBeUnPaused()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed)
        });
    });

    describe("check ERC20PausableToken", async function () {
        it("check how transfer depends on pauses", async () => {
            const pausable = await PausableToken.new(
                management.address,
                new BigNumber("10000").mul(precision),
                0,
                true,
                true
            );

            await management.registerContract(CONTRACT_TOKEN, pausable.address)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                (await pausable.paused.call()).valueOf(),
                true,
                "pause is not equal"
            );

            await allocator.allocate(accounts[1], new BigNumber("100").mul(precision), 0)
                .then(Utils.receiptShouldSucceed);

            let prevTokenBalance1 = await pausable.balanceOf.call(accounts[1]);

            await assert.equal(
                prevTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let prevTokenBalance2 = await pausable.balanceOf.call(accounts[2]);

            await assert.equal(
                prevTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await pausable.transfer(
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentTokenBalance1 = await pausable.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let currentTokenBalance2 = await pausable.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await pausable.unpause();

            await pausable.transfer(
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldSucceed);

            currentTokenBalance1 = await pausable.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance1 is not equal"
            );

            currentTokenBalance2 = await pausable.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance2 is not equal"
            );

            await pausable.pause()
                .then(Utils.receiptShouldSucceed);

            await pausable.transfer(
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            currentTokenBalance1 = await pausable.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance1 is not equal"
            );

            currentTokenBalance2 = await pausable.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance2 is not equal"
            );
        });

        it("check how transferFrom depends on time", async () => {
            const pausable = await PausableToken.new(
                management.address,
                new BigNumber("10000").mul(precision),
                0,
                true,
                true
            );

            await management.registerContract(CONTRACT_TOKEN, pausable.address)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                (await pausable.paused.call()).valueOf(),
                true,
                "pause is not equal"
            );

            await allocator.allocate(accounts[1], new BigNumber("100").mul(precision), 0)
                .then(Utils.receiptShouldSucceed);

            let prevTokenBalance1 = await pausable.balanceOf.call(accounts[1]);

            await assert.equal(
                prevTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let prevTokenBalance2 = await pausable.balanceOf.call(accounts[2]);

            await assert.equal(
                prevTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await pausable.approve(
                accounts[3],
                new BigNumber("100").mul(precision).valueOf(),
                { from: accounts[1] }
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                (await pausable.allowance.call(accounts[1], accounts[3])).valueOf(),
                new BigNumber("100").mul(precision),
                "allowance is not equal"
            );

            await pausable.transferFrom(
                accounts[1],
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[3] }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentTokenBalance1 = await pausable.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("100").mul(precision),
                "tokenBalance1 is not equal"
            );

            let currentTokenBalance2 = await pausable.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                0,
                "tokenBalance2 is not equal"
            );

            await pausable.unpause();

            await pausable.transferFrom(
                accounts[1],
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[3] }
            )
                .then(Utils.receiptShouldSucceed);

            currentTokenBalance1 = await pausable.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance1 is not equal"
            );

            currentTokenBalance2 = await pausable.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance2 is not equal"
            );

            await pausable.pause();

            await pausable.transferFrom(
                accounts[1],
                accounts[2],
                new BigNumber("50").mul(precision),
                { from: accounts[3] }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            currentTokenBalance1 = await pausable.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance1.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance1 is not equal"
            );

            currentTokenBalance2 = await pausable.balanceOf.call(accounts[2]);

            await assert.equal(
                currentTokenBalance2.valueOf(),
                new BigNumber("50").mul(precision),
                "tokenBalance2 is not equal"
            );
        });
    });
});
