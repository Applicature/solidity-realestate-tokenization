pragma solidity ^0.4.24;

import "./RealEstateFT.sol";
import "./GeneralConstants.sol";
import "./ico.contracts/allocator/MintableTokenAllocator.sol";
import "./ico.contracts/contribution/DirectContributionForwarder.sol";
import "./ico.contracts/pricing/PricingStrategyImpl.sol";
import "./ico.contracts/crowdsale/CrowdsaleImpl.sol";
import "./ico.contracts/dividends/Dividends.sol";
import "./RealEstateAgent.sol";
import "./ico.contracts/Constants.sol";


contract RealEstateCrowdsale is Constants {

    mapping(
        uint256 => RealEstateEntityAddress
    ) public realEstateToEntityAddresses;

    mapping(uint256 => RealEstateData) public realEstateToCrowdsaleData;

    struct RealEstateData {
        bool initialized;
    }

    struct RealEstateEntityAddress {
        address strategy;
        address contributionForwarder;
        address allocator;
        address crowdsale;
        address agent;
        address stats;
        address dividends;
    }

    constructor (
        uint256 _realEstateId,
        address _fungibleToken,
        address _signerAddress,
        address _etherHolder,
        uint256[2] _investmentPeriod,
        bool _tiersChangingAllowed,
        bool _updateChangeRateAllowed,
        uint256[] _tiers,
        uint256 _etherPriceInCurrency,
        uint256 _currencyDecimals,
        uint256 _percentageAbsMax
    )
        public
    {

        RealEstateFT fungibleTokenInstance = RealEstateFT(_fungibleToken);
        address managementContract = RealEstateFT(_fungibleToken).management();
        RealEstateEntityAddress storage entityAddresses =
            realEstateToEntityAddresses[_realEstateId];
        entityAddresses.allocator = new MintableTokenAllocator(
            fungibleTokenInstance.maxSupply(),
            managementContract
        );

        entityAddresses.contributionForwarder =
            new DirectContributionForwarder(
               _etherHolder,
                managementContract
            );

        deployCrowdsale(
            _realEstateId,
            _investmentPeriod,
            managementContract
        );
        entityAddresses.strategy = new PricingStrategyImpl(
            managementContract,
            _tiersChangingAllowed,
            _updateChangeRateAllowed,
            _tiers,
            _etherPriceInCurrency,
            _currencyDecimals,
            fungibleTokenInstance.decimals(),
            _percentageAbsMax
        );
        entityAddresses.dividends = new Dividends(managementContract);
        entityAddresses.agent = new RealEstateAgent(managementContract);
        configureManagement(
            _realEstateId,
            managementContract,
            _fungibleToken,
            _signerAddress
        );
    }

    function deployCrowdsale(
        uint256 _realEstateId,
        uint256[2] _investmentPeriod,
        address _managementContract
    ) internal {
        RealEstateEntityAddress storage entityAddresses =
        realEstateToEntityAddresses[_realEstateId];
        entityAddresses.crowdsale = new CrowdsaleImpl(
            _investmentPeriod[0],
            _investmentPeriod[1],
            true,
            true,
            false,
            _managementContract
        );
        Management managementInstance = Management(_managementContract);
        managementInstance.registerContract(
            CONTRACT_CROWDSALE,
            entityAddresses.crowdsale
        );
        managementInstance.setPermission(
            entityAddresses.crowdsale,
            CAN_UPDATE_STATE,
            true
        );
        managementInstance.setPermission(
            entityAddresses.crowdsale,
            CAN_INTERACT_WITH_ALLOCATOR,
            true
        );
    }

    function configureManagement(
        uint256 _realEstateId,
        address _managementContract,
        address _fungibleToken,
        address _signerAddress
    )
        internal
    {
        Management managementInstance = Management(_managementContract);
        RealEstateEntityAddress memory entityAddresses =
        realEstateToEntityAddresses[_realEstateId];

        managementInstance.registerContract(
            CONTRACT_TOKEN,
            _fungibleToken
        );
        managementInstance.registerContract(
            CONTRACT_PRICING,
            entityAddresses.strategy
        );
        managementInstance.registerContract(
            CONTRACT_ALLOCATOR,
            entityAddresses.allocator
        );
        managementInstance.registerContract(
            CONTRACT_AGENT,
            entityAddresses.contributionForwarder
        );
        managementInstance.registerContract(
            CONTRACT_FORWARDER,
            entityAddresses.contributionForwarder
        );
        managementInstance.registerContract(
            CONTRACT_DIVIDENDS,
            entityAddresses.dividends
        );
        managementInstance.setPermission(
            entityAddresses.allocator,
            CAN_MINT_TOKENS,
            true
        );
        managementInstance.setPermission(
            _signerAddress,
            EXTERNAL_CONTRIBUTORS,
            true
        );
        managementInstance.setPermission(_signerAddress, SIGNERS, true);
    }

}
