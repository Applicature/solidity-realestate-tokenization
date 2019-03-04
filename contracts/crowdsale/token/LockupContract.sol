pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "../Managed.sol";


contract LockupContract is Claimable, Managed {
    using SafeMath for uint256;

    uint256 public lockPeriod;
    uint256 public initialUnlock;
    uint256 public releasePeriod;

    mapping (address => uint256[]) public lockedAmount;

    event Lock(address holderAddress, uint256 amount);

    constructor(
        uint256 _lockPeriod,
        uint256 _initialUnlock,
        uint256 _releasePeriod,
        address _management
    )
        public
        Managed(_management)
    {
        require(_initialUnlock <= 100, ERROR_WRONG_AMOUNT);
        require(_releasePeriod <= _lockPeriod, ERROR_NOT_AVAILABLE);
        lockPeriod = _lockPeriod;
        initialUnlock = _initialUnlock;
        releasePeriod = _releasePeriod;
    }

    function log(address _address, uint256 _amount, uint256 _startingAt)
        public
        requirePermission(CAN_LOCK_TOKENS)
    {
        lockedAmount[_address].push(_startingAt);
        if (initialUnlock > 0) {
            _amount = _amount.mul(uint256(100).sub(initialUnlock)).div(100);
        }
        lockedAmount[_address].push(_amount);
        emit Lock(_address, _amount);
    }

    function isTransferAllowedInternal(
        address _address,
        uint256 _value,
        uint256 _time,
        uint256 _holderBalance
    )
        internal
        view
        returns (bool)
    {
        if (
            hasPermission(_address, EXCLUDED_ADDRESSES) ||
            lockedAmount[_address].length == 0
        ) {
            return true;
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
                        uint256 duration = _time.sub(lockTime).div(releasePeriod);
                        tokensUnlocked = lockedBalance.mul(duration).mul(releasePeriod).div(lockPeriod);
                    }
                    blockedAmount = blockedAmount.add(lockedBalance).sub(tokensUnlocked);
                }
            }
        }

        if (_holderBalance.sub(blockedAmount) >= _value) {
            return true;
        }

        return false;
    }
}