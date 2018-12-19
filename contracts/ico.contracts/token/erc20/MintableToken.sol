pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "../../Managed.sol";


/// @title MintableToken
/// @author Applicature
/// @notice allow to mint tokens
/// @dev Base class
contract MintableToken is BasicToken, Claimable, Managed {
    using SafeMath for uint256;

    uint256 public maxSupply;
    bool public allowedMinting;

    event Mint(
        address indexed holder,
        uint256 tokens
    );

    constructor(
        uint256 _maxSupply,
        uint256 _mintedSupply,
        bool _allowedMinting,
        address _management
    )
        public
        Managed(_management)
    {
        maxSupply = _maxSupply;
        totalSupply_ = totalSupply_.add(_mintedSupply);
        allowedMinting = _allowedMinting;
    }

    /// @notice allow to mint tokens
    function mint(address _holder, uint256 _tokens)
        public
        requirePermission(CAN_MINT_TOKENS)
    {
        require(
            allowedMinting == true &&
            totalSupply_.add(_tokens) <= maxSupply,
            ERROR_NOT_AVAILABLE
        );

        totalSupply_ = totalSupply_.add(_tokens);

        balances[_holder] = balances[_holder].add(_tokens);

        if (totalSupply_ == maxSupply) {
            allowedMinting = false;
        }
        emit Mint(_holder, _tokens);
    }

    /// @notice update allowedMinting flat
    function disableMinting()
        public
        requirePermission(CAN_UPDATE_STATE)
    {
        allowedMinting = false;
    }

    /// @return available tokens
    function availableTokens()
        public
        view
        returns (uint256 tokens)
    {
        return maxSupply.sub(totalSupply_);
    }
}

