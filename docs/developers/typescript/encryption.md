---
sidebar_position: 3
---

# Encryption to Medusa

## Local Encryption 

Encryption to the Medusa network is a simple call:
```typescript
const { blob, cipherkey } = await medusa.encrypt(msg, applicationAddress);
```

where 
* `msg`is the plaintext message to encrypt as a `Uint8Array`
* `applicationAddress` is the dApp contract address for which you are encrypting.

This call returns two values:
* encrypted blob represents the final ciphertext
* cipherkey represents the key, in an encrypted form, needed to decrypt the blob

Only the latter needs to be submitted onchain !

:::info Preventing replay attacks

A ciphertext is _tied_ to both the address of the user encrypting it and the address
of the smart contract that submits it. This is to prevent replay attacks where an
attacker could submit the same ciphertext and ask to decrypt for himself.

:::

## Notifying Medusa

Now you need to notify Medusa about the `cipherkey`. This part is application specific
but let's illustrate with the example dApp shown in [previous sections](./example).

Let's assume you have the contract code instantiated in Typescript
```typescript
const ebayContract
```
then one submits the ciphertext the following way:
```typescript
await ebayContract.submitEntry(cipherkey, 1eth);
```

This will generate an event on Medusa's network notifying it of this new ciphertext.