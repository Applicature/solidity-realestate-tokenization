pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./token/erc1358/ERC1358.sol";
import "./token/erc1358/ERC1358FTFull.sol";
import "./RealEstateFT.sol";
import "./Strings.sol";
import "./GeneralConstants.sol";
import "./Permissions.sol";
import "./RealEstateCrowdsale.sol";
import "./ico.contracts/Management.sol";


contract RealEstateFabric is ERC1358, Strings, GeneralConstants, Permissions {
    using SafeMath for uint256;

    address public signerAddress;
    // Mapping from Non-Fungible token id to address of crowdsale of Fungible Token
    mapping (uint256 => address) public ftCrowdsalesAddresses;

    /**
     * Constructor of RealEstateFabric smart contract for Tallyx system
     * @param _name - Name for set of REAL_ESTATE's
     * @param _symbol - Symbol for set REAL_ESTATE's
     */
    constructor(
        string _name,
        string _symbol
    )   public
        ERC1358(_name, _symbol)
        Permissions()
    {
        permissions[msg.sender] = PERMISSION_SET_PERMISSION |
            PERMISSION_TO_CREATE |
            PERMISSION_TO_MODIFY_STATUS |
            PERMISSION_TO_MODIFY_PAY_STATUS |
            PERMISSION_TO_DEACTIVATE;
    }

    function createRealEstate(
        string _realEstateUri,
        address _owner,
        uint256 _sqmSupply
    )
        external
        hasPermission(msg.sender, PERMISSION_TO_CREATE)
        returns (uint256)
    {
        require(
            _owner != address(0),
            ERROR_VALUE_EQUALS_ZERO
        );

        uint256 tokenId = _allTokens.length;
        address fungibleToken;
        address fungibleTokenCrowdsale;

        fungibleToken = _createFT(
            concat("REAL_ESTATE", toString(tokenId)),
            "REAL_ESTATE",
            2,
            _owner,
            _sqmSupply,
            tokenId
        );

        require(
            super._mint(_owner, tokenId) == true,
            ERROR_MINTING_NFT
        );
        _setTokenURI(
            tokenId,
            _realEstateUri
        );
        ftAddresses[tokenId] = fungibleToken;
        ftCrowdsalesAddresses[tokenId] =  fungibleTokenCrowdsale;
        nftValues[tokenId] = _sqmSupply;

        return tokenId;
    }

    /**
     * @dev Disallowed transferFrom function
     */
    function transferFrom(
        address,
        address,
        uint256
    ) public {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * @dev Disallowed approve function
     */
    function approve(
        address,
        uint256
    ) public {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * @dev Disallowed setApprovalForAll function
     */
    function setApprovalForAll(
        address,
        bool
    ) public {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * @dev Disallowed mint function
     */
    function mint(
        string,
        string,
        uint256,
        address,
        uint256
    )
        public
        returns (uint256)
    {
        require(false, ERROR_DISALLOWED);
    }

    /**
     * @dev Disallowed burn function
     */
    function burn(
        address,
        uint256
    )
        public
        returns (bool)
    {
        require(false, ERROR_DISALLOWED);
    }

    function setSignerAddress(address _signerAddress)
        public
        hasPermission(msg.sender, PERMISSION_TO_CREATE)
    {
        signerAddress = _signerAddress;
    }

    /**
     * Overrided createFT with RealEstateFT creation instead ERC1358FT
     */
    function _createFT(
        string _name,
        string _symbol,
        uint256 _decimals,
        address _tokenOwner,
        uint256 _fungibleTokenSupply,
        uint256 _tokenId
    )
        internal
        returns (address)
    {
        require(
            _decimals > 0 &&
            _tokenOwner != address(0) &&
            _fungibleTokenSupply > 0,
            ERROR_VALUE_EQUALS_ZERO
        );
        address managementAddress = new Management();
        RealEstateFT fungibleToken = new RealEstateFT(
            _name,
            _symbol,
            _decimals,
            _fungibleTokenSupply,
            address(this),
            _tokenId,
            _tokenOwner,
            managementAddress
        );
        return address(fungibleToken);
    }

    function _createCrowdsale(
        uint256 _tokenId,
        address _fungibleToken,
        address _signerAddress,
        address _etherHolder,
        uint256[2] _investmentPeriod,
        bool _tiersChangingAllowed,
        bool _updateChangeRateAllowed,
        uint256[] _tiers,
        uint256 _etherPriceInCurrency,
        uint256 _currencyDecimals,
        uint256 _percentageAbsMax
    )
        internal
        returns (address)
    {
        RealEstateCrowdsale fungibleTokenCrowdsale = new RealEstateCrowdsale(
            _tokenId,
            _fungibleToken,
            _signerAddress,
            _etherHolder,
            _investmentPeriod,
            _tiersChangingAllowed,
            _updateChangeRateAllowed,
            _tiers,
            _etherPriceInCurrency,
            _currencyDecimals,
            _percentageAbsMax
        );
        return address(fungibleTokenCrowdsale);
    }
}
