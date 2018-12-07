pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IERC1358FT.sol";


contract ERC1358FT is IERC1358FT {
//    using SafeMath for uint256;
//
//    // Mapping of Fungible Token holder balances
//    mapping (address => uint256) public _balances;
//
//    // Mapping of Fungible Token allowance
//    mapping (address => mapping (address => uint256)) public _allowed;
//
//    // Total supply of Fungible Token
//    uint256 private totalSupply_;
//
//    /**
//    * @dev Transfer specified amount of tokens from token holder to
//    * receipient, could throw in case function caller has not enough tokens
//    * @notice owner means holder of FT's
//    * @param _to - New holder of FT's
//    * @param _amount - Amount of FT's to be transfered
//    */
//    function transfer(
//        address _to,
//        uint256 _amount
//    )
//        public
//        returns (bool)
//    {
//        require(_amount <= _balances[msg.sender]);
//        require(_to != address(0));
//
//        _balances[msg.sender] = _balances[msg.sender].sub(_amount);
//        _balances[_to] = _balances[_to].add(_amount);
//        emit Transfer(msg.sender, _to, _amount);
//        return true;
//    }
//
//    /**
//    * @dev Allow _operator to withdraw from your account, multiple times,
//    * up to the _amount. If this function is called again it overwrites
//    * the current allowance with _value.
//    * @param _operator - Address that allowed to withdraw from FT owner balance
//    * @param _amount - Amount of approved FT's
//    */
//    function approve(
//        address _operator,
//        uint256 _amount
//    )
//        public
//        returns (bool)
//    {
//        require(_operator != address(0));
//        _allowed[msg.sender][_operator] = _amount;
//        emit Approval(msg.sender, _operator, _amount);
//        return true;
//    }
//
//    /**
//    * @dev Transfer specified amount of tokens from token holder to receipient,
//    * function caller address is approved address
//    * @notice Allowance balance will be decreased with _amount
//    * @param _from - Holder of FT's to transfer from
//    * @param _to - New holder of FT's to transfer to
//    * @param _amount - Amount of FT's to be transfered
//    */
//    function transferFrom(
//        address _from,
//        address _to,
//        uint256 _amount
//    )
//        public
//        returns (bool)
//    {
//        require(_amount <= _balances[_from]);
//        require(_amount <= _allowed[_from][msg.sender]);
//        require(_to != address(0));
//
//        _balances[_from] = _balances[_from].sub(_amount);
//        _balances[_to] = _balances[_to].add(_amount);
//        _allowed[_from][msg.sender] = _allowed[_from][msg.sender].sub(_amount);
//        emit Transfer(_from, _to, _amount);
//        return true;
//    }
//
//    /**
//    * @dev Increase amount of tokens allowed to be transfered for approved
//    * address from balance of owner
//    * @notice owner means caller address
//    * @param _operator - Approved address
//    * @param _addedAmount - Amount to be added to approved address allowance balance
//    */
//    function increaseAllowance(
//        address _operator,
//        uint256 _addedAmount
//    )
//        public
//        returns (bool)
//    {
//        require(_operator != address(0));
//        _allowed[msg.sender][_operator] = (
//            _allowed[msg.sender][_operator].add(_addedAmount)
//        );
//        emit Approval(msg.sender, _operator, _allowed[msg.sender][_operator]);
//        return true;
//    }
//
//    /**
//    * @dev Decrease amount of tokens allowed to be transfered for approved
//    * address from balance of owner
//    * @notice owner means caller address
//    * @param _operator - Approved address
//    * @param _substractedAmount - Amount to be substracted from approved address allowance balance
//    */
//    function decreaseAllowance(
//        address _operator,
//        uint256 _substractedAmount
//    )
//        public
//        returns (bool)
//    {
//        require(_operator != address(0));
//        _allowed[msg.sender][_operator] = (
//            _allowed[msg.sender][_operator].sub(_substractedAmount)
//        );
//        emit Approval(msg.sender, _operator, _allowed[msg.sender][_operator]);
//        return true;
//    }
//
//    /**
//    * @dev Returns amount of tokens allowed to be transfered for approved address
//    * from balance of owner
//    * @param _owner - Holder of FT's
//    * @param _operator - Approved address
//    */
//    function allowance(
//        address _owner,
//        address _operator
//    )
//        public
//        view
//        returns (uint256)
//    {
//        return _allowed[_owner][_operator];
//    }
}
