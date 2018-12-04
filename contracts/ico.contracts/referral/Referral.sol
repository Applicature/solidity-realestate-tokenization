pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../allocator/TokenAllocator.sol";
import "../Managed.sol";


contract Referral is Managed {
    using SafeMath for uint256;

    mapping(address => bool) public claimed;
    
    mapping(address => uint256) public claimedBalances;

    bool couldClaimOnlyOnce;

    constructor(
        address _management,
        bool _couldClaimOnlyOnce
    ) 
        public 
        Managed(_management) 
    {
        couldClaimOnlyOnce = _couldClaimOnlyOnce;
    }

    event Claimed(
        address claimer,
        uint256 claimed
    );

    /// @notice check sign
    function verify(
        address _sender,
        uint256 _amount,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
        public
        pure
        returns (address)
    {
        bytes32 hash = keccak256(abi.encodePacked(_sender, _amount));
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";

        return ecrecover(
            keccak256(abi.encodePacked(prefix, hash)), 
            _v, 
            _r, 
            _s
        );
    }

    function claim(
        address _address,
        uint256 _amount,
        uint8 _v,
        bytes32 _r,
        bytes32 _s,
        address _crowdsale
    )
        public
    {
        require(
            _address == msg.sender, ERROR_ACCESS_DENIED 
        );

        if (couldClaimOnlyOnce == true) {
            require(claimed[_address] == false, ERROR_ACCESS_DENIED);
        }

        //check if signer address has a permission to sign the transaction
        require(
            hasPermission(
                verify(
                    msg.sender, 
                    _amount, 
                    _v, 
                    _r, 
                    _s
                ), 
                SIGNERS
            ),
            ERROR_ACCESS_DENIED
        );

        //TODO change 28 to real number of already allocated referral tokens from starage contract
        uint256 allocatedTokens = _amount;
        
        TokenAllocator allocator = TokenAllocator(
            management.contractRegistry(_crowdsale, CONTRACT_ALLOCATOR)
        );
        //check tokens amount
        require(
            _amount > 0 && allocator.tokensAvailable(allocatedTokens) >= _amount,
            ERROR_WRONG_AMOUNT
        );

        //TODO should be checked with storage contract regarding stateless
        claimed[_address] = true;
        claimedBalances[_address] = claimedBalances[_address].add(_amount);

        allocator.allocate(_address, _amount, allocatedTokens);
    }

}
