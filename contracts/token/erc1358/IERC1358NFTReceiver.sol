pragma solidity ^0.4.24;


interface IERC1358NFTReceiver {
    /**
     * Note: the NFT main contract address is always the message sender (msg.sender)
     * @param _operator - Address who called 'transferFrom' function
     * @param _from - The address which previously owned the Non-Fungible Token
     * @param _tokenId - The Non-Fungible Token unique identifier
     * @param _data - Additional data with unspecified format
     * @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
     * unless throwing
     */
    function onERC1358Received(
        address _operator, 
        address _from, 
        uint256 _tokenId, 
        bytes _data
    ) 
        external 
        returns (bytes4);
}