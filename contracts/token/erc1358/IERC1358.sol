pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IERC1358NFTFull.sol";


/**
 * @title ERC-1358 full interface
 * This interface implementing functionality to create ERC-1358 token
 * that has Non-Fungible structure and its value is supplied with Fungible Token
 * (ERC-20 compatible)
 */
contract IERC1358 is IERC1358NFTFull {
    using SafeMath for uint256;

    /**
     * @dev Creates FT with specified parameters
     * @param _name - Name for FT
     * @param _symbol - Symbol for FT
     * @param _decimals - Precision amount for FT
     * @param _tokenOwner - Address of FT owner
     * @param _fungibleTokenSupply - Max token supply for FT
     * @param _tokenId - Unique identifier of NFT related to this FT
     * @param _management - management contract address
     */
    function _createFT(
        string _name,
        string _symbol,
        uint256 _decimals,
        address _tokenOwner,
        uint256 _fungibleTokenSupply,
        uint256 _tokenId,
        address _management
    )
        internal
        returns (address);

    /**
     * @dev Mint NFT token and create FT accordingly
     * @param _name - Name for FT
     * @param _symbol - Symbol for FT
     * @param _decimals - Precision amount for FT
     * @param _tokenOwner - Address of FT owner
     * @param _fungibleTokenSupply - Max token supply for FT
     */
    function mintNFT(
        string _name,
        string _symbol,
        uint256 _decimals,
        address _tokenOwner,
        uint256 _fungibleTokenSupply
    )
        public
        returns (uint256);

    /**
     * @dev Burn NFT and delete FT data
     * @param _owner - owner address of NFT to burn
     * @param _tokenId - Unique identifier of NFT
     */
    function burn(
        address _owner,
        uint256 _tokenId
    )
        public
        returns (bool);

    /**
     * @dev Returns value of selected NFT
     * @param _tokenId - Unique identifier of NFT
     */
    function nftValue(
        uint256 _tokenId
    )
        public
        view
        returns (uint256);

    /**
     * @dev Returns FT token balance of specified NFT
     * @param _holder - Holder address
     * @param _tokenId - Unique identifier of NFT
     */
    function ftHolderBalance(
        uint256 _tokenId,
        address _holder
    )
        public
        view
        returns (uint256);

    /**
     * @dev Returns all FT token holders and their balances of specified NFT
     * @param _tokenId - Unique identifier of NFT
     * @param _indexFrom - Start index inside array of token holders
     * @param _indexTo - End index inside array of token holders
     */
    function ftHoldersBalances(
        uint256 _tokenId,
        uint256 _indexFrom,
        uint256 _indexTo
    )
        public
        view
        returns (address[], uint256[]);

    /**
     * @dev Returns FT token holders amount of specified NFT
     * @param _tokenId - Unique identifier of NFT
     */
    function ftHoldersCount(uint256 _tokenId)
        public
        view
        returns (uint256);

    /**
     * @dev Returns FT smart contract address of specified NFT
     * @param _tokenId - Unique identifier of NFT
     */
    function ftAddress(uint256 _tokenId)
        public
        view
        returns (address _ftAddress);
}



