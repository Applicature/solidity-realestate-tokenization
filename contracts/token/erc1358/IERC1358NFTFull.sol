pragma solidity ^0.4.24;

import "./IERC1358NFT.sol";
import "./IERC1358NFTMetadata.sol";
import "./IERC1358NFTEnumerable.sol";


/**
 * @title ERC-1358 Non-Fungible Token interface, that is supplied with Fungible Token
 * @notice Non-Fungible Token full interface 
 */
/* solium-disable-next-line */
contract IERC1358NFTFull is IERC1358NFT, IERC1358NFTMetadata, IERC1358NFTEnumerable {}