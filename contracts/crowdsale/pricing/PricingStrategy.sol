pragma solidity ^0.4.23;


/// @title PricingStrategy
/// @author Applicature
/// @notice Contract is responsible for calculating tokens amount depending on different criterias
/// @dev Base class
contract PricingStrategy {

    function isInitialized() public view returns (bool);

    function getTokens(
        address _contributor,
        uint256 _tokensAvailable, uint256 _tokensSold,
        uint256 _weiAmount, uint256 _collectedWei
    )
        public
        view
        returns (
            uint256 tokens,
            uint256 tokensExludingBonus,
            uint256 bonus
        );

    function getWeis(
        uint256 _collectedWei,
        uint256 _tokensSold,
        uint256 _tokens
    )
        public
        view
        returns (
            uint256 weiAmount,
            uint256 tokensBonus
        );
}
