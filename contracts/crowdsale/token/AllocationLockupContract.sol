pragma solidity ^0.4.23;

import "./LockupContract.sol";


contract AllocationLockupContract is LockupContract {

    mapping (address => uint256[]) public lockedAllocationAmount;
    
    constructor(address _management)
        public
        LockupContract(0, 0, 0, _management)
    {

    }

    function allocationLog(
        address _address,
        uint256 _amount,
        uint256 _startingAt,
        uint256 _lockPeriod,
        uint256 _initialUnlock,
        uint256 _releasePeriod
    )
        public
        requirePermission(CAN_LOCK_TOKENS)
    {
        lockedAllocationAmount[_address].push(_startingAt);
        if (_initialUnlock > 0) {
            _amount = _amount.mul(uint256(100).sub(_initialUnlock)).div(100);
        }
        lockedAllocationAmount[_address].push(_amount);
        lockedAllocationAmount[_address].push(_lockPeriod);
        lockedAllocationAmount[_address].push(_releasePeriod);
        emit Lock(_address, _amount);
    }

    function isTransferAllowedAllocation(
        address _address,
        uint256 _value,
        uint256 _time,
        uint256 _holderBalance
    )
        public
        view
        returns (bool)
    {
        if (lockedAllocationAmount[_address].length == 0) {
            return true;
        }

        uint256 blockedAllocationAmount;

        for (uint256 i = 0; 
            i < lockedAllocationAmount[_address].length / 4; 
            i++
        ) {
            uint256 lockTime = lockedAllocationAmount[_address][i.mul(4)];
            uint256 lockedBalance = 
                lockedAllocationAmount[_address][i.mul(4).add(1)];
            uint256 lockPeriod = 
                lockedAllocationAmount[_address][i.mul(4).add(2)];
            uint256 releasePeriod = 
                lockedAllocationAmount[_address][i.mul(4).add(3)];

            if (lockTime.add(lockPeriod) > _time) {
                // as there is no point to call allocationLog function with amount = 0
                // additional condition to block all balance is added
                if (lockedBalance == 0) {
                    blockedAllocationAmount = _holderBalance;
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
                    blockedAllocationAmount = blockedAllocationAmount.add(lockedBalance).sub(tokensUnlocked);
                }
            }
        }

        if (_holderBalance.sub(blockedAllocationAmount) >= _value) {
            return true;
        }

        return false;
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
        if (lockedAllocationAmount[_address].length == 0) {
            return _holderBalance;
        }

        uint256 blockedAllocationAmount;

        for (uint256 i = 0; 
            i < lockedAllocationAmount[_address].length / 4; 
            i++
        ) {
            uint256 lockTime = lockedAllocationAmount[_address][i.mul(4)];
            uint256 lockedBalance = 
                lockedAllocationAmount[_address][i.mul(4).add(1)];
            uint256 lockPeriod = 
                lockedAllocationAmount[_address][i.mul(4).add(2)];
            uint256 releasePeriod = 
                lockedAllocationAmount[_address][i.mul(4).add(3)];
            if (lockTime.add(lockPeriod) > _time) {
                if (lockedBalance == 0) {
                    blockedAllocationAmount = _holderBalance;
                    break;
                } else {
                    uint256 tokensUnlocked;
                    if (releasePeriod > 0) {
                        uint256 duration = (_time.sub(lockTime))
                            .div(releasePeriod);
                        tokensUnlocked = lockedBalance
                            .mul(duration)
                            .mul(releasePeriod)
                            .div(lockPeriod);
                    }
                    blockedAllocationAmount = blockedAllocationAmount.add(lockedBalance).sub(tokensUnlocked);
                }
            }
        }

        return _holderBalance.sub(blockedAllocationAmount);
    }
}