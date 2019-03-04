pragma solidity ^0.4.23;

import "../token/AllocationLockupContract.sol";
import "../token/erc20/MintableBurnableToken.sol";


/* solium-disable-next-line */
contract AllocationLockupContractTest is AllocationLockupContract, MintableBurnableToken {

    constructor(address _management) 
        public
        AllocationLockupContract(_management)
        MintableBurnableToken(
            374163322e18, 
            0, 
            true, 
            _management
        ) 
    {
        
    }

    function isTransferAllowedTest(
        address _address,
        uint256 _value,
        uint256 _time,
        uint256 _holderBalance
    )
        public
        view
        returns (bool)
    {
        return isTransferAllowedInternal(
            _address,
            _value,
            _time,
            _holderBalance
        );
    }


}