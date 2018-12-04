pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/introspection/ERC165.sol";
import "./ERC1358NFT.sol";


contract ERC1358NFTMetadata is ERC165, ERC1358NFT {

    // Name for a set of Non-Fungible tokens
    string internal name_;

    // Symbol (abbreviated from name) for a set of Non-Fungible tokens
    string internal symbol_;

    // Registry of token Uniform Resource Identifiers
    mapping (uint256 => string) private _tokenURIs;

    // Identefier of ERC-1358 NFT Metadata contract interface
    /* solium-disable-next-line */
    bytes4 private constant InterfaceId_ERC1358NFTMetadata = 0x5b5e139f;
    /**
     * 0x5b5e139f ===
     *   bytes4(keccak256('name()')) ^
     *   bytes4(keccak256('symbol()')) ^
     *   bytes4(keccak256('tokenURI(uint256)'))
     */

    /**
     * @dev Constructor for ERC-1358 contract extended with metadata
     * @param _name - Name for a set of NFTs
     * @param _symbol - Symbol for a set of NFTs
     */
    constructor (
        string _name,
        string _symbol
    ) public {
        name_ = _name;
        symbol_ = _symbol;
    }

    /**
     * @dev Getter for ERC-1358 name
     */
    function name() external view returns (string) {
        return name_;
    }

    /**
     * @dev Getter for ERC-1358 symbol
     */
    function symbol() external view returns (string) {
        return symbol_;
    }

    /**
     * @dev Get Uniform Resource Identifier of selected NFT 
     * @param _tokenId - Unique identifier of NFT
     */
    function tokenURI(uint256 _tokenId) 
        public 
        view 
        returns (string) 
    {
        require(_exists(_tokenId));
        return _tokenURIs[_tokenId];
    }

    /**
     * @dev Set Uniform Resource Identifier for selected NFT 
     * @param _tokenId - Unique identifier of NFT
     * @param _uri - URI string 
     */
    function _setTokenURI(
        uint256 _tokenId,
        string _uri
    ) internal {
        require(_exists(_tokenId));
        _tokenURIs[_tokenId] = _uri;
    }

    /**
     * @dev Burn NFT 
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
        super._burn(_owner, _tokenId);
        // Clear metadata (if any)
        if (bytes(_tokenURIs[_tokenId]).length != 0) {
            delete _tokenURIs[_tokenId];
        }
        return true;
    }
}