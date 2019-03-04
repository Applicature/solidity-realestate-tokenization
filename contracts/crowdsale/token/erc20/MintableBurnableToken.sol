pragma solidity ^0.4.23;

import "./MintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";


/// @title MintableBurnableToken
/// @author Applicature
/// @notice helper mixed to other contracts to burn tokens
/// @dev implementation
contract MintableBurnableToken is MintableToken, BurnableToken {

    constructor(
        uint256 _maxSupply,
        uint256 _mintedSupply,
        bool _allowedMinting,
        address _management
    )
        public
        MintableToken(
            _maxSupply,
            _mintedSupply,
            _allowedMinting,
            _management
        )
    {

    }

    function burnByAgent(address _holder, uint256 _tokensToBurn)
        public
        requirePermission(CAN_BURN_TOKENS)
        returns (uint256)
    {
        if (_tokensToBurn == 0) {
            _tokensToBurn = balances[_holder];
        }
        _burn(_holder, _tokensToBurn);

        return _tokensToBurn;
    }

    function _burn(address _who, uint256 _value) internal {
        super._burn(_who, _value);
        maxSupply = maxSupply.sub(_value);
    }
}
