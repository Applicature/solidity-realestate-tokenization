pragma solidity ^0.4.23;

import "./TokenAllocator.sol";
import "../token/erc20/MintableToken.sol";


/// @title MintableTokenAllocator
/// @author Applicature
/// @notice Contract responsible for defining distribution logic of tokens.
/// @dev implementation
contract MintableTokenAllocator is TokenAllocator {

    constructor(uint256 _maxSupply, address _management)
        public
        TokenAllocator(_maxSupply, _management)
    {

    }

    /// @notice Check whether contract is initialised
    /// @return true if initialized
    function isInitialized() public view returns (bool) {
        return (
            super.isInitialized() &&
            hasPermission(address(this), CAN_MINT_TOKENS)
        );
    }

    function internalAllocate(
        address _holder,
        uint256 _tokens
    )
        internal
        requireContractExistsInRegistry(CONTRACT_TOKEN)
        requirePermission(CAN_INTERACT_WITH_ALLOCATOR)
    {
        MintableToken(management.contractRegistry(CONTRACT_TOKEN))
            .mint(_holder, _tokens);
    }
}

