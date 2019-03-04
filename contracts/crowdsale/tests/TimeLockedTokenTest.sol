pragma solidity ^0.4.24;

import "../token/erc20/TimeLockedToken.sol";


contract TimeLockedTokenTest is TimeLockedToken {
    using SafeMath for uint256;

    uint256 public maxSupply;
    bool public allowedMinting;

    event Mint(
        address indexed holder,
        uint256 tokens
    );

    constructor(
    	uint256 _time,
        uint256 _maxSupply,
        uint256 _mintedSupply,
        bool _allowedMinting,
    	address _management
    ) 
    	public
    	TimeLockedToken(_time, _management)
    {
        maxSupply = _maxSupply;
        totalSupply_ = totalSupply_.add(_mintedSupply);
        allowedMinting = _allowedMinting;
    }

    function mint(address _holder, uint256 _tokens)
        public
        requirePermission(CAN_MINT_TOKENS)
    {
        require(
            allowedMinting == true &&
            totalSupply_.add(_tokens) <= maxSupply,
            ERROR_NOT_AVAILABLE
        );

        totalSupply_ = totalSupply_.add(_tokens);

        balances[_holder] = balances[_holder].add(_tokens);

        if (totalSupply_ == maxSupply) {
            allowedMinting = false;
        }
        emit Mint(_holder, _tokens);
    }

    function updateTime(uint256 _time) public {
        time = _time;
    }

    function shouldBeLocked() 
    	public 
    	isTimeLocked(msg.sender, true) 
    	returns (bool) 
    {
        return true;
    }

    function shouldBeUnLocked() 
    	public 
    	isTimeLocked(msg.sender, false) 
    	returns (bool) 
    {
        return true;
    }

}

