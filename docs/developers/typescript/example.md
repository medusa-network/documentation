---
sidebar_position: 1
---

# Example dApp

Throughout this documentation on the Typescript SDK, we use the following small
example dApp.

## Web3 Ebay-like

This is a very simplistic version of a web3-native eBay like application.
Users can upload "blobs" (it can be images, or texts, or API tokens etc) with 
an associated price. 
When a user wants to buy one item, it submits a request to the dApp paying the 
requested amount. Medusa takes care of reencrypting the blob towards the specific
user that paid.

:::warning DO NOT USE IN PRODUCTION

This is a very simple contract but insecure !

:::

```solidity
contract OnlyFiles is IEncryptionClient {
    /// the address of the Medusa oracle 
    IOracle public oracle;
    /// mapping recording the price of each item referenced by its cipher ID
    mapping(uint256 => uint256) itemToPrice;

    /// One calls this method to submit a a new entry which is encrypted
    /// towards Medusa. The `submitCiphertext()` call will check if the 
    /// ciphertext is valid and notify the Medusa network.
    function submitEntry(
        Ciphertext calldata cipher,
        uint256 price,
    ) external returns (uint256) {
        uint256 cipherId = oracle.submitCiphertext(cipher, msg.sender);
        itemToPrice[cipherId] = price;
        return cipherId;
    }

    /// Looks if the caller is sending enough token to buy the entry. If so, it notifies
    /// the Medusa network to reencrypt the given cipher ID with the given public key.
    /// This public key is generated on the client side (TS) and is most often ephemereal.
    function buyEntry(uint256 cipherId, G1Point calldata buyerPublicKey) external payable returns (uint256) {
        uint256 price = listings[cipherId];
        if (msg.value < listing.price) {
            revert InsufficentFunds();
        }
        uint256 requestId = oracle.requestReencryption(cipherId, buyerPublicKey);
        return requestId;
    }

    event EntryDecryption(uint256 indexed requestId, Ciphertext ciphertext);

    /// oracleResult gets called when the Medusa network successfully reencrypted 
    /// the ciphertext to the given public key called in the previous method.
    /// This contract here simply emits an event so the client can listen on it and
    /// pick up on the cipher and locally decrypt.
    function oracleResult(uint256 requestId, Ciphertext calldata cipher) external onlyOracle {
        emit EntryDecryption(requestId, cipher);
    }
}
```

