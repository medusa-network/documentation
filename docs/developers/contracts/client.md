---
sidebar_position: 3
---

# Client contract

This interface contract is what any dApp must implement to be able to receive
the results from Medusa:
```solidity
interface IEncryptionClient {
    /// @notice Callback to client contract when medusa posts a result
    /// @dev Implement in client contracts of medusa
    /// @param requestId The id of the original request
    /// @param _cipher the reencryption result
    function oracleResult(uint256 requestId, ReencryptedCipher calldata _cipher) external;
}
```

Medusa will call this function giving the relevant request id and the result. 
The dApp is free to handle the reencrypted ciphertext in any way it wants.
Generally we recommend to emit an event so the client can simply listen off the 
events from the dApp to get back the reencryption.