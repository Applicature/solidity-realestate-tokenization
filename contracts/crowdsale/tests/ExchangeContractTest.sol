pragma solidity ^0.4.23;

import "../pricing/ExchangeContract.sol";


contract ExchangeContractTest is ExchangeContract {

    constructor(
        address _management, 
        uint256 _etherPriceInCurrency, 
        uint256 _currencyDecimals
    )
        public
        ExchangeContract(
            _management,
            _etherPriceInCurrency, 
            _currencyDecimals
        )
    {
    
    }
    
    function parseIntTest(
        string _a, 
        uint _b
    ) 
        public 
        pure 
        returns (uint) 
    {
        return parseInt(_a, _b);
    }
}