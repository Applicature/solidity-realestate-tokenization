const Management = artifacts.require("ico.contracts/Management.sol");
const PricingStrategy = artifacts.require("ico.contracts/pricing/PricingStrategyImpl.sol");
const BigNumber = require("bignumber.js");
const Utils = require("../utils.js");

// Permission keys
const CAN_UPDATE_PRICE = 4;

// Precision for BigNumber (1e18)
const precision = new BigNumber("1000000000000000000");

// Precision for USD (1e5)
const usdPrecision = new BigNumber("100000");

let icoSince = parseInt(new Date().getTime() / 1000) - 3600;
let icoTill = parseInt(new Date().getTime() / 1000) + 3600;

contract("PricingStrategy", accounts => {
    let management;
    let strategy;

    beforeEach(async () => {
        management = await Management.new();

        strategy = await PricingStrategy.new(
            management.address,
            true,
            true,
            [//_tiers
                // Tier 1
                new BigNumber("1").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("800").mul(precision).valueOf(),//bonusCap;
                new BigNumber("50").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("10").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("100").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
                // Tier 2
                new BigNumber("1").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("2000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("1400").mul(precision).valueOf(),//bonusCap;
                new BigNumber("20").mul(1).valueOf(),//discountPercents;
                new BigNumber("5").mul(1).valueOf(),//bonusPercents;
                new BigNumber("5").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("50").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            ],
            new BigNumber("1000").mul(usdPrecision).valueOf(),//_etherPriceInCurrency
            new BigNumber("5").valueOf(),//_currencyDecimals
            new BigNumber("18").valueOf(),//_tokenDecimals
            new BigNumber("100").valueOf(),//_percentageAbsMax
        );
    });

    describe("check view methods", async () => {

        it("isInitialized", async () => {
            assert.equal(await strategy.isInitialized.call(), true, "isInitialized is not equal");

            let pricing = await PricingStrategy.new(
                management.address,
                true,
                true,
                [],
                new BigNumber("1000").mul(usdPrecision).valueOf(),//_etherPriceInCurrency
                new BigNumber("5").valueOf(),//_currencyDecimals
                new BigNumber("18").valueOf(),//_tokenDecimals
                new BigNumber("100").valueOf(),//_percentageAbsMax
            );

            assert.equal(
                await pricing.isInitialized.call(),
                false,
                "isInitialized is not equal"
            );
        });

        it("getArrayOfTiers", async () => {
            let tiersData = await strategy.getArrayOfTiers.call();
            await assert.equal(
                tiersData[0].valueOf(),
                new BigNumber("1").mul(usdPrecision).valueOf(),
                "tokenInUSD is not equal"
            );

            await assert.equal(
                tiersData[1].valueOf(),
                new BigNumber("1000").mul(precision).valueOf(),
                "maxTokensCollected is not equal"
            );

            await assert.equal(
                tiersData[2].valueOf(),
                new BigNumber("800").mul(precision).valueOf(),
                "bonusCap is not equal"
            );

            await assert.equal(
                tiersData[3].valueOf(),
                new BigNumber("50").mul(1).valueOf(),
                "discountPercents is not equal"
            );

            await assert.equal(
                tiersData[4].valueOf(),
                new BigNumber("10").mul(1).valueOf(),
                "bonusPercents is not equal"
            );

            await assert.equal(
                tiersData[5].valueOf(),
                new BigNumber("10").mul(usdPrecision).valueOf(),
                "minInvestInCurrency is not equal"
            );

            await assert.equal(
                tiersData[6].valueOf(),
                new BigNumber("100").mul(usdPrecision).valueOf(),
                "maxInvestInCurrency is not equal"
            );

            await assert.equal(
                tiersData[7].valueOf(),
                new BigNumber(icoSince).mul(1).valueOf(),
                "startTime is not equal"
            );

            await assert.equal(
                tiersData[8].valueOf(),
                new BigNumber(icoTill).mul(1).valueOf(),
                "endTime is not equal"
            );


            await assert.equal(
                tiersData[9].valueOf(),
                new BigNumber("1").mul(usdPrecision).valueOf(),
                "tokenInUSD is not equal"
            );

            await assert.equal(
                tiersData[10].valueOf(),
                new BigNumber("2000").mul(precision).valueOf(),
                "maxTokensCollected is not equal"
            );

            await assert.equal(
                tiersData[11].valueOf(),
                new BigNumber("1400").mul(precision).valueOf(),
                "bonusCap is not equal"
            );

            await assert.equal(
                tiersData[12].valueOf(),
                new BigNumber("20").mul(1).valueOf(),
                "discountPercents is not equal"
            );

            await assert.equal(
                tiersData[13].valueOf(),
                new BigNumber("5").mul(1).valueOf(),
                "bonusPercents is not equal"
            );

            await assert.equal(
                tiersData[14].valueOf(),
                new BigNumber("5").mul(usdPrecision).valueOf(),
                "minInvestInCurrency is not equal"
            );

            await assert.equal(
                tiersData[15].valueOf(),
                new BigNumber("50").mul(usdPrecision).valueOf(),
                "maxInvestInCurrency is not equal"
            );

            await assert.equal(
                tiersData[16].valueOf(),
                new BigNumber(icoSince).mul(1).valueOf(),
                "startTime is not equal"
            );

            await assert.equal(
                tiersData[17].valueOf(),
                new BigNumber(icoTill).mul(1).valueOf(),
                "endTime is not equal"
            );

        });

        it("getTiersAmount", async () => {
            let tiersAmount = await strategy.getTiersAmount.call();

            await assert.equal(
                tiersAmount.valueOf(),
                2,
                "tiersAmount is not equal"
            );
        });

        it("getTierIndex", async () => {
            assert.equal(
                await strategy.getTierIndex.call(0),
                0,
                "TierIndex is not equal"
            );

            assert.equal(
                await strategy.getTierIndex.call(new BigNumber("999").mul(precision).valueOf()),
                0,
                "TierIndex is not equal"
            );

            assert.equal(
                await strategy.getTierIndex.call(new BigNumber("1000").mul(precision).valueOf()),
                1,
                "TierIndex is not equal"
            );

            assert.equal(
                await strategy.getTierIndex.call(new BigNumber("2000").mul(precision).valueOf()),
                2,
                "TierIndex is not equal"
            );

            await strategy.updateDates(0, icoSince - 4000, icoSince - 3000)
                .then(Utils.receiptShouldSucceed);
            await strategy.updateDates(1, icoSince - 2000, icoSince - 1000)
                .then(Utils.receiptShouldSucceed);

            assert.equal(
                await strategy.getTierIndex.call(new BigNumber("0").mul(precision).valueOf()),
                2,
                "TierIndex is not equal"
            );

            await strategy.updateDates(0, icoTill + 1000, icoTill + 2000)
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(1, icoTill + 3000, icoTill + 4000)
                .then(Utils.receiptShouldSucceed);

            assert.equal(
                await strategy.getTierIndex.call(new BigNumber("0").mul(precision).valueOf()),
                2,
                "TierIndex is not equal"
            );
        });

        it("getActualTierIndex", async () => {
            assert.equal(
                await strategy.getActualTierIndex.call(0),
                0,
                "TierIndex is not equal"
            );

            assert.equal(
                await strategy.getActualTierIndex.call(new BigNumber("999").mul(precision).valueOf()),
                0,
                "TierIndex is not equal"
            );

            assert.equal(
                await strategy.getActualTierIndex.call(new BigNumber("1000").mul(precision).valueOf()),
                1,
                "TierIndex is not equal"
            );

            assert.equal(
                await strategy.getActualTierIndex.call(new BigNumber("2000").mul(precision).valueOf()),
                1,
                "TierIndex is not equal"
            );


            await strategy.updateDates(0, icoSince - 4000, icoSince - 3000)
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(1, icoSince - 2000, icoSince - 1000)
                .then(Utils.receiptShouldSucceed);

            assert.equal(
                await strategy.getActualTierIndex.call(new BigNumber("1").mul(precision).valueOf()),
                1,
                "TierIndex is not equal"
            );


            await strategy.updateDates(0, icoTill + 1000, icoTill + 2000)
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(1, icoTill + 3000, icoTill + 4000)
                .then(Utils.receiptShouldSucceed);

            assert.equal(
                await strategy.getActualTierIndex.call(1),
                0,
                "TierIndex is not equal"
            );
        });

        it("getTierActualDates", async () => {
            assert.equal(
                await strategy.getActualTierIndex.call(0),
                0,
                "tierIndex is not equal"
            );

            let dates = await strategy.getTierActualDates.call(0);

            await assert.equal(
                new BigNumber(dates[0]).valueOf(),
                icoSince,
                "start is not equal"
            );

            await assert.equal(
                new BigNumber(dates[1]).valueOf(),
                icoTill,
                "end is not equal"
            );

            await strategy.updateDates(0, icoSince - 4000, icoSince - 3000)
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(1, icoSince - 2000, icoSince - 1000)
                .then(Utils.receiptShouldSucceed);

            assert.equal(
                await strategy.getActualTierIndex.call(new BigNumber("1").mul(precision).valueOf()),
                1,
                "tierIndex is not equal"
            );

            dates = await strategy.getTierActualDates.call(new BigNumber("1").mul(precision).valueOf());

            await assert.equal(
                new BigNumber(dates[0]).valueOf(),
                icoSince - 2000,
                "start is not equal"
            );

            await assert.equal(
                new BigNumber(dates[1]).valueOf(),
                icoSince - 1000,
                "end is not equal"
            );
        });

        it("getCurrencyAmount", async () => {
            assert.equal(
                await strategy.getCurrencyAmount.call(new BigNumber("1").mul(precision).valueOf()),
                new BigNumber("1000").mul(usdPrecision).valueOf(),
                "getCurrencyAmount is not equal"
            );

            await management.setPermission(accounts[0], CAN_UPDATE_PRICE, true)
                .then(Utils.receiptShouldSucceed);

            const userPermissionToUpdatePrice = await management
                .permissions
                .call(accounts[0], CAN_UPDATE_PRICE);

            assert.equal(
                userPermissionToUpdatePrice,
                true,
                "user has not got permission to update price"
            );


            await strategy.setEtherInCurrency("2000.12345")
                .then(Utils.receiptShouldSucceed);

            assert.equal(
                await strategy.getCurrencyAmount.call(new BigNumber("1").mul(precision).valueOf()),
                new BigNumber("2000.12345").mul(usdPrecision).valueOf(),
                "getCurrencyAmount is not equal"
            );
        });

        it("getTokenInCurrency", async () => {
            assert.equal(
                await strategy.getTokenInCurrency.call(0),
                new BigNumber("0.5").mul(usdPrecision).valueOf(),
                "getTokenInCurrency is not equal"
            );

            assert.equal(
                await strategy.getTokenInCurrency.call(1),
                new BigNumber("0.8").mul(usdPrecision).valueOf(),
                "getTokenInCurrency is not equal"
            );


            await strategy.updateTier(
                0,
                new BigNumber("10").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("800").mul(precision).valueOf(),//bonusCap;
                new BigNumber("10").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("10").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("100").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            );

            await strategy.updateTier(
                1,
                new BigNumber("100").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("800").mul(precision).valueOf(),//bonusCap;
                new BigNumber("0").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("10").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("100").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            );

            assert.equal(
                await strategy.getTokenInCurrency.call(0),
                new BigNumber("9").mul(usdPrecision).valueOf(),
                "getTokenInCurrency is not equal"
            );

            assert.equal(
                await strategy.getTokenInCurrency.call(1),
                new BigNumber("100").mul(usdPrecision).valueOf(),
                "getTokenInCurrency is not equal"
            );

            assert.equal(
                await strategy.getTokenInCurrency.call(2),
                new BigNumber("0").mul(usdPrecision).valueOf(),
                "getTokenInCurrency is not equal"
            );


        });

        it("getDiscount", async () => {
            assert.equal(
                await strategy.getDiscount.call(0),
                new BigNumber("50").mul(1).valueOf(),
                "getDiscount is not equal"
            );

            assert.equal(
                await strategy.getDiscount.call(1),
                new BigNumber("20").mul(1).valueOf(),
                "getDiscount is not equal"
            );


            await strategy.updateTier(
                0,
                new BigNumber("10").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("800").mul(precision).valueOf(),//bonusCap;
                new BigNumber("10").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("10").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("100").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            );

            await strategy.updateTier(
                1,
                new BigNumber("100").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("800").mul(precision).valueOf(),//bonusCap;
                new BigNumber("0").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("10").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("100").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            );

            assert.equal(
                await strategy.getDiscount.call(0),
                new BigNumber("10").mul(1).valueOf(),
                "getDiscount is not equal"
            );

            assert.equal(
                await strategy.getDiscount.call(1),
                new BigNumber("0").mul(1).valueOf(),
                "getDiscount is not equal"
            );

            assert.equal(
                await strategy.getDiscount.call(2),
                new BigNumber("0").mul(usdPrecision).valueOf(),
                "getDiscount is not equal"
            );


        });

        it("getMinEtherInvest", async () => {
            assert.equal(
                await strategy.getMinEtherInvest.call(0),
                new BigNumber("0.01").mul(precision).valueOf(),
                "getMinEtherInvest is not equal"
            );

            assert.equal(
                await strategy.getMinEtherInvest.call(1),
                new BigNumber("0.005").mul(precision).valueOf(),
                "getMinEtherInvest is not equal"
            );


            await strategy.updateTier(
                0,
                new BigNumber("10").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("800").mul(precision).valueOf(),//bonusCap;
                new BigNumber("10").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("100").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("100").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            );

            await strategy.updateTier(
                1,
                new BigNumber("100").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("800").mul(precision).valueOf(),//bonusCap;
                new BigNumber("0").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("100").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("1000").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            );

            assert.equal(
                await strategy.getMinEtherInvest.call(0),
                new BigNumber("0.1").mul(precision).valueOf(),
                "getMinEtherInvest is not equal"
            );

            assert.equal(
                await strategy.getMinEtherInvest.call(1),
                new BigNumber("0.1").mul(precision).valueOf(),
                "getMinEtherInvest is not equal"
            );

            assert.equal(
                await strategy.getMinEtherInvest.call(2),
                new BigNumber("0").mul(precision).valueOf(),
                "getMinEtherInvest is not equal"
            );


        });

        it("getMaxEtherInvest", async () => {
            assert.equal(
                await strategy.getMaxEtherInvest.call(0),
                new BigNumber("0.1").mul(precision).valueOf(),
                "getMaxEtherInvest is not equal"
            );

            assert.equal(
                await strategy.getMaxEtherInvest.call(1),
                new BigNumber("0.05").mul(precision).valueOf(),
                "getMaxEtherInvest is not equal"
            );


            await strategy.updateTier(
                0,
                new BigNumber("10").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("800").mul(precision).valueOf(),//bonusCap;
                new BigNumber("10").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("100").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("1000").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            );

            await strategy.updateTier(
                1,
                new BigNumber("100").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("800").mul(precision).valueOf(),//bonusCap;
                new BigNumber("0").mul(1).valueOf(),//discountPercents;
                new BigNumber("10").mul(1).valueOf(),//bonusPercents;
                new BigNumber("1000").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("1500").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            );

            assert.equal(
                await strategy.getMaxEtherInvest.call(0),
                new BigNumber("1").mul(precision).valueOf(),
                "getMaxEtherInvest is not equal"
            );

            assert.equal(
                await strategy.getMaxEtherInvest.call(1),
                new BigNumber("1.5").mul(precision).valueOf(),
                "getMaxEtherInvest is not equal"
            );

            assert.equal(
                await strategy.getMaxEtherInvest.call(2),
                new BigNumber("0").mul(precision).valueOf(),
                "getMaxEtherInvest is not equal"
            );


        });

        it("getRemainingTokens", async () => {
            assert.equal(
                await strategy.getRemainingTokens.call(0),
                new BigNumber("2000").mul(precision).valueOf(),
                "getRemainingTokens is not equal"
            );

            assert.equal(
                await strategy.getRemainingTokens.call(new BigNumber("1000").mul(precision).valueOf()),
                new BigNumber("1000").mul(precision).valueOf(),
                "getRemainingTokens is not equal"
            );
        });

        it("getTierUnsoldTokens", async () => {
            let tokens = await strategy.getTierUnsoldTokens.call(new BigNumber("500").mul(precision).valueOf());

            assert.equal(
                tokens.valueOf(),
                new BigNumber("500").mul(precision).valueOf(),
                "tierUnsoldTokens is not equal"
            );

            let tiersAmount = await strategy.getTiersAmount.call();

            await assert.equal(
                tiersAmount.valueOf(),
                2,
                "tiersAmount is not equal"
            );

            tokens = await strategy.getTierUnsoldTokens.call(new BigNumber("100").mul(precision).valueOf());

            assert.equal(
                tokens.valueOf(),
                new BigNumber("900").mul(precision).valueOf(),
                "tierUnsoldTokens is not equal"
            );
        });

        it("calculateBonusAmount", async () => {
            assert.equal(
                await strategy.calculateBonusAmount.call(
                    0,
                    new BigNumber("100").mul(precision).valueOf(),
                    new BigNumber("0").mul(precision).valueOf()
                ),
                new BigNumber("10").mul(precision).valueOf(),
                "bonus is not equal"
            );

            assert.equal(
                await strategy.calculateBonusAmount.call(
                    1,
                    new BigNumber("100").mul(precision).valueOf(),
                    new BigNumber("0").mul(precision).valueOf()
                ),
                new BigNumber("5").mul(precision).valueOf(),
                "bonus is not equal"
            );

            assert.equal(
                await strategy.calculateBonusAmount.call(
                    0,
                    new BigNumber("100").mul(precision).valueOf(),
                    new BigNumber("750").mul(precision).valueOf()
                ),
                new BigNumber("5").mul(precision).valueOf(),
                "bonus is not equal"
            );
        });

        it("getTokensWithoutRestrictions", async () => {
            let tokens = await strategy.getTokensWithoutRestrictions.call(
                new BigNumber("0").mul(precision).valueOf(),
                new BigNumber("0").mul(precision).valueOf()
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

            //1 token = 1 $
            //1 eth = 1000 $
            //10000eth = 10000000$
            //50% discount
            //10000000 / 0.5 = 20000000
            //10% bonus
            //20 * 110/100 = 22000000
            tokens = await strategy.getTokensWithoutRestrictions.call(
                new BigNumber("10000").mul(precision).valueOf(),
                new BigNumber("0").mul(precision).valueOf()
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("22000000").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("20000000").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("2000000").mul(precision).valueOf(),
                "bonus is not equal"
            );
        });
    });

    describe("check getTokens", async () => {
        it("zero weis should return zero tokens", async () => {
            let tokens = await strategy.getTokens.call(
                accounts[0],
                5000000,
                0,
                0,
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
        });

        it("should return zero tokens if no active tiers", async () => {
            assert.equal(
                await strategy.getTierIndex.call(0),
                0,
                "getTierIndex is not equal"
            );

            await strategy.updateDates(0, icoSince - 4000, icoSince - 3000)
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(1, icoSince - 2000, icoSince - 1000)
                .then(Utils.receiptShouldSucceed);

            assert.equal(
                await strategy.getTierIndex.call(0),
                2,
                "getTierIndex is not equal"
            );

            let tokens = await strategy.getTokens.call(
                accounts[0],
                5000000,
                0,
                new BigNumber("1").mul(precision).valueOf(),
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
        });

        it("check min/max investment", async () => {
            let tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("1000").mul(precision).valueOf(),
                0,
                new BigNumber("0.009").mul(precision).valueOf(),
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

            //1 token = 1 $
            //1 eth = 1000 $
            //0.01eth = 10$
            //50% discount
            //10 / 0.5 = 20
            //10% bonus
            //20 * 110/100 = 22
            tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("1000").mul(precision).valueOf(),
                0,
                new BigNumber("0.01").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("22").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("20").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("2").mul(precision).valueOf(),
                "bonus is not equal"
            );


            //1 token = 1 $
            //1 eth = 1000 $
            //0.1eth = 100$
            //50% discount
            //100 / 0.5 = 200
            //10% bonus
            //200 * 110/100 = 220
            tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("1000").mul(precision).valueOf(),
                0,
                new BigNumber("0.1").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("220").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("200").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("20").mul(precision).valueOf(),
                "bonus is not equal"
            );


            //1 token = 1 $
            //1 eth = 1000 $
            //0.101eth = 101$
            //50% discount
            //101 / 0.5 = 202
            //10% bonus
            //202 * 110/100 = 222.2
            tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("1000").mul(precision).valueOf(),
                0,
                new BigNumber("0.101").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("0").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("0").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("0").mul(precision).valueOf(),
                "bonus is not equal"
            );


        });

        it("tokens less than available", async () => {
            //1 token = 1 $
            //1 eth = 1000 $
            //0.01eth = 10$
            //50% discount
            //10 / 0.5 = 20
            //10% bonus
            //20 * 110/100 = 22
            let tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("22").mul(precision).valueOf(),
                0,
                new BigNumber("0.01").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("22").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("20").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("2").mul(precision).valueOf(),
                "bonus is not equal"
            );


            tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("22").mul(precision).valueOf(),
                0,
                new BigNumber("0.02").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("0").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("0").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("0").mul(precision).valueOf(),
                "bonus is not equal"
            );

        });

        it("success for each tier", async () => {
            //1 token = 1 $
            //1 eth = 1000 $
            //0.01eth = 10$
            //50% discount
            //10 / 0.5 = 20
            //10% bonus
            //20 * 110/100 = 22
            //------------
            //5 / 0.8 = 6.25
            //6.25 * 105/100 = 6.5625
            let tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("10000").mul(precision).valueOf(),
                new BigNumber("990").mul(precision).valueOf(),
                new BigNumber("0.01").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("11").add("6.5625").mul(
                    precision).valueOf(), "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("10").add("6.25").mul(
                    precision).valueOf(), "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("1").add("0.3125").mul(
                    precision).valueOf(), "bonus is not equal"
            );


            await strategy.updateDates(1, icoTill, icoTill + 1);

            tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("10000").mul(precision).valueOf(),
                new BigNumber("990").mul(precision).valueOf(),
                new BigNumber("0.01").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("0").add("0").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("0").add("0").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("0").add("0").mul(precision).valueOf(),
                "bonus is not equal"
            );

        });
    });

    describe("check getWeis", async () => {
        it("zero tokens should return zero weis", async () => {
            let tokens = await strategy.getWeis.call(0, 0, 0);
            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                0,
                "totalWeiAmount is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                0,
                "tokensBonus is not equal"
            );
        });


        it("tokens > availableTokens should return zero weis", async () => {
            await strategy.updateTier(
                1,
                new BigNumber("1").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("2000").mul(precision).valueOf(),//maxTokensCollected;
                new BigNumber("1400").mul(precision).valueOf(),//bonusCap;
                new BigNumber("20").mul(1).valueOf(),//discountPercents;
                new BigNumber("5").mul(1).valueOf(),//bonusPercents;
                new BigNumber("0").mul(usdPrecision).valueOf(),//minInvestInCurrency;
                new BigNumber("0").mul(usdPrecision).valueOf(),//maxInvestInCurrency;
                new BigNumber(icoSince).mul(1).valueOf(),//startTime;
                new BigNumber(icoTill).mul(1).valueOf(),//endTime;
            );

            let weis = await strategy.getWeis.call(
                0,
                new BigNumber("1900").mul(precision).valueOf(),
                new BigNumber("200").mul(precision).valueOf()
            );

            await assert.equal(
                new BigNumber(weis[0]).valueOf(),
                0,
                "totalWeiAmount is not equal"
            );

            await assert.equal(
                new BigNumber(weis[1]).valueOf(),
                0,
                "tokensBonus is not equal"
            );
        });

        it("should return zero weis if no active tiers", async () => {
            assert.equal(
                await strategy.getTierIndex.call(0),
                0,
                "getTierIndex is not equal"
            );

            await strategy.updateDates(0, icoSince - 4000, icoSince - 3000)
                .then(Utils.receiptShouldSucceed);

            await strategy.updateDates(1, icoSince - 2000, icoSince - 1000)
                .then(Utils.receiptShouldSucceed);

            assert.equal(
                await strategy.getTierIndex.call(0),
                2,
                "getTierIndex is not equal"
            );

            let tokens = await strategy.getWeis.call(
                0,
                0,
                new BigNumber("20").mul(precision).valueOf()
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                0, "totalWeiAmount is not equal");
            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                0,
                "tokensBonus is not equal");
        });


        it("check min/max investment", async () => {
            let tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("1000").mul(precision).valueOf(),
                0,
                new BigNumber("0.009").mul(precision).valueOf(),
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

            //1 token = 1 $
            //1 eth = 1000 $
            //0.01eth = 10$
            //50% discount
            //10 / 0.5 = 20
            //10% bonus
            //20 * 110/100 = 22
            tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("1000").mul(precision).valueOf(),
                0,
                new BigNumber("0.01").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("22").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("20").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("2").mul(precision).valueOf(),
                "bonus is not equal"
            );

            //1 token = 1 $
            //1 eth = 1000 $
            //0.1eth = 100$
            //50% discount
            //100 / 0.5 = 200
            //10% bonus
            //200 * 110/100 = 220
            tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("1000").mul(precision).valueOf(),
                0,
                new BigNumber("0.1").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("220").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("200").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("20").mul(precision).valueOf(),
                "bonus is not equal"
            );

            //1 token = 1 $
            //1 eth = 1000 $
            //0.101eth = 101$
            //50% discount
            //101 / 0.5 = 202
            //10% bonus
            //202 * 110/100 = 222.2
            tokens = await strategy.getTokens.call(
                accounts[0],
                new BigNumber("1000").mul(precision).valueOf(),
                0,
                new BigNumber("0.101").mul(precision).valueOf(),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("0").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("0").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                new BigNumber("0").mul(precision).valueOf(),
                "bonus is not equal"
            );

        });

        it("success for each tier", async () => {
            //1 token = 1 $
            //1 eth = 1000 $
            //0.01eth = 10$
            //50% discount
            //10 / 0.5 = 20
            //10% bonus
            //20 * 110/100 = 22
            //------------
            //5 / 0.8 = 6.25
            //6.25 * 105/100 = 6.5625
            let tokens = await strategy.getWeis.call(
                0,
                new BigNumber("990").mul(precision).valueOf(),
                new BigNumber("16.25").mul(precision).valueOf()
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("0.01").mul(precision).valueOf(),
                "totalWeiAmount is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("1").add("0.3125").mul(
                    precision).valueOf(), "bonus is not equal"
            );


            await strategy.updateDates(1, icoTill, icoTill + 1);

            tokens = await strategy.getWeis.call(
                0,
                new BigNumber("990").mul(precision).valueOf(),
                new BigNumber("11").add("6.5625").mul(precision).valueOf()
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("0").add("0").mul(precision).valueOf(),
                "totalWeiAmount is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("0").add("0").mul(precision).valueOf(),
                "bonus is not equal"
            );

        });
    });
});
