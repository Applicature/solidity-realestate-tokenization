pragma solidity ^0.4.24;

import "../Managed.sol";


contract ManagedTest is Managed {

    bool public notContract;
    address public caller;

    constructor(address _managementAddress)
        public
        Managed(_managementAddress)
    {

    }

    function checkNotContractSenderIsTrue()
        public
        requireNotContractSender
    {
        notContract = true;
        caller = msg.sender;
    }

}