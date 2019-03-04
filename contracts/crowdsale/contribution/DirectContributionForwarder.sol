pragma solidity ^0.4.23;

import "./ContributionForwarder.sol";


/// @title DirectContributionForwarder
/// @author Applicature
/// @notice Contract is responsible for distributing collected ethers, that are received from CrowdSale.
/// @dev implementation
contract DirectContributionForwarder is ContributionForwarder {

    address public receiver;

    constructor(
        address _receiver, 
        address _management
    )
        public
        ContributionForwarder(_management)
    {
        receiver = _receiver;
    }

    function internalForward() internal {
        receiver.transfer(msg.value);
        weiForwarded = weiForwarded.add(msg.value);
        emit ContributionForwarded(receiver, msg.value);
    }
}

