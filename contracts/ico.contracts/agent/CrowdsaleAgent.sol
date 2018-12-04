pragma solidity ^0.4.23;

import "./Agent.sol";
import "../Managed.sol";
import "../crowdsale/Crowdsale.sol";


/// @title CrowdsaleAgent
/// @author Applicature
/// @notice Contract which takes actions on state change and contribution
/// @dev Base class
contract CrowdsaleAgent is Agent, Managed {

    constructor(address _management)
        public
        Managed(_management)
    {

    }

    function isInitialized() 
        public 
        view 
        returns (bool) 
    {
        return (
            address(management) != address(0) &&
            management.contractRegistry(CONTRACT_CROWDSALE) != address(0)
        );
    }

    function onContribution(
        address _contributor,
        uint256 _weiAmount,
        uint256 _tokens,
        uint256 _bonus
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_CROWDSALE);

    function onStateChange(
        Crowdsale.State _state
    )
        public
        requirePermission(CAN_UPDATE_STATE)
        requireContractExistsInRegistry(CONTRACT_CROWDSALE);

    function onRefund(
        address _contributor,
        uint256 _tokens
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_CROWDSALE)
        returns (uint256 burned);
}

