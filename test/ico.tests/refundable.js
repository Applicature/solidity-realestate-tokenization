const Management = artifacts.require("ico.contracts/Management.sol");
const Token = artifacts.require("ico.contracts/token/erc20/MintableToken.sol");
const TokenAllocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const PricingStrategy = artifacts.require("ico.contracts/pricing/PricingStrategyImpl.sol");
const ContributionForwarder = artifacts.require("ico.contracts/contribution/DirectContributionForwarder.sol");
const RefundableCrowdsale = artifacts.require("ico.contracts/tests/RCrowdsaleTest.sol");
const Agent = artifacts.require("ico.contracts/tests/MintableCrowdsaleOnSuccessAgentTest.sol");
const Utils = require("../utils.js");
const BigNumber = require("bignumber.js");

// Contract keys
const CONTRACT_TOKEN = 1;
const CONTRACT_PRICING = 2;
const CONTRACT_CROWDSALE = 3;
const CONTRACT_ALLOCATOR = 4;
const CONTRACT_AGENT = 5;
const CONTRACT_FORWARDER = 6;

// Permission keys
const CAN_MINT_TOKENS = 0;
const CAN_UPDATE_STATE = 2;
const CAN_INTERACT_WITH_ALLOCATOR = 5;

// Precision for BigNumber (1e18)
const precision = new BigNumber("1000000000000000000");

// Precision for USD (1e5)
const usdPrecision = new BigNumber("100000");

let icoSince = parseInt(new Date().getTime() / 1000) - 3600;
let icoTill = parseInt(new Date().getTime() / 1000) + 3600;

contract("RefundableCrowdsale", accounts => {

    let management;
    let token;
    let allocator;
    let contributionForwarder;
    let strategy;
    let crowdsale;
    let agent;

    beforeEach(async function () {
        management = await Management.new();

        token = await Token.new(
            500 * precision,
            0,
            true,
            management.address
        );

        allocator = await TokenAllocator.new(500 * precision, management.address);

        contributionForwarder = await ContributionForwarder.new(accounts[3], management.address);

        strategy = await PricingStrategy.new(
            management.address,
            true,
            true,
            [///privateSale
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                100 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                50,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                0,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoSince,// uint256 startTime;
                icoTill,// uint256 endTime;
                ///preSale
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                200 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                30,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                0,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoTill + 3600,// uint256 startTime;
                icoTill + 3600 * 2,// uint256 endTime;
                ///ICO Tier1
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                300 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                25,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                0,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoTill + 3600,// uint256 startTime;
                icoTill + 3600 * 2,// uint256 endTime;
                ///ICO Tier2
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                400 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                20,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                100000000,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoTill + 3600,// uint256 startTime;
                icoTill + 3600 * 2,// uint256 endTime;
                ///ICO Tier3
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                500 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                10,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                100000000,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoTill + 3600,// uint256 startTime;
                icoTill + 3600 * 2,// uint256 endTime;
            ],
            75045000,
            5,
            18,
            100
        );
        crowdsale = await RefundableCrowdsale.new(
            icoSince, // uint256 startDate
            icoTill, // uint256 endDate
            true, // bool allowWhitelisted
            true, // bool allowSigned
            false, // bool allowAnonymous
            200 * precision, // uint256 softCap
            500 * precision, // uint256 hardCap
            management.address // address management
        );
        agent = await Agent.new(management.address);

        await management.registerContract(CONTRACT_TOKEN, token.address)
            .then(Utils.receiptShouldSucceed);

        const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

        assert.equal(
            contractTokenAddress,
            token.address,
            "token address is not equal"
        );

        await management.registerContract(CONTRACT_PRICING, strategy.address)
            .then(Utils.receiptShouldSucceed);

        const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

        assert.equal(
            contractPricingAddress,
            strategy.address,
            "pricing strategy address is not equal"
        );

        await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
            .then(Utils.receiptShouldSucceed);

        const contractCrowdsaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

        assert.equal(
            contractCrowdsaleAddress,
            crowdsale.address,
            "crowdsale address is not equal"
        );

        await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
            .then(Utils.receiptShouldSucceed);

        const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

        assert.equal(
            contractAllocatorAddress,
            allocator.address,
            "allocator address is not equal"
        );

        await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
            .then(Utils.receiptShouldSucceed);

        const contractForwarderAddress = await management.contractRegistry.call(CONTRACT_FORWARDER);

        assert.equal(
            contractForwarderAddress,
            contributionForwarder.address,
            "contributionForwarder address is not equal"
        );

        await management.registerContract(CONTRACT_AGENT, agent.address)
            .then(Utils.receiptShouldSucceed);

        const contractAgentAddress = await management.contractRegistry.call(CONTRACT_AGENT);

        assert.equal(
            contractAgentAddress,
            agent.address,
            "agent address is not equal"
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

        await management.setPermission(crowdsale.address, CAN_UPDATE_STATE, true)
            .then(Utils.receiptShouldSucceed);

        const crowdsalePermissionToUpdateState = await management
            .permissions
            .call(crowdsale.address, CAN_UPDATE_STATE);

        assert.equal(
            crowdsalePermissionToUpdateState,
            true,
            "crowdsale has not got permission to update state"
        );

        await management.setPermission(crowdsale.address, CAN_INTERACT_WITH_ALLOCATOR, true)
            .then(Utils.receiptShouldSucceed);

        const crowdsalePermissionToInteractWithAllocator = await management
            .permissions
            .call(crowdsale.address, CAN_INTERACT_WITH_ALLOCATOR);

        assert.equal(
            crowdsalePermissionToInteractWithAllocator,
            true,
            "crowdsale has not got permission to interact with allocator"
        );
    });

    describe("check getState", () => {
        it("should return InCrowdsale as crowdsale continues", async () => {
            let state = await crowdsale.getState.call();

            assert.equal(
                state.valueOf(),
                3,
                "state is not equal"
            );
        });

        it("should return Success as crowdsale finished and softcap is achieved", async () => {
            await crowdsale.updateSoldTokens(210e18)
                .then(Utils.receiptShouldSucceed);

            await crowdsale.updateEndDate(new BigNumber(icoSince).add(10))
                .then(Utils.receiptShouldSucceed);

            let state = await crowdsale.getState.call();

            assert.equal(
                state.toString(),
                4,
                "state is not equal"
            );
        });

        it("should return Refundable as crowdsale finished and softcap is not achieved", async () => {
            await crowdsale.updateEndDate(new BigNumber(icoSince).add(10))
                .then(Utils.receiptShouldSucceed);

            let state = await crowdsale.getState.call();

            assert.equal(
                state.toString(),
                6,
                "state is not equal"
            );
        });
    });

    describe("check internalContribution", () => {
        it("should succeed and forward ethers", async () => {
            await strategy.updateDates(0, icoSince - 4000, icoSince - 3000)
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(1, icoSince - 2000, icoSince - 1000)
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(2, icoSince, icoTill)
                .then(Utils.receiptShouldSucceed);

            let prev = await Utils.getEtherBalance(accounts[3]);

            let state = await crowdsale.getState.call();

            await assert.equal(
                state.valueOf(),
                3,
                "state is not equal"
            );

            await assert.equal(
                new BigNumber(await strategy.getTierIndex.call(50 * precision)).valueOf(),
                2,
                "tierIndex is not equal"
            );

            let tokens = await strategy.getTokens.call(
                0,
                500 * precision,
                0,
                new BigNumber("0.25").mul(precision),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("250.15").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("250.15").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                0,
                "bonus is not equal"
            );

            await crowdsale.internalContributionTest(
                accounts[1],
                new BigNumber("0.25").mul(precision),
                { value: 1000 }
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(new BigNumber(await token.balanceOf.call(accounts[1])).valueOf(),
                new BigNumber("250.15").mul(precision).valueOf(), "tokenBalance is not equal");

            await Utils.checkEtherBalance(accounts[3], prev.add(1000))
        });

        it("should succeed and store contributor to array", async () => {
            let state = await crowdsale.getState.call();

            await assert.equal(state.valueOf(), 3, "state is not equal");

            await assert.equal(
                new BigNumber(await crowdsale.contributorsWei.call(accounts[1])).valueOf(),
                0,
                "contributors weis is not equal"
            );

            await crowdsale.internalContributionTest(
                accounts[1],
                new BigNumber("0.01").mul(precision),
                { from: accounts[7], value: 1000 }
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(await token.balanceOf.call(accounts[1])).valueOf(),
                new BigNumber("15.009").mul(precision).valueOf(),
                "tokenBalance is not equal"
            );

            let contributor = await crowdsale.contributors.call(0);

            await assert.equal(
                contributor.valueOf(),
                accounts[1],
                "contributor is not equal"
            );

            await assert.equal(
                new BigNumber(await crowdsale.contributorsWei.call(accounts[1])).valueOf(),
                1000,
                "contributors weis is not equal"
            );
        });

        it("should failed as crowdsale has not been started", async () => {
            await crowdsale.updateEndDate(new BigNumber(icoSince).add(10))
                .then(Utils.receiptShouldSucceed);

            let state = await crowdsale.getState.call();
            assert.equal(state.toString(), 6, "state is not equal");

            crowdsale.internalContributionTest(
                accounts[1],
                new BigNumber("0.01").mul(precision)
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("should failed as tokens == 0", async () => {
            let state = await crowdsale.getState.call();
            await assert.equal(state.valueOf(), 3, "state is not equal");

            let tokens = await strategy.getTokens.call(
                0,
                500 * precision,
                0,
                precision,
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                0,
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                0,
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                0,
                "bonus is not equal"
            );

            await crowdsale.internalContributionTest(accounts[1], precision)
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });
    });

    describe("check refund", () => {
        it("refund should succeed", async () => {
            await assert.equal(
                (await crowdsale.getState.call()).valueOf(),
                3,
                "state is not equal"
            );

            await crowdsale.internalContributionTest(
                accounts[1],
                new BigNumber("0.01").mul(precision),
                { from: accounts[7], value: 1000 }
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(await token.balanceOf.call(accounts[1])).valueOf(),
                new BigNumber("15.009").mul(precision).valueOf(),
                "tokenBalance is not equal"
            );

            await assert.equal(
                (await crowdsale.getState.call()).valueOf(),
                3,
                "state is not equal"
            );

            await crowdsale.refund({from: accounts[1]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await strategy.updateDates(
                0,
                new BigNumber(icoSince).sub(3600 * 22),
                new BigNumber(icoSince).sub(3600 * 21)
            )
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(
                1,
                new BigNumber(icoSince).sub(3600 * 20),
                new BigNumber(icoSince).sub(3600 * 19)
            )
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(
                2,
                new BigNumber(icoSince).sub(3600 * 18),
                new BigNumber(icoSince).sub(3600 * 17)
            )
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(
                3,
                new BigNumber(icoSince).sub(3600 * 16),
                new BigNumber(icoSince).sub(3600 * 15)
            )
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(
                4,
                new BigNumber(icoSince).sub(3600 * 14),
                new BigNumber(icoSince).sub(3600 * 13)
            )
                .then(Utils.receiptShouldSucceed);

            await crowdsale.updateEndDate(icoSince)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await crowdsale.isSoftCapAchieved.call(0),
                false,
                "isSoftCapAchieved is not equal"
            );

            await assert.equal(
                new BigNumber(await strategy.getTierIndex.call(0)).valueOf(),
                5,
                "tierIndex is not equal"
            );

            await assert.equal(
                new BigNumber(await crowdsale.contributorsWei.call(accounts[1])).valueOf(),
                1000,
                "contributorsWei is not equal"
            );

            await assert.equal(
                (await crowdsale.getState.call()).valueOf(),
                6,
                "state is not equal"
            );

            await crowdsale.refund({from: accounts[1]})
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(await crowdsale.contributorsWei.call(accounts[1])).valueOf(),
                0,
                "contributorsWei is not equal"
            );
        });

        it("delegatedRefund should succeed", async () => {
            await assert.equal(
                (await crowdsale.getState.call()).valueOf(),
                3,
                "state is not equal"
            );

            await crowdsale.internalContributionTest(
                accounts[1],
                new BigNumber("0.01").mul(precision),
                { from: accounts[7], value: 1000 }
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(await token.balanceOf.call(accounts[1])).valueOf(),
                new BigNumber("15.009").mul(precision).valueOf(),
                "tokenBalance is not equal"
            );

            await assert.equal(
                (await crowdsale.getState.call()).valueOf(),
                3,
                "state is not equal"
            );

            await crowdsale.delegatedRefund(accounts[1])
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await strategy.updateDates(
                0,
                new BigNumber(icoSince).sub(3600 * 22),
                new BigNumber(icoSince).sub(3600 * 21)
            )
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(
                1,
                new BigNumber(icoSince).sub(3600 * 20),
                new BigNumber(icoSince).sub(3600 * 19)
            )
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(
                2,
                new BigNumber(icoSince).sub(3600 * 18),
                new BigNumber(icoSince).sub(3600 * 17)
            )
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(
                3,
                new BigNumber(icoSince).sub(3600 * 16),
                new BigNumber(icoSince).sub(3600 * 15)
            )
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(
                4,
                new BigNumber(icoSince).sub(3600 * 14),
                new BigNumber(icoSince).sub(3600 * 13)
            )
                .then(Utils.receiptShouldSucceed);

            await crowdsale.updateEndDate(icoSince)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await crowdsale.isSoftCapAchieved.call(0),
                false,
                "isSoftCapAchieved is not equal"
            );

            await assert.equal(
                new BigNumber(await strategy.getTierIndex.call(0)).valueOf(),
                5,
                "tierIndex is not equal"
            );

            await assert.equal(
                new BigNumber(await crowdsale.contributorsWei.call(accounts[1])).valueOf(),
                1000,
                "contributorsWei is not equal"
            );

            await assert.equal(
                (await crowdsale.getState.call()).valueOf(),
                6,
                "state is not equal"
            );

            await crowdsale.delegatedRefund(accounts[1])
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(await crowdsale.contributorsWei.call(accounts[1])).valueOf(),
                0,
                "contributorsWei is not equal"
            );
        });
    });
});
