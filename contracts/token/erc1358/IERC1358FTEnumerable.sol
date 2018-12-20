pragma solidity ^0.4.24;


/**
 * @title ERC-1358 Fungible Token interface (ERC-20 compatible)
 * @notice Optional enumerable interface for ERC-20 compatible Token
 */
contract IERC1358FTEnumerable {

    /**
     * @notice Returns address of Parental NFT that is creator of current FT
     * and unique token identifier of NFT its whose values it supplies
     */
    function getNFT()
        public view returns(address _nftAddress, uint256 _tokenId);
}
