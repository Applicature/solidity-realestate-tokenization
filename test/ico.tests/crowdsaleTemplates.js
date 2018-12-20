const Management = artifacts.require("ico.contracts/Management.sol");
const Crowdsale = artifacts.require("ico.contracts/tests/CrowdsaleImplTest.sol");
const MintableTokenAllocator = artifacts.require("ico.contracts/allocator/MintableTokenAllocator.sol");
const PricingStrategy = artifacts.require("ico.contracts/pricing/PricingStrategyImpl.sol");
const DistributedDirectContributionForwarder = artifacts
    .require("ico.contracts/contribution/DistributedDirectContributionForwarder.sol");
const MintableCrowdsaleOnSuccessAgent = artifacts.require("ico.contracts/tests/MintableCrowdsaleOnSuccessAgentTest.sol");
const MintableToken = artifacts.require("ico.contracts/token/erc20/MintableToken.sol");
const OpenZeppelinERC20 = artifacts.require("ico.contracts/token/erc20/openzeppelin/OpenZeppelinERC20.sol");
const abi = require("ethereumjs-abi");
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
const WHITELISTED = 9;
const SIGNERS = 10;
const EXTERNAL_CONTRIBUTORS = 11;

// Precision for BigNumber (1e18)
const precision = new BigNumber(1000000000000000000).valueOf();
// Precision for USD (1e5)
const usdPrecision = new BigNumber(100000).valueOf();

let icoSince = parseInt(new Date().getTime() / 1000 - 3600);
let icoTill = parseInt(new Date().getTime() / 1000) + 3600;

contract("Crowdsale", accounts => {

    const owner = accounts[0];
    const signAddress = accounts[0];
    const notOwner = accounts[1];
    const externalContributor = accounts[2];
    const contributor = accounts[4];
    const totalSupply = new BigNumber(1000000).mul(precision).valueOf();

    let erc20;
    let token;
    let allocator;
    let contributionForwarder;
    let strategy;
    let crowdsale;
    let management;

    beforeEach(async () => {
        // create an instance and deploy
        management = await Management.new();

        token = await MintableToken.new(
            totalSupply,
            0,
            true,
            management.address
        );

        allocator = await MintableTokenAllocator.new(totalSupply, management.address);

        contributionForwarder = await DistributedDirectContributionForwarder.new(
            100,
            [owner],
            [100],
            management.address
        );

        strategy = await PricingStrategy.new(
            management.address,
            true,
            true,
            [ //privateSale
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                10000 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                50,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                0,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoSince,// uint256 startTime;
                icoTill,// uint256 endTime;
                ///preSale
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                10000 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                30,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                500000000,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoTill + 3600,// uint256 startTime;
                icoTill + 3600 * 2,// uint256 endTime;
                ///ICO Tier1
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                10000 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                25,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                100000000,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoTill + 3600,// uint256 startTime;
                icoTill + 3600 * 2,// uint256 endTime;
                ///ICO Tier2
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                10000 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                20,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                100000000,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoTill + 3600,// uint256 startTime;
                icoTill + 3600 * 2,// uint256 endTime;
                ///ICO Tier3
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                10000 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                10,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                100000000,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoTill + 3600,// uint256 startTime;
                icoTill + 3600 * 2,// uint256 endTime;
                ///ICO Tier4
                new BigNumber("1").mul(usdPrecision).valueOf(), // uint256 tokenInCurrency;
                10000 * precision,// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                0,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                100000000,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoTill + 3600,// uint256 startTime;
                icoTill + 3600 * 2// uint256 endTime;
            ],
            75045000,
            5,
            18,
            100
        );
        crowdsale = await Crowdsale.new(
            icoSince,
            icoTill,
            true,
            true,
            true,
            management.address
        );
    });

    describe("Crowdsale", () => {
        it("check crowdsale isInitialized", async () => {
            assert.equal(await crowdsale.isInitialized.call(), false, "isInitialized is not equal");

            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            assert.equal(
                await crowdsale.isInitialized.call(),
                false,
                "isInitialized is not equal"
            );

            const mintableCA = await MintableCrowdsaleOnSuccessAgent.new(management.address);

            // Agent adding
            await management.registerContract(CONTRACT_AGENT, mintableCA.address)
                .then(Utils.receiptShouldSucceed);

            const contractMintableCaAdress = await management.contractRegistry.call(CONTRACT_AGENT);

            assert.equal(
                contractMintableCaAdress,
                mintableCA.address,
                "mintableCA address is not equal"
            );

            assert.equal(
                await crowdsale.isInitialized.call(),
                false,
                "isInitialized is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            const contractForwarderAddress = await management.contractRegistry.call(CONTRACT_FORWARDER);

            assert.equal(
                contractForwarderAddress,
                contributionForwarder.address,
                "contributionForwarder address is not equal"
            );

            assert.equal(
                await crowdsale.isInitialized.call(),
                false,
                "isInitialized is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            assert.equal(
                await crowdsale.isInitialized.call(),
                false,
                "isInitialized is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            assert.equal(
                await crowdsale.isInitialized.call(),
                true,
                "isInitialized is not equal"
            );
        });

        it("should allow to set crowdsale agent", async () => {
            const mintableCA = await MintableCrowdsaleOnSuccessAgent.new(management.address);

            assert.equal(
                await mintableCA.isInitialized.call(),
                false,
                "isInitialized is not equal"
            );
            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            const contractForwarderAddress = await management.contractRegistry.call(CONTRACT_FORWARDER);

            assert.equal(
                contractForwarderAddress,
                contributionForwarder.address,
                "contributionForwarder address is not equal"
            );

            // Agent adding
            await management.registerContract(CONTRACT_AGENT, mintableCA.address)
                .then(Utils.receiptShouldSucceed);

            const contractMintableCaAdress = await management.contractRegistry.call(CONTRACT_AGENT);

            assert.equal(
                contractMintableCaAdress,
                mintableCA.address,
                "mintableCA address is not equal"
            );
            // isInitilialized == true, cause all contracts are presented in registry
            assert.equal(
                await mintableCA.isInitialized.call(),
                true,
                "isInitialized is not equal"
            );
        });

        it("should not allow to set crowdsale agent, cause msg.sender != owner", async () => {
            const mintableCA = await MintableCrowdsaleOnSuccessAgent.new(management.address);

            assert.equal(
                await mintableCA.isInitialized.call(),
                false,
                "isInitialized is not equal"
            );

            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            const contractForwarderAddress = await management.contractRegistry.call(CONTRACT_FORWARDER);

            assert.equal(
                contractForwarderAddress,
                contributionForwarder.address,
                "contributionForwarder address is not equal"
            );

            // isInitialized != true, cause CONTRACT_AGENT is absencing in registry
            assert.equal(
                await mintableCA.isInitialized.call(),
                false,
                "isInitialized is not equal"
            );

            await management.registerContract(CONTRACT_AGENT, mintableCA.address, {from: accounts[2]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            assert.equal(
                await mintableCA.isInitialized.call(),
                false,
                "isInitialized is not equal"
            );
        });

        it("should get current state", async () => {
            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            const contractForwarderAddress = await management.contractRegistry.call(CONTRACT_FORWARDER);

            assert.equal(
                contractForwarderAddress,
                contributionForwarder.address,
                "contributionForwarder address is not equal"
            );

            //current crowdsale state is Initializing because allocator is not initialized
            let currentState1 = await allocator.isInitialized();
            assert.equal(currentState1, false, "state doesn't match");

            let currentState2 = await contributionForwarder.isInitialized();
            assert.equal(currentState2, true, "state doesn't match");

            let currentState3 = await strategy.isInitialized();
            assert.equal(currentState3, true, "state doesn't match");

            let currentState = await crowdsale.getState.call();
            assert.equal(new BigNumber(currentState).valueOf(), 1, "state doesn't match");

            // current crowdsale state is Initializing because forwarder is not initialized
            await management.setPermission(allocator.address, CAN_MINT_TOKENS, true);
            currentState1 = await allocator.isInitialized();
            assert.equal(currentState1, true, "state doesn't match");

            let newContributionForwarder = await DistributedDirectContributionForwarder.new(
                100,
                [owner],
                [100],
                0
            );

            await management.registerContract(CONTRACT_FORWARDER, newContributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            const contractNewForwarderAddress = await management.contractRegistry.call(CONTRACT_FORWARDER);

            assert.equal(
                contractNewForwarderAddress,
                newContributionForwarder.address,
                "newContributionForwarder address is not equal"
            );

            currentState2 = await newContributionForwarder.isInitialized();
            assert.equal(currentState2, false, "state doesn't match");

            currentState3 = await strategy.isInitialized();
            assert.equal(currentState3, true, "state doesn't match");

            currentState = await crowdsale.getState.call();
            assert.equal(new BigNumber(currentState).valueOf(), 1, "state doesn't match");

            //current crowdsale state is Initializing because pricing is not initialized
            currentState1 = await allocator.isInitialized();
            assert.equal(currentState1, true, "state doesn't match");

            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            const contractOldForwarderAddress = await management.contractRegistry.call(CONTRACT_FORWARDER);

            assert.equal(
                contractOldForwarderAddress,
                contributionForwarder.address,
                "contributionForwarder address is not equal"
            );

            currentState2 = await contributionForwarder.isInitialized();
            assert.equal(currentState2, true, "state doesn't match");

            let newPricing = await PricingStrategy.new(
                management.address,
                true,
                true,
                [],
                new BigNumber("1000").mul(usdPrecision).valueOf(),//_etherPriceInCurrency
                new BigNumber("5").valueOf(),//_currencyDecimals
                new BigNumber("18").valueOf(),//_tokenDecimals
                new BigNumber("100").valueOf(),//_percentageAbsMax
            );

            await management.registerContract(CONTRACT_PRICING, newPricing.address)
                .then(Utils.receiptShouldSucceed);

            const contractNewPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractNewPricingAddress,
                newPricing.address,
                "newPricing address is not equal"
            );

            currentState3 = await newPricing.isInitialized();
            assert.equal(currentState3, false, "state doesn't match");

            currentState = await crowdsale.getState.call();
            assert.equal(new BigNumber(currentState).valueOf(), 1, "state doesn't match");

            //current crowdsale state is InCrowdsale
            currentState1 = await allocator.isInitialized();
            assert.equal(currentState1, true, "state doesn't match");

            currentState2 = await contributionForwarder.isInitialized();
            assert.equal(currentState2, true, "state doesn't match");

            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractOldPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractOldPricingAddress,
                strategy.address,
                "pricing address is not equal"
            );

            currentState3 = await strategy.isInitialized();
            assert.equal(currentState3, true, "state doesn't match");

            currentState = await crowdsale.getState.call();
            assert.equal(new BigNumber(currentState).valueOf(), 3, "state doesn't match");

            // try to call update state
            await crowdsale.updateState();

            const updatedState = await crowdsale.getState();

            // it shouldn"t be changed because nothing changed
            assert.equal(updatedState, 3, "state doesn't match");

            //current crowdsale state is Finalized
            await crowdsale.setFinalized(true);

            currentState = await crowdsale.getState();
            assert.equal(currentState, 5, "state doesn't match");
        });

        it("should allow to add external contributor crowdsale agent", async () => {
            await management.setPermission(signAddress, EXTERNAL_CONTRIBUTORS, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(signAddress, EXTERNAL_CONTRIBUTORS),
                true,
                "external contributor is not equal"
            );
        });

        it("should not allow to add external contributor crowdsale agent cause msg.sender != owner", async () => {
            await management.setPermission(signAddress, EXTERNAL_CONTRIBUTORS, true, {from: notOwner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await assert.equal(
                await management.permissions.call(signAddress, EXTERNAL_CONTRIBUTORS),
                false,
                "external contributor is not equal"
            );
        });

        it("should allow to remove external contributor crowdsale agent", async () => {
            await management.setPermission(externalContributor, EXTERNAL_CONTRIBUTORS, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(externalContributor, EXTERNAL_CONTRIBUTORS),
                true,
                "external contributor is not equal"
            );

            await management.setPermission(externalContributor, EXTERNAL_CONTRIBUTORS, false)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(signAddress, EXTERNAL_CONTRIBUTORS),
                false,
                "external contributor is not equal"
            );
        });

        it("should not allow to remove external contributor crowdsale agent cause msg.sender != owner", async () => {
            await management.setPermission(externalContributor, EXTERNAL_CONTRIBUTORS, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(externalContributor, EXTERNAL_CONTRIBUTORS),
                true,
                "external contributor is not equal"
            );

            await management.setPermission(externalContributor, EXTERNAL_CONTRIBUTORS, false, {from: notOwner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await assert.equal(
                await management.permissions.call(externalContributor, EXTERNAL_CONTRIBUTORS),
                true,
                "external contributor is not equal"
            );
        });

        it("should allow to make external contribution", async () => {
            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            // Giving external contributor permission EXTERNAL_CONTRIBUTION
            await management.setPermission(externalContributor, EXTERNAL_CONTRIBUTORS, true)
                .then(Utils.receiptShouldSucceed);

            const externalContributorPermission = await management
                .permissions
                .call(externalContributor, EXTERNAL_CONTRIBUTORS);

            assert.equal(
                externalContributorPermission,
                true,
                "external contributor has not got permission to contribute"
            );

            const currentState = await crowdsale.getState.call();
            assert.equal(new BigNumber(currentState).valueOf(), 3, "state doesn't match");

            let previousBalance = await token.balanceOf.call(externalContributor);
            await assert.equal(new BigNumber(previousBalance).valueOf(), 0, "previousBalance is not equal");

            await crowdsale.externalContribution(
                externalContributor,
                new BigNumber(1).mul(precision).valueOf(),
                { from: externalContributor, value: web3.toWei("0.000000000001", "ether") }
            )
                .then(Utils.receiptShouldSucceed);

            let currentBalance = await token.balanceOf.call(externalContributor);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                new BigNumber("1500.9").mul(precision).valueOf(),
                "currentBalance is not equal"
            );
        });

        it("should not allow to make external contribution, cause externalContributor" +
           "has not got permission to make external contribution", async () => {
            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            const currentState = await crowdsale.getState.call();

            assert.equal(
                new BigNumber(currentState).valueOf(),
                3,
                "state doesn't match"
            );

            let previousBalance = await token.balanceOf.call(externalContributor);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            await crowdsale.externalContribution(
                externalContributor,
                new BigNumber(1).mul(precision).valueOf(),
                { from: externalContributor }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentBalance = await token.balanceOf.call(externalContributor);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                0,
                "currentBalance is not equal"
            );
        });

        it("should allow to add signer", async () => {
            await management.setPermission(signAddress, SIGNERS, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(signAddress, SIGNERS),
                true,
                "signer is not equal"
            );
        });

        it("should not allow to add signer cause msg.sender != owner", async () => {
            await management.setPermission(signAddress, SIGNERS, true, {from: notOwner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await assert.equal(
                await management.permissions.call(signAddress, SIGNERS),
                false,
                "signer is not equal"
            );
        });

        it("should allow to remove signer", async () => {
            await management.setPermission(signAddress, SIGNERS, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(signAddress, SIGNERS),
                true,
                "signer is not equal"
            );

            await management.setPermission(signAddress, SIGNERS, false)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(signAddress, SIGNERS),
                false,
                "signer is not equal"
            );
        });

        it("should not allow to remove signer cause msg.sender != owner", async () => {
            await management.setPermission(signAddress, SIGNERS, true)
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                await management.permissions.call(signAddress, SIGNERS),
                true,
                "signer is not equal"
            );

            await management.setPermission(signAddress, SIGNERS, false, {from: notOwner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await assert.equal(
                await management.permissions.call(signAddress, SIGNERS),
                true,
                "signer is not equal"
            );
        });

        it("should allow to call fallback", async () => {
            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            const currentState = await crowdsale.getState.call();

            assert.equal(
                new BigNumber(currentState).valueOf(),
                3,
                "state doesn't match"
            );

            let previousBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            await crowdsale.sendTransaction({
                from: contributor,
                value: web3.toWei("0.1", "ether")
            })
                .then(Utils.receiptShouldSucceed);

            let currentBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                new BigNumber("150.09").mul(precision).valueOf(),
                "currentBalance is not equal"
            );
        });

        it("should not allow to call fallback cause caller is not whitelisted", async () => {
            crowdsale = await Crowdsale.new(
                icoSince,
                icoTill,
                true,
                true,
                false,
                management.address
            );

            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            const currentState = await crowdsale.getState.call();

            assert.equal(
                new BigNumber(currentState).valueOf(),
                3,
                "state doesn't match"
            );

            let previousBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            await crowdsale.sendTransaction({
                from: contributor,
                value: web3.toWei("0.1", "ether")
            })
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                new BigNumber(previousBalance).valueOf(),
                "currentBalance is not equal"
            );

            await management.setPermission(contributor, WHITELISTED, true);

            await crowdsale.sendTransaction({
                from: contributor,
                value: web3.toWei("0.1", "ether")
            })
                .then(Utils.receiptShouldSucceed);

            currentBalance = await token.balanceOf.call(contributor);
            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                new BigNumber("150.09").mul(precision).valueOf(),
                "currentBalance is not equal"
            );
        });

        it("should not allow to call fallback cause allowWhitelisted and allowAnonymous are false", async () => {
            crowdsale = await Crowdsale.new(
                icoSince,
                icoTill,
                false,
                true,
                false,
                management.address
            );

            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            const currentState = await crowdsale.getState.call();

            assert.equal(
                new BigNumber(currentState).valueOf(),
                3,
                "state doesn't match"
            );

            let previousBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            await crowdsale.sendTransaction({
                from: contributor,
                value: web3.toWei("0.1", "ether")
            })
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                new BigNumber(previousBalance).valueOf(),
                "currentBalance is not equal"
            );
        });

        it("should allow to make contribution", async () => {
            const signer = accounts[4];

            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving signer permission SIGNERS
            await management.setPermission(signer, SIGNERS, true)
                .then(Utils.receiptShouldSucceed);

            const signerPermission = await management.permissions.call(signer, SIGNERS);

            assert.equal(
                signerPermission,
                true,
                "signer has not got permission to sign"
            );

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            const currentState = await crowdsale.getState.call();

            assert.equal(
                new BigNumber(currentState).valueOf(),
                3,
                "state doesn't match"
            );

            let previousBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            const hash = abi.soliditySHA3(["address", "address"], [crowdsale.address, contributor]);
            const sig = web3.eth.sign(signer, hash.toString("hex")).slice(2);
            const r = `0x${sig.slice(0, 64)}`;
            const s = `0x${sig.slice(64, 128)}`;
            const v = web3.toDecimal(sig.slice(128, 130)) + 27;
            const transactionData = abi.simpleEncode("contribute(uint8,bytes32,bytes32)", v, r, s);

            await crowdsale.sendTransaction({
                value: web3.toWei("0.1", "ether"),
                from: contributor,
                data: transactionData.toString("hex")
            })
                .then(Utils.receiptShouldSucceed);

            let currentBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                new BigNumber("150.09").mul(precision).valueOf(),
                "currentBalance is not equal"
            );
        });

        it("should not allow to make contribution because signed by not a signer", async () => {
            const signer = accounts[4];

            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving signer permission SIGNERS
            await management.setPermission(signer, SIGNERS, true)
                .then(Utils.receiptShouldSucceed);

            const signerPermission = await management.permissions.call(signer, SIGNERS);

            assert.equal(
                signerPermission,
                true,
                "signer has not got permission to sign"
            );

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            // not a signer any more
            await management.setPermission(signer, SIGNERS, false)
                .then(Utils.receiptShouldSucceed);

            const signerDisallowedPermission = await management.permissions.call(signer, SIGNERS);

            assert.equal(
                signerDisallowedPermission,
                false,
                "signer has permission to sign"
            );

            const currentState = await crowdsale.getState.call();

            assert.equal(
                new BigNumber(currentState).valueOf(),
                3,
                "state doesn't match"
            );

            let previousBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            const hash = abi.soliditySHA3(["address", "address"], [crowdsale.address, contributor]);
            const sig = web3.eth.sign(signer, hash.toString("hex")).slice(2);
            const r = `0x${sig.slice(0, 64)}`;
            const s = `0x${sig.slice(64, 128)}`;
            const v = web3.toDecimal(sig.slice(128, 130)) + 27;
            const transactionData = abi.simpleEncode("contribute(uint8,bytes32,bytes32)", v, r, s);

            await crowdsale.sendTransaction({
                value: web3.toWei("0.000000000001", "ether"),
                from: contributor,
                data: transactionData.toString("hex")
            })
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentBalance = await token.balanceOf.call(contributor);
            await assert.equal(new BigNumber(currentBalance).valueOf(), 0, "currentBalance is not equal");
        });

        it("should not allow to make contribution because of broken hash", async () => {
            const signer = accounts[4];

            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving signer permission SIGNERS
            await management.setPermission(signer, SIGNERS, true)
                .then(Utils.receiptShouldSucceed);

            const signerPermission = await management
                .permissions
                .call(signer, SIGNERS);

            assert.equal(
                signerPermission,
                true,
                "signer has not got permission to sign"
            );

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            const currentState = await crowdsale.getState.call();

            assert.equal(
                new BigNumber(currentState).valueOf(),
                3,
                "state doesn't match"
            );

            let previousBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(previousBalance).valueOf(),
                0,
                "previousBalance is not equal"
            );

            const hash = abi.soliditySHA3(["address", "uint256"], [crowdsale.address, 1000]);
            const sig = web3.eth.sign(signer, hash.toString("hex")).slice(2);
            const r = `0x${sig.slice(0, 64)}`;
            const s = `0x${sig.slice(64, 128)}`;
            const v = web3.toDecimal(sig.slice(128, 130)) + 27;
            const transactionData = abi.simpleEncode("contribute(uint8,bytes32,bytes32)", v, r, s);

            await crowdsale.sendTransaction({
                value: web3.toWei("0.000000000001", "ether"),
                from: contributor,
                data: transactionData.toString("hex")
            })
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            let currentBalance = await token.balanceOf.call(contributor);

            await assert.equal(
                new BigNumber(currentBalance).valueOf(),
                0,
                "currentBalance is not equal"
            );
        });

        it("should failed internalContribution as crowdsale has not been started", async () => {
            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            await crowdsale.updateStartDate(new BigNumber(icoTill).sub(10));

            let state = await crowdsale.getState.call();

            assert.equal(
                state.toString(),
                2,
                "state is not equal"
            );

            await crowdsale.internalContributionTest(
                accounts[0],
                new BigNumber("0.01").mul(precision).valueOf(),
                { value: new BigNumber("1").mul(precision).valueOf() }
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("should failed as tokens > tokensAvailable", async () => {
            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            let state = await crowdsale.getState.call();
            await assert.equal(state.valueOf(), 3, "state is not equal");

            let tokens = await strategy.getTokens.call(
                0,
                500 * precision,
                0,
                new BigNumber("1000").mul(precision),
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

            await crowdsale.internalContributionTest(
                accounts[1],
                new BigNumber("10000").mul(precision).valueOf(),
                { value: new BigNumber("1").mul(precision).valueOf()}
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it("should succeed with internalContribution", async () => {
            // Token adding
            await management.registerContract(CONTRACT_TOKEN, token.address)
                .then(Utils.receiptShouldSucceed);

            const contractTokenAddress = await management.contractRegistry.call(CONTRACT_TOKEN);

            assert.equal(
                contractTokenAddress,
                token.address,
                "token address is not equal"
            );

            // PricingStrategy adding
            await management.registerContract(CONTRACT_PRICING, strategy.address)
                .then(Utils.receiptShouldSucceed);

            const contractPricingAddress = await management.contractRegistry.call(CONTRACT_PRICING);

            assert.equal(
                contractPricingAddress,
                strategy.address,
                "pricing strategy address is not equal"
            );

            // Crowdsale adding
            await management.registerContract(CONTRACT_CROWDSALE, crowdsale.address)
                .then(Utils.receiptShouldSucceed);

            const contractCrowdaleAddress = await management.contractRegistry.call(CONTRACT_CROWDSALE);

            assert.equal(
                contractCrowdaleAddress,
                crowdsale.address,
                "crowdsale address is not equal"
            );

            // Allocator adding
            await management.registerContract(CONTRACT_ALLOCATOR, allocator.address)
                .then(Utils.receiptShouldSucceed);

            const contractAllocatorAddress = await management.contractRegistry.call(CONTRACT_ALLOCATOR);

            assert.equal(
                contractAllocatorAddress,
                allocator.address,
                "allocator address is not equal"
            );

            // ContributionForwarder adding
            await management.registerContract(CONTRACT_FORWARDER, contributionForwarder.address)
                .then(Utils.receiptShouldSucceed);

            // Giving allocator permission CAN_MINT_TOKENS
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

            // Giving Crowdsale permission CAN_UPDATE_STATE
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

            // Giving Crowdsale permission CAN_INTERACT_WITH_ALLOCATOR
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

            let state = await crowdsale.getState.call();
            await assert.equal(state.valueOf(), 3, "state is not equal");

            let tokens = await strategy.getTokens.call(
                0,
                500 * precision,
                0,
                new BigNumber("0.01").mul(precision),
                0
            );

            await assert.equal(
                new BigNumber(tokens[0]).valueOf(),
                new BigNumber("15.009").mul(precision).valueOf(),
                "tokens is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[1]).valueOf(),
                new BigNumber("15.009").mul(precision).valueOf(),
                "tokensExcludingBonus is not equal"
            );

            await assert.equal(
                new BigNumber(tokens[2]).valueOf(),
                0,
                "bonus is not equal"
            );

            let prev = await Utils.getEtherBalance(owner);

            await assert.equal(
                new BigNumber(await token.balanceOf.call(accounts[1])).valueOf(),
                0,
                "balance is not equal"
            );

            await crowdsale.internalContributionTest(
                accounts[1],
                new BigNumber("0.01").mul(precision).valueOf(),
                { from: accounts[3], value: new BigNumber("1").mul(precision).valueOf() }
            )
                .then(Utils.receiptShouldSucceed);

            await assert.equal(
                new BigNumber(await token.balanceOf.call(accounts[1])).valueOf(),
                new BigNumber("15.009").mul(precision).valueOf(),
                "balance is not equal"
            );

            let current = await Utils.getEtherBalance(owner);

            await assert.equal(
                prev.add(new BigNumber("1").mul(precision)).valueOf(),
                current.valueOf(),
                "balance is not equal"
            );
        });
    });

    describe("OpenZeppelinERC20", () => {
        it("should transfer all tokens to creator", async () => {
            erc20 = await OpenZeppelinERC20.new(
                totalSupply,
                "Test",
                18,
                "TTT",
                true
            );

            await assert.equal(
                new BigNumber(await erc20.balanceOf.call(accounts[1])).valueOf(),
                0,
                "balanceOf is not equal"
            );

            await assert.equal(
                new BigNumber(await erc20.balanceOf.call(accounts[0])).valueOf(),
                new BigNumber(totalSupply).valueOf(),
                "balanceOf is not equal"
            );

            await assert.equal(
                new BigNumber(await erc20.balanceOf.call(erc20.address)).valueOf(),
                0,
                "balanceOf is not equal"
            );
        });

        it("should transfer all tokens to contract", async () => {
            erc20 = await OpenZeppelinERC20.new(
                totalSupply,
                "Test",
                18,
                "TTT",
                false
            );

            await assert.equal(
                new BigNumber(await erc20.balanceOf.call(accounts[1])).valueOf(),
                0,
                "balanceOf is not equal"
            );

            await assert.equal(
                new BigNumber(await erc20.balanceOf.call(accounts[0])).valueOf(),
                0,
                "balanceOf is not equal"
            );

            await assert.equal(
                new BigNumber(await erc20.balanceOf.call(erc20.address)).valueOf(),
                new BigNumber(totalSupply).valueOf(),
                "balanceOf is not equal"
            );
        });
    });
});
