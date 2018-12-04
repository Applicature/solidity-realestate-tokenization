pragma solidity ^0.4.24;

import "./ERC1358FT.sol";


contract ERC1358FTMetadata is ERC1358FT {
    // Name for FT (notice: Name is not unique)
    string internal name_;
    // Symbol for FT (notice: Symbol is abbreviated from name and is not unique to)
    string internal symbol_;
    // Amount of precision (notice: by default 18)
    uint256 internal decimals_;

    /**
     * @dev Constructor for ERC-1358 contract with Metadata extension
     * @param _name - Name for FT
     * @param _symbol - Symbol for FT
     * @param _decimals - Precision for FT
     */ 
    constructor (
        string _name,
        string _symbol,
        uint256 _decimals
    ) public {
        require(_decimals > 0);
        name_ = _name;
        symbol_ = _symbol;
        decimals_ = _decimals;
    }

    /**
     * @dev Return name of FT
     */
    function name() public view returns (string) {
        return name_;
    }

    /**
     * @dev Return symbol of FT
     */ 
    function symbol() public view returns (string) {
        return symbol_;
    }

    /**
     * @dev Return decimals precision of FT
     */
    function decimals() public view returns (uint256) {
        return decimals_;
    }
}