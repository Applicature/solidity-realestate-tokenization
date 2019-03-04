const Management = artifacts.require("ico.contracts/Management.sol");
const MintableBurnableToken = artifacts.require("ico.contracts/token/erc20/MintableBurnableToken.sol");
const MintableTokenAllocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const Utils = require("../utils.js");

// Contract keys
const CONTRACT_TOKEN = 1;
const CONTRACT_ALLOCATOR = 4;

// Permission keys
const CAN_MINT_TOKENS = 0;
const CAN_BURN_TOKENS = 1;
const CAN_INTERACT_WITH_ALLOCATOR = 5;

contract("MintableBurnableToken", accounts => {

    let allocator;
    let token;
    let management;

    beforeEach(async function () {
        management = await Management.new();
        token = await MintableBurnableToken.new(10000e18, 0, true, management.address);
        allocator = await MintableTokenAllocator.new(10000e18, management.address);

        await management.registerContract(CONTRACT_TOKEN, token.address)
            .then(Utils.receiptShouldSucceed);

        const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

        assert.equal(
            contractTokenAddress,
            token.address,
            "token address is not equal"
        );

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
    });

    describe("check updateBurnAgent", () => {
        it("should not allow to update burn agent by not owner", async () => {
            await management.setPermission(accounts[2], CAN_BURN_TOKENS, true, {from: accounts[1]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let result = await management.permissions.call(accounts[2], CAN_BURN_TOKENS);

            await assert.equal(
                result.valueOf(),
                false,
                "burnAgent is not equal"
            );
        });

        it("should allow to update burn agent by owner", async () => {
            await management.setPermission(accounts[2], CAN_BURN_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let result = await management.permissions.call(accounts[2], CAN_BURN_TOKENS);

            await assert.equal(
                result.valueOf(),
                true,
                "burnAgent is not equal"
            );
        });
    });

    describe("check burnByAgent", () => {
        it("should not allow to burn by not agent", async () => {
            await management.setPermission(accounts[0], CAN_INTERACT_WITH_ALLOCATOR, true);

            await assert.equal(
                await management.permissions.call(accounts[0], CAN_INTERACT_WITH_ALLOCATOR),
                true,
                "allocator agent is not equal"
            );

            await allocator.allocate(accounts[1], 100e18, 100e18)
                .then(Utils.receiptShouldSucceed);

            let prevTokenBalance = await token.balanceOf.call(accounts[1]);

            await assert.equal(
                prevTokenBalance.valueOf(),
                100e18,
                "tokenBalance is not equal"
            );

            await management.setPermission(accounts[2], CAN_BURN_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(accounts[0], CAN_BURN_TOKENS),
                false,
                "burnAgent is not equal"
            );

            await token.burnByAgent(accounts[1], 10e18)
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentTokenBalance = await token.balanceOf.call(accounts[1]);

            await assert.equal(
                currentTokenBalance.valueOf(),
                100e18,
                "tokenBalance is not equal"
            );
        });

        it("should allow to burn all balance", async () => {
            await management.setPermission(accounts[2], CAN_BURN_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let result = await management.permissions.call(accounts[2], CAN_BURN_TOKENS);

            await assert.equal(
                result.valueOf(),
                true,
                "burnAgent is not equal"
            );

            await management.setPermission(accounts[0], CAN_INTERACT_WITH_ALLOCATOR, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(accounts[0], CAN_INTERACT_WITH_ALLOCATOR),
                true,
                "allocator agent is not equal"
            );

            await allocator.allocate(accounts[1], 100e18, 100e18)
                .then(Utils.receiptShouldSucceed);

            let prevTokenBalance = await token.balanceOf.call(accounts[1]);

            await assert.equal(
                prevTokenBalance.valueOf(),
                100e18,
                "tokenBalance is not equal"
            );

            await token.burnByAgent(accounts[1], 0, {from: accounts[2]})
                .then(Utils.receiptShouldSucceed);

            let currentTokenBalance = await token.balanceOf.call(accounts[1]);
            await assert.equal(
                await currentTokenBalance.valueOf(),
                0,
                "tokenBalance is not equal"
            );
        });

        it("should allow to burn", async () => {
            await management.setPermission(accounts[2], CAN_BURN_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            let result = await management.permissions.call(accounts[2], CAN_BURN_TOKENS);

            await assert.equal(
                result.valueOf(),
                true,
                "burnAgent is not equal"
            );

            await management.setPermission(accounts[0], CAN_INTERACT_WITH_ALLOCATOR, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(accounts[0], CAN_INTERACT_WITH_ALLOCATOR),
                true,
                "allocator agent is not equal"
            );

            await allocator.allocate(accounts[1], 100e18, 100e18)
                .then(Utils.receiptShouldSucceed);

            let prevTokenBalance = await token.balanceOf.call(accounts[1]);

            await assert.equal(
                prevTokenBalance.valueOf(),
                100e18,
                "tokenBalance is not equal"
            );

            await token.burnByAgent(accounts[1], 10e18, {from: accounts[2]})
                .then(Utils.receiptShouldSucceed);

            let currentTokenBalance = await token.balanceOf.call(accounts[1]);

            await assert.equal(
                await currentTokenBalance.valueOf(),
                90e18,
                "tokenBalance is not equal"
            );
        });
    });
});
