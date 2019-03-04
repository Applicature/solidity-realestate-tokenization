pragma solidity ^0.4.23;

import "../token/LockupContract.sol";


contract LockupContractTest is LockupContract {

    constructor(
        uint256 _lockPeriod, 
        uint256 _initialUnlock, 
        uint256 _releasePeriod, 
        address _management
    ) 
        public
        LockupContract(
            _lockPeriod, 
            _initialUnlock, 
            _releasePeriod, 
            _management
        ) 
    {
        
    }

    function isTransferAllowedTest(
        address _address,
        uint256 _value,
        uint256 _time,
        uint256 _holderBalance
    )
        public
        view
        returns (bool)
    {
        return isTransferAllowedInternal(
            _address,
            _value,
            _time,
            _holderBalance
        );
    }

    function allowedBalance(
        address _address,
        uint256 _time,
        uint256 _holderBalance
    )
        public
        view
        returns (uint256)
    {
        if (
            hasPermission(_address, EXCLUDED_ADDRESSES) ||
            lockedAmount[_address].length == 0
        )
        {
            return _holderBalance;
        }

        uint256 length = lockedAmount[_address].length / 2;
        uint256 blockedAmount;

        for (uint256 i = 0; i < length; i++) {
            uint256 lockTime = lockedAmount[_address][i.mul(2)];
            uint256 lockedBalance = lockedAmount[_address][i.mul(2).add(1)];
            if (lockTime.add(lockPeriod) > _time) {
                if (lockedBalance == 0) {
                    blockedAmount = _holderBalance;
                    break;
                } else {
                    uint256 tokensUnlocked;
                    if (releasePeriod > 0) {
                        uint256 duration = _time
                            .sub(lockTime)
                            .div(releasePeriod);
                        tokensUnlocked = lockedBalance
                            .mul(duration)
                            .mul(releasePeriod)
                            .div(lockPeriod);
                    }
                    blockedAmount = blockedAmount
                        .add(lockedBalance)
                        .sub(tokensUnlocked);
                }
            }
        }

        return _holderBalance.sub(blockedAmount);
    }
}