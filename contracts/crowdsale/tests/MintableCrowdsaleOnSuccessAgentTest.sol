pragma solidity ^0.4.23;

import "../agent/MintableCrowdsaleOnSuccessAgent.sol";


contract MintableCrowdsaleOnSuccessAgentTest is 
    MintableCrowdsaleOnSuccessAgent 
{

    constructor(address _management) 
        public 
        MintableCrowdsaleOnSuccessAgent(_management)
    {
        
    }

    function onRefund(
        address _contributor,
        uint256 _tokens
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_CROWDSALE)
        returns (uint256)
    {
        _contributor = _contributor;
        _tokens = _tokens;
    }

    function onContribution(
        address,
        uint256,
        uint256,
        uint256
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_CROWDSALE)
    {

    }

    function onStateChange(Crowdsale.State)
        public
        requirePermission(CAN_UPDATE_STATE)
        requireContractExistsInRegistry(CONTRACT_CROWDSALE)
    {
        
    }
}
