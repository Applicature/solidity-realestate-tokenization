pragma solidity ^0.4.18;

import "../contribution/ClaimableContributionForwarder.sol";


contract ClaimableContributionForwarderTest is ClaimableContributionForwarder {
    using SafeMath for uint256;

    constructor(
        address _receiver, 
        address _management
    )
        public
        ClaimableContributionForwarder(
            _receiver,
            _management
        )
    {

    }

    function increaseBalanceTest() public payable { }
}