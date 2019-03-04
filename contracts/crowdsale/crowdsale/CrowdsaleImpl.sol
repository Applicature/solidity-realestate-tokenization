pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "../allocator/TokenAllocator.sol";
import "../agent/CrowdsaleAgent.sol";
import "../contribution/ContributionForwarder.sol";
import "../pricing/PricingStrategy.sol";
import "./Crowdsale.sol";
import "../Managed.sol";


/// @title Crowdsale
/// @author Applicature
/// @notice Contract is responsible for collecting, refunding, allocating tokens during different stages of Crowdsale.
contract CrowdsaleImpl is Crowdsale, Claimable, Managed {
    using SafeMath for uint256;

    State public currentState;
    bool public finalized;
    uint256 public startDate;
    uint256 public endDate;
    bool public allowWhitelisted;
    bool public allowSigned;
    bool public allowAnonymous;

    event Contribution(
        address _contributor,
        uint256 _wei,
        uint256 _tokensExcludingBonus,
        uint256 _bonus
    );

    constructor(
        uint256 _startDate,
        uint256 _endDate,
        bool _allowWhitelisted,
        bool _allowSigned,
        bool _allowAnonymous,
        address _management
    ) 
        public 
        Managed(_management) 
    {
        startDate = _startDate;
        endDate = _endDate;

        allowWhitelisted = _allowWhitelisted;
        allowSigned = _allowSigned;
        allowAnonymous = _allowAnonymous;

        currentState = State.Unknown;
    }

    /// @notice default payable function
    function() 
        public 
        payable 
    {
        require(allowWhitelisted || allowAnonymous, ERROR_ACCESS_DENIED);

        if (!allowAnonymous && allowWhitelisted) {
            require(hasPermission(msg.sender, WHITELISTED), ERROR_ACCESS_DENIED);
        }

        internalContribution(msg.sender, msg.value);
    }

    /// @notice allows external user to do contribution
    function externalContribution(
        address _contributor, 
        uint256 _wei
    )
        public 
        payable 
        requirePermission(EXTERNAL_CONTRIBUTORS) 
    {
        internalContribution(_contributor, _wei);
    }

    /// @notice allows to do signed contributions
    function contribute(uint8 _v, bytes32 _r, bytes32 _s) 
        public 
        payable 
    {
        address recoveredAddress = verify(
            msg.sender, 
            _v, 
            _r, 
            _s
        );

        require(hasPermission(recoveredAddress, SIGNERS), ERROR_ACCESS_DENIED);
        internalContribution(msg.sender, msg.value);
    }

    /// @notice Crowdsale state
    function updateState() public {
        State state = getState();

        if (currentState != state) {
            if (management.contractRegistry(CONTRACT_AGENT) != address(0)) {
                CrowdsaleAgent(management.contractRegistry(CONTRACT_AGENT)).onStateChange(state);
            }
            currentState = state;
        }
    }

    /// @notice check sign
    function verify(
        address _sender, 
        uint8 _v, 
        bytes32 _r, 
        bytes32 _s
    )
        public
        view
        returns (address)
    {
        bytes32 hash = keccak256(abi.encodePacked(this, _sender));

        bytes memory prefix = "\x19Ethereum Signed Message:\n32";

        return ecrecover(
            keccak256(abi.encodePacked(prefix, hash)),
            _v, 
            _r, 
            _s
        );
    }

    /// @return Crowdsale state
    function getState() public view returns (State) {
        if (finalized) {
            return State.Finalized;
        } else if (TokenAllocator(management.contractRegistry(CONTRACT_ALLOCATOR)).isInitialized() == false) {
            return State.Initializing;
        } else if (ContributionForwarder(management.contractRegistry(CONTRACT_FORWARDER)).isInitialized() == false) {
            return State.Initializing;
        } else if (PricingStrategy(management.contractRegistry(CONTRACT_PRICING)).isInitialized() == false) {
            return State.Initializing;
        } else if (block.timestamp < startDate) {
            return State.BeforeCrowdsale;
        } else if (block.timestamp >= startDate && block.timestamp <= endDate) {
            return State.InCrowdsale;
        } else if (block.timestamp > endDate) {
            return State.Success;
        }

        return State.Unknown;
    }

    function isInitialized() public view returns (bool) {
        return (
            management.contractRegistry(CONTRACT_TOKEN) != address(0) &&
            management.contractRegistry(CONTRACT_AGENT) != address(0) &&
            management.contractRegistry(CONTRACT_FORWARDER) != address(0) &&
            management.contractRegistry(CONTRACT_PRICING) != address(0) &&
            management.contractRegistry(CONTRACT_ALLOCATOR) != address(0)
        );
    }

    function internalContribution(
        address _contributor, 
        uint256 _wei
    )
        internal
    {
        require(getState() == State.InCrowdsale, ERROR_ACCESS_DENIED);
        
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

        require(tokens > 0, ERROR_WRONG_AMOUNT);
        allocator.allocate(_contributor, tokens, tokensSold);
        tokensSold = tokensSold.add(tokens);

        if (msg.value > 0) {
            contributionForwarder.forward.value(msg.value)();
        }

        emit Contribution(
            _contributor, 
            _wei, 
            tokensExcludingBonus, 
            bonus
        );
    }
}