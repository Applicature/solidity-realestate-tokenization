pragma solidity ^0.4.24;

import "./ico.contracts/agent/CrowdsaleAgent.sol";


contract RealEstateAgent is CrowdsaleAgent {

    constructor(address _management)
        public
        CrowdsaleAgent(_management)
    {}

    function onContribution(
        address _contributor,
        uint256 _weiAmount,
        uint256 _tokens,
        uint256 _bonus
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_CROWDSALE)
    {}

    function onStateChange(
        Crowdsale.State _state
    )
        public
        requirePermission(CAN_UPDATE_STATE)
        requireContractExistsInRegistry(CONTRACT_CROWDSALE)
    {}

    function onRefund(
        address _contributor,
        uint256 _tokens
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_CROWDSALE)
        returns (uint256 burned)
    {}
}

