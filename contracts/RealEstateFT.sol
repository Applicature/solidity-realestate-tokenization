pragma solidity ^0.4.24;

import "./token/erc1358/ERC1358FTFull.sol";
import "./RealEstateFabric.sol";
import "./ico.contracts/token/erc20/MintableToken.sol";
import "./GeneralConstants.sol";


contract RealEstateFT is
    ERC1358FTFull,
    MintableToken,
    GeneralConstants
{

    /**
     * @dev Constructor of RealEstateFT smart contract for Tallyx system
     * @param _name - Name for FT
     * @param _symbol - Symbol for FT
     * @param _decimals - Precision amount for FT
     * @param _maxSupply - Max FT supply
     * @param _nftAddress - Address of RealEstateFabric
     * @param _management - Address of Management
     * @param _owner - Address of FT owner
     */
    constructor (
        string _name,
        string _symbol,
        uint256 _decimals,
        uint256 _maxSupply,
        address _nftAddress,
        uint256 _tokenId,
        address _owner,
        address _management
    )
        public
        ERC1358FTFull(
            _name,
            _symbol,
            _decimals,
            0,
            _nftAddress,
            _tokenId,
            _owner
        )
        MintableToken(
            _maxSupply,
            0,
            false,
            _management
        )
    {

    }

}
