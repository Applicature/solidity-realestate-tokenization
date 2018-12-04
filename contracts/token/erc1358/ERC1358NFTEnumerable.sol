pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/introspection/ERC165.sol";
import "./ERC1358NFT.sol";


contract ERC1358NFTEnumerable is ERC165, ERC1358NFT {

    /* Mapping from Address of NFT holder to a set of his NFTs */
    mapping (address => uint256[]) internal _ownedTokens;

    // Mapping from owned NFT unique identifiers to their position in array
    mapping (uint256 => uint256) internal _ownedTokensIndex;

    // Array of all NFTs
    uint256[] public _allTokens;

    // Mapping from NFT unique identifiers to their position in array
    mapping (uint256 => uint256) internal _allTokensIndex;

    // InterfaceId for ERC-1358 Enumerable contract
    /* solium-disable-next-line */
    bytes4 private constant _InterfaceId_ERC1358NFTEnumerable = 0x780e9d63;

    /**
     * @dev Constructor for ERC-1358 NFT Enumarable contract
     */
    constructor() public {
        _registerInterface(_InterfaceId_ERC1358NFTEnumerable);
    }

    /**
     * @dev Returns NFT id owned by the supplied address and index in 
     * the owner's NFT array.
     * Index could be from 0 to n, where n is owner's balance of NFT's
     * @notice Every address in contract has array of NFT ids, and this 
     * method provides ability to navigate in it.
     * @param _owner - Address of NFT's owner
     * @param _index - Index inside array of owner's NFT
     */
    function tokenOfOwnerByIndex(
        address _owner,
        uint256 _index
    )
        public 
        view 
        returns (uint256) 
    {
        require(_index < balanceOf(_owner));
        return _ownedTokens[_owner][_index];
    }

    /**
     * @dev Returns total amount of NFT's presented in this NFT contract
     * @notice For example we have minted 2 NFTs for 2 users(1 NFT per 1 user), 
     * in this case totalSupply will equal to 2
     */
    function totalSupply() public view returns (uint256) {
        return _allTokens.length;
    }

    /**
     * @dev Returns NFT id from all NFT's array by using its index.
     * @notice All NFT's are added during minting to array, for example
     * we have minted 2 NFT's for 2 users, in case we call tokenByIndex(1),
     * it will return unique NFT id, which is located by index 1
     * @param _index - Index inside array of all NFT
     */
    function tokenByIndex(uint256 _index) 
        public 
        view 
        returns (uint256) 
    {
        require (_index < totalSupply());
        return _allTokens[_index];
    }

    /**
     * @dev Transfers ownership from token owner to certain receiver
     * @param _to - Address of NFT's receiver
     * @param _tokenId - Unique identifier for NFT
     */
    function _addTokenTo(
        address _to,
        uint256 _tokenId
    ) internal {
        super._addTokenTo(_to, _tokenId);
        uint256 _length = _ownedTokens[_to].length;
        _ownedTokens[_to].push(_tokenId);
        _ownedTokensIndex[_tokenId] = _length;
    }

    /**
     * @dev Discards ownership for specified NFT owner, making NFT unassigned
     * @param _from - Address of NFT's owner
     * @param _tokenId - Unique identifier for NFT
     */
    function _removeTokenFrom(
        address _from,
        uint256 _tokenId
    ) internal {
        super._removeTokenFrom(_from, _tokenId);

        uint256 _tokenIndex = _ownedTokensIndex[_tokenId];
        uint256 _lastTokenIndex = _ownedTokens[_from].length.sub(1);
        uint256 _lastToken = _ownedTokens[_from][_lastTokenIndex];

        _ownedTokens[_from][_tokenIndex] = _lastToken;
        _ownedTokens[_from].length--;

        _ownedTokensIndex[_tokenId] = 0;
        _ownedTokensIndex[_lastToken] = _tokenIndex;
    }

    /** 
     * @dev Mint new NFT for specified address
     * @param _to - Address of new Non-Fungible token owner
     * @param _tokenId - Unique identifier of NFT
     */
    function _mint(
        address _to,
        uint256 _tokenId
    ) 
        internal 
        returns (bool)
    {
        require(super._mint(_to, _tokenId) == true);

        _allTokensIndex[_tokenId] = _allTokens.length;
        _allTokens.push(_tokenId);
        
        return true;
    }

    /**
     * @dev Burn Non-Fungible token for specified NFT holder
     * @param _owner - Address of Non-Fungible token owner
     * @param _tokenId - Unique identifier of NFT
     */
    function _burn(
        address _owner,
        uint256 _tokenId
    ) 
        internal 
        returns (bool)
    {
        require(super._burn(_owner, _tokenId) == true);

        uint256 _tokenIndex = _allTokensIndex[_tokenId];
        uint256 _lastTokenIndex = _allTokens.length.sub(1);
        uint256 _lastToken = _allTokens[_lastTokenIndex];

        _allTokens[_tokenIndex] = _lastToken;
        _allTokens[_lastTokenIndex] = 0;

        _allTokens.length--;
        _allTokensIndex[_tokenId] = 0;
        _allTokensIndex[_lastToken] = _tokenIndex;

        return true;
    }
}