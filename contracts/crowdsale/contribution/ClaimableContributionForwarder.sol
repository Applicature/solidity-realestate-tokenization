pragma solidity ^0.4.18;

import "./ContributionForwarder.sol";


/// @title ClaimableContributionForwarder
/// @author Applicature
/// @notice Contract is responsible for distributing collected ethers, that are received from CrowdSale.
/// @dev implementation
contract ClaimableContributionForwarder is ContributionForwarder {
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

    /// @notice transfer wei to receiver
    function transfer() public {
        weiForwarded = weiForwarded.add(address(this).balance);
        receiver.transfer(address(this).balance);
        emit ContributionForwarded(receiver, address(this).balance);
    }

    function internalForward() internal {}
}
