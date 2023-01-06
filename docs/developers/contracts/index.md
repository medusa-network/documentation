---
sidebar_position: 3
---

# Contracts

There are two main important contracts to know when interacting with Medusa:
* the "oracle" contract to submit ciphertexts, reencryption request and receive results
* the "client" interface that defines how Medusa can submit the result back

The interface for both of these contracts are defined in this solidity [file](https://github.com/medusa-network/medusa-contracts/blob/main/src/EncryptionOracle.sol).

But first, we need to explore the core structure of what Medusa handle: encrypted data.


