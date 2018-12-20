const Management = artifacts.require("ico.contracts/Management.sol");
const MintableToken = artifacts.require("ico.contracts/token/erc20/MintableToken.sol");
const PricingStrategy = artifacts.require("ico.contracts/pricing/PricingStrategyImpl.sol");
const Crowdsale = artifacts.require("ico.contracts/crowdsale/CrowdsaleImpl.sol");
const MintableTokenAllocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const DirectContributionForwarder = artifacts.require("ico.contracts/contribution/DirectContributionForwarder.sol");
const MintableCrowdsaleOnSuccessAgent = artifacts.require("ico.contracts/tests/MintableCrowdsaleOnSuccessAgentTest.sol");
const Stats = artifacts.require("ico.contracts/Stats.sol");
const BigNumber = require("bignumber.js");
const Utils = require("../utils.js");

// Contract keys
const CONTRACT_TOKEN = 1;
const CONTRACT_PRICING = 2;
const CONTRACT_CROWDSALE = 3;
const CONTRACT_ALLOCATOR = 4;
const CONTRACT_AGENT = 5;
const CONTRACT_FORWARDER = 6;
const CONTRACT_STATS = 8;

// Permission keys
const CAN_MINT_TOKENS = 0;
const CAN_UPDATE_STATE = 2;
const CAN_INTERACT_WITH_ALLOCATOR = 5;

// Precision for BigNumber (1e18)
const precision = new BigNumber(1000000000000000000).valueOf();

// Precision for USD (1e5)
const usdPrecision = new BigNumber(100000).valueOf();

let icoSince = parseInt(new Date().getTime() / 1000) - 3600;
let icoTill = parseInt(new Date().getTime() / 1000) + 3600;

contract("Stats", function (accounts) {

    const owner = accounts[0];
    const totalSupply = new BigNumber(1000000).mul(precision).valueOf();

    let token;
    let agent;
    let allocator;
    let contributionForwarder;
    let strategy;
    let crowdsale;
    let stats;
    let management;

    beforeEach(async () => {
        management = await Management.new();

        token = await MintableToken.new(totalSupply, 0, true, management.address);

        agent = await MintableCrowdsaleOnSuccessAgent.new(management.address);

        allocator = await MintableTokenAllocator.new(totalSupply, management.address);

        contributionForwarder = await DirectContributionForwarder.new(owner, management.address);

        strategy = await PricingStrategy.new(
            management.address,
            true,
            true,
            [//_tiers
                new BigNumber("1").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("3000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("2000").mul(precision).valueOf(),//bonusCap;
                new BigNumber("50").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("10").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("0").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;

                new BigNumber("2").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("4000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("1400").mul(precision).valueOf(),//bonusCap;
                new BigNumber("20").mul(1).valueOf(),//discountPercents;
                new BigNumber("5").mul(1).valueOf(),//bonusPercents;
                new BigNumber("5").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("50").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoTill + 1000).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill + 2000).mul(1).valueOf(),//endTime;
            ],
            new BigNumber("1000").mul(usdPrecision).valueOf(),//_etherPriceInCurrency
            new BigNumber("5").valueOf(),//_currencyDecimals
            new BigNumber("18").valueOf(),//_tokenDecimals
            new BigNumber("100").valueOf(),//_percentageAbsMax
        );

        crowdsale = await Crowdsale.new(
            icoSince,
            icoTill,
            true,
            true,
            true,
            management.address
        );

        stats = await Stats.new(
            management.address,
            token.address,
            crowdsale.address,
            strategy.address
        );

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

        await management.registerContract(CONTRACT_STATS, stats.address)
            .then(Utils.receiptShouldSucceed);

        const contractStatsAddress = await management.contractRegistry.call(CONTRACT_STATS);

        assert.equal(
            contractStatsAddress,
            stats.address,
            "stats address is not equal"
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

    it("should check getTokens", async () => {
        let tokensData = await stats.getTokens.call(new BigNumber("1").mul(precision));

        assert.equal(
            new BigNumber(tokensData[0]).valueOf(),
            new BigNumber("2200").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            new BigNumber(tokensData[1]).valueOf(),
            new BigNumber("2000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            new BigNumber(tokensData[2]).valueOf(),
            new BigNumber("200").mul(precision).valueOf(),
            "bonus is not equal"
        );
    });

    it("should check getWeis", async () => {
        let tokensData = await stats.getWeis.call(new BigNumber("2000").mul(precision).valueOf());

        assert.equal(
            new BigNumber(tokensData[0]).valueOf(),
            new BigNumber("1").mul(precision).valueOf(),
            "totalWeiAmount is not equal"
        );

        assert.equal(
            new BigNumber(tokensData[1]).valueOf(),
            new BigNumber("200").mul(precision).valueOf(),
            "tokensBonus is not equal"
        );
    });

    it("should check getTiersData", async function () {
        let tiersData = await stats.getTiersData.call();

        assert.equal(
            tiersData[0].valueOf(),
            new BigNumber("1000000000000000000").valueOf(),
            "tokenInCurrency 0 tier is not equal"
        );

        assert.equal(
            tiersData[1].valueOf(),
            new BigNumber("0").mul(precision).valueOf(),
            "tokenInWei is not equal"
        );

        assert.equal(
            tiersData[2].valueOf(),
            new BigNumber("3000").mul(precision),
            "maxTokensCollected is not equal"
        );

        assert.equal(
            tiersData[3].valueOf(),
            new BigNumber("0").valueOf(),
            "soldTierTokens is not equal"
        );

        assert.equal(
            tiersData[4].valueOf(),
            new BigNumber("50").valueOf(),
            "discountPercents is not equal"
        );

        assert.equal(
            tiersData[5].valueOf(),
            new BigNumber("10").valueOf(),
            "bonusPercents is not equal"
        );

        assert.equal(
            tiersData[6].valueOf(),
            new BigNumber("10").mul(usdPrecision).valueOf(),
            "minInvestInCurrency is not equal"
        );

        assert.equal(
            tiersData[7].valueOf(),
            new BigNumber("0").valueOf(),
            "minInvestInWei is not equal"
        );

        assert.equal(
            tiersData[8].valueOf(),
            new BigNumber("0").mul(usdPrecision).valueOf(),
            "maxInvestInCurrency is not equal"
        );

        assert.equal(
            tiersData[9].valueOf(),
            new BigNumber("0").valueOf(),
            "maxInvestInWei is not equal"
        );

        assert.equal(
            tiersData[10].valueOf(),
            new BigNumber(icoSince).valueOf(),
            "startTime is not equal"
        );

        assert.equal(
            tiersData[11].valueOf(),
            new BigNumber(icoTill).valueOf(),
            "endTime is not equal"
        );

        assert.equal(
            tiersData[12].valueOf(),
            new BigNumber("1").valueOf(),
            "tierType is not equal"
        );

        assert.equal(
            tiersData[13].valueOf(),
            new BigNumber("500000000000000000").valueOf(),
            "tokenInCurrency 1 tier is not equal"
        );
    });

    it("should check getStats", async function () {
        await crowdsale.updateState();

        let statsData = await stats.getStats.call(
            [
                new BigNumber("1").mul(precision),
                new BigNumber("2").mul(precision),
                new BigNumber("3").mul(precision),
                new BigNumber("4").mul(precision),
                new BigNumber("5").mul(precision),
                new BigNumber("6").mul(precision),
                new BigNumber("1").mul(precision)
            ],
            0
        );

        // stats
        assert.equal(
            statsData[0][0].valueOf(),
            new BigNumber("1000000").mul(precision).valueOf(),
            "maxTokenSupply is not equal"
        );

        assert.equal(
            statsData[0][1].valueOf(),
            new BigNumber("0").mul(precision).valueOf(),
            "totalTokenSupply is not equal"
        );

        assert.equal(
            statsData[0][2].valueOf(),
            new BigNumber("0").mul(precision).valueOf(),
            "maxSaleSupply is not equal"
        );

        assert.equal(
            statsData[0][3].valueOf(),
            new BigNumber("0").mul(precision).valueOf(),
            "tokensSold is not equal"
        );

        assert.equal(
            statsData[0][4].valueOf(),
            new BigNumber("3").mul(1).valueOf(),
            "currentState is not equal"
        );

        assert.equal(
            statsData[0][5].valueOf(),
            new BigNumber("0").valueOf(),
            "actualTier is not equal"
        );

        assert.equal(
            statsData[0][6].valueOf(),
            new BigNumber("3000").mul(precision).valueOf(),
            "tierUnsoldTokens is not equal"
        );

        assert.equal(
            statsData[0][7].valueOf(),
            new BigNumber("10").mul(precision).div(1000).valueOf(),
            "minEtherInvest is not equal"
        );

        // tiersData
        // tier 0
        assert.equal(
            statsData[1][0].valueOf(),
            new BigNumber("1000000000000000000").valueOf(),
            "tokenInCurrency 0 tier is not equal"
        );

        assert.equal(
            statsData[1][1].valueOf(),
            new BigNumber("0").mul(precision).valueOf(),
            "tokenInWei is not equal"
        );

        assert.equal(
            statsData[1][2].valueOf(),
            new BigNumber("3000").mul(precision),
            "maxTokensCollected is not equal"
        );

        assert.equal(
            statsData[1][3].valueOf(),
            new BigNumber("0").valueOf(),
            "soldTierTokens is not equal"
        );

        assert.equal(
            statsData[1][4].valueOf(),
            new BigNumber("50").valueOf(),
            "discountPercents is not equal"
        );

        assert.equal(
            statsData[1][5].valueOf(),
            new BigNumber("10").valueOf(),
            "bonusPercents is not equal"
        );

        assert.equal(
            statsData[1][6].valueOf(),
            new BigNumber("10").mul(usdPrecision).valueOf(),
            "minInvestInCurrency is not equal"
        );

        assert.equal(
            statsData[1][7].valueOf(),
            new BigNumber("0").valueOf(),
            "minInvestInWei is not equal"
        );

        assert.equal(
            statsData[1][8].valueOf(),
            new BigNumber("0").mul(usdPrecision).valueOf(),
            "maxInvestInCurrency is not equal"
        );

        assert.equal(
            statsData[1][9].valueOf(),
            new BigNumber("0").valueOf(),
            "maxInvestInWei is not equal"
        );

        assert.equal(
            statsData[1][10].valueOf(),
            new BigNumber(icoSince).valueOf(),
            "startTime is not equal"
        );

        assert.equal(
            statsData[1][11].valueOf(),
            new BigNumber(icoTill).valueOf(),
            "endTime is not equal"
        );

        assert.equal(
            statsData[1][12].valueOf(),
            new BigNumber("1").valueOf(),
            "tierType is not equal"
        );

        // tier 1
        assert.equal(
            statsData[1][13].valueOf(),
            new BigNumber("500000000000000000").valueOf(),
            "tokenInCurrency 1 tier is not equal"
        );

        assert.equal(
            statsData[1][14].valueOf(),
            new BigNumber("0").mul(precision).valueOf(),
            "tokenInWei is not equal"
        );

        assert.equal(
            statsData[1][15].valueOf(),
            new BigNumber("4000").mul(precision),
            "maxTokensCollected is not equal"
        );

        assert.equal(
            statsData[1][16].valueOf(),
            new BigNumber("0").valueOf(),
            "soldTierTokens is not equal"
        );

        assert.equal(
            statsData[1][17].valueOf(),
            new BigNumber("20").valueOf(),
            "discountPercents is not equal"
        );

        assert.equal(
            statsData[1][18].valueOf(),
            new BigNumber("5").valueOf(),
            "bonusPercents is not equal"
        );

        assert.equal(
            statsData[1][19].valueOf(),
            new BigNumber("5").mul(usdPrecision).valueOf(),
            "minInvestInCurrency is not equal"
        );

        assert.equal(
            statsData[1][20].valueOf(),
            new BigNumber("0").valueOf(),
            "minInvestInWei is not equal"
        );

        assert.equal(
            statsData[1][21].valueOf(),
            new BigNumber("50").mul(usdPrecision).valueOf(),
            "maxInvestInCurrency is not equal"
        );

        assert.equal(
            statsData[1][22].valueOf(),
            new BigNumber("0").valueOf(),
            "maxInvestInWei is not equal"
        );

        assert.equal(
            statsData[1][23].valueOf(),
            new BigNumber(icoTill + 1000).valueOf(),
            "startTime is not equal"
        );

        assert.equal(
            statsData[1][24].valueOf(),
            new BigNumber(icoTill + 2000).valueOf(),
            "endTime is not equal"
        );

        assert.equal(
            statsData[1][25].valueOf(),
            new BigNumber("1").valueOf(),
            "tierType is not equal"
        );

        // currencyContr
        // 1 eth
        assert.equal(
            statsData[2][0].valueOf(),
            new BigNumber("2200").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            statsData[2][1].valueOf(),
            new BigNumber("2000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            statsData[2][2].valueOf(),
            new BigNumber("200").mul(precision).valueOf(),
            "bonus is not equal"
        );

        // 2 eth
        assert.equal(
            statsData[2][3].valueOf(),
            new BigNumber("4400").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            statsData[2][4].valueOf(),
            new BigNumber("4000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            statsData[2][5].valueOf(),
            new BigNumber("400").mul(precision).valueOf(),
            "bonus is not equal"
        );
    });

    it("should check getCurrencyContrData", async () => {
        await crowdsale.updateState();

        let currencyContrData = await stats.getCurrencyContrData.call(
            [
                new BigNumber("1").mul(precision),
                new BigNumber("2").mul(precision),
                new BigNumber("3").mul(precision),
                new BigNumber("4").mul(precision),
                new BigNumber("5").mul(precision),
                new BigNumber("6").mul(precision),
                new BigNumber("7").mul(precision)
            ],
            0
        );

        // 1 ETH
        assert.equal(
            currencyContrData[0].valueOf(),
            new BigNumber("2200").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            currencyContrData[1].valueOf(),
            new BigNumber("2000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            currencyContrData[2].valueOf(),
            new BigNumber("200").mul(precision).valueOf(),
            "bonus is not equal"
        );
        // 2 ETH
        assert.equal(
            currencyContrData[3].valueOf(),
            new BigNumber("4400").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            currencyContrData[4].valueOf(),
            new BigNumber("4000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            currencyContrData[5].valueOf(),
            new BigNumber("400").mul(precision).valueOf(),
            "bonus is not equal"
        );
        // 3 ETH
        assert.equal(
            currencyContrData[6].valueOf(),
            new BigNumber("6600").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            currencyContrData[7].valueOf(),
            new BigNumber("6000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            currencyContrData[8].valueOf(),
            new BigNumber("600").mul(precision).valueOf(),
            "bonus is not equal"
        );
        // 4 ETH
        assert.equal(
            currencyContrData[9].valueOf(),
            new BigNumber("8800").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            currencyContrData[10].valueOf(),
            new BigNumber("8000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            currencyContrData[11].valueOf(),
            new BigNumber("800").mul(precision).valueOf(),
            "bonus is not equal"
        );
        // 5 ETH
        assert.equal(
            currencyContrData[12].valueOf(),
            new BigNumber("11000").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            currencyContrData[13].valueOf(),
            new BigNumber("10000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            currencyContrData[14].valueOf(),
            new BigNumber("1000").mul(precision).valueOf(),
            "bonus is not equal"
        );
        // 6 ETH
        assert.equal(
            currencyContrData[15].valueOf(),
            new BigNumber("13200").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            currencyContrData[16].valueOf(),
            new BigNumber("12000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            currencyContrData[17].valueOf(),
            new BigNumber("1200").mul(precision).valueOf(),
            "bonus is not equal"
        );
        // 7 ETH
        assert.equal(
            currencyContrData[18].valueOf(),
            new BigNumber("15400").mul(precision).valueOf(),
            "tokens is not equal"
        );

        assert.equal(
            currencyContrData[19].valueOf(),
            new BigNumber("14000").mul(precision).valueOf(),
            "tokensExcludingBonus is not equal"
        );

        assert.equal(
            currencyContrData[20].valueOf(),
            new BigNumber("1400").mul(precision).valueOf(),
            "bonus is not equal"
        );

        assert.equal(
            currencyContrData.length,
            21,
            "currencyContrData length is not equal"
        );
    });

    it("should check getStatsData", async () => {
        await crowdsale.updateState();

        let statsData = await stats.getStatsData.call();

        assert.equal(
            statsData[0].valueOf(),
            new BigNumber("1000000").mul(precision).valueOf(),
            "maxTokenSupply is not equal"
        );

        assert.equal(
            statsData[1].valueOf(),
            new BigNumber("0").mul(precision).valueOf(),
            "totalTokenSupply is not equal"
        );

        assert.equal(
            statsData[2].valueOf(),
            new BigNumber("0").mul(precision).valueOf(),
            "maxSaleSupply is not equal"
        );

        assert.equal(
            statsData[3].valueOf(),
            new BigNumber("0").mul(precision).valueOf(),
            "tokensSold is not equal"
        );

        assert.equal(
            statsData[4].valueOf(),
            new BigNumber("3").mul(1).valueOf(),
            "currentState is not equal"
        );

        assert.equal(
            statsData[5].valueOf(),
            new BigNumber("0").valueOf(),
            "actualTier is not equal"
        );

        assert.equal(
            statsData[6].valueOf(),
            new BigNumber("3000").mul(precision).valueOf(),
            "tierUnsoldTokens is not equal"
        );

        assert.equal(
            statsData[7].valueOf(),
            new BigNumber("10").mul(precision).div(1000).valueOf(),
            "minEtherInvest is not equal"
        );
    });
});
