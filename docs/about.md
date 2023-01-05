---
sidebar_position: 1
---

# Medusa

> *Simple programmatic access control without keys*

Medusa is a network of nodes that allows dApps to build complex access control 
system onchain without the apps or users to manage keys !

Medusa can be used to manage access in different scenarios:
* A private NFT gated content platform  
* A private distribution platform like onlyFans onchain
* In general, fair exchange of any private data

One can think of Medusa as an oracle that instead of giving price feeds etc, gives
back re-encryption / decryption of data onchain.

![Overview](./../static/img/overview_medusa.png)

# An example workflow

Imagine Alice wants to sell a picture of her cat for 1 DAI on an eBay-like dApp. 

### 1. Uploading
Alice encrypts the cat picture to the Medusa network and registers the encryption and the price to the dApp platform.

### 2. Buying

When Bob wants the buy the cat picture, it sends one 1 DAI to Alice via the dApp 
platform. At this point, the dApp asks Medusa (on smart contract) to _reencrypt_ the cat picture to Bob.

### 3. Reencryption to Bob

Medusa verifies that the cat was submitted to the same platform that requested the
reencryption. If so, Medusa's nodes perform their operation offchain and submits the
resulting reencryption onchain.

### 4. Local decryption

Bob sees the event that the reencryption has been submitted, and can now locally decrypts
the cat picture !

**Important**: At no point in time, the dApp nor Medusa nodes were able to decrypt and see the cat picture.