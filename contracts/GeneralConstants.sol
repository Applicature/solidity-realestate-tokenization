pragma solidity ^0.4.24;


contract GeneralConstants {
    uint256 public constant PERMISSION_SET_PERMISSION = 1;
    uint256 public constant PERMISSION_TO_CREATE = 2;
    uint256 public constant PERMISSION_TO_MODIFY = 4;
    uint256 public constant PERMISSION_TO_MODIFY_STATUS = 8;
    uint256 public constant PERMISSION_TO_MODIFY_VERIFIER = 16;
    uint256 public constant PERMISSION_TO_MODIFY_PAY_STATUS = 32;
    uint256 public constant PERMISSION_TO_DEACTIVATE = 64;

    string public constant ERROR_VALUE_EQUALS_ZERO = "ZERO VALUE";
    string public constant ERROR_DISALLOWED = "THIS FUNCTION IS DISALLOWED";
    string public constant ERROR_ACCESS_RESTRICTED = "ACCESS RESTRICTED";
    string public constant ERROR_MINTING_NFT = "MINT FUNCTION FAILED";
    string public constant ERROR_ZERO_ADDRESS = "ZERO ADDRESS";
}
