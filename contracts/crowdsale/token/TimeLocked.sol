pragma solidity ^0.4.23;

import "../Managed.sol";


/// @title TimeLocked
/// @author Applicature
/// @notice helper mixed to other contracts to lock contract on a timestamp
/// @dev Base class
contract TimeLocked is Managed {
    uint256 public time;

    modifier isTimeLocked(address _holder, bool _timeLocked) {
        bool locked = (block.timestamp < time);
        require(
            hasPermission(_holder, EXCLUDED_ADDRESSES) ||
            locked == _timeLocked, ERROR_ACCESS_DENIED
        );
        _;
    }

    constructor(uint256 _time, address _management)
        public
        Managed(_management)
    {
        time = _time;
    }
}
