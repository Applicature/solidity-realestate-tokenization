pragma solidity ^0.4.0;

import "../crowdsale/RefundableCrowdsale.sol";


contract RCrowdsaleTest is RefundableCrowdsale {

    constructor(
        uint256 _startDate,
        uint256 _endDate,
        bool _allowWhitelisted,
        bool _allowSigned,
        bool _allowAnonymous,
        uint256 _softCap,
        uint256 _hardCap,
        address _management
    )
        public
        RefundableCrowdsale(
            _startDate,
            _endDate,
            _allowWhitelisted,
            _allowSigned,
            _allowAnonymous,
            _softCap,
            _hardCap,
            _management
        )
    {

    }

    function updateEndDate(uint256 _endDate)
        public
        onlyOwner
    {
        endDate = _endDate;
    }

    function updateSoldTokens(uint256 _tokensSold) public {
        tokensSold = _tokensSold;
    }

    function internalContributionTest(
        address _contributor,
        uint256 _wei
    )
        public
        payable
    {
        internalContribution(_contributor, _wei);
    }
}
