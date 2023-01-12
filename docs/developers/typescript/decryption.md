---
sidebar_position: 4
---

# Decryption from Medusa

For anyone to decrypt a given ciphertext, there are a couple of steps:
* Generation of the keypair
* Asking Medusa to reencrypt
* Listening for reply and local decryption

## Generate ephemereal keypair

First, you need to generate an keypair linked to this user's wallet. 
Indeed, Medusa does not know to who to re-encrypt yet and it needs a public key.
```typescript
await medusa.signForKeypair();
```

This will ask the user to sign a message and the SDK generates the keypair from it.
The keypair is stored in the SDK global store so there is no need to keep it around ourself.
It can be accessed via `medusa.keypair`.

:::info Different keys

By default, we derive keypair from a deterministic signature from the users's wallet.
That way, if the user goes out and creates a new session later, he will be able to 
decrypt all the previous items he already decrypted.
If you want to have more control over the key management, you can use
```typescript
const { private, public } = await medusa.generateKeypair();

:::

## Asking Medusa to reencrypt for you

To decrypt, you have to pass through the dApp you are building. Remember that a 
ciphertext is tied to the smart contract it has been submitted to, so only the
same smart contract can ask for reencryption.

Taking back on our example dApp, this could look like:
```typescript
const options = {value: ethers.utils.parseEther("1.0")};
const requestID = await ebayContract.buyEntry(cipherID, public.toEvm(), options);
```
TODO: check options

Note the 1eth sending: if you don't pay enough, the smart contract is not gonna call
`oracle.requestReencryption()` and thus Medusa is not gonna do the work !

The `requestID` is an unique identifier of this specific request.

## Waiting for reencryption event

Medusa is gonna emit an event with the ciphertext reencrypted to the public key you
advertised.
Listening for events is quite dependent on the framework you uses. You can look at 
our main application how it is done [here](https://github.com/medusa-network/medusa-app/blob/4a6e75e71489e97e9a08d3b0fc313b6fc2f32344/src/pages/index.tsx#LL44-L52).

## Decryption 

We now assume that you have caught up the event `EntryDecryption(requestID, ciphertext)`.
Now it's time to decrypt!
```typescript
const decryptedBytes = await medusa.decrypt(ciphertext, blob)
```

Remember blob is the part of the ciphertext which can be stored anywhere, on IPFS for example.

That's it !