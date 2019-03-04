pragma solidity ^0.4.24;

import "./crowdsale/agent/CrowdsaleAgent.sol";
import "./RealEstateFT.sol";
import "./crowdsale/dividends/Dividends.sol";
import "./crowdsale/Management.sol";


contract RealEstateAgent is CrowdsaleAgent {

    constructor(address _management)
        public
        CrowdsaleAgent(_management)
    {

    }

    function onContribution(
        address,
        uint256,
        uint256,
        uint256
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_CROWDSALE)
    {}

    function onStateChange(
        Crowdsale.State
    )
        public
        requirePermission(CAN_UPDATE_STATE)
        requireContractExistsInRegistry(CONTRACT_CROWDSALE)
    {}

    function onRefund(
        address,
        uint256
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_CROWDSALE)
        returns (uint256)
    {}

    function onTransfer(
        address _from,
        address _to
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_TOKEN)
    {
        RealEstateFT tokenInstance = RealEstateFT(
            management.contractRegistry(CONTRACT_TOKEN)
        );
        Dividends dividendsInstance = Dividends(
            management.contractRegistry(CONTRACT_DIVIDENDS)
        );
        if (_from != address(0)) {
            dividendsInstance.updateValueAtNow(
                _from,
                tokenInstance.balanceOf(_from)
            );
        }
        if (_to != address(0)) {
            dividendsInstance.updateValueAtNow(
                _to, tokenInstance.balanceOf(_to)
            );
        }
    }

    function onMinting(
        address _to
    )
        public
        canCallOnlyRegisteredContract(CONTRACT_TOKEN)
    {
        RealEstateFT tokenInstance = RealEstateFT(
            management.contractRegistry(CONTRACT_TOKEN)
        );

        Dividends dividendsInstance = Dividends(
            management.contractRegistry(CONTRACT_DIVIDENDS)
        );

        dividendsInstance.updateValueAtNow(_to, tokenInstance.balanceOf(_to));
        dividendsInstance.updateTotalSupplyAtNow(tokenInstance.totalSupply());
    }
}

