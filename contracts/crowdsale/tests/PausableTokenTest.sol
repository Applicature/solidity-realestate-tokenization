pragma solidity ^0.4.24;

import "../token/erc20/Erc20PausableToken.sol";


contract PausableTokenTest is Erc20PausableToken {
    using SafeMath for uint256;

    uint256 public maxSupply;
    bool public allowedMinting;

    event Mint(
        address indexed holder,
        uint256 tokens
    );

    constructor(
        address _management,
        uint256 _maxSupply,
        uint256 _mintedSupply,
        bool _allowedMinting,
        bool _paused
    ) 
        public
        Erc20PausableToken(_management, _paused)
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

    function shouldBePaused() 
        public 
        isPaused(true) 
        returns (bool) 
    {
        return true;
    }

    function shouldBeUnPaused() 
        public 
        isPaused(false) 
        returns (bool) 
    {
        return true;
    }
}

