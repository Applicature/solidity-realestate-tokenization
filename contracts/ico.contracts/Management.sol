pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Constants.sol";


contract Management is Claimable, Constants {
    using SafeMath for uint256;

    // Contract Registry
    mapping (uint256 => address) public contractRegistry;

    // Per contract registry
    /* solium-disable-next-line max-len */
    mapping (address => mapping(uint256 => address)) public sourceContractRegistry;

    // Permissions
    mapping (address => mapping(uint256 => bool)) public permissions;

    event PermissionsSet(
        address subject,
        uint256 permission,
        bool value
    );

    event ContractRegistered(
        uint256 key,
        address source,
        address target
    );

    function contractRegistry(
        address _source,
        uint256 _key
    )
        public
        view
        returns (address)
    {
        if (_source == address(0)) {
            return contractRegistry[_key];
        }

        return sourceContractRegistry[_source][_key];
    }

    function setPermission(
        address _address,
        uint256 _permission,
        bool _value
    )
        public
        onlyOwner
    {
        permissions[_address][_permission] = _value;
        emit PermissionsSet(_address, _permission, _value);
    }

    function registerContract(
        uint256 _key,
        address _target
    )
        public
        onlyOwner
    {
        contractRegistry[_key] = _target;
        emit ContractRegistered(_key, 0x0, _target);
    }

    function registerSourceContract(
        uint256 _key,
        address _source,
        address _target
    )
        public
        onlyOwner
    {
        sourceContractRegistry[_source][_key] = _target;
        emit ContractRegistered(_key, _source, _target);
    }
}
