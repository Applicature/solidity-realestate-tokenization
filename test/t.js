const RealEstateAgent = artifacts.require('RealEstateAgent');
const RealEstateCrowdsale = artifacts.require('RealEstateCrowdsale');
const RealEstateCrowdsaleDependecies = artifacts.require('RealEstateCrowdsaleDependecies');
const RealEstateStrategy = artifacts.require('RealEstateStrategy');
const RealEstateFabric = artifacts.require('RealEstateFabric');
const RealEstateFT = artifacts.require('RealEstateFT');
const Management = artifacts.require('ico.contracts/Management');
const ManagementConfigurator = artifacts.require('ManagementConfigurator');
const MintableTokenAllocator = artifacts.require('ico.contracts/allocator/MintableTokenAllocator');
const DirectContributionForwarder = artifacts.require('ico.contracts/contribution/DirectContributionForwarder.sol');
const PricingStrategyImpl = artifacts.require('ico.contracts/pricing/PricingStrategyImpl.sol');
const CrowdsaleImpl = artifacts.require('ico.contracts/crowdsale/CrowdsaleImpl.sol');
const Dividends = artifacts.require('ico.contracts/dividends/Dividends.sol');
const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const Utils = require('./utils');

let precision = new BigNumber("1000000000000000000");
let usdPrecision = new BigNumber("100000");

contract('RealEstate', accounts => {

    let fabric
    beforeEach(async () => {
        fabric = await RealEstateFabric.new(
            'RealEstate 1',
            'RE1',
        );
    })

    it('test flow', async () => {
        let realEstateFT = await RealEstateFT.new(
             '_name',
             '_symbol',
             18,
            new BigNumber("1000").mul(precision).valueOf(),
            fabric.address,
             0,
            accounts[1],
            accounts[2]
        );
        let managementConfig = await ManagementConfigurator.new();
        // string _realEstateUri,
        //     address _owner,
        //     uint256 _sqmSupply,
        //     address _managementConfigurator
        let tokenRE = await fabric.createRealEstate(
            "realEstateUri",
            accounts[1],
            new BigNumber("1000").mul(precision).valueOf(),
            managementConfig.address
        )
            .then(Utils.receiptShouldSucceed)

        let icoSince = parseInt(new Date().getTime() / 1000 - 3600);
        let icoTill = parseInt(new Date().getTime() / 1000) + 3600;

        let ftToken = await fabric.ftAddresses.call(0);
        let ftTokenInstance = await RealEstateFT.at(ftToken);

        console.log('name', await ftTokenInstance.name.call());
        console.log('symbol', await ftTokenInstance.symbol.call());
        console.log('aaa', ftTokenInstance.address);
        console.log('totalSupply', await ftTokenInstance.totalSupply.call());
        console.log('maxSupply', await ftTokenInstance.maxSupply.call());

        let crowdsale = await RealEstateCrowdsale.new(
            0, //_tokenId
            fabric.address,
            [icoSince, icoTill],
        );
        let crowdsaleAddress =  await crowdsale.crowdsaleAddress.call();
        crowdsale = await CrowdsaleImpl.at(crowdsaleAddress)
        let dependecies = await RealEstateCrowdsaleDependecies.new(
            0,
            fabric.address,
            accounts[0]
        );


        let crowdsalePricing = await RealEstateStrategy.new(
            0, //_tokenId
            fabric.address,
            false,
            true,
            [
                new BigNumber("1").mul(usdPrecision).valueOf(),//tokenInCurrency;
                new BigNumber("1000").mul(precision).valueOf(),// uint256 maxTokensCollected;
                0,// uint256 bonusCap;
                0,// uint256 discountPercents;
                0,// uint256 bonusPercents;
                0,// uint256 minInvestInCurrency;
                0,// uint256 maxInvestInCurrency;
                icoSince,// uint256 startTime;
                icoTill,// uint256 endTime;
            ],
            new BigNumber("1000").mul(usdPrecision).valueOf(),//_etherPriceInCurrency
            new BigNumber("5").valueOf(),//_currencyDecimals
            new BigNumber("100").valueOf(),//_percentageAbsMax
        );
        let strategy =  await crowdsalePricing.strategy.call();
        crowdsalePricing = await PricingStrategyImpl.at(strategy)
        let dependenciesList = await dependecies.getDependecies.call();
        await managementConfig.configureManagement(
            0,
            fabric.address,
            accounts[1],
            [
                crowdsale.address,
                crowdsalePricing.address,
                dependenciesList[0],
                dependenciesList[1],
                dependenciesList[2],
                dependenciesList[3]
            ]
        )
        console.log('state',await crowdsale.getState.call())
        assert.equal(
            new BigNumber(
                await crowdsalePricing.getCurrencyAmount.call(
                    new BigNumber("1").mul(precision).valueOf()
                )
            ).valueOf(),
            new BigNumber("1000").mul(usdPrecision).valueOf(),
            "getCurrencyAmount is not equal"
        );
        assert.equal(
            new BigNumber(
                await crowdsalePricing.getTokenInCurrency.call(
                    new BigNumber(0).valueOf()
                )
            ).valueOf(),
            new BigNumber("1").mul(usdPrecision).valueOf(),
            "getTokenInCurrency is not equal"
        );

        console.log('state22', await crowdsalePricing.getTokens.call(
            accounts[0],
            new BigNumber("1000").mul(precision).valueOf(),
            0,
            new BigNumber("0.01").mul(precision).valueOf(),
            0
        ));
       await crowdsale.externalContribution(
            accounts[0],
           new BigNumber("0.01").mul(precision).valueOf(),
           {from: accounts[1]}
    )
           .then(Utils.receiptShouldSucceed)
        //1 token = 1 $
        //1 eth = 1000 $
        //0.01eth = 10$
       // 0.000 00001 eth =0.00001$ == 1 cent

        let tokens = await crowdsalePricing.getTokens.call(
            accounts[0],
            new BigNumber("1000").mul(precision).valueOf(),
            0,
            new BigNumber("0.00000001").mul(precision).valueOf(),
            0
        )
        assert.equal(
            new BigNumber(tokens[0]).valueOf(),
            new BigNumber("1").mul(1e13).valueOf(),
            "balanceOf is not equal"
        );

        assert.equal(
            new BigNumber(await ftTokenInstance.balanceOf.call(accounts[0])).valueOf(),
            new BigNumber("1").mul(1e19).valueOf(),
            "balanceOf is not equal"
        );
    });
})
