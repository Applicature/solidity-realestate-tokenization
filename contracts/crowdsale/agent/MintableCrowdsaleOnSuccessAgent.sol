pragma solidity ^0.4.23;

import "./CrowdsaleAgent.sol";
import "../crowdsale/Crowdsale.sol";


/// @title MintableCrowdsaleOnSuccessAgent
/// @author Applicature
/// @notice Contract which takes actions on state change and contribution
/// @dev implementation
contract MintableCrowdsaleOnSuccessAgent is CrowdsaleAgent {

    constructor(address _management) 
    	public 
    	CrowdsaleAgent(_management)
	{
		
    }

    function isInitialized() public view returns (bool) {
        return (
            super.isInitialized()
            && management.contractRegistry(CONTRACT_TOKEN) != address(0)
            && management.contractRegistry(CONTRACT_AGENT) != address(0)
        );
    }

}

