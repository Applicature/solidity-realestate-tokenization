pragma solidity ^0.4.18;


// import "../../../../node_modules/minimetoken/contracts/MiniMeToken.sol";
// import "openzeppelin-solidity/contracts/math/SafeMath.sol";
// import "../IErc20.sol";
/// @title MiniMeERC20
/// @author Applicature
/// @notice Minime implementation of standart ERC20
/// @dev Base class
contract MiniMeERC20/*is IErc20, MiniMeToken*/ {
//     using SafeMath for uint256;

    constructor()
        public
    {
        
    }
//     string public standard;

//     function MiniMeERC20(
//         address _tokenFactory,
//         address _parentToken,
//         uint _parentSnapShotBlock,
//         uint256 _totalSupply,
//         string _tokenName,
//         uint8 _decimals,
//         string _tokenSymbol,
//         bool _transferAllSupplyToOwner
//     )
//         public
//         MiniMeToken(
//             _tokenFactory,
//             _parentToken,
//             _parentSnapShotBlock,
//             _tokenName,
//             _decimals,
//             _tokenSymbol,
//             true
//         )
//     {
//         standard = "ERC20 0.1";

//         if (_transferAllSupplyToOwner) {
//             setBalance(msg.sender, _totalSupply);
//         } else {
//             setBalance(this, _totalSupply);
//         }

//         name = _tokenName;
//         // Set the name for display purposes
//         symbol = _tokenSymbol;
//         // Set the symbol for display purposes
//         decimals = _decimals;
//     }

//     function setTotalSupply(uint256 _totalSupply) internal {
//         updateValueAtNow(totalSupplyHistory, _totalSupply);
//     }
// }


// /* WITHOUT IT YOU CANNOT DEPLOY AND TEST MiniME TOKEN*/

// ////////////////
// // MiniMeTokenFactory
// ////////////////

// /// @dev This contract is used to generate clone contracts from a contract.
// ///  In solidity this is the way to create a contract from a contract of the
// ///  same class
// contract MiniMeTokenFactory {

//     /// @notice Update the DApp by creating a new token with new functionalities
//     ///  the msg.sender becomes the controller of this clone token
//     /// @param _parentToken Address of the token being cloned
//     /// @param _snapshotBlock Block of the parent token that will
//     ///  determine the initial distribution of the clone token
//     /// @param _tokenName Name of the new token
//     /// @param _decimalUnits Number of decimals of the new token
//     /// @param _tokenSymbol Token Symbol for the new token
//     /// @param _transfersEnabled If true, tokens will be able to be transferred
//     /// @return The address of the new token contract
//     function createCloneToken(
//         address _parentToken,
//         uint _snapshotBlock,
//         string _tokenName,
//         uint8 _decimalUnits,
//         string _tokenSymbol,
//         bool _transfersEnabled
//     ) 
//         public 
//         returns (MiniMeToken) 
//     {
//         MiniMeToken newToken = new MiniMeToken(
//             this,
//             _parentToken,
//             _snapshotBlock,
//             _tokenName,
//             _decimalUnits,
//             _tokenSymbol,
//             _transfersEnabled
//         );

//         newToken.changeController(msg.sender);
//         return newToken;
//     }
// }

// contract Controlled {
//     /// @notice The address of the controller is the only address that can call
//     ///  a function with this modifier
//     modifier onlyController {
//         require(msg.sender == controller);
//         _;
//     }

//     address public controller;

//     function Controlled() public {
//         controller = msg.sender;
//     }

//     /// @notice Changes the controller of the contract
//     /// @param _newController The new controller of the contract
//     function changeController(address _newController) 
//         public 
//         onlyController 
//     {
//         controller = _newController;
//     }
// }


// /// @dev The token controller contract must implement these functions
// contract TokenController {
//     /// @notice Called when `_owner` sends ether to the MiniMe Token contract
//     /// @param _owner The address that sent the ether to create tokens
//     /// @return True if the ether is accepted, false if it throws
//     function proxyPayment(address _owner) public payable returns (bool);

//     /// @notice Notifies the controller about a token transfer allowing the
//     ///  controller to react if desired
//     /// @param _from The origin of the transfer
//     /// @param _to The destination of the transfer
//     /// @param _amount The amount of the transfer
//     /// @return False if the controller does not authorize the transfer
//     function onTransfer(
//         address _from, 
//         address _to, 
//         uint _amount
//     ) 
//         public 
//         returns (bool);

//     /// @notice Notifies the controller about an approval allowing the
//     ///  controller to react if desired
//     /// @param _owner The address that calls `approve()`
//     /// @param _spender The spender in the `approve()` call
//     /// @param _amount The amount in the `approve()` call
//     /// @return False if the controller does not authorize the approval
//     function onApprove(
//         address _owner, 
//         address _spender, 
//         uint _amount
//     ) 
//         public 
        // returns (bool);
}


