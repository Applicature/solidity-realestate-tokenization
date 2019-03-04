pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";


/// @title OpenZeppelinERC20
/// @author Applicature
/// @notice Open Zeppelin implementation of standart ERC20
/// @dev Base class
contract OpenZeppelinERC20 is StandardToken, Claimable {
    using SafeMath for uint256;

    uint8 public decimals;
    string public name;
    string public symbol;
    string public standard;

    constructor(
        uint256 _totalSupply,
        string _tokenName,
        uint8 _decimals,
        string _tokenSymbol,
        bool _transferAllSupplyToOwner
    ) public {
        standard = "ERC20 0.1";
        totalSupply_ = _totalSupply;

        if (_transferAllSupplyToOwner) {
            balances[msg.sender] = _totalSupply;
        } else {
            balances[this] = _totalSupply;
        }

        name = _tokenName;
        // Set the name for display purposes
        symbol = _tokenSymbol;
        // Set the symbol for display purposes
        decimals = _decimals;
    }
}
