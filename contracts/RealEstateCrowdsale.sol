pragma solidity ^0.4.24;

import "./token/erc1358/ERC1358FTFull.sol";
import "./RealEstateFabric.sol";
import "./ico.contracts/token/erc20/MintableBurnableToken.sol";
import "./GeneralConstants.sol";


contract RealEstateCrowdsale {

    /**
     * @dev Constructor of RealEstateFT smart contract for Tallyx system
     * @param _name - Name for FT
     * @param _symbol - Symbol for FT
     * @param _decimals - Precision amount for FT
     * @param _maxSupply - Max FT supply
     * @param _nftAddress - Address of RealEstateFabric
     * @param _initialTokenId - RealEstate id related to this FT
     * @param _management - Address of Management
     * @param _owner - Address of FT owner
     */
    constructor (
      address  fungibleToken,
      uint256  _priceInCurrencyPerSqm,
      uint256[2] _investmentPeriod
    )
        public

    {

    }

}
