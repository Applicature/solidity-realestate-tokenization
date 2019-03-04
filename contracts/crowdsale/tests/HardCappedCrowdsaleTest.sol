pragma solidity ^0.4.24;

import "../crowdsale/HardCappedCrowdsale.sol";


contract HardCappedCrowdsaleTest is HardCappedCrowdsale {

    constructor(
        uint256 _startDate,
        uint256 _endDate,
        bool _allowWhitelisted,
        bool _allowSigned,
        bool _allowAnonymous,
        uint256 _hardCap,
        address _management
    )
        public
        HardCappedCrowdsale(
            _startDate,
            _endDate,
            _allowWhitelisted,
            _allowSigned,
            _allowAnonymous,
            _hardCap,
            _management
        )
    {

    }

    function updateStartDate(uint256 _startDate) public {
        startDate = _startDate;
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