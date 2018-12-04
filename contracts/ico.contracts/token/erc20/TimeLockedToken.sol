pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../TimeLocked.sol";


/// @title TimeLockedToken
/// @author Applicature
/// @notice helper mixed to other contracts to lock contract on a timestamp
/// @dev Base class
contract TimeLockedToken is TimeLocked, StandardToken {

    constructor(uint256 _time, address _management)
        public
        TimeLocked(_time, _management)
    {

    }

    function transfer(address _to, uint256 _tokens)
        public
        isTimeLocked(msg.sender, false) returns (bool)
    {
        return super.transfer(_to, _tokens);
    }

    function transferFrom(address _holder, address _to, uint256 _tokens)
        public
        isTimeLocked(_holder, false)
        returns (bool)
    {
        return super.transferFrom(_holder, _to, _tokens);
    }
}
