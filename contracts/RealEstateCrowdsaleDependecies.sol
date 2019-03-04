pragma solidity ^0.4.24;

import "./RealEstateFabric.sol";
import "./RealEstateFT.sol";
import "./GeneralConstants.sol";
import "./RealEstateAgent.sol";
import "./crowdsale/allocator/MintableTokenAllocator.sol";
import "./crowdsale/contribution/DirectContributionForwarder.sol";
import "./crowdsale/dividends/Dividends.sol";


contract RealEstateCrowdsaleDependecies is GeneralConstants {

    DependenciesDeployed public dependecies;

    struct DependenciesDeployed {
        address agent;
        address allocator;
        address directContributionForwarder;
        address dividends;
    }

    constructor (
        uint256 _realEstateId,
        address _realEstateFabric,
        address _etherHolder
    )
        public
    {

        RealEstateFabric realEstateFabric = RealEstateFabric(_realEstateFabric);
        address managementContract = realEstateFabric
            .managementAddresses(_realEstateId);

        RealEstateFT fungibleTokenInstance = RealEstateFT(
            realEstateFabric.ftAddresses(_realEstateId)
        );
        MintableTokenAllocator allocator = new MintableTokenAllocator(
            fungibleTokenInstance.maxSupply(),
            managementContract
        );
        DirectContributionForwarder forwarder = new DirectContributionForwarder(
            _etherHolder,
            managementContract
        );
        Dividends dividends = new Dividends(managementContract);
        RealEstateAgent agent = new RealEstateAgent(managementContract);

        dependecies = DependenciesDeployed(
            address(agent),
            address(allocator),
            address(forwarder),
            address(dividends)
        );
    }

    function getDependecies() public view returns(address[4] dependenciesList){
        dependenciesList[0] = dependecies.agent;
        dependenciesList[1] = dependecies.allocator;
        dependenciesList[2] = dependecies.directContributionForwarder;
        dependenciesList[3] = dependecies.dividends;
    }
}
