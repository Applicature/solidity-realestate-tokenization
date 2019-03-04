pragma solidity ^0.4.24;

import {ERC1358FTMetadata as Metadata} from "./ERC1358FTMetadata.sol";
import "./ERC1358FTEnumerable.sol";
import "../../crowdsale/token/erc20/MintableToken.sol";


contract ERC1358FTFull is MintableToken, Metadata, ERC1358FTEnumerable {
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
        address _owner,
        address _management
    )
        public
        MintableToken(
            _totalSupply,
            0,
            true,
            _management
        )
        Metadata(
            _name,
            _symbol,
            _decimals
        )
        ERC1358FTEnumerable(
            0,
            _nftAddress,
            _initialTokenId,
            _owner
        )
    {

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

    /**
    * @dev Allow _operator to withdraw from your account, multiple times,
    * up to the _amount. If this function is called again it overwrites
    * the current allowance with _value.
    * @param _operator - Address that allowed to withdraw from FT owner balance
    * @param _amount - Amount of approved FT's
    */
    function approve(
        address _operator,
        uint256 _amount
    )
        public
        returns (bool)
    {
        require(_operator != address(0));
        return super.approve(_operator, _amount);
    }

    /**
    * @dev Increase amount of tokens allowed to be transfered for approved
    * address from balance of owner
    * @notice owner means caller address
    * @param _operator - Approved address
    * @param _addedAmount - Amount to be added to approved address allowance balance
    */
    function increaseApproval(
        address _operator,
        uint256 _addedAmount
    )
        public
        returns (bool)
    {
        require(_operator != address(0));
        return super.increaseApproval(_operator, _addedAmount);
    }

    /**
    * @dev Decrease amount of tokens allowed to be transfered for approved
    * address from balance of owner
    * @notice owner means caller address
    * @param _operator - Approved address
    * @param _substractedAmount - Amount to be substracted from approved address allowance balance
    */
    function decreaseApproval(
        address _operator,
        uint256 _substractedAmount
    )
        public
        returns (bool)
    {
        require(_operator != address(0));
        return super.decreaseApproval(_operator, _substractedAmount);

    }
}
