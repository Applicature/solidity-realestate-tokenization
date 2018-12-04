pragma solidity ^0.4.24;

import "./IERC1358NFT.sol";


/**
 * @title ERC-1358 Non-Fungible Token interface, that is supplied with Fungible Token
 * @notice Optional Enumerable interface for Non-Fungible Token
 */
contract IERC1358NFTEnumerable is IERC1358NFT {
	/**
	 * @dev Returns total capacity of current NFT series
	 */
    function totalSupply() public view returns (uint256);

 	/**
 	 * @dev Returns owner of Non-Fungible token by it's index in array
 	 * @param _owner - Address of Non-Fungible Token owner
 	 * @param _index - Index of Non-Fungible Token in NFT array
 	 */
    function tokenOfOwnerByIndex(
        address _owner,
        uint256 _index
    )
        public
        view
        returns (uint256 tokenId);

    /**
     * @dev Returns Non-Fungible Token unique identifier by it's index in array
     * @param _index - Index of NFT in array
     */
    function tokenByIndex(uint256 _index) public view returns (uint256);
}