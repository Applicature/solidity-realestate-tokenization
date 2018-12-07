pragma solidity ^0.4.24;

import "./token/erc1358/ERC1358FTFull.sol";
import "./RealEstateFabric.sol";
import "./ico.contracts/token/erc20/MintableToken.sol";
import "./RealEstateAgent.sol";
import "./GeneralConstants.sol";


contract RealEstateFT is
    ERC1358FTFull,
    MintableToken,
    GeneralConstants
{

    /**
     * @dev Constructor of RealEstateFT smart contract for Tallyx system
     * @param _name - Name for FT
     * @param _symbol - Symbol for FT
     * @param _decimals - Precision amount for FT
     * @param _maxSupply - Max FT supply
     * @param _nftAddress - Address of RealEstateFabric
     * @param _management - Address of Management
     * @param _owner - Address of FT owner
     */
    constructor (
        string _name,
        string _symbol,
        uint256 _decimals,
        uint256 _maxSupply,
        address _nftAddress,
        uint256 _tokenId,
        address _owner,
        address _management
    )
        public
        ERC1358FTFull(
            _name,
            _symbol,
            _decimals,
            0,
            _nftAddress,
            _tokenId,
            _owner
        )
        MintableToken(
            _maxSupply,
            0,
            false,
            _management
        )
    {

    }

    function transfer(
        address _to,
        uint256 _value
    )
        public
        returns (bool)
    {
        if (true == super.transfer(_to, _value)) {
            RealEstateAgent(
                management.contractRegistry(CONTRACT_AGENT)
            ).onTransfer(msg.sender, _to);
            return true;
        }
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
        public
        returns (bool)
    {
        if (true == super.transferFrom(_from, _to, _amount)) {
            RealEstateAgent(
                management.contractRegistry(CONTRACT_AGENT)
            ).onTransfer(_from, _to);
            return true;
        }
    }

    function mint(address _holder, uint256 _tokens) public {
        super.mint(_holder, _tokens);
        RealEstateAgent(
            management.contractRegistry(CONTRACT_AGENT)
        ).onMinting(_holder);
    }

}
