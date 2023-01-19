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
```
:::

## Asking Medusa to reencrypt for you

To decrypt, you have to pass through the dApp you are building; the smart contract that originally submits
a ciphertext is the only account that can request reencryption of that ciphertext.

For our example dApp, this would look like:
```typescript
const price = await debayContract.itemToPrice(cipherId);
const requestID = await debayContract.buyEntry(cipherID, public.toEvm(), { value: price });
```
The `requestID` is a unique identifier of this specific request.

:::info Access Control Policy

Note the `{ value: price }` parameter: This follows from the access control policy that you have defined in your smart contract.
If a user does not pay the sufficient price for the item, the smart contract will not call `oracle.requestReencryption()`
and thus Medusa will not do the work!
:::

## Waiting for reencryption event

Medusa will emit an event with the ciphertext reencrypted to the public key you advertised.

Listening for events is quite dependent on the framework you use. Here is an example using React and [wagmi](https://wagmi.sh/)
from our [demo application](https://github.com/medusa-network/medusa-app/blob/d5fe9a6bf7e4bef7785a58d05f0b21474c69ddcf/src/components/EventsFetcher.tsx#L28-L104)

## Decryption 

We now assume that you have received the event `EntryDecryption(requestID, ciphertext)`.
Now it's time to decrypt!
```typescript
const decryptedBytes = await medusa.decrypt(ciphertext, blob)
```

Remember blob is the part of the ciphertext which can be stored anywhere, on IPFS for example.

That's it!
