pragma solidity 0.4.25;


contract Constants {
    // Permissions bit constants
    uint256 public constant CAN_MINT_TOKENS = 0;
    uint256 public constant CAN_BURN_TOKENS = 1;
    uint256 public constant CAN_UPDATE_STATE = 2;
    uint256 public constant CAN_LOCK_TOKENS = 3;
    uint256 public constant CAN_UPDATE_PRICE = 4;
    uint256 public constant CAN_INTERACT_WITH_ALLOCATOR = 5;
    uint256 public constant CAN_SET_ALLOCATOR_MAX_SUPPLY = 6;
    uint256 public constant CAN_PAUSE_TOKENS = 7;
    uint256 public constant EXCLUDED_ADDRESSES = 8;
    uint256 public constant WHITELISTED = 9;
    uint256 public constant SIGNERS = 10;
    uint256 public constant EXTERNAL_CONTRIBUTORS = 11;
    uint256 public constant CAN_UPDATE_DIVIDENDS = 12;
    uint256 public constant CAN_CREATE_DIVIDENDS = 13;
    uint256 public constant CAN_CONFIGURE_MANAGEMENT = 14;


    // Contract Registry keys
    uint256 public constant CONTRACT_TOKEN = 1;
    uint256 public constant CONTRACT_PRICING = 2;
    uint256 public constant CONTRACT_CROWDSALE = 3;
    uint256 public constant CONTRACT_ALLOCATOR = 4;
    uint256 public constant CONTRACT_AGENT = 5;
    uint256 public constant CONTRACT_FORWARDER = 6;
    uint256 public constant CONTRACT_REFERRAL = 7;
    uint256 public constant CONTRACT_STATS = 8;
    uint256 public constant CONTRACT_DIVIDENDS = 9;

    string public constant ERROR_ACCESS_DENIED = "ERROR_ACCESS_DENIED";
    string public constant ERROR_WRONG_AMOUNT = "ERROR_WRONG_AMOUNT";
    string public constant ERROR_NO_CONTRACT = "ERROR_NO_CONTRACT";
    string public constant ERROR_NOT_AVAILABLE = "ERROR_NOT_AVAILABLE";
}
