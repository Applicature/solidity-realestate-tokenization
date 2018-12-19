pragma solidity ^0.4.24;

import "./RealEstateFabric.sol";
import "./GeneralConstants.sol";
import "./ico.contracts/crowdsale/CrowdsaleImpl.sol";

contract RealEstateCrowdsale is GeneralConstants {

    constructor (
        uint256 _realEstateId,
        address _realEstateFabric,
        uint256[2] _investmentPeriod
    )
        public
    {

        address managementContract = RealEstateFabric(_realEstateFabric).managementAddresses(_realEstateId);

        deployCrowdsale(
            _realEstateId,
            _investmentPeriod,
            managementContract
        );
    }

    function deployCrowdsale(
        uint256 _realEstateId,
        uint256[2] _investmentPeriod,
        address _managementContract
    )
        public
    {
        new CrowdsaleImpl(
            _investmentPeriod[0],
            _investmentPeriod[1],
            true,
            true,
            false,
            _managementContract
        );
    }
}
