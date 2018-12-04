pragma solidity ^0.4.24;

import "./IERC1358NFT.sol";


/**
 * @title ERC-1358 Non-Fungible Token interface, that is supplied with Fungible Token
 * @notice Optional Metadata interface for Non-Fungible Token
 */
contract IERC1358NFTMetadata is IERC1358NFT {
    /**
     * @dev Returns name of ERC-1358 Non-Fungible Token series
     */
    function name() external view returns (string);

    /**
     * @dev Returns symbol of ERC-1358 Non-Fungible Token series
     */
    function symbol() external view returns (string);
      
    /**
     * @dev Returns Unique Resource Identifier of ERC-1358 Non-Fungible Token
     * @param _tokenId - Unique Non-Fungible Token identifier
     */
    function tokenURI(uint256 _tokenId) public view returns (string);
}