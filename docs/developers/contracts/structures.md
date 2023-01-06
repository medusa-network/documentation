---
sidebar_position: 1
---

# Encryption

There are two notions of encrypted data in Medusa.

## Ciphertext

A `Ciphertext` is some encrypted data created by the client initially and submitted to Medusa. Any ciphertext can be denoted by its id, a `uint256 _cipherId`.

```solidity
/// A 32-byte encrypted ciphertext that a client submits to Medusa
struct Ciphertext {
    G1Point random;
    uint256 cipher;
    G1Point random2;
    DleqProof dleq;
}
```

The submission to Medusa happens by calling `medusaContract.submitCiphertext()` which submits an event that Medusa node pick up offchain.

## Reencrypted Ciphertext

A `ReencryptedCipher` is a reencryption of a `Ciphertext`, created by Medusa and submitted onchain.
```solidity
/// Struct that Medusa nodes submits in response to a request
struct ReencryptedCipher {
    G1Point random;
    uint256 cipher;
}
```

The submission from Medusa happens by calling `appContract.oracleResult()`.