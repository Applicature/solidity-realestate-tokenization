pragma solidity ^0.4.24;

import "./IERC1358FTMetadata.sol";
import "./IERC1358FTEnumerable.sol";


/**
 * @title ERC-1358 Fungible Token full interface (ERC-20 compatible)
 * @notice Full interface for ERC-20 compatible Token
 */
/* solium-disable-next-line */
contract IERC1358FTFull is IERC1358FTMetadata, IERC1358FTEnumerable {}
