const MintableTokenAllocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const MintableToken = artifacts.require("ico.contracts/token/MintableToken.sol");
const Management = artifacts.require("ico.contracts/Management.sol");
const Utils = require("../utils");
const BigNumber = require("bignumber.js");

// Contract keys
const CONTRACT_TOKEN = 1;
const CONTRACT_ALLOCATOR = 4;

// Permission keys
const CAN_MINT_TOKENS = 0;
const CAN_UPDATE_STATE = 2;
const CAN_INTERACT_WITH_ALLOCATOR = 5;

contract("MintableTokenAllocator", accounts => {
    let management;

    beforeEach(async () => {
        management = await Management.new({from: accounts[0]});
    });

    describe("MintableTokenAllocator", () => {
        it("tokens available should return 900", async () => {
            const allocator = await MintableTokenAllocator.new(1000, management.address);
            const res = await allocator.tokensAvailable.call(100);

            assert.equal(
                res.valueOf(),
                900,
                "tokens doesn't match"
            );
        });

        it("tokens available should return 0", async () => {
            const allocator = await MintableTokenAllocator.new(100, management.address);
            const res = await allocator.tokensAvailable.call(100);

            assert.equal(
                res,
                0,
                "tokens doesn't match"
            );
        });

        it("should allow to allocate", async () => {
            const holder = accounts[1];
            const crowdsale = accounts[2];

            const token = await MintableToken.new(
                1000000,
                100,
                true,
                management.address
            );

            const allocator = await MintableTokenAllocator.new(1000000, management.address);

            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const tokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                tokenAddress,
                token.address,
                "token address is not equal"
            );

            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const allocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                allocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            await management.setPermission(allocator.address, CAN_MINT_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            const allocatorPermissionMintTokens = await management
                .permissions
                .call(allocator.address, CAN_MINT_TOKENS);

            assert.equal(
                allocatorPermissionMintTokens,
                true,
                "allocator has not got permission to mint tokens"
            );

            await management.setPermission(crowdsale, CAN_INTERACT_WITH_ALLOCATOR, true)
                .then(Utils.receiptShouldSucceed);

            const crowdsalePermissionToInteractWithAllocator = await management
                .permissions
                .call(crowdsale, CAN_INTERACT_WITH_ALLOCATOR);

            assert.equal(
                crowdsalePermissionToInteractWithAllocator,
                true,
                "crowdsale has not got permission to interact with allocator"
            );

            let previousBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            await allocator.allocate(holder, 100, 0, {from: crowdsale})
                .then(Utils.receiptShouldSucceed);

            let currentBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                100,
                "currentBalance is not equal"
            );
        });

        it("should not allow to allocate from not crowdsale", async () => {
            const owner = accounts[0];
            const holder = accounts[1];
            const crowdsale = accounts[2];

            const token = await MintableToken.new(1000000, 100, true, management.address);
            const allocator = await MintableTokenAllocator.new(1000000, management.address);

            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const tokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);
            assert.equal(tokenAddress, token.address, "token address is not equal");

            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const allocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);
            assert.equal(allocatorAddress, allocator.address, "allocator address is not equal");

            await management.setPermission(allocator.address, CAN_MINT_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            const allocatorPermissionMintTokens = await management
                .permissions
                .call(allocator.address, CAN_MINT_TOKENS);

            assert.equal(
                allocatorPermissionMintTokens,
                true,
                "allocator has not got permission to mint tokens"
            );


            await management.setPermission(crowdsale, CAN_INTERACT_WITH_ALLOCATOR, true)
                .then(Utils.receiptShouldSucceed);

            const crowdsalePermissionToInteractWithAllocator = await management
                .permissions
                .call(crowdsale, CAN_INTERACT_WITH_ALLOCATOR);

            assert.equal(
                crowdsalePermissionToInteractWithAllocator,
                true,
                "crowdsale has not got permission to interact with allocator"
            );

            let previousBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            await allocator.allocate(holder, 100, 0, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                0,
                "currentBalance is not equal"
            );
        });

        it("should allow to set token only from owner", async () => {
            const token = await MintableToken.new(
                1000000,
                100,
                true,
                management.address
            );

            const allocator = await MintableTokenAllocator.new(1000000, management.address);

            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const allocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                allocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            await management.registerContract(CONTRACT_TOKEN, token.address, {from: accounts[1]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let result = await management.contractRegistry.call(CONTRACT_TOKEN);

            await assert.equal(
                result.valueOf(),
                "0x0000000000000000000000000000000000000000",
                "CONTRACT_TOKEN is not equal"
            );

            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const tokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                tokenAddress,
                token.address,
                "token address is not equal"
            );

            result = await management.contractRegistry.call(CONTRACT_TOKEN);

            await assert.equal(
                result.valueOf(),
                token.address,
                "CONTRACT_TOKEN is not equal"
            );
        });
    });

    describe("MintableToken", () => {
        it("available tokens should return 800", async () => {
            const holder = accounts[1];
            const crowdsale = accounts[2];

            const token = await MintableToken.new(
                1000,
                100,
                true,
                management.address
            );

            const allocator = await MintableTokenAllocator.new(1000, management.address);

            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const tokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                tokenAddress,
                token.address,
                "token address is not equal"
            );

            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const allocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                allocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            await management.setPermission(allocator.address, CAN_MINT_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            const allocatorPermissionMintTokens = await management
                .permissions
                .call(allocator.address, CAN_MINT_TOKENS);

            assert.equal(
                allocatorPermissionMintTokens,
                true,
                "allocator has not got permission to mint tokens"
            );

            await management.setPermission(crowdsale, CAN_INTERACT_WITH_ALLOCATOR, true)
                .then(Utils.receiptShouldSucceed);

            const crowdsalePermissionToInteractWithAllocator = await management
                .permissions
                .call(crowdsale, CAN_INTERACT_WITH_ALLOCATOR);

            assert.equal(
                crowdsalePermissionToInteractWithAllocator,
                true,
                "crowdsale has not got permission to interact with allocator"
            );

            let previousBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            await allocator.allocate(holder, 100, 0, {from: crowdsale})
                .then(Utils.receiptShouldSucceed);

            let currentBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                100,
                "currentBalance is not equal"
            );

            let total = await token.totalSupply.call();

            await assert.equal(
                new BigNumber(total).valueOf(),
                200,
                "totalSupply is not equal"
            );

            const res = await token.availableTokens.call();

            assert.equal(
                res.valueOf(),
                800,
                "tokens doesn't match"
            );
        });

        it("should not allow to allocate because totalSupply == maxSupply", async () => {
            const holder = accounts[1];
            const crowdsale = accounts[2];

            const token = await MintableToken.new(
                1000000,
                900000,
                true,
                management.address
            );

            const allocator = await MintableTokenAllocator.new(1000000, management.address);

            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const tokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                tokenAddress,
                token.address,
                "token address is not equal"
            );

            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const allocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                allocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            await management.setPermission(allocator.address, CAN_MINT_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            const allocatorPermissionMintTokens = await management
                .permissions
                .call(allocator.address, CAN_MINT_TOKENS);

            assert.equal(
                allocatorPermissionMintTokens,
                true,
                "allocator has not got permission to mint tokens"
            );

            await management.setPermission(crowdsale, CAN_INTERACT_WITH_ALLOCATOR, true)
                .then(Utils.receiptShouldSucceed);

            const crowdsalePermissionToInteractWithAllocator = await management
                .permissions
                .call(crowdsale, CAN_INTERACT_WITH_ALLOCATOR);

            assert.equal(
                crowdsalePermissionToInteractWithAllocator,
                true,
                "crowdsale has not got permission to interact with allocator"
            );

            let previousBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            await allocator.allocate(holder, 100000, 0, {from: crowdsale})
                .then(Utils.receiptShouldSucceed);

            let currentBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                100000,
                "currentBalance is not equal"
            );

            await allocator.allocate(holder, 100000, 100000, {from: crowdsale})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            currentBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                100000,
                "currentBalance is not equal"
            );
        });

        it("should allow to disable minting only from CAN_UPDATE_STATE", async () => {
            const holder = accounts[1];
            const crowdsale = accounts[2];

            const token = await MintableToken.new(
                1000000,
                900000,
                true,
                management.address
            );

            const allocator = await MintableTokenAllocator.new(1000000, management.address);

            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const tokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);
            assert.equal(
                tokenAddress,
                token.address,
                "token address is not equal"
            );

            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const allocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                allocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            await management.setPermission(allocator.address, CAN_MINT_TOKENS, true)
                .then(Utils.receiptShouldSucceed);

            const allocatorPermissionMintTokens = await management
                .permissions
                .call(allocator.address, CAN_MINT_TOKENS);

            assert.equal(
                allocatorPermissionMintTokens,
                true,
                "allocator has not got permission to mint tokens"
            );

            await management.setPermission(crowdsale, CAN_INTERACT_WITH_ALLOCATOR, true)
                .then(Utils.receiptShouldSucceed);

            const crowdsalePermissionToInteractWithAllocator = await management
                .permissions
                .call(crowdsale, CAN_INTERACT_WITH_ALLOCATOR);

            assert.equal(
                crowdsalePermissionToInteractWithAllocator,
                true,
                "crowdsale has not got permission to interact with allocator"
            );

            await management.setPermission(crowdsale, CAN_UPDATE_STATE, true)
                .then(Utils.receiptShouldSucceed);

            const crowdsalePermissionToUpdateState = await management
                .permissions
                .call(crowdsale, CAN_UPDATE_STATE);

            assert.equal(
                crowdsalePermissionToUpdateState,
                true,
                "crowdsale has not got permission to update state"
            );

            let previousBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            await allocator.allocate(holder, 100, 0, {from: crowdsale})
                .then(Utils.receiptShouldSucceed);

            let currentBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                100,
                "currentBalance is not equal"
            );

            await token.disableMinting()
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await allocator.allocate(holder, 100, 0, {from: crowdsale})
                .then(Utils.receiptShouldSucceed);

            currentBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                200,
                "currentBalance is not equal"
            );

            await token.disableMinting({from: crowdsale})
                .then(Utils.receiptShouldSucceed);

            await allocator.allocate(holder, 100, 100, {from: crowdsale})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            currentBalance = await token.balanceOf.call(holder);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                200,
                "currentBalance is not equal"
            );
        });
    });
});
