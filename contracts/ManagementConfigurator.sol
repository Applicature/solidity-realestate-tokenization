pragma solidity ^0.4.24;

import "./RealEstateFabric.sol";
import "./GeneralConstants.sol";
import "./crowdsale/Management.sol";
import "./crowdsale/Constants.sol";


contract ManagementConfigurator is Constants, GeneralConstants {

    function configureManagement(
        uint256 _realEstateId,
        address _realEstateFabric,
        address _signerAddress,
        address[6] _icoContracts
    )
        public
    {
        address managementAddress = RealEstateFabric(_realEstateFabric)
            .managementAddresses(_realEstateId);
        require(
            managementAddress != address(0),
            ERROR_VALUE_EQUALS_ZERO
        );
        Management managementInstance = Management(managementAddress);
        managementInstance.registerContract(
            CONTRACT_CROWDSALE,
            _icoContracts[0]
        );
        managementInstance.registerContract(
            CONTRACT_PRICING,
            _icoContracts[1]
        );
        managementInstance.registerContract(
            CONTRACT_AGENT,
            _icoContracts[2]
        );
        managementInstance.registerContract(
            CONTRACT_ALLOCATOR,
            _icoContracts[3]
        );
        managementInstance.registerContract(
            CONTRACT_FORWARDER,
            _icoContracts[4]
        );
        managementInstance.registerContract(
            CONTRACT_DIVIDENDS,
            _icoContracts[5]
        );
        managementInstance.setPermission(
            _icoContracts[0],
            CAN_UPDATE_STATE,
            true
        );
        managementInstance.setPermission(
            _icoContracts[0],
            CAN_INTERACT_WITH_ALLOCATOR,
            true
        );
        managementInstance.setPermission(
            _icoContracts[3], CAN_MINT_TOKENS, true
        );
        managementInstance.setPermission(
            _signerAddress,
            EXTERNAL_CONTRIBUTORS,
            true
        );
    }
}
