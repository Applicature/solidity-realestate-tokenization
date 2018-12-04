pragma solidity ^0.4.24;


contract Strings {
    /**
     * @dev Converts int256 to string
     * @param i - Integer 256 bit value that will be converted to string
     */
    function toString(uint256 i) 
        internal 
        pure 
        returns (string) 
    {
        if (i == 0) return "0";
        uint256 j = i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length - 1;
        while (i != 0) {
            bstr[k--] = byte(48 + i % 10);
            i /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev Concatenates two string
     * @param a - First string
     * @param b - Second string
     */
    function concat(string a, string b)
        internal
        pure
        returns (string)
    {
        return string(abi.encodePacked(a, b));
    }

    /** 
     * @dev Converts string to bytes32
     * @param source - String variable to be converted
     */
    function toBytes32(string memory source) 
        internal
        pure
        returns (bytes32 result) 
    {
        bytes memory bytesString = bytes(source);
        if (bytesString.length == 0) {
            return 0x0;
        }
        /* solium-disable-next-line */
        assembly {
            result := mload(add(source, 32))
        }
    }

    /**
     * @dev Converts bytes32 to string
     * @param source - Bytes32 variable to be converted
     */
    function bytes32ToString(bytes32 source)
        internal 
        pure
        returns (string result)
    {
        bytes memory bytesArray = new bytes(32);
        
        for (uint256 i = 0; i < 32; i++) {
            bytesArray[i] = source[i];
        }
        result = string(bytesArray);
    }
}
