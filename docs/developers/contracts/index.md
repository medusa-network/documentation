---
sidebar_position: 3
---

# Contracts

There are two main important contracts to know when interacting with Medusa:
* the "oracle" contract to submit ciphertexts, reencryption requests and to receive results
* the "client" interface that defines how Medusa can submit the result back to your application

The interfaces for these two contracts are defined in this [Solidity file](https://github.com/medusa-network/medusa-contracts/blob/main/src/EncryptionOracle.sol).

But first, we need to explore the core structure of what Medusa handles: encrypted data.

