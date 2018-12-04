pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "../Managed.sol";


/// @title Pausable
/// @author Applicature
/// @notice helper mixed to other contracts to pause/un pause contract
/// @dev Base class
contract Pausable is Claimable, Managed {

    bool public paused;

    modifier isPaused(bool _paused) {
        require(paused == _paused, ERROR_ACCESS_DENIED);
        _;
    }

    constructor(address _management, bool _paused)
        public
        Managed(_management)
    {
        paused = _paused;
    }

    function pause() public requirePermission(CAN_PAUSE_TOKENS) {
        paused = true;
    }

    function unpause() public requirePermission(CAN_PAUSE_TOKENS) {
        paused = false;
    }
}

