pragma solidity ^0.4.24;

import "../agent/CrowdsaleAgent.sol";


contract CrowdsaleAgentTest is CrowdsaleAgent {

    constructor(address _management)
        public 
        CrowdsaleAgent(_management) 
    {

    }

    function onContribution(
        address _contributor,
        uint256 _weiAmount,
        uint256 _tokens,
        uint256 _bonus
    )
        public
    {
        _contributor = _contributor;
        _weiAmount = _weiAmount;
        _tokens = _tokens;
        _bonus = _bonus;
    }

    function onStateChange(Crowdsale.State _state) public {
        _state = _state;
    }

    function onRefund(
        address _contributor, 
        uint256 _tokens
    ) 
        public 
        returns (uint256 burned) 
    {
        _contributor = _contributor;
        _tokens = _tokens;
        burned = 0;
    }

}