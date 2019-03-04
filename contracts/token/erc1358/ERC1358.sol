pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ERC1358NFTFull.sol";
import "./ERC1358FTFull.sol";
import "./IERC1358.sol";
import "../../crowdsale/Management.sol";


contract ERC1358 is  ERC1358NFTFull, Ownable {

    // Mapping from Non-Fungible token id to address of Fungible Token
    mapping (uint256 => address) public ftAddresses;
    mapping (uint256 => address) public managementAddresses;
    // Mapping from Non-Fungible token id to its value in equivalent of Fungible tokens
    mapping (uint256 => uint256) public nftValues;

    /**
     * @dev Constructor for ERC-1358 main contract
     * @param _name - Name for a set of NFTs
     * @param _symbol - Symbol for a set of NFTs
     */
    constructor(
        string _name,
        string _symbol
    )
        public
        ERC1358NFTFull(_name, _symbol)
    {

    }

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
        returns (uint256)
    {
        uint256 tokenId = _allTokens.length;

        address fungibleToken = _createFT(
            _name,
            _symbol,
            _decimals,
            _tokenOwner,
            _fungibleTokenSupply,
            tokenId,
            address(0)
        );

        require(super._mint(_tokenOwner, tokenId) == true);

        ftAddresses[tokenId] = fungibleToken;
        nftValues[tokenId] = _fungibleTokenSupply;

        return tokenId;
    }

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
        returns (bool)
    {
        require(super._burn(_owner, _tokenId) == true);
        ftAddresses[_tokenId] = address(0);
        nftValues[_tokenId] = 0;
        return true;
    }

    /**
     * @dev Returns value of selected NFT
     * @param _tokenId - Unique identifier of NFT
     */
    function nftValue(
        uint256 _tokenId
    )
        public
        view
        returns (uint256)
    {
        return nftValues[_tokenId];
    }

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
        returns (uint256)
    {
        return ERC1358FTFull(ftAddresses[_tokenId]).balanceOf(_holder);
    }

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
        returns (address[], uint256[])
    {
        return ERC1358FTFull(ftAddresses[_tokenId])
            .holders(_indexFrom, _indexTo);
    }

    /**
     * @dev Returns FT token holders amount of specified NFT
     * @param _tokenId - Unique identifier of NFT
     */
    function ftHoldersCount(uint256 _tokenId)
        public
        view
        returns (uint256)
    {
        return ERC1358FTFull(ftAddresses[_tokenId]).holdersCount();
    }

    /**
     * @dev Returns FT smart contract address of specified NFT
     * @param _tokenId - Unique identifier of NFT
     */
    function ftAddress(uint256 _tokenId)
        public
        view
        returns (address _ftAddress)
    {
        return ftAddresses[_tokenId];
    }

    /**
     * @dev Creates FT with specified parameters
     * @param _name - Name for FT
     * @param _symbol - Symbol for FT
     * @param _decimals - Precision amount for FT
     * @param _tokenOwner - Address of FT owner
     * @param _fungibleTokenSupply - Max token supply for FT
     * @param _tokenId - Unique identifier of NFT related to this FT
     */
    function _createFT(
        string _name,
        string _symbol,
        uint256 _decimals,
        address _tokenOwner,
        uint256 _fungibleTokenSupply,
        uint256 _tokenId,
        address
    )
        internal
        returns (address)
    {
        require (_decimals > 0);
        require (_tokenOwner != address(0));
        require (_fungibleTokenSupply > 0);
        Management managementAddress = new Management();
        managementAddresses[_tokenId] = managementAddress;
        managementAddress.setPermission(
            _tokenOwner,
            managementAddress.CAN_CONFIGURE_MANAGEMENT(),
            true
        );
        ERC1358FTFull fungibleToken = new ERC1358FTFull(
            _name,
            _symbol,
            _decimals,
            _fungibleTokenSupply,
            address(this),
            _tokenId,
            _tokenOwner,
            managementAddress
        );

        return address(fungibleToken);
    }
}
