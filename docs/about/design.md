---
sidebar_position: 3
---

# System Design

This page describes the different actors that are part of the Medusa system in the context of the programmatic onchain access control project.  

## Actors

### Medusa Nodes

The Medusa nodes are the actual nodes that form a threshold network and react to onchain events. They communicate together on a libp2p gossiping network. They communicate with the chain by listening to events on the  oracle smart contract and by pushing transactions to the contract when needs be.

Note they only need to communicate with **one** smart contract, namely the oracle smart contract, regardless of the number of endusers.

### Oracle Smart Contract

The threshold oracle smart contract is the central gateway between Medusa nodes and external endusers of Medusa.

The contract serves to:

- Run the setup phase (DKG) between the Medusa nodes
- Submit ciphertexts to the Medusa network
- Request reencryptions to the Medusa network
- Receive reencrypted ciphertext from the Medusa nodes and dispatch it to the end destination

### Oracle Factory Smart Contract

This smart contract is where a Medusa nodes connect at the beginning when he wishes to join a network. For the purpose of the demo it is at the moment very simple. The admin of the contract can create via the factory a new oracle smart contract and all Medusa nodes will join the new oracle smart contract to start a new threshold network.

### Application Smart Contract

Any smart contract can use the Medusa network by communicating with the oracle smart contract. The application can submit ciphertexts to the oracle smart contract (they are not being processed at this moment, it’s just for recording). For reencryption, the logic is pretty similar to the notion of oracle onchain: the application issues reencryption requests towards a specific key by asking the oracle smart contract and giving it a callback address. 

## Workflow

### Setup

1. **Setup an oracle factory:** This factory is only responsible for creating new oracle smart contract on demand
2. **Spin up Medusa nodes**: Medusa nodes connects to the gossiping network (via a rendezvous server) and listens for creation events on the oracle factory.
3. **Start a new oracle contract:** The admin of the factory contract creates a new oracle contract via the factory. This emits an event with the address of the new oracle contract all Medusa nodes will pick up. Medusa nodes will run the setup phase (DKG) over the oracle contract. The DKG finishes after some rounds (30 rounds, 10 per phases with 3 phases). Each Medusa node post the messages directly onchain for the setup phase, not on the gossiping network.

### Encryption/Decryption with role based ACL contract

This part explains **one possible example** of usage of Medusa: 
access control list via roles implemented onchain. You can see the Solidity 
contract [here](https://github.com/medusa-network/medusa-contracts/blob/b21ec5c6568826d23288a1d0728be5541e2fa93c/src/RoleACL.sol).

The api of the ACL contract looks like the following:

- `authorizeReader(address, pubkey)`
- `submitCiphertext(ciphertext) -> cipher_id`
- `askDecryption(cipher_id, pubkey) -> request_id`

The workflow looks like the following:

1. **Authorize a public key to be a reader**: This must be done by the admin of the contract. The public key given is not a Ethereum address, it is a specific Medusa public key (on a different curve, BN254 to be precise) that must be generated before.
2. **Submit Ciphertext:** The admin or anyone with the WRITER role can submit a ciphertext. The ACL contract actually calls the oracle smart contract inside that emits an event with the ciphertext in it. The oracle contract also assigns an unique ciphertext_id to this ciphertext so it can be referred easily afterwards. 
    * **Important**: A ciphertext is _tied_ to both (a) the user generating the ciphertext and (b) the smart contract address where it submits it.
3. **Request Reencryption**: This can be called by anyone which has the READER role onchain. This ACL contract actually calls the oracle contract that submits a reencryption event and assigns a specific id to the reencryption request. This ID is necessary for the reader to track the reencrypted cipher at the next stage. The oracle contract saves the address of the ACL contract with this request id.
4. **Medusa nodes reencrypt ciphertext:** The Medusa nodes perform the following:
    - Each picks up the reencryption request,
    - Each checks if there is an associated ciphertext event onchain with the same cipher_id
    - Each checks that **both event come from the same contract** ! This is important to guarantee that only the same application can issue decryption request for a ciphertext it came from. There is also a cryptographic guarantee that ties one ciphertext to an address so there is no replay attacks possible.
    - Each will compute their local reencryption share - see the cryptographic [reference](https://www.notion.so/Cryptographic-Protocols-Specs-2d1b453bc082481492bb6d4dec5d7ac1)s for more details and broadcast this on the gossiping network.
    - Once there are enough shares gathered on the gossiping network, nodes will submit the reconstructed reencrypted ciphertext onchain to the oracle contract.
5. **Emits events with reencrypted ciphertext:** The oracle contract checks that the submitted reencryption comes from a valid request, and if so, calls a callback on the address saved at the stage 3. The ACL contract issues an event with the reencrypted ciphertext inside.
6. **Reader decrypts locally:** Reader picks up the event, checks it is for the same request that he has done before, and then decrypts **locally** the ciphertext.