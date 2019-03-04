pragma solidity ^0.4.23;

import "../allocator/TokenAllocator.sol";


contract TokenAllocatorTest is TokenAllocator {

    constructor(
        uint256 _maxSupply, 
        address _management
    )
        public
        TokenAllocator(_maxSupply, _management)
    {

    }

    function internalAllocate(
        address,
        uint256
    )
        internal
        requirePermission(CAN_INTERACT_WITH_ALLOCATOR)
    {

    }
}