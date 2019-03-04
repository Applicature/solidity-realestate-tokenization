const Management = artifacts.require("ico.contracts/Management.sol");
const Token = artifacts.require("ico.contracts/token/erc20/MintableToken.sol");
const TokenAllocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const PricingStrategy = artifacts.require("ico.contracts/pricing/PricingStrategyImpl.sol");
const ContributionForwarder = artifacts.require("ico.contracts/contribution/DirectContributionForwarder.sol");
const HardCappedCrowdsale = artifacts.require("ico.contracts/tests/HardCappedCrowdsaleTest.sol");
const Agent = artifacts.require("ico.contracts/test/MintableCrowdsaleOnSuccessAgentTest.sol");
const Utils = require("../utils");
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
const CAN_INTERACT_WITH_ALLOCATOR = 5;

// Precision for BigNumber (1e18)
const precision = new BigNumber("1000000000000000000");

// Precision for USD (1e5)
const usdPrecision = new BigNumber("100000");

let icoSince = parseInt(new Date().getTime() / 1000) - 3600;
let icoTill = parseInt(new Date().getTime() / 1000) + 3600;

contract("HardCappedCrowdsale", accounts => {
    let token;
    let allocator;
    let contributionForwarder;
    let strategy;
    let crowdsale;
    let management;
    let agent;

    beforeEach(async () => {
        management = await Management.new();

        token = await Token.new(
            new BigNumber("400").mul(precision),
            0,
            true,
            management.address
        );

        allocator = await TokenAllocator.new(new BigNumber("400").mul(precision), management.address);

        contributionForwarder = await ContributionForwarder.new(accounts[5], management.address);

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
                100000000,// uint256 minInvestInCurrency;
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
            ],
            75045000, //_etherPriceInCurrency
            5, //_currencyDecimals
            18, //_tokenDecimals
            100 //_percentageAbsMax
        );

        crowdsale = await HardCappedCrowdsale.new(
            icoSince,
            icoTill,
            true,
            true,
            false,
            new BigNumber("350").mul(precision),
            management.address
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
            "strategy address is not equal"
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

        const allocatorPermissionToMint = await management
            .permissions
            .call(allocator.address, CAN_MINT_TOKENS);

        assert.equal(
            allocatorPermissionToMint,
            true,
            "allocator has not got permission to mint"
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
        it("should return Success as crowdsale continues but hardcap is achieved", async () => {
            await assert.equal(
                new BigNumber(await crowdsale.tokensSold.call()).valueOf(),
                0,
                "tokensSold is not equal"
            );

            let state = await crowdsale.getState.call();
            assert.equal(state.valueOf(), 3, "state is not equal");

            await crowdsale.updateSoldTokens(new BigNumber(350).mul(precision));

            await assert.equal(
                new BigNumber(await crowdsale.tokensSold.call()).valueOf(),
                new BigNumber(350).mul(precision),
                "tokensSold is not equal"
            );

            await assert.equal(
                await crowdsale.isHardCapAchieved.call(0),
                true,
                "isHardCapAchieved is not equal"
            );

            state = await crowdsale.getState.call();
            assert.equal(state.toString(), 4, "state is not equal");
        });

        it("should return InCrowdsale as crowdsale continues and hardcap is not achieved", async () => {
            await assert.equal(
                await crowdsale.isHardCapAchieved.call(0),
                false,
                "isHardCapAchieved is not equal"
            );

            let state = await crowdsale.getState.call();
            assert.equal(state.valueOf(), 3, "state is not equal");
        });

        it("should return BeforeCrowdsale as crowdsale has not been started", async () => {
            let state = await crowdsale.getState.call();
            assert.equal(state.valueOf(), 3, "state is not equal");

            await crowdsale.updateStartDate(new BigNumber(icoTill).sub(10));
            state = await crowdsale.getState.call();
            assert.equal(state.toString(), 2, "state is not equal")
        });
    });

    describe("check internalContribution", () => {

        it("should failed as crowdsale has not been started", async () => {
            await crowdsale.updateStartDate(new BigNumber(icoTill).sub(10))
                .then(Utils.receiptShouldSucceed);

            let state = await crowdsale.getState.call();
            assert.equal(state.toString(), 2, "state is not equal");

            crowdsale.internalContributionTest(accounts[0], new BigNumber("0.01"))
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("should failed as tokens = 0", async () => {
            let state = await crowdsale.getState.call();
            await assert.equal(state.valueOf(), 3, "state is not equal");

            let tokens = await strategy.getTokens.call(
                0,
                400 * precision,
                0,
                new BigNumber("0.25").mul(precision),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                0,
                "tokens is not equal"
            );

            crowdsale.internalContributionTest(accounts[0], new BigNumber("10000").mul(precision))
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("should failed as hardcap is achieved", async () => {
            let state = await crowdsale.getState.call();
            await assert.equal(state.valueOf(), 3, "state is not equal");

            await management.setPermission(accounts[0], CAN_INTERACT_WITH_ALLOCATOR, true)
                .then(Utils.receiptShouldSucceed);

            const permissionToInteractWithAllocator = await management
                .permissions
                .call(accounts[0], CAN_INTERACT_WITH_ALLOCATOR);

            assert.equal(
                permissionToInteractWithAllocator,
                true,
                "user has not got permission to interact with allocator"
            );

            await assert.equal(
                await management.permissions.call(accounts[0], CAN_INTERACT_WITH_ALLOCATOR),
                true,
                "permissions is not equal"
            );

            await crowdsale.updateSoldTokens(new BigNumber(350).mul(precision))
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(await crowdsale.tokensSold.call()).valueOf(),
                new BigNumber(350).mul(precision),
                "tokensSold is not equal"
            );

            await assert.equal(
                await crowdsale.isHardCapAchieved.call(0),
                true,
                "isHardCapAchieved is not equal"
            );

            let tokens = await strategy.getTokens.call(
                0,
                400 * precision,
                0,
                new BigNumber("0.01").mul(precision),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("15.009").mul(precision).valueOf(),
                "tokens is not equal"
            );

            crowdsale.internalContributionTest(accounts[0], new BigNumber("0.01").mul(precision))
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("should succeed", async () => {
            let state = await crowdsale.getState.call();
            await assert.equal(state.valueOf(), 3, "state is not equal");

            let tokens = await strategy.getTokens.call(
                0,
                400 * precision,
                0,
                new BigNumber("0.01").mul(precision),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("15.009").mul(precision).valueOf(),
                "tokens is not equal"
            );

            let receiverBalance = await web3.eth.getBalance(accounts[5]);

            await crowdsale.internalContributionTest(
                accounts[1],
                new BigNumber("0.01").mul(precision),
                { value: 1000 }
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(await token.balanceOf.call(accounts[1])).valueOf(),
                new BigNumber("15.009").mul(precision).valueOf(),
                "balance is not equal"
            );

            let newReceiverBalance = await web3.eth.getBalance(accounts[5]);

            assert.equal(
                receiverBalance.add(1000).valueOf(),
                newReceiverBalance.valueOf(),
                "receiverBalance is not equal"
            );
        });
    });
});
