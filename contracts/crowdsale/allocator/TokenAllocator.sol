pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "../Managed.sol";


/// @title TokenAllocator
/// @author Applicature
/// @notice Contract responsible for defining distribution logic of tokens.
/// @dev Base class
contract TokenAllocator is Claimable, Managed {
    using SafeMath for uint256;

    uint256 public maxSupply;

    constructor(uint256 _maxSupply, address _management)
        public
        Managed(_management)
    {
        maxSupply = _maxSupply;
    }

    function allocate(
        address _holder,
        uint256 _tokens,
        uint256 _allocatedTokens
    )
        public
        requirePermission(CAN_INTERACT_WITH_ALLOCATOR)
    {
        require(
            tokensAvailable(_allocatedTokens) >= _tokens,
            ERROR_WRONG_AMOUNT
        );
        internalAllocate(_holder, _tokens);
    }

    function updateMaxSupply(uint256 _maxSupply)
        public
        requirePermission(CAN_SET_ALLOCATOR_MAX_SUPPLY)
    {
        maxSupply = _maxSupply;
    }

    /// @notice Check whether contract is initialised
    /// @return true if initialized
    function isInitialized() public view returns (bool) {
        if (
            address(management) == address(0) ||
            management.contractRegistry(CONTRACT_TOKEN) == address(0)||
            management.contractRegistry(CONTRACT_ALLOCATOR) != address(this)
        ) {
            return false;
        }
        return true;
    }

    /// @return available tokens
    function tokensAvailable(uint256 _allocatedTokens)
        public
        view
        returns (uint256)
    {
        return maxSupply.sub(_allocatedTokens);
    }

    function internalAllocate(
        address _holder,
        uint256 _tokens
    )
        internal
        requirePermission(CAN_INTERACT_WITH_ALLOCATOR);
}