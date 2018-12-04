pragma solidity ^0.4.24;

import "./ERC1358NFT.sol";
import "./ERC1358NFTMetadata.sol";
import "./ERC1358NFTEnumerable.sol";


/* solium-disable-next-line */
contract ERC1358NFTFull is ERC1358NFT, ERC1358NFTMetadata, ERC1358NFTEnumerable {
    /**
     * @dev Constructor for full ERC-1358 NFT contract
     * @param _name - Name for a set of NFTs
     * @param _symbol - Symbol (abbreviated from name) for a set of NFTs
     */
    constructor (
        string _name,
        string _symbol
    ) 
        public 
        ERC1358NFTMetadata(
            _name,
            _symbol
        ) 
    {
        
    }
}