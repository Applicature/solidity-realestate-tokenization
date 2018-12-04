pragma solidity ^0.4.23;

import "./ContributionForwarder.sol";


/// @title DistributedDirectContributionForwarder
/// @author Applicature
/// @notice Contract is responsible for distributing collected ethers, that are received from CrowdSale.
/// @dev implementation
contract DistributedDirectContributionForwarder is ContributionForwarder {
    Receiver[] public receivers;
    uint256 public proportionAbsMax;

    struct Receiver {
        address receiver;
        uint256 proportion; // abslolute value in range of 0 - proportionAbsMax
        uint256 forwardedWei;
    }

    constructor(
        uint256 _proportionAbsMax, 
        address[] _receivers, 
        uint256[] _proportions, 
        address _management
    ) 
        public 
        ContributionForwarder(_management)
    {
        proportionAbsMax = _proportionAbsMax;

        require(_receivers.length == _proportions.length, ERROR_ACCESS_DENIED);
        require(_receivers.length > 0, ERROR_ACCESS_DENIED);
        uint256 totalProportion;

        for (uint256 i = 0; i < _receivers.length; i++) {
            uint256 proportion = _proportions[i];
            totalProportion = totalProportion.add(proportion);
            receivers.push(Receiver(_receivers[i], proportion, 0));
        }

        require(totalProportion == proportionAbsMax, ERROR_WRONG_AMOUNT);
    }

    function internalForward() internal {
        uint256 transferred;

        for (uint256 i = 0; i < receivers.length; i++) {
            Receiver storage receiver = receivers[i];

            uint256 value = msg.value
                .mul(receiver.proportion)
                .div(proportionAbsMax);

            if (i == receivers.length - 1) {
                value = msg.value.sub(transferred);
            }

            transferred = transferred.add(value);

            receiver.receiver.transfer(value);

            emit ContributionForwarded(receiver.receiver, value);
        }

        weiForwarded = weiForwarded.add(transferred);
    }
}
