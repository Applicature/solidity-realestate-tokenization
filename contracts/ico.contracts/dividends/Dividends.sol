pragma solidity ^0.4.18;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../token/erc20/minime/MiniMeERC20.sol";


// TODO make implementation on base not MINIME
// Dividends 
// ask Roma and Sasha more

/// @title Dividends
/// @author Applicature
///// @notice Contract is used only for collecting funding and paying dividends/share profit
contract Dividends is Ownable {

    constructor() 
        public 
    {
        
    }
//
//    using SafeMath for uint256;
//
//    MiniMeERC20 public miniMeToken;
//
//    struct Dividend {
//        uint256 blockNumber;
//        uint256 timestamp;
//        uint256 amount;
//        uint256 claimedAmount;
//        uint256 totalSupply;
//        bool recycled;
//        mapping(address => bool) claimed;
//    }
//
//    Dividend[] public dividends;
//
//    mapping(address => uint256) public dividendsClaimed;
//
//    // start point for dividends pay out
//    // after round zero update it every quarter
//    uint256 internal dateTimeWhenRoundZeroOrQuarterFinished;
//
//    /// configurable through setter
//    uint256 public recycleTime = 90 days;
//
//    event DividendDeposited(address indexed _investor, uint256 _blockNumber, uint256 _amount, uint256 _totalSupply, uint256 _dividendIndex);
//    event DividendClaimed(address indexed _claimer, uint256 _dividendIndex, uint256 _claim);
//    event DividendRecycled(address indexed _recycler, uint256 _blockNumber, uint256 _amount, uint256 _totalSupply, uint256 _dividendIndex);
//
//    modifier validDividendIndex(uint256 _dividendIndex) {
//        require(_dividendIndex < dividends.length);
//        _;
//    }
//
//    function() public payable {
//
//    }
//
//    /// @notice set recycle time
//    function setRecycleTime(uint256 _period) public onlyOwner {
//        require(_period != 0);
//        recycleTime = _period;
//    }
//
//    /// @notice set token
//    function setToken(address _token) public onlyOwner {
//        require(_token != address(0));
//        miniMeToken = MiniMeERC20(_token);
//    }
//
//    /// @notice set new value for `dateTimeWhenRoundZeroOrQuarterFinished`
//    function setBindingDate(uint256 _data) public onlyOwner {
//        dateTimeWhenRoundZeroOrQuarterFinished = _data;
//    }
//
//    /// @notice 1st case(preferable): Admin/Owner send ethers to this contract in order to share with investors
//    /// this function called by platform at the end of quarter
//    /// it deposits the certain amount to pay dividends so we always knew what amount need to be shared in the period
//    /// it sets new data for dividends
//    /// it starts the new time period
//    function payableDepositDividend() public payable onlyOwner {
//        uint256 currentSupply = miniMeToken.totalSupplyAt(block.number);
//        uint256 dividendIndex = dividends.length;
//        uint256 blockNumber = SafeMath.sub(block.number, 1);
//        dividends.push(
//            Dividend(
//                blockNumber,
//                getNow(),
//                msg.value,
//                0,
//                currentSupply,
//                false
//            )
//        );
//        DividendDeposited(msg.sender, blockNumber, msg.value, currentSupply, dividendIndex);
//    }
//
//    /// @notice 2nd case(less preferable but possible): Contract collects money during the period
//    ///  Admin/Owner calls this function in order to set up dividends data,
//    /// it uses the current balance as amount for dividends, since next moment it collects money for next
//    /// pay period
//    /// it starts the new time period
//    /// earlier then 90 days platform cannot call it
//    function depositDividend() public onlyOwner {
//        require((now - dateTimeWhenRoundZeroOrQuarterFinished) > recycleTime);
//
//        uint256 currentSupply = miniMeToken.totalSupplyAt(block.number);
//        uint256 dividendIndex = dividends.length;
//        uint256 blockNumber = SafeMath.sub(block.number, 1);
//        uint256 currentBalance = this.balance;
//        dividends.push(
//            Dividend(
//                blockNumber,
//                getNow(),
//                currentBalance,
//                0,
//                currentSupply,
//                false
//            )
//        );
//        dateTimeWhenRoundZeroOrQuarterFinished = now;
//        DividendDeposited(msg.sender, blockNumber, currentBalance, currentSupply, dividendIndex);
//    }
//
//    /// @notice the claimer always needs to call into the contract to claim their dividend
//    /// claim dividends for more than one pay period
//    function claimDividendAll() public {
//        require(dividendsClaimed[msg.sender] < dividends.length);
//        for (uint i = dividendsClaimed[msg.sender]; i < dividends.length; i++) {
//            if ((dividends[i].claimed[msg.sender] == false) && (dividends[i].recycled == false)) {
//                dividendsClaimed[msg.sender] = SafeMath.add(i, 1);
//                claimDividend(i);
//            }
//        }
//    }
//
//    /// @notice the claimer always needs to call into the contract to claim their dividend
//    /// claim dividends for one pay period
//    function claimDividend(uint256 _dividendIndex) public validDividendIndex(_dividendIndex) {
//        Dividend dividend = dividends[_dividendIndex];
//        require(dividend.claimed[msg.sender] == false);
//        require(dividend.recycled == false);
//        uint256 balance = miniMeToken.balanceOfAt(msg.sender, dividend.blockNumber);
//        uint256 claim = balance.mul(dividend.amount).div(dividend.totalSupply);
//        dividend.claimed[msg.sender] = true;
//        dividend.claimedAmount = dividend.claimedAmount.add(claim);
//        if (claim > 0) {
//            msg.sender.transfer(claim);
//            DividendClaimed(msg.sender, _dividendIndex, claim);
//        }
//    }
//
//    function recycleDividend(uint256 _dividendIndex) public onlyOwner validDividendIndex(_dividendIndex) {
//        Dividend dividend = dividends[_dividendIndex];
//        require(dividend.recycled == false);
//        require(dividend.timestamp < SafeMath.sub(now, recycleTime));
//        dividends[_dividendIndex].recycled = true;
//        uint256 currentSupply = miniMeToken.totalSupplyAt(block.number);
//        uint256 remainingAmount = SafeMath.sub(dividend.amount, dividend.claimedAmount);
//        uint256 dividendIndex = dividends.length;
//        dividends.push(
//            Dividend(
//                block.number,
//                now,
//                remainingAmount,
//                0,
//                currentSupply,
//                false
//            )
//        );
//        DividendRecycled(msg.sender, block.number, remainingAmount, currentSupply, dividendIndex);
//    }
//
//    function getNow() internal constant returns (uint256) {
//        return now;
//    }
//
}
