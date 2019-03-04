pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./CrowdsaleImpl.sol";
import "../allocator/TokenAllocator.sol";
import "../contribution/ContributionForwarder.sol";
import "../pricing/PricingStrategy.sol";
import "../agent/CrowdsaleAgent.sol";


/// @title HardCappedCrowdsale
/// @author Applicature
/// @notice Contract is responsible for collecting, refunding, allocating tokens during different stages of Crowdsale.
/// with hard limit
//@todo should use one Impl for multiple and single
contract HardCappedCrowdsale is CrowdsaleImpl {
    using SafeMath for uint256;

    uint256 public hardCap;

    constructor(
        uint256 _startDate,
        uint256 _endDate,
        bool _allowWhitelisted,
        bool _allowSigned,
        bool _allowAnonymous,
        uint256 _hardCap,
        address _management
    ) 
        public 
        CrowdsaleImpl(
            _startDate,
            _endDate,
            _allowWhitelisted,
            _allowSigned,
            _allowAnonymous,
            _management
        ) 
    {
        hardCap = _hardCap;
    }

    /// @return Crowdsale state
    function getState() 
        public 
        view 
        returns (State) 
    {
        State state = super.getState();

        if (state == State.InCrowdsale) {
            if (isHardCapAchieved(0)) {
                return State.Success;
            }
        }

        return state;
    }

    function isHardCapAchieved(uint256 _value) 
        public 
        view 
        returns (bool) 
    {
        if (hardCap <= tokensSold.add(_value)) {
            return true;
        }
        return false;
    }

    function internalContribution(
        address _contributor, 
        uint256 _wei
    )
        internal
    {
        require(getState() == State.InCrowdsale, ERROR_NOT_AVAILABLE);
        
        TokenAllocator allocator = TokenAllocator(
            management.contractRegistry(CONTRACT_ALLOCATOR)
        );
        
        ContributionForwarder contributionForwarder = ContributionForwarder(
            management.contractRegistry(CONTRACT_FORWARDER)
        );

        uint256 tokensAvailable = allocator.tokensAvailable(tokensSold);
        uint256 collectedWei = contributionForwarder.weiCollected();
        uint256 tokens;
        uint256 tokensExcludingBonus;
        uint256 bonus;

        (tokens, tokensExcludingBonus, bonus) = PricingStrategy(
            management.contractRegistry(CONTRACT_PRICING)
        ).getTokens(
            _contributor, 
            tokensAvailable, 
            tokensSold, 
            _wei, 
            collectedWei
        );

        require(
            tokens <= tokensAvailable && 
            tokens > 0 && 
            false == isHardCapAchieved(tokens.sub(1)), 
            ERROR_NOT_AVAILABLE
        );

        allocator.allocate(_contributor, tokens, tokensSold);
        tokensSold = tokensSold.add(tokens);

        if (msg.value > 0) {
            contributionForwarder.forward.value(msg.value)();
        }

        CrowdsaleAgent(
            management.contractRegistry(CONTRACT_AGENT)
        ).onContribution(
            _contributor,
            _wei,
            tokensExcludingBonus,
            bonus
        );
        
        emit Contribution(
            _contributor, 
            _wei, 
            tokensExcludingBonus, 
            bonus
        );
    }
}