---
sidebar_position: 3
---

# Encryption to Medusa

## Local Encryption 

Encryption to the Medusa network is a simple call:
```typescript
const { encryptedBlob, encryptedCipherkey } = await medusa.encrypt(msg, applicationAddress);
```

where 
* `msg` is the plaintext message to encrypt as a `Uint8Array`
* `applicationAddress` is the dApp contract address for which you are encrypting.

This call returns two values:
* `encryptedBlob` represents the final ciphertext
* `encryptedCipherkey` represents the key, in an encrypted form, needed to decrypt the blob

Only the latter needs to be submitted onchain!
The encrypted blob can be put on IPFS or anywhere where the user can easily download it!

:::info Preventing replay attacks

A ciphertext is _tied_ to both the address of the user encrypting it and the address
of the smart contract that submits it. This is to prevent replay attacks where an
attacker could submit the same ciphertext and ask to decrypt for himself.

:::

## Notifying Medusa

Now you need to notify Medusa about the `encryptedCipherkey`. This part is application specific
but let's illustrate with the example dApp shown in [previous sections](./example).

Let's assume you have the contract code instantiated in Typescript.
Here we are using [Typechain](https://github.com/dethcrypto/TypeChain) to interact with our contract in a typesafe manner.
```typescript
import { deBay__factory } from "../typechain";

const debayContract = deBay__factory.connect(
    address,
    signer
);
```
then one submits the ciphertext the following way:
```typescript
const price = ethers.utils.parseEther("1");
const cipherID = await debayContract.submitEntry(encryptedCipherkey, price);
```

This generates an event on the oracle contract thereby notifying Medusa's network of this new ciphertext.
