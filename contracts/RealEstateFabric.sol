pragma solidity ^0.4.24;

import "./token/erc1358/ERC1358.sol";
import "./RealEstateFT.sol";
import "./Strings.sol";
import "./GeneralConstants.sol";
import "./Permissions.sol";
import "./RealEstateCrowdsale.sol";
import "./crowdsale/Management.sol";
import "./crowdsale/Constants.sol";


contract RealEstateFabric is ERC1358, GeneralConstants, Constants, Permissions {
    using Strings for *;

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
        uint256 _sqmSupply,
        address _managementConfigurator
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

        fungibleToken = _createFT(
            "REAL_ESTATE".toSlice().concat(tokenId.uint2str().toSlice()),
            "REAL_ESTATE",
            18,
            _owner,
            _sqmSupply,
            tokenId,
            _managementConfigurator
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

    /**
     * Overrided createFT with RealEstateFT creation instead ERC1358FT
     */
    function _createFT(
        string _name,
        string _symbol,
        uint256 _decimals,
        address _tokenOwner,
        uint256 _fungibleTokenSupply,
        uint256 _tokenId,
        address _managementConfigurator
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
        Management managementAddress = new Management();
        managementAddresses[_tokenId] = managementAddress;
        RealEstateFT fungibleToken = new RealEstateFT(
            _name,
            _symbol,
            _decimals,
            _fungibleTokenSupply,
            address(this),
            _tokenId,
            _tokenOwner,
            address(managementAddress)
        );
        managementAddress.setPermission(
            _managementConfigurator,
            CAN_CONFIGURE_MANAGEMENT,
            true
        );
        managementAddress.registerContract(
            CONTRACT_TOKEN,
            address(fungibleToken)
        );
        return address(fungibleToken);
    }

}
