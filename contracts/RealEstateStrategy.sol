pragma solidity ^0.4.24;

import "./RealEstateFabric.sol";
import "./RealEstateFT.sol";
import "./GeneralConstants.sol";
import "./crowdsale/pricing/PricingStrategyImpl.sol";


contract RealEstateStrategy is Constants {

    PricingStrategyImpl public strategy;

    constructor (
        uint256 _realEstateId,
        address _realEstateFabric,
        bool _tiersChangingAllowed,
        bool _updateChangeRateAllowed,
        uint256[] _tiers,
        uint256 _etherPriceInCurrency,
        uint256 _currencyDecimals,
        uint256 _percentageAbsMax
    )
        public
    {
        RealEstateFabric realEstateFabric = RealEstateFabric(_realEstateFabric);
        address managementContract = realEstateFabric
            .managementAddresses(_realEstateId);

        RealEstateFT fungibleTokenInstance = RealEstateFT(
            realEstateFabric.ftAddresses(_realEstateId)
        );
        strategy = new PricingStrategyImpl(
            managementContract,
            _tiersChangingAllowed,
            _updateChangeRateAllowed,
            _tiers,
            _etherPriceInCurrency,
            _currencyDecimals,
            fungibleTokenInstance.decimals(),
            _percentageAbsMax
        );
    }
}
