pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../Pausable.sol";


/// @title Erc20PausableToken
/// @author Applicature
/// @notice helper mixed to other contracts to pause/ un pause contract
/// @dev Base class
contract Erc20PausableToken is Pausable, StandardToken {


    constructor(address _management, bool _paused)
        public
        Pausable(_management, _paused)
    {
        
    }

    function transfer(address _to, uint256 _tokens)
        public
        isPaused(false)
        returns (bool)
    {
        super.transfer(_to, _tokens);
    }

    function transferFrom(address _holder, address _to, uint256 _tokens)
        public
        isPaused(false)
        returns (bool)
    {
        super.transferFrom(_holder, _to, _tokens);
    }
}
