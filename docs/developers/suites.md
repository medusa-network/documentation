---
sidebar_position: 2
---

# Suites

Medusa is meant to support different platforms and different encryption algorithms 
over time. Therefore, Medusa has the notion of a suite, that contains all informations
regarding the type of curve and encryption used. This notion is similar to the
[cipher suites](https://ciphersuite.info/cs/) defined in the TLS specifications.

Each `EncryptionOracle` is tied to a specific suite so the dapp knows which suite
has been used to encrypt any ciphertext.

Currently there is only one suite supported on Medusa using the bn254 curve. Later,
Medusa will switch to using BLS12-381 and therefore offer better security with better standards.

## BN254_KEYG1_SHA256_HGAMAL

This suite is the default one. It uses BN254 as the main curve, where the public key
of the Medusa network is defined over the group G1 and it uses a an Hash El Gamal 
encryption algorithm where the hash is SHA256.