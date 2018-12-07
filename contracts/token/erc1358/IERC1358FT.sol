pragma solidity 0.4.24;


/**
 * @title ERC-1358 Fungible Token interface (ERC-20 compatible)
 * @notice ERC-20 Token compatible interface
 */
interface IERC1358FT {
    /**
     * @dev This emits when Fungible Token is being transfered
     * This event emits when Fungible Token is transfered to specified address,
     * may fail in case transferable amount exceeds sender balance or 'from' address
     * is invalid
     */
    event Transfer(
        address _from,
        address _to,
        uint256 indexed _tokenId
    );

    /**
     * @dev This emits when Fungible Token is being transfered from specified address
     * by a owner of tokens or approved address for Fungible Token
     */
    event Approval(
        address indexed _owner,
        address indexed _approved,
        uint256 indexed _tokenId
    );

//    /**
//     * @notice Returns value of specified address of Fungible Token
//     * @dev Fungible Token amount is a supply for Non-Fungible Token value,
//     * may fail in case _address is invalid
//     * @param _address - ETH address of token holder
//     * @return Fungible Token balance
//     */
//    function balanceOf(address _address)
//        external
//        view
//        returns (uint256 _value);
//
//    /**
//     * @notice Transfer of Fungible Token
//     * @dev Throws if token owner hasn't got enough tokens
//     * @param _to - Address of Fungible Token receiver
//     * @param _amount - Transferable amount of Non-Fungible Token
//     */
//    function transfer(
//        address _to,
//        uint256 _amount
//    ) external;
//
//    /**
//     * @notice Approve specified address as operator for token distributing
//     * Throws if _spender is invalid address or token owner hasnt' got
//     * tokens equal to _amount
//     * @param _operator - Approval address for Fungible Token
//     * @param _amount - The approval amount of Fungible Token
//     */
//    function approve(
//        address _operator,
//        uint256 _amount
//    ) external;
//
//    /**
//     * @notice Transfer from of Fungible Token
//     * @dev Throws if token owner hasn't got enough tokens or
//     * msg.sender is not owner or approved operator
//     * @param _from - Address of Fungible Token owner
//     * @param _to - Address of Fungible Token receiver
//     * @param _amount - Transferable amount of Non-Fungible Token
//     */
//    function transferFrom(
//        address _from,
//        address _to,
//        uint256 _amount
//    ) external;
//
//    /**
//     * @notice Returns approved Fungible Token amount for specified operator address
//     * Throws if _owner or _operator is invalid address, or _owner hasn't approved token for
//     * specified _operator
//     * @param _owner - Address of Fungible Token owner
//     * @param _operator - Address of approved operator for Fungible Token
//     * @return Allowed amount for _operator to manage
//     */
//    function allowance(
//        address _owner,
//        address _operator
//    )
//        external
//        view
//        returns (uint256 _allowedAmount);
}
