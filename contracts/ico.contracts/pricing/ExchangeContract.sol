pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../Managed.sol";


contract ExchangeContract is Claimable, Managed {
    using SafeMath for uint256;

    uint256 public etherPriceInCurrency;
    uint256 public currencyDecimals;
    uint256 public priceUpdateAt;

    event NewPriceTicker(string _price);

    constructor(
        address _management,
        uint256 _etherPriceInCurrency,
        uint256 _currencyDecimals
    )
        public
        Managed(_management)
    {
        require(_etherPriceInCurrency > 0, ERROR_WRONG_AMOUNT);
        require(_currencyDecimals > 0, ERROR_WRONG_AMOUNT);

        etherPriceInCurrency = _etherPriceInCurrency;
        currencyDecimals = _currencyDecimals;
        priceUpdateAt = block.timestamp;
    }

    function setEtherInCurrency(string _price)
        public
        requirePermission(CAN_UPDATE_PRICE)
    {
        bytes memory bytePrice = bytes(_price);
        uint256 dot = bytePrice.length.sub(uint256(currencyDecimals).add(1));

        require(0x2e == uint(bytePrice[dot]), ERROR_WRONG_AMOUNT);

        etherPriceInCurrency = parseInt(_price, currencyDecimals);

        require(etherPriceInCurrency > 0, ERROR_WRONG_AMOUNT);

        priceUpdateAt = block.timestamp;

        emit NewPriceTicker(_price);
    }

    function parseInt(
        string _a, 
        uint _b
    ) 
        internal 
        pure 
        returns (uint) 
    {
        bytes memory bresult = bytes(_a);
        uint res = 0;
        bool decimals = false;
        for (uint i = 0; i < bresult.length; i++) {
            if ((bresult[i] >= 48) && (bresult[i] <= 57)) {
                if (decimals) {
                    if (_b == 0) break;
                    else _b--;
                }
                res *= 10;
                res += uint(bresult[i]) - 48;
            } else if (bresult[i] == 46) {
                decimals = true;
            }
        }
        if (_b > 0) {
            res *= 10 ** _b;
        }

        return res;
    }
}
