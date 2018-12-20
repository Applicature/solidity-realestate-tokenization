pragma solidity ^0.4.24;

import "./IERC1358FTEnumerable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


contract ERC1358FTEnumerable is IERC1358FTEnumerable, StandardToken {

    // Address of main NFT
    address internal nftAddress_;

    // tokenId of NFT, for which this FT is supplier
    uint256 internal initialTokenId_;

    // Mapping from address of token holer to its status
    mapping (address => bool) public tokenHolders;

    // Array of all token holders
    address[] public tokenHoldersRegistry;

    /**
     * @dev Constructor for ERC-1358FT contract with Enumerable extension
     * @param _totalSupply - Max amount of tokens
     * @param _nftAddress - Address of main NFT, by which this FT was created
     * @param _initialTokenId - Unique identifier of NFT linked to this FT
     * @param _owner - Address of FT token owner
     */
    constructor (
        uint256 _totalSupply,
        address _nftAddress,
        uint256 _initialTokenId,
        address _owner
    ) public {
        require(_nftAddress != address(0));
        require(_initialTokenId >= 0);
        require(_owner != address(0));

        totalSupply_ = _totalSupply;
        nftAddress_ = _nftAddress;
        initialTokenId_ = _initialTokenId;
        balances[_owner] = _totalSupply;
        tokenHolders[_owner] = true;
        tokenHoldersRegistry.push(_owner);
    }

    /**
     * @dev Returns count of token holders
     */
    function holdersCount() public view returns (uint256) {
        return tokenHoldersRegistry.length;
    }

    /**
     * @dev Returns address of token holder by index inside array
     * of token holders
     * @param _index - Index inside array of token holders
     */
    function holderByIndex(uint256 _index) public view returns (address) {
        return tokenHoldersRegistry[_index];
    }

    /**
     * @dev Returns token holders addresses and their balances in some range
     * @param _from - Start index inside array of token holders
     * @param _to - End index inside array of token holders
     */
    function holders(
        uint256 _from,
        uint256 _to
    )
        public
        view
        returns (address[], uint256[])
    {
        require(
            _from >= 0 &&
            _to <= holdersCount()
        );

        address[] memory holdersAddresses = new address[](_to.sub(_from));
        uint256[] memory holdersBalance = new uint256[](_to.sub(_from));

        for (uint256 i = _from; i < _to; i++) {
            holdersAddresses[i] = tokenHoldersRegistry[i];
            holdersBalance[i] = balanceOf(tokenHoldersRegistry[i]);
        }
        return (holdersAddresses, holdersBalance);
    }

    /**
     * @dev Returns address of NFT contract and NFT id that was generated for FT
     */
    function getNFT() public view returns (address, uint256) {
        return (nftAddress_, initialTokenId_);
    }
}
