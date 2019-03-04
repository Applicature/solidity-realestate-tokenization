pragma solidity ^0.4.24;

import "./token/erc20/MintableToken.sol";
import "./pricing/PricingStrategyImpl.sol";
import "./crowdsale/CrowdsaleImpl.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Managed.sol";


contract Stats is Managed {
    using SafeMath for uint256;

    uint256 public constant STATS_DATA_LENGTH = 8;
    uint256 public constant CURRENCY_CONTR_DATA_LENGTH = 3;
    uint256 public constant TIER_DATA_LENGTH = 13;

    MintableToken public token;
    CrowdsaleImpl public crowdsale;
    PricingStrategyImpl public pricing;

    constructor(
        address _management,
        MintableToken _token,
        CrowdsaleImpl _crowdsale,
        PricingStrategyImpl _pricing
    )
        public
        Managed(_management)
    {
        require(
            address(_token) != address(0)
            && address(_crowdsale) != address(0)
            && address(_pricing) != address(0),
            ERROR_NO_CONTRACT
        );
        token = _token;
        crowdsale = _crowdsale;
        pricing = _pricing;
    }

    function getTokens(uint256 _weiAmount)
        public
        view
        returns (uint256 tokens, uint256 tokensExcludingBonus, uint256 bonus)
    {
        //todo: zero should be changed to real value of _tokensSold
        return pricing.getTokensWithoutRestrictions(_weiAmount, 0);
    }

    function getWeis(uint256 _tokenAmount)
        public
        view
        returns (uint256 totalWeiAmount, uint256 tokensBonus)
    {
        //todo: zeros should be changed to real values of _bonusProduced and _tokensSold
        return pricing.getWeis(0, 0, _tokenAmount);
    }

    // TODO check if we will use address of crowdsale from constructor or address from function param
    function getStats(uint256[7] _ethPerCurrency, uint256 _tokensSold)
        public
        view
        returns (
            uint256[] memory stats,
            uint256[] memory tiersData,
            uint256[] memory currencyContr //tokensPerEachCurrency
        )
    {
        stats = getStatsData();
        tiersData = getTiersData();
        currencyContr = getCurrencyContrData(_ethPerCurrency, _tokensSold);
    }

    function getTiersData() 
        public 
        view 
        returns (uint256[]) 
    {
        uint256 tiersAmount = pricing.getTiersAmount();
        uint256 tierElements = pricing.TIER_ELEMENTS_AMOUNT();

        uint256[] memory tiers = pricing.getArrayOfTiers();
        uint256[] memory tiersData = new uint256[](
            tiersAmount.mul(TIER_DATA_LENGTH)
        );

        uint256 j = 0;
        for (uint256 i = 0; i < tiers.length; i += tierElements) {
            tiersData[j++] = uint256(1e23).div(tiers[i]);// tokenInUSD;
            tiersData[j++] = 0;// tokenInWei;
            tiersData[j++] = uint256(tiers[i.add(1)]);// maxTokensCollected;
            //todo: zero should be changed to real value of soldTierTokens
            tiersData[j++] = 0;// soldTierTokens;
            tiersData[j++] = uint256(tiers[i.add(3)]);// discountPercents;
            tiersData[j++] = uint256(tiers[i.add(4)]);// bonusPercents;
            tiersData[j++] = uint256(tiers[i.add(5)]);// minInvestInCurrency;
            tiersData[j++] = 0;// minInvestInWei;
            tiersData[j++] = uint256(tiers[i.add(6)]);// maxInvestInCurrency;
            tiersData[j++] = 0;// maxInvestInWei;
            tiersData[j++] = uint256(tiers[i.add(7)]);// startDate;
            tiersData[j++] = uint256(tiers[i.add(8)]);// endDate;
            tiersData[j++] = uint256(1);// tierType;
        }

        return tiersData;
    }

    function getStatsData() 
        public 
        view 
        returns (uint256[]) 
    {
        // TODO change 2, 3, 5 and 6 elements values to real
        uint256[] memory stats = new uint256[](STATS_DATA_LENGTH);
        stats[0] = token.maxSupply();
        stats[1] = token.totalSupply();
        stats[2] = 0;
        // stats[2] = .tokensAvailable();
        stats[3] = crowdsale.tokensSold();
        stats[4] = uint256(crowdsale.currentState());
        stats[5] = pricing.getActualTierIndex(stats[3]);
        stats[6] = pricing.getTierUnsoldTokens(stats[5]);
        stats[7] = pricing.getMinEtherInvest(stats[5]);
        return stats;
    }

    function getCurrencyContrData(
        uint256[7] _ethPerCurrency,
        uint256 _tokensSold
    )
        public
        view
        returns (uint256[])
    {
        uint256[] memory currencyContr = new uint256[](
            _ethPerCurrency.length.mul(CURRENCY_CONTR_DATA_LENGTH)
        );

        uint256 j = 0;
        for (uint256 i = 0; i < _ethPerCurrency.length; i++) {
            (currencyContr[j++], currencyContr[j++], currencyContr[j++]) = 
                pricing.getTokensWithoutRestrictions(
                    _ethPerCurrency[i], _tokensSold
                );
        }
        return currencyContr;
    }
}