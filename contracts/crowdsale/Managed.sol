pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "./Constants.sol";
import "./Management.sol";


contract Managed is Claimable, Constants {

    Management public management;

    modifier requirePermission(uint256 _permissionBit) {
        require(
            hasPermission(msg.sender, _permissionBit),
            ERROR_ACCESS_DENIED
        );
        _;
    }

    modifier canCallOnlyRegisteredContract(uint256 _key) {
        require(
            msg.sender == management.contractRegistry(_key),
            ERROR_ACCESS_DENIED
        );
        _;
    }

    modifier requireContractExistsInRegistry(uint256 _key) {
        require(
            management.contractRegistry(_key) != address(0),
            ERROR_NO_CONTRACT
        );
        _;
    }

    modifier requireNotContractSender() {
        require(isContract(msg.sender) == false, ERROR_ACCESS_DENIED);
        _;
    }

    constructor(address _managementAddress) public {
        management = Management(_managementAddress);
    }

    function setManagementContract(address _management) public onlyOwner {
        require(address(0) != _management, ERROR_NO_CONTRACT);

        management = Management(_management);
    }

    function hasPermission(address _subject, uint256 _permissionBit)
        internal
        view
        returns (bool)
    {
        return management.permissions(_subject, _permissionBit);
    }

    function isContract(address _addr) private view returns (bool) {
        uint32 size;
        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }
}