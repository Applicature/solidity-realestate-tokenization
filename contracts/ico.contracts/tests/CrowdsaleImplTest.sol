pragma solidity ^0.4.24;

import "../crowdsale/CrowdsaleImpl.sol";


contract CrowdsaleImplTest is CrowdsaleImpl {

    constructor(
        uint256 _startDate,
        uint256 _endDate,
        bool _allowWhitelisted,
        bool _allowSigned,
        bool _allowAnonymous,
        address _management
    ) public CrowdsaleImpl(
        _startDate,
        _endDate,
        _allowWhitelisted,
        _allowSigned,
        _allowAnonymous,
        _management
    ) {

    }

    function updateStartDate(uint256 _startDate) public {
        startDate = _startDate;
    }

    function setFinalized(bool _value) public {
        finalized = _value;
    }

    function internalContributionTest(address _contributor, uint256 _wei)
        public
        payable
    {
        internalContribution(_contributor, _wei);
    }
}
