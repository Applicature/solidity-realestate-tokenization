pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../token/erc20/MintableToken.sol";
import "../Management.sol";
import "../Managed.sol";


contract Dividends is Ownable, Managed {

    using SafeMath for uint256;

    struct Checkpoint {
        // `fromBlock` is the block number that the value was generated from
        uint256 fromBlock;
        // `value` is the amount of tokens at a specific block number
        uint256 value;
    }

    mapping(address => Checkpoint[]) public balances;

    // Tracks the history of the `totalSupply` of the token
    Checkpoint[] public totalSupplyHistory;

    struct Dividend {
        uint256 id;

        uint256 block;
        uint256 time;
        uint256 amount;

        uint256 claimedAmount;
        uint256 transferredBack;

        uint256 totalSupply;

    }

    mapping(address => uint256[]) public claimed;

    /* variables */
    Dividend[] dividends;

    /* Events */
    event DividendTransferred(
        uint256 id,
        address indexed _address,
        uint256 _block,
        uint256 _amount,
        uint256 _totalSupply
    );

    event Disbursed(address indexed holder, uint256 value);
    event UnclaimedDividendTransfer(uint256 id, uint256 _value);

    constructor (address _management)
        public
        Managed(_management)
    {}

    function updateValueAtNow(address _holder, uint256 _value)
        public
        requirePermission(CAN_UPDATE_DIVIDENDS)
    {
        Checkpoint[] storage checkpoints = balances[_holder];
        internalUpdateValueAtNow(checkpoints, _value);
    }

    function updateTotalSupplyAtNow(uint256 _totalSupply)
        public
        requirePermission(CAN_UPDATE_DIVIDENDS)
    {
        internalUpdateValueAtNow(totalSupplyHistory, _totalSupply);
    }

    // before running this function approve _dividendAmount
    //for spending by address of Dividend contract

    function addDividend()
        public
        payable
        requirePermission(CAN_CREATE_DIVIDENDS)
    {
        require(msg.value > 0, ERROR_WRONG_AMOUNT);
        uint256 id = dividends.length;
        Management(management).contractRegistry(CONTRACT_TOKEN);
        uint256 currentTotalSupply = StandardToken(
            Management(management).contractRegistry(CONTRACT_TOKEN)
        ).totalSupply();

        dividends.push(
            Dividend(
                id,
                block.number,
                now,
                msg.value,
                0,
                0,
                currentTotalSupply
            )
        );

        emit DividendTransferred(
            id,
            msg.sender,
            block.number,
            msg.value,
            currentTotalSupply
        );
    }

    function balanceOf(address _owner)
        public
        view
        returns (uint256 balance)
    {
        return balanceOfAt(_owner, block.number);
    }

    // get all the unclaimed dividends
    /// @return The number of tokens being claimed
    function claim() public returns (uint256) {
        if (dividends.length == claimed[msg.sender].length) {
            return 0;
        }
        uint256 totalAmount;
        Checkpoint[] storage checkpoints = balances[msg.sender];
        for (
            uint256 i = claimed[msg.sender].length;
            i < dividends.length;
            i++
        ) {
            Dividend storage dividend = dividends[i];
            uint256 amount = calculateAmount(
                checkpoints, dividend.block, dividend.amount
            );
            dividend.claimedAmount = (dividend.claimedAmount).add(amount);
            require(
                dividend.claimedAmount <= dividend.amount,
                ERROR_WRONG_AMOUNT
            );
            claimed[msg.sender].push(i);
            totalAmount = totalAmount.add(amount);
        }
        msg.sender.transfer(totalAmount);
        emit Disbursed(msg.sender, totalAmount);
        return totalAmount;
    }

    // calcualte  claim amount for token holders
    function calculateClaimAmount(address _holder)
        public
        view
        returns (uint256)
    {
        if (dividends.length == claimed[msg.sender].length) {
            return 0;
        }
        uint256 totalAmount;
        Checkpoint[] storage checkpoints = balances[_holder];
        for (uint256 i = claimed[_holder].length; i < dividends.length; i++) {
            Dividend memory dividend = dividends[i];
            uint256 amount = calculateAmount(
                checkpoints,
                dividend.block,
                dividend.amount
            );
            totalAmount = totalAmount.add(amount);
        }
        return totalAmount;
    }

    /// @dev Queries the balance of `_owner` at a specific `_blockNumber`
    /// @param _owner The address from which the balance will be retrieved
    /// @param _blockNumber The block number when the balance is queried
    /// @return The balance at `_blockNumber`
    function balanceOfAt(address _owner, uint256 _blockNumber)
        public
        view
        returns (uint256)
    {
        // These next few lines are used when the balance of the token is
        //  requested before a check point was ever created
        if ((balances[_owner].length == 0)
            || (balances[_owner][0].fromBlock > _blockNumber)) {
            return 0;
            // This will return the expected balance during normal situations
        } else {
            return getValueAt(balances[_owner], _blockNumber);
        }
    }

    /// @notice Total amount of tokens at a specific `_blockNumber`.
    /// @param _blockNumber The block number when the totalSupply is queried
    /// @return The total amount of tokens at `_blockNumber`
    function totalSupplyAt(uint256 _blockNumber) public view returns (uint256) {

        // These next few lines are used when the totalSupply of the token is
        //  requested before a check point was ever created for this token, it
        //  requires that the `parentToken.totalSupplyAt` be queried at the
        //  genesis block for this token as that contains totalSupply of this
        //  token at this block number.
        if ((totalSupplyHistory.length == 0)
            || (totalSupplyHistory[0].fromBlock > _blockNumber)) {
            return 0;
        } else {
            return getValueAt(totalSupplyHistory, _blockNumber);
        }
    }

    /// @dev `getValueAt` retrieves the number of tokens at a given block number
    /// @param _checkpoints The history of values being queried
    /// @param _block The block number to retrieve the value at
    /// @return The number of tokens being queried
    function getValueAt(
        Checkpoint[] storage
        _checkpoints,
        uint256 _block
    )
        internal
        view
        returns (uint256)
    {
        if (_checkpoints.length == 0) return 0;

        // Shortcut for the actual value
        if (_block >= _checkpoints[_checkpoints.length - 1].fromBlock)
            return _checkpoints[_checkpoints.length - 1].value;
        if (_block < _checkpoints[0].fromBlock) return 0;

        // Binary search of the value in the array
        uint256 min = 0;
        uint256 max = _checkpoints.length - 1;
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (_checkpoints[mid].fromBlock <= _block) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        return _checkpoints[min].value;
    }

    /// @dev `internalUpdateValueAtNow` used to update the `balances` map and the
    ///  `totalSupplyHistory`
    /// @param _checkpoints The history of data being updated
    /// @param _value The new number of tokens
    function internalUpdateValueAtNow(
        Checkpoint[] storage _checkpoints,
        uint256 _value
    )
        internal
        returns (bool)
    {
        if (
            (_checkpoints.length == 0)
            || (_checkpoints[_checkpoints.length - 1].fromBlock < block.number)
        ) {
            Checkpoint storage newCheckPoint = _checkpoints[_checkpoints.length++];
            newCheckPoint.fromBlock = uint256(block.number);
            newCheckPoint.value = uint256(_value);
        } else {
            Checkpoint storage oldCheckPoint = _checkpoints[_checkpoints.length - 1];
            oldCheckPoint.value = uint256(_value);
        }
    }

    function calculateAmount(
        Checkpoint[] storage _checkpoints,
        uint256 _blockNumber,
        uint256 _amount
    )
        internal
        view
        returns (uint256 totalAmount)
    {
        if (_checkpoints.length == 0) {
            return 0;
        }
        return _amount
            .mul(getValueAt(_checkpoints, _blockNumber))
            .div(totalSupplyAt(_blockNumber));
    }

}

