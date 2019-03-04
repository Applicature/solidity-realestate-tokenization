pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../agent/CrowdsaleAgent.sol";
import "../allocator/TokenAllocator.sol";
import "../contribution/ContributionForwarder.sol";
import "../pricing/PricingStrategy.sol";
import "./HardCappedCrowdsale.sol";


/// @title RefundableCrowdsale
/// @author Applicature
/// @notice Contract is responsible for collecting, refunding, allocating tokens during different stages of Crowdsale.
/// with hard and soft limits
contract RefundableCrowdsale is HardCappedCrowdsale {
    using SafeMath for uint256;

    uint256 public softCap;
    mapping(address => uint256) public contributorsWei;
    address[] public contributors;

    event Refund(
        address _holder, 
        uint256 _wei, 
        uint256 _tokens
    );

    constructor(
        uint256 _startDate,
        uint256 _endDate,
        bool _allowWhitelisted,
        bool _allowSigned,
        bool _allowAnonymous,
        uint256 _softCap,
        uint256 _hardCap,
        address _management
    )
        public
        HardCappedCrowdsale(
            _startDate,
            _endDate,
            _allowWhitelisted,
            _allowSigned,
            _allowAnonymous,
            _hardCap,
            _management
        )
    {
        softCap = _softCap;
    }

    /// @notice refund ethers to contributor
    function refund() public {
        internalRefund(msg.sender);
    }

    /// @notice refund ethers to delegate
    function delegatedRefund(address _address) public {
        internalRefund(_address);
    }

    /// @return Crowdsale state
    function getState() 
        public 
        view 
        returns (State) 
    {
        State state = super.getState();

        if (state == State.Success) {
            if (!isSoftCapAchieved(0)) {
                return State.Refunding;
            }
        }

        return state;
    }

    function isSoftCapAchieved(uint256 _value) 
        public 
        view 
        returns (bool) 
    {
        if (softCap <= tokensSold.add(_value)) {
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
        require(
            block.timestamp >= startDate &&
            block.timestamp <= endDate,
            ERROR_NOT_AVAILABLE
        );

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
            tokens > 0 && hardCap > tokensSold.add(tokens),
            ERROR_NOT_AVAILABLE
        );

        allocator.allocate(_contributor, tokens, tokensSold);

        tokensSold = tokensSold.add(tokens);

        // transfer only if softcap is reached
        if (isSoftCapAchieved(0)) {
            if (msg.value > 0) {
                contributionForwarder.forward.value(address(this).balance)();
            }
        } else {
            // store contributor if it is not stored before
            if (contributorsWei[_contributor] == 0) {
                contributors.push(_contributor);
            }
            contributorsWei[_contributor] = contributorsWei[_contributor]
                .add(msg.value);
        }
        CrowdsaleAgent(management.contractRegistry(CONTRACT_AGENT))
            .onContribution(
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

    function internalRefund(address _holder)
        internal
        requireContractExistsInRegistry(CONTRACT_AGENT)
    {
        updateState();
        require(block.timestamp > endDate, ERROR_NOT_AVAILABLE);
        require(!isSoftCapAchieved(0), ERROR_NOT_AVAILABLE);

        uint256 value = contributorsWei[_holder];

        require(value > 0, ERROR_WRONG_AMOUNT);

        contributorsWei[_holder] = 0;

        uint256 burnedTokens = CrowdsaleAgent(
            management.contractRegistry(CONTRACT_AGENT)
        ).onRefund(_holder, 0);

        _holder.transfer(value);

        emit Refund(_holder, value, burnedTokens);
    }
}

