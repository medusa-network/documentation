---
sidebar_position: 2
---

# Motivation
## 🔒 Decentralized Access Control

Currently in web3, almost all activity is public, all transactions are publics and their interaction with smart contracts are public too. Privacy is where many major innovations will come into web3 to bring it to large scale usage. 

Access control, private data management is a core component of many web2 services and it is not clear yet how to make the transition to web3. This where Medusa comes in.

Medusa’s threshold network be the gateway between the *delegator,* the party giving access, and the *delegatee*, the party being granted access. Medusa’s network is decentralized and will only release access to the recipient according to some programmable rules onchain. No information is gained by the network, the network never sees the information in the plain (unless granted to) and no external party neither.

Medusa can enable **private decryption** as explained above where only the recipient learns of the resulting message but also **public decryption** where the decryption is public, for everyone (users and smart contracts) to consume.

## 📐 Democratizing **threshold cryptography**

Even though treshold cryptography used to not be realistic before because the trust assumptions were seemed to be too much of a blocker, it turns out it is now attracting a lot of attention from a practical perspective:

- CryptoNetLab is looking at generalized threshold network to allow smart contract to "have a secret" that can unlock many use cases (data management is one)
- [Drand](https://drand.love) is using threshold cryptography to build a randomness beacon
- [Axelar Network](https://axelar.network/) is a blockchain bridge project that uses threshold network as a gatekeeper of tokens between different platforms
- [Anoma Network](https://anoma.network/) is a blockhain that uses threshold network to prevent front running attacks
- ConsensusLab is looking to use DKGs to pinpoints state of Filecoin on other blockchains (BTC)
- ConsensusLab is looking to use DKGs to checkpoint subnet's state into parents subnets

## 💼 Applications of a threshold network

There are several important applications that could arise from having a general threshold cryptographic network:

- Smart contracts with private data: encrypted data is unlocked if some on-chain condition is met (e.g. an on-chain vote, a payment, etc).
- Specialized Random beacons: randomness is released only on some events.
- Access Control and Key Distribution: encrypted data is re-encrypted to be accessed by new users (e.g. private newsletter, private forums, etc).
- Trusted signatures (a signed attestation can be produced based on a mix of secret and on-chain information "address x guessed the correct number")
- Threshold based L2 (?)
- (Miner Extractable Value) MEV Protection
- Distributed PKI (identity based system):
    - Anyone with an ID can get his corresponding secret key from the threshold committee
    - Anybody can encrypt stuff to an ID, without having the key, even without the recipient being aware of it