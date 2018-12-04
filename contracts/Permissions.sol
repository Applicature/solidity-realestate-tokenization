pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./GeneralConstants.sol";


contract Permissions is GeneralConstants {
    using SafeMath for uint256;

    mapping (address => uint256) public permissions;

    constructor() public {
        permissions[msg.sender] = PERMISSION_SET_PERMISSION;
    }

    modifier hasPermission(
        address _address,
        uint256 _permission
    ) {
        require(
            permissions[_address] & _permission == _permission,
            ERROR_ACCESS_RESTRICTED
        );
        _;
    }

    function setPermission(address _address, uint256 _permission)
        public
        hasPermission(msg.sender, PERMISSION_SET_PERMISSION)
    {
        require(_address != address(0), ERROR_ZERO_ADDRESS);
        permissions[_address] = _permission;
    }
}
