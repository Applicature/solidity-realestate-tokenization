pragma solidity ^0.4.24;

import "./ERC1358FT.sol";
import "./ERC1358.sol";
import "./ERC1358FTMetadata.sol";
import "./ERC1358FTEnumerable.sol";


contract ERC1358FTFull is ERC1358FT, ERC1358FTMetadata, ERC1358FTEnumerable {
    /**
     * @dev Constructor for ERC1358FT full implementation contract
     * @param _name - Name for FT
     * @param _symbol - Symbol for FT
     * @param _decimals - Precision amount for FT
     * @param _totalSupply - Max token supply ofr FT
     * @param _nftAddress - Address of main NFT contract
     * @param _initialTokenId - Unique identifier of dependent NFT
     * @param _owner - Address of FT owner
     */
    constructor(
        string _name,
        string _symbol,
        uint256 _decimals,
        uint256 _totalSupply,
        address _nftAddress,
        uint256 _initialTokenId,
        address _owner
    )
        public
        ERC1358FTMetadata(
            _name,
            _symbol,
            _decimals
        )
        ERC1358FTEnumerable(
            _totalSupply,
            _nftAddress,
            _initialTokenId,
            _owner
        )
    {

    }

    /**
     * @dev Transfer specified token amounts from token holder to receipients
     * @notice Means that _receivers[index] address will get _values[index] tokens
     * @param _receivers - Array of FT's receivers addresses
     * @param _values - Array of FT's amount
     */
    function batchTransfer(
        address[] _receivers,
        uint256[] _values
    )
        public
        returns (bool)
    {
        require(_receivers.length == _values.length);
        for (uint256 i = 0; i < _receivers.length; i++) {
            require(transfer(_receivers[i], _values[i]) == true);
        }
        return true;
    }

    /**
     * @dev Transfer specified token amounts from token holder to receipients
     * @notice Allowance balance will be decreased with _values
     * @param _from - Holder of NFT's
     * @param _receivers - Array of FT's receivers addresses
     * @param _values - Array of FT's amount
     */
    function batchTransferFrom(
        address _from,
        address[] _receivers,
        uint256[] _values
    )
        public
        returns (bool)
    {
        require(_receivers.length == _values.length);
        for (uint256 i = 0; i < _receivers.length; i++) {
            require(transferFrom(_from, _receivers[i], _values[i]) == true);
        }
        return true;
    }

    /**
     * @dev Overrided transfer function
     * @notice Require function caller to be token holder
     * @param _to - Address of token receiver
     * @param _amount - Token amount to transfer
     */
    function transfer(
        address _to,
        uint256 _amount
    )
        public
        returns (bool)
    {
        require(tokenHolders[msg.sender] == true);
        require(super.transfer(_to, _amount) == true);
        if (tokenHolders[_to] == false) {
            tokenHolders[_to] = true;
            tokenHoldersRegistry.push(_to);
        }
        return true;
    }

    /**
     * @dev Overrided transferFrom function, to transferFrom function
     * @param _from - Address of token sender
     * @param _to - Address of token receiver
     * @param _amount - Token amount to transfer
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
        public
        returns (bool)
    {
        require(tokenHolders[_from] == true);
        require(super.transferFrom(_from, _to, _amount) == true);
        if (tokenHolders[_to] == false) {
            tokenHolders[_to] = true;
            tokenHoldersRegistry.push(_to);
        }
        return true;
    }
}
