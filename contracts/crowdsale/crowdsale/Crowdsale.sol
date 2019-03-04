pragma solidity ^0.4.23;


contract Crowdsale {
    uint256 public tokensSold;

    enum State {
        Unknown, 
        Initializing, 
        BeforeCrowdsale, 
        InCrowdsale, 
        Success, 
        Finalized, 
        Refunding
    }

    function externalContribution(
        address _contributor, 
        uint256 _wei
    ) public payable;

    function contribute(uint8 _v, bytes32 _r, bytes32 _s) public payable;

    function updateState() public;

    function getState() public view returns (State);

    function isInitialized() public view returns (bool);

    function internalContribution(address _contributor, uint256 _wei) internal;
}
