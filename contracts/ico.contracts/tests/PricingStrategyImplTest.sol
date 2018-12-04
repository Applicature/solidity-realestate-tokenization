pragma solidity ^0.4.23;

import "../pricing/PricingStrategyImpl.sol";


contract PricingStrategyImplTest is PricingStrategyImpl {

    constructor(
        address _management,
        uint256[] _tiers,
        uint256 _etherPriceInCurrency,
        uint256 _currencyDecimals,
        uint256 _tokenDecimals,
        uint256 _percentageAbsMax
    )
        public
        PricingStrategyImpl(
            _management,
            true,
            true,
            _tiers,
            _etherPriceInCurrency,
            _currencyDecimals,
            _tokenDecimals,
            _percentageAbsMax
        )
    {
        
    }

    function updateMaxTokensCollected(
        uint256 _tierId, 
        uint256 _maxTokensCollected
    )
        public
    {
        Tier storage tier = tiers[_tierId];
        tier.maxTokensCollected = _maxTokensCollected;
    }
}
