pragma solidity ^0.4.24;

import "./PricingStrategy.sol";
import "./ExchangeContract.sol";


/**
 * @title PricingStrategy
 * @author Applicature
 * @notice Contract is responsible for calculating tokens amount depending on price in USD
 * @dev implementation
 */
contract PricingStrategyImpl is PricingStrategy, ExchangeContract {

    uint256 public constant TIER_ELEMENTS_AMOUNT = 9;

    struct Tier {
        uint256 tokenInCurrency;
        uint256 maxTokensCollected;
        uint256 bonusCap;
        uint256 discountPercents;
        uint256 bonusPercents;
        uint256 minInvestInCurrency;
        uint256 maxInvestInCurrency;
        uint256 startTime;
        uint256 endTime;
    }

    Tier[] public tiers;
    uint256 public tokenDecimals;
    uint256 public percentageAbsMax;
    bool tiersChangingAllowed;
    bool updateChangeRateAllowed;

    constructor(
        address _management,
        bool _tiersChangingAllowed,
        bool _updateChangeRateAllowed,
        uint256[] _tiers,
        uint256 _etherPriceInCurrency,
        uint256 _currencyDecimals,
        uint256 _tokenDecimals,
        uint256 _percentageAbsMax
    )
        public
        ExchangeContract(_management, _etherPriceInCurrency, _currencyDecimals)
    {
        require(_tiers.length % TIER_ELEMENTS_AMOUNT == 0, ERROR_WRONG_AMOUNT);
        require(_tokenDecimals > 0, ERROR_WRONG_AMOUNT);
        require(_percentageAbsMax > 0, ERROR_WRONG_AMOUNT);

        tokenDecimals = _tokenDecimals;
        percentageAbsMax = _percentageAbsMax;
        tiersChangingAllowed = _tiersChangingAllowed;
        updateChangeRateAllowed = _updateChangeRateAllowed;

        uint256 length = _tiers.length.div(TIER_ELEMENTS_AMOUNT);
        for (uint256 i = 0; i < length; i++) {
            require(
                _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(1)] > 0 &&
                _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(3)] < _percentageAbsMax &&
                _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(4)] < _percentageAbsMax &&
                _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(7)] > 0 &&
                _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(8)] > _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(7)],
                ERROR_WRONG_AMOUNT
            );
            require (
                _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(6)] == 0 ||
                _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(6)] >= _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(5)],
                ERROR_WRONG_AMOUNT
            );
            tiers.push(
                Tier(
                    _tiers[i.mul(TIER_ELEMENTS_AMOUNT)],//tokenInCurrency
                    _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(1)],//maxTokensCollected
                    _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(2)],//bonusCap
                    _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(3)],//discountPercents
                    _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(4)],//bonusPercents
                    _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(5)],//minInvestInCurrency
                    _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(6)],//maxInvestInCurrency
                    _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(7)],//startTime
                    _tiers[i.mul(TIER_ELEMENTS_AMOUNT).add(8)]//endTime
                )
            );
        }
    }

    function updateDates(uint8 _tierId, uint256 _start, uint256 _end)
        public
        onlyOwner()
    {
        require (
            _start != 0 &&
            _start < _end &&
            _tierId < tiers.length,
            ERROR_WRONG_AMOUNT
        );
        Tier storage tier = tiers[_tierId];
        tier.startTime = _start;
        tier.endTime = _end;
    }

    function updateTier(
        uint256 _tierId,
        uint256 _tokenInCurrency,
        uint256 _maxTokensCollected,
        uint256 _bonusCap,
        uint256 _discountPercents,
        uint256 _bonusPercents,
        uint256 _minInvestInCurrency,
        uint256 _maxInvestInCurrency,
        uint256 _startTime,
        uint256 _endTime
    )
        public
        onlyOwner()
    {
        require(
            tiersChangingAllowed == true &&
            _maxTokensCollected >= _bonusCap &&
            _discountPercents < percentageAbsMax &&
            _bonusPercents < percentageAbsMax &&
            (_maxInvestInCurrency == 0 || _maxInvestInCurrency >= _minInvestInCurrency) &&
            _startTime != 0 &&
            _startTime < _endTime &&
            _tierId < tiers.length,
            ERROR_WRONG_AMOUNT
        );

        Tier storage tier = tiers[_tierId];
        tier.tokenInCurrency = _tokenInCurrency;
        tier.maxTokensCollected = _maxTokensCollected;
        tier.bonusCap = _bonusCap;
        tier.discountPercents = _discountPercents;
        tier.bonusPercents = _bonusPercents;
        tier.minInvestInCurrency = _minInvestInCurrency;
        tier.maxInvestInCurrency = _maxInvestInCurrency;
        tier.startTime = _startTime;
        tier.endTime = _endTime;
    }

    function setEtherInCurrency(string _price)
        public
        requirePermission(CAN_UPDATE_PRICE)
    {
        require(updateChangeRateAllowed == true, ERROR_NOT_AVAILABLE);
        super.setEtherInCurrency(_price);
    }

    function isInitialized()
        public
        view
        returns (bool)
    {
        return tiers.length > 0;
    }

    function getArrayOfTiers()
        public
        view
        returns (uint256[])
    {
        uint256[] memory tiersData = new uint256[](
            getTiersAmount().mul(TIER_ELEMENTS_AMOUNT)
        );

        uint256 j = 0;
        for (uint256 i = 0; i < tiers.length; i++) {
            tiersData[j++] = uint256(tiers[i].tokenInCurrency);
            tiersData[j++] = uint256(tiers[i].maxTokensCollected);
            tiersData[j++] = uint256(tiers[i].bonusCap);
            tiersData[j++] = uint256(tiers[i].discountPercents);
            tiersData[j++] = uint256(tiers[i].bonusPercents);
            tiersData[j++] = uint256(tiers[i].minInvestInCurrency);
            tiersData[j++] = uint256(tiers[i].maxInvestInCurrency);
            tiersData[j++] = uint256(tiers[i].startTime);
            tiersData[j++] = uint256(tiers[i].endTime);
        }

        return tiersData;
    }

    function getTiersAmount()
        public
        view
        returns (uint256)
    {
        return tiers.length;
    }

    function getTierIndex(uint256 _tokensSold)
        public
        view
        returns (uint256)
    {
        for (uint256 i = 0; i < tiers.length; i++) {
            if (
                block.timestamp >= tiers[i].startTime &&
                block.timestamp < tiers[i].endTime &&
                tiers[i].maxTokensCollected > _tokensSold
            ) {
                return i;
            }
        }

        return tiers.length;
    }

    function getActualTierIndex(uint256 _tokensSold)
        public
        view
        returns (uint256)
    {
        for (uint256 i = 0; i < tiers.length; i++) {
            if (
                block.timestamp >= tiers[i].startTime &&
                block.timestamp < tiers[i].endTime &&
                tiers[i].maxTokensCollected > _tokensSold ||
                block.timestamp < tiers[i].startTime
            ) {
                return i;
            }
        }

        return tiers.length.sub(1);
    }

    function getTierActualDates(uint256 _tokensSold)
        public
        view
        returns (uint256 startTime, uint256 endTime)
    {
        uint256 tierIndex = getActualTierIndex(_tokensSold);
        startTime = tiers[tierIndex].startTime;
        endTime = tiers[tierIndex].endTime;
    }

    function getCurrencyAmount(uint256 _weiAmount)
        public
        view
        returns (uint256)
    {
        return _weiAmount.mul(etherPriceInCurrency).div(1 ether);
    }

    function getTokenInCurrency(uint256 _tierIndex)
        public
        view
        returns (uint256)
    {
        if (_tierIndex < tiers.length) {
            if (getDiscount(_tierIndex) > 0) {

                return tiers[_tierIndex].tokenInCurrency.mul(
                    percentageAbsMax.sub(getDiscount(_tierIndex))
                ).div(percentageAbsMax);
            }

            return tiers[_tierIndex].tokenInCurrency;
        }
    }

    function getDiscount(uint256 _tierIndex)
        public
        view
        returns (uint256)
    {
        if (_tierIndex < uint256(tiers.length)) {
            return tiers[_tierIndex].discountPercents;
        }
    }

    function getMinEtherInvest(uint256 _tierIndex)
        public
        view
        returns (uint256)
    {
        if (
            _tierIndex < uint256(tiers.length) &&
            tiers[_tierIndex].minInvestInCurrency > 0
        ) {
            return tiers[_tierIndex].minInvestInCurrency
                .mul(1 ether)
                .div(etherPriceInCurrency);
        }
    }

    function getMaxEtherInvest(uint256 _tierIndex)
        public
        view
        returns (uint256)
    {
        if (
            _tierIndex < uint256(tiers.length) &&
            tiers[_tierIndex].maxInvestInCurrency > 0
        ) {
            return tiers[_tierIndex].maxInvestInCurrency
                .mul(1 ether)
                .div(etherPriceInCurrency);
        }
    }

    function getRemainingTokens(uint256 _tokensSold)
        public
        view
        returns (uint256)
    {
        return tiers[tiers.length.sub(1)]
            .maxTokensCollected
            .sub(_tokensSold);
    }

    function getTierUnsoldTokens(uint256 _tokensSold)
        public
        view
        returns (uint256)
    {
        return tiers[getActualTierIndex(_tokensSold)]
            .maxTokensCollected
            .sub(_tokensSold);
    }

    function calculateBonusAmount(
        uint256 _tierIndex,
        uint256 _tokens,
        uint256 _bonusProduced
    )
        public
        view
        returns (uint256)
    {
        if (_bonusProduced.add(_tokens) <= tiers[_tierIndex].bonusCap) {
            return _tokens
                .mul(tiers[_tierIndex].bonusPercents)
                .div(percentageAbsMax);
        }

        return tiers[_tierIndex]
            .bonusCap
            .sub(_bonusProduced)
            .mul(tiers[_tierIndex].bonusPercents)
            .div(percentageAbsMax);
    }

    function getTokensWithoutRestrictions(
        uint256 _weiAmount,
        uint256 _tokensSold
    )
        public
        view
        returns (
            uint256 tokens,
            uint256 tokensExcludingBonus,
            uint256 bonus
        )
    {
        if (_weiAmount == 0) {
            return (0, 0, 0);
        }

        uint256 tierIndex = getActualTierIndex(_tokensSold);

        tokensExcludingBonus = getCurrencyAmount(_weiAmount)
            .mul(10 ** tokenDecimals)
            .div(getTokenInCurrency(tierIndex));
        bonus = tokensExcludingBonus
            .mul(tiers[tierIndex].bonusPercents)
            .div(percentageAbsMax);
        tokens = tokensExcludingBonus.add(bonus);
    }

    function getTokens(
        address,
        uint256 _tokensAvailable,
        uint256 _tokensSold,
        uint256 _weiAmount,
        uint256 _bonusProduced
    )
        public
        view
        returns (
            uint256 tokens,
            uint256 tokensExcludingBonus,
            uint256 bonus
        )
    {
        if (_weiAmount == 0) {
            return (0, 0, 0);
        }

        uint256 tierIndex = getTierIndex(_tokensSold);
        if (tierIndex == tiers.length) {
            return (0, 0, 0);
        }

        uint256 currencyAmount = getCurrencyAmount(_weiAmount);
        if (
            currencyAmount < tiers[tierIndex].minInvestInCurrency ||
            tiers[tierIndex].maxInvestInCurrency > 0 &&
            currencyAmount > tiers[tierIndex].maxInvestInCurrency
        ) {
            return (0, 0, 0);
        }

        uint256 remainingCurrencyAmount = currencyAmount;
        uint256 newTokensSold = _tokensSold;
        uint256 tierTokens;
        uint256 diff;

        for (uint256 i = tierIndex; i < tiers.length; i++) {
            tierTokens = remainingCurrencyAmount
                .mul(10 ** tokenDecimals)
                .div(getTokenInCurrency(i));

            if (
                tiers[i].startTime < block.timestamp &&
                tiers[i].endTime > block.timestamp
            ) {
                if (newTokensSold.add(tierTokens) > tiers[i].maxTokensCollected) {
                    diff = tiers[i].maxTokensCollected.sub(newTokensSold);
                    remainingCurrencyAmount = remainingCurrencyAmount.sub(
                        diff.mul(getTokenInCurrency(i)).div(10 ** tokenDecimals)
                    );
                } else {
                    diff = tierTokens;
                    remainingCurrencyAmount = 0;
                }

                tokensExcludingBonus = tokensExcludingBonus.add(diff);
                bonus = bonus.add(calculateBonusAmount(i, diff, _bonusProduced));

                if (remainingCurrencyAmount == 0) {
                    break;
                }
            }
        }

        tokens = tokens.add(tokensExcludingBonus.add(bonus));

        if (remainingCurrencyAmount > 0 || tokens > _tokensAvailable) {
            return (0, 0, 0);
        }
    }

    function getWeis(
        uint256 _bonusProduced,
        uint256 _tokensSold,
        uint256 _tokens
    )
        public
        view
        returns (
            uint256 totalWeiAmount,
            uint256 tokensBonus
        )
    {
        if (_tokens == 0) {
            return (0, 0);
        }

        uint256 tierIndex = getTierIndex(_tokensSold);
        if (tierIndex == tiers.length) {
            return (0, 0);
        }

        uint256 remainingTokens = _tokens;
        uint256 newTokensSold = _tokensSold;
        uint256 diff;

        for (uint i = tierIndex; i < tiers.length; i++) {
            if (
                tiers[i].startTime < block.timestamp &&
                tiers[i].endTime > block.timestamp
            ) {
                if (
                    newTokensSold.add(remainingTokens) >
                    tiers[i].maxTokensCollected
                ) {
                    diff = tiers[i].maxTokensCollected.sub(newTokensSold);
                    remainingTokens = remainingTokens.sub(diff);
                } else {
                    diff = remainingTokens;
                    remainingTokens = 0;
                }

                totalWeiAmount = totalWeiAmount.add(
                    diff.mul(getTokenInCurrency(i))
                        .div(10 ** tokenDecimals)
                        .mul(1 ether).div(etherPriceInCurrency)
                );
                tokensBonus = tokensBonus
                    .add(calculateBonusAmount(i, diff, _bonusProduced));

                if (remainingTokens == 0) {
                    break;
                }
            }
        }

        uint256 currencyAmount = getCurrencyAmount(totalWeiAmount);
        if (
            currencyAmount < tiers[tierIndex].minInvestInCurrency ||
            tiers[tierIndex].maxInvestInCurrency > 0 &&
            currencyAmount > tiers[tierIndex].maxInvestInCurrency
        ) {
            return (0, 0);
        }

        if (remainingTokens > 0) {
            return (0, 0);
        }
    }

}
