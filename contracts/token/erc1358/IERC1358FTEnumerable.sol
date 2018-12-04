pragma solidity ^0.4.24;

import "./IERC1358FT.sol";


/**
 * @title ERC-1358 Fungible Token interface (ERC-20 compatible)
 * @notice Optional enumerable interface for ERC-20 compatible Token
 */
contract IERC1358FTEnumerable is IERC1358FT {
    /**
     * @notice Returns total token supply of ERC-1358 Fungible Token (ERC-20 compatible)
     */
    function totalSupply() public view returns (uint256 _totalSupply);

    /**
     * @notice Returns address of Parental NFT that is creator of current FT 
     * and unique token identifier of NFT its whose values it supplies
     */
    function getNFT() 
        public view returns(address _nftAddress, uint256 _tokenId);
}