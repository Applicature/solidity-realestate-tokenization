pragma solidity ^0.4.24;

import "./RealEstateFabric.sol";
import "./GeneralConstants.sol";
import "./crowdsale/crowdsale/CrowdsaleImpl.sol";


contract RealEstateCrowdsale is GeneralConstants {

    address public crowdsaleAddress;

    constructor (
        uint256 _realEstateId,
        address _realEstateFabric,
        uint256[2] _investmentPeriod
    )
        public
    {

        address managementContract = RealEstateFabric(
            _realEstateFabric
        ).managementAddresses(_realEstateId);

        deployCrowdsale(
            _investmentPeriod,
            managementContract
        );
    }

    function deployCrowdsale(
        uint256[2] _investmentPeriod,
        address _managementContract
    )
        public
    {
        crowdsaleAddress = new CrowdsaleImpl(
            _investmentPeriod[0],
            _investmentPeriod[1],
            true,
            true,
            false,
            _managementContract
        );
    }
}
