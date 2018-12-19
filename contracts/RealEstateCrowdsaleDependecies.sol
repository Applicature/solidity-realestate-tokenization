pragma solidity ^0.4.24;

import "./RealEstateFabric.sol";
import "./RealEstateFT.sol";
import "./GeneralConstants.sol";
import "./RealEstateAgent.sol";
import "./ico.contracts/allocator/MintableTokenAllocator.sol";
import "./ico.contracts/contribution/DirectContributionForwarder.sol";
import "./ico.contracts/dividends/Dividends.sol";




contract RealEstateCrowdsaleDependecies is GeneralConstants {

    DependenciesDeployed public dependecies;

    struct DependenciesDeployed {
        address realEstateAgent;
        address mintableTokenAllocator;
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
        address managementContract = realEstateFabric.managementAddresses(_realEstateId);
        RealEstateFT fungibleTokenInstance = RealEstateFT(
            realEstateFabric.ftAddresses(_realEstateId)
        );
        MintableTokenAllocator mintableTokenAllocator = new MintableTokenAllocator(
            fungibleTokenInstance.maxSupply(),
            managementContract
        );
        DirectContributionForwarder directContributionForwarder = new DirectContributionForwarder(
               _etherHolder,
                managementContract
            );
        Dividends dividends = new Dividends(managementContract);
        RealEstateAgent realEstateAgent = new RealEstateAgent(managementContract);

        dependecies =  DependenciesDeployed(
            address(realEstateAgent),
            address(mintableTokenAllocator),
            address(directContributionForwarder),
            address(dividends)
        );
    }

    function getDependecies() public view returns(address[4] dependenciesList){
        dependenciesList[0] = dependecies.realEstateAgent;
        dependenciesList[1] = dependecies.mintableTokenAllocator;
        dependenciesList[2] = dependecies.directContributionForwarder;
        dependenciesList[3] = dependecies.dividends;
    }
}
