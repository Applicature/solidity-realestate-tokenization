const TokenAllocator = artifacts.require("ico.contracts/tests/TokenAllocatorTest.sol");
const MintableToken = artifacts.require("ico.contracts/token/MintableToken.sol");
const Management = artifacts.require("ico.contracts/Management.sol");
const Utils = require("../utils");
const BigNumber = require("bignumber.js");

// Contract keys
const CONTRACT_TOKEN = 1;
const CONTRACT_ALLOCATOR = 4;

// Permission keys
const CAN_INTERACT_WITH_ALLOCATOR = 5;
const CAN_SET_ALLOCATOR_MAX_SUPPLY = 6;

contract("TokenAllocator", accounts => {
    let allocator,
        mintableToken,
        management;

    const owner = accounts[0];

    beforeEach(async () => {
        management = await Management.new({from: owner});
        mintableToken = await MintableToken.new(1000, 100, true, management.address, {from: owner});
        allocator = await TokenAllocator.new(1000, management.address, {from: owner});
    });

    describe("check initializating and updateMaxSupply functionality", () => {
        it("should return false as management is zero-address", async () => {
            allocator = await TokenAllocator.new(1000, 0);
            let res = await allocator.isInitialized();
            assert.equal(res, false, "isInitialized doesn't match");
        });

        it("should return false as token contract is not registered", async () => {
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address);
            let res = await allocator.isInitialized();
            assert.equal(res, false, "isInitialized doesn't match");
        });

        it("should return false as allocator contract is not registered", async () => {
            await management.registerContract(CONTRACT_TOKEN, mintableToken.address);
            let res = await allocator.isInitialized();
            assert.equal(res, false, "isInitialized doesn't match");
        });

        it("should return true as TokenAllocator is initialized", async () => {
            await management.registerContract(CONTRACT_TOKEN, mintableToken.address);
            assert.equal(await management.contractRegistry.call(CONTRACT_TOKEN),
                mintableToken.address, "registry is not equal");

            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address);
            assert.equal(await management.contractRegistry.call(CONTRACT_ALLOCATOR),
                allocator.address, "registry is not equal");

            let res = await allocator.isInitialized();
            assert.equal(res, true, "isInitialized doesn't match");
        });

        it("should change maxSupply", async () => {
            await assert.equal(
                new BigNumber(await allocator.maxSupply.call()).valueOf(),
                1000,
                "maxSupply is not equal"
            );

            await allocator.updateMaxSupply(100)
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await management.setPermission(accounts[0], CAN_SET_ALLOCATOR_MAX_SUPPLY, true)
                .then(Utils.receiptShouldSucceed);

            assert.equal(await management.permissions.call(accounts[0], CAN_SET_ALLOCATOR_MAX_SUPPLY),
                true, "permissions is not equal");

            await allocator.updateMaxSupply(100)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(await allocator.maxSupply.call()).valueOf(),
                100,
                "maxSupply is not equal"
            );
        });

        it("should allocate tokens", async () => {
            let holder = accounts[3];
            let tokens = 100;
            let allocatedTokens = 0;

            await management.setPermission(owner, CAN_INTERACT_WITH_ALLOCATOR, true, {from: owner})
                .then(Utils.receiptShouldSucceed);

            await allocator.allocate(holder, tokens, allocatedTokens, {from: owner})
                .then(Utils.receiptShouldSucceed);
        });

        it("should not allocate tokens cause msg.sender do not have permission", async () => {
            let holder = accounts[3];
            let tokens = 100;
            let allocatedTokens = 0;

            await allocator.allocate(holder, tokens, allocatedTokens, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("should not allocate tokens cause tokensAvailable < tokens", async () => {
            let holder = accounts[3];
            let tokens = 100;
            let allocatedTokens = 1001;

            await allocator.allocate(holder, tokens, allocatedTokens, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });
    });
});
