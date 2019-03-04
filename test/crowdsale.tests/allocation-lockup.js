const Management = artifacts.require("ico.contracts/Management.sol");
const AllocationLockupContractTest = artifacts.require("ico.contracts/tests/AllocationLockupContractTest.sol");
const MintableTokenAllocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const Utils = require("../utils");
const BigNumber = require("bignumber.js");

// Contract keys
const CONTRACT_TOKEN = 1;
const CONTRACT_ALLOCATOR = 4;

// Permission keys
const CAN_MINT_TOKENS = 0;
const CAN_LOCK_TOKENS = 3;
const CAN_INTERACT_WITH_ALLOCATOR = 5;

// Precision for BigNumber (1e18)
const precision = new BigNumber("1000000000000000000");

let icoSince = parseInt(new Date().getTime() / 1000) - 3600;
let icoTill = parseInt(new Date().getTime() / 1000) + 3600;

contract("AllocationLockupContract", accounts => {
    let allocator;
    let management;
    let allocation;

    const owner = accounts[0];

    beforeEach(async () => {
        management = await Management.new();
        allocator = await MintableTokenAllocator.new(10000 * precision, management.address);
        allocation = await AllocationLockupContractTest.new(management.address);

        await management.registerContract(CONTRACT_TOKEN, allocation.address)
            .then(Utils.receiptShouldSucceed);

        let contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);
        assert.equal(contractTokenAddress, allocation.address, "token address is not equal");

        await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
            .then(Utils.receiptShouldSucceed);

        let contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);
        assert.equal(contractAllocatorAddress, allocator.address, "allocator address is not equal");

        await management.setPermission(allocator.address, CAN_MINT_TOKENS, true)
            .then(Utils.receiptShouldSucceed);

        let allocatorPermissionToMint = await management.permissions.call(allocator.address, CAN_MINT_TOKENS);
        assert.equal(allocatorPermissionToMint, true, "allocator has not got permission to mint tokens");

        await management.setPermission(allocation.address, CAN_INTERACT_WITH_ALLOCATOR, true)
            .then(Utils.receiptShouldSucceed);

        let tokenPermissionToInteractWithAllocator =
            await management.permissions.call(allocation.address, CAN_INTERACT_WITH_ALLOCATOR);

        assert.equal(
            tokenPermissionToInteractWithAllocator,
            true,
            "token has not got permission to interact with allocator"
        );

        await management.setPermission(allocation.address, CAN_LOCK_TOKENS, true)
            .then(Utils.receiptShouldSucceed);

        let tokenPermissionToLockTokens = await management.permissions.call(allocation.address, CAN_LOCK_TOKENS);
        assert.equal(tokenPermissionToLockTokens, true, "token has not got permission to lock tokens");
    });

    describe("check allocationLog", async () => {

        it("should not allow to call allocationLog from not lockupAgent", async () => {
            await allocation.allocationLog(
                accounts[1],
                100 * precision,
                icoSince,
                3600 * 24 * 5,
                0,
                3600 * 24
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed)
        });

        it("should return amount = amount", async () => {
            await management.setPermission(owner, CAN_LOCK_TOKENS, true);
            assert.equal(await management.permissions.call(owner, CAN_LOCK_TOKENS),
                true, "permissions is not equal");

            await allocation.allocationLog(
                accounts[1],
                100 * precision,
                icoSince,
                3600 * 24 * 5,
                0,
                3600 * 24
            )
                .then(Utils.receiptShouldSucceed);

            let amount = await allocation.lockedAllocationAmount.call(accounts[1], 1);
            assert.equal(amount, 100 * precision, "amount is not equal");
        });

        it("should return amount = amount - initialUnlock", async () => {
            await management.setPermission(owner, CAN_LOCK_TOKENS, true);
            assert.equal(await management.permissions.call(owner, CAN_LOCK_TOKENS),
                true, "permissions is not equal");

            await allocation.allocationLog(
                accounts[1],
                100 * precision,
                icoSince,
                3600 * 24 * 5,
                20,
                3600 * 24
            )
                .then(Utils.receiptShouldSucceed);

            let amount = await allocation.lockedAllocationAmount.call(accounts[1], 1);
            assert.equal(amount, 80 * precision, "amount is not equal");
        });
    });

    describe("check isTransferAllowedAllocation", async () => {
        it("should allow to transfer as account hasn`t got locked tokens", async () => {
            await management.setPermission(owner, CAN_INTERACT_WITH_ALLOCATOR, true)
                .then(Utils.receiptShouldSucceed);

            assert.equal(await management.permissions.call(owner, CAN_INTERACT_WITH_ALLOCATOR),
                true, "permissions is not equal");

            await allocator.allocate(accounts[2], 100 * precision, 0)
                .then(Utils.receiptShouldSucceed);

            let tokenBalance = await allocation.balanceOf.call(accounts[2]);
            let result = await allocation.isTransferAllowedAllocation(
                accounts[2],
                100 * precision,
                icoSince,
                tokenBalance
            );

            assert.equal(result, true, "isTransferAllowedAllocation is not equal")
        });

        it("should allow to transfer as transfer amount is less than balance", async () => {
            await management.setPermission(owner, CAN_LOCK_TOKENS, true);
            assert.equal(await management.permissions.call(owner, CAN_LOCK_TOKENS),
                true, "permissions is not equal");

            await allocation.allocationLog(
                accounts[1],
                100 * precision,
                icoSince,
                3600 * 24 * 5,
                20,
                3600 * 24
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(
                    await allocation.lockedAllocationAmount.call(
                        accounts[1], 1
                    )
                ).valueOf(),
                80 * precision,
                "lockedAllocationAmount is not equal"
            );

            let result = await allocation.isTransferAllowedAllocation(
                accounts[1],
                80 * precision,
                icoSince,
                100 * precision
            );

            assert.equal(result, false, "isTransferAllowedAllocation is not equal");

            result = await allocation.isTransferAllowedAllocation(
                accounts[1],
                10 * precision,
                icoSince,
                100 * precision
            );

            assert.equal(result, true, "isTransferAllowedAllocation is not equal");
        });

        it("should not allow to transfer as all balance is locked", async () => {
            await management.setPermission(owner, CAN_LOCK_TOKENS, true);
            assert.equal(await management.permissions.call(owner, CAN_LOCK_TOKENS),
                true, "permissions is not equal");

            await allocation.allocationLog(
                accounts[1],
                100 * precision,
                icoSince,
                3600 * 24 * 5,
                20,
                3600 * 24
            )
                .then(Utils.receiptShouldSucceed);

            await allocation.allocationLog(
                accounts[1],
                0,
                icoSince,
                3600 * 24 * 5,
                20,
                3600 * 24
            )
                .then(Utils.receiptShouldSucceed);

            let result = await allocation.isTransferAllowedAllocation(
                accounts[1],
                10 * precision,
                icoSince,
                100 * precision
            );

            assert.equal(result, false, "isTransferAllowedAllocation is not equal");
        });

        it("should not allow to transfer all balance as lockPeriodEnd is less than current time", async () => {
            await management.setPermission(owner, CAN_LOCK_TOKENS, true);
            assert.equal(await management.permissions.call(owner, CAN_LOCK_TOKENS),
                true, "permissions is not equal");

            await allocation.allocationLog(
                accounts[1],
                100 * precision,
                icoSince,
                3600 * 24 * 5,
                20,
                3600 * 24
            )
                .then(Utils.receiptShouldSucceed);

            let result = await allocation.isTransferAllowedAllocation(
                accounts[1],
                100 * precision,
                icoSince + 3600 * 24 * 4,
                100 * precision
            );

            assert.equal(result, false, "isTransferAllowedAllocation is not equal");
        });

        it("should not allow to transfer as transfer amount is bigger than balance", async () => {
            await management.setPermission(owner, CAN_LOCK_TOKENS, true);
            assert.equal(await management.permissions.call(owner, CAN_LOCK_TOKENS),
                true, "permissions is not equal");

            await allocation.allocationLog(
                accounts[1],
                100 * precision,
                icoSince,
                3600 * 24 * 5,
                20,
                3600 * 24
            )
                .then(Utils.receiptShouldSucceed);

            let result = await allocation.isTransferAllowedAllocation(
                accounts[1],
                100 * precision + 10 * precision,
                icoSince + 3600 * 24 * 6,
                100 * precision
            );

            assert.equal(result, false, "isTransferAllowedAllocation is not equal")
        });
    });

    describe("check allowedBalance", async () => {
        it("should return all balance as account hasn`t got locked tokens", async () => {
            await management.setPermission(owner, CAN_INTERACT_WITH_ALLOCATOR, true);
            assert.equal(await management.permissions.call(owner, CAN_INTERACT_WITH_ALLOCATOR),
                true, "permissions is not equal");

            await allocator.allocate(accounts[2], 100 * precision, 0)
                .then(Utils.receiptShouldSucceed);

            let tokenBalance = await allocation.balanceOf.call(accounts[2]);
            assert.equal(tokenBalance.valueOf(), 100 * precision, "tokenBalance is not equal");

            let result = await allocation.allowedBalance(accounts[2], icoSince, tokenBalance);
            assert.equal(result.valueOf(), tokenBalance.valueOf(), "allowedBalance is not equal");
        });

        it("should return 0 as all balance is locked", async () => {
            await management.setPermission(owner, CAN_LOCK_TOKENS, true);
            assert.equal(await management.permissions.call(owner, CAN_LOCK_TOKENS),
                true, "permissions is not equal");

            await management.setPermission(owner, CAN_INTERACT_WITH_ALLOCATOR, true);
            assert.equal(await management.permissions.call(owner, CAN_INTERACT_WITH_ALLOCATOR),
                true, "permissions is not equal");

            await allocator.allocate(accounts[2], 100 * precision, 0)
                .then(Utils.receiptShouldSucceed);

            let tokenBalance = await allocation.balanceOf.call(accounts[2]);
            assert.equal(tokenBalance.valueOf(), 100 * precision, "tokenBalance is not equal");

            let result = await allocation.allowedBalance(accounts[2], icoSince, tokenBalance);
            assert.equal(result.valueOf(), tokenBalance.valueOf(), "allowedBalance is not equal");

            await allocation.allocationLog(
                accounts[2],
                0,
                icoTill,
                3600 * 24 * 5,
                20,
                3600 * 24
            )
                .then(Utils.receiptShouldSucceed);

            result = await allocation.allowedBalance(accounts[2], icoTill, tokenBalance);
            assert.equal(result.valueOf(), 0, "allowedBalance is not equal");
        });

        it("should return allowedBalance = initialUnlock", async () => {
            await management.setPermission(owner, CAN_LOCK_TOKENS, true);
            assert.equal(await management.permissions.call(owner, CAN_LOCK_TOKENS),
                true, "permissions is not equal");

            await allocation.allocationLog(
                accounts[1],
                100 * precision,
                icoSince,
                3600 * 24 * 5,
                20,
                0
            )
                .then(Utils.receiptShouldSucceed);

            let result = await allocation.allowedBalance(accounts[1], icoSince + 3600 * 24, 100 * precision);
            assert.equal(result.valueOf(), 20 * precision, "allowedBalance is not equal");
        });

        it("should return allowedBalance = initialUnlock + releasePeriod tokens", async () => {
            await management.setPermission(owner, CAN_LOCK_TOKENS, true);
            assert.equal(await management.permissions.call(owner, CAN_LOCK_TOKENS),
                true, "permissions is not equal");

            await allocation.allocationLog(
                accounts[1],
                100 * precision,
                icoSince,
                3600 * 24 * 5,
                20,
                3600 * 24
            )
                .then(Utils.receiptShouldSucceed);

            let result = await allocation.allowedBalance.call(
                accounts[1],
                new BigNumber(icoSince).add(3600 * 25),
                100 * precision
            );

            assert.equal(result.valueOf(), 36 * precision, "allowedBalance is not equal");
        });
    });
});
