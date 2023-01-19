---
sidebar_position: 2
---

# Threshold Network

*Note: The first sections are meant to be an introduction to how threshold networks work. If you want to read the DKG specs Medusa implements, skip to the last [section](#dkg-spec) of this page*.

The purpose of the setup phase is to create a collective private, and public key pair shared among $n$ participants. This is done through a $t$-of-$n$ [Distributed Key Generation (DKG)](https://en.wikipedia.org/wiki/Distributed_key_generation) process at the end of which each of the $n$ participants obtains a copy of the **collective public key**, together with a **private key share** of the **collective private key**. The key shares are computed such that no individual node knows the entire collective private key.

Each private key share can then be used to perform cryptographic threshold computations, such as generating threshold signatures, where at least $t$ contributions produced using the individual private key shares are required to successfully finish the collective operation.

A DKG is performed in a fully distributed manner, avoiding any single points of failure. We give an overview of the different sub-components of the
[DKG implementation](https://github.com/dedis/kyber/tree/master/share/dkg/pedersen) in the following subsections.

### Secret sharing

[Secret sharing](https://en.wikipedia.org/wiki/Secret_sharing) is an important technique that many advanced threshold cryptography mechanisms rely on. Secret sharing allows one to split a secret value $s$ into $n$ shares $s_1,\ldots,s_n$ such that $s$ can only be reconstructed if a threshold of $t$ shares is available.

[Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing) (SSS) scheme is one of the most well-known and widely used secret sharing approaches, and it is a core component of Medusa. SSS works over an arbitrary finite field, but for simplicity, we use the integers modulo $p$ denoted by $\mathbb{Z}_p$. Let $s \in \mathbb{Z}_p$ denote the secret to be shared.

**Share Distribution**: To share $s$ a **dealer** first creates a polynomial $q(x) = a_0 + a_1x + ... + a_{t-1}x^{t-1}$ with $a_0 = s$ and (random) $a \in \mathbb{Z}p$ for $i = 1,\ldots,t-1$

The dealer then creates one share $s_i$ for each participant $i$ by evaluating $q(x)$ at the integer $i$ and setting $s_i = (i,q(i))$.

**Secret Reconstruction**: To recover the secret $s$, one first collects at least $t$ shares, then uniquely reconstructs $q(x)$ via [Lagrange interpolation](https://en.wikipedia.org/wiki/Lagrange_polynomial), and finally obtains $s$ as $s = a_0 = q(0)$.

Note that any subset of $t$-of-$n$ shares can be used to perform Lagrange interpolation and uniquely determine $s$. Having any subset of fewer than $t$ shares does not allow one to learn anything about $s$, though.

### Verifiable secret sharing

Shamir's Secret Sharing scheme assumes that the dealer is honest but this assumption might not always hold in practice.

A [Verifiable Secret Sharing](https://en.wikipedia.org/wiki/Verifiable_secret_sharing) (VSS)
scheme protects against malicious dealers by enabling participants to verify that their shares are consistent with those dealt to other nodes ensuring that the shared secret can be correctly reconstructed later on.

Medusa relies on a variation of [Feldman's VSS](https://ieeexplore.ieee.org/abstract/document/4568297) scheme, an extension of SSS. Let $\mathbb{G}$ denote a cyclic group of prime order $p$ in which computing discrete logarithms is intractable.

A cyclic group means there exists a generator $g$ such that any element $x \in \mathbb{G}$ can be written as $x = g^a$ for some $a \in {0,\ldots,p-1}$.

**Share Distribution**: In addition to distributing shares of the secret to the participants, the dealer also broadcasts commitments to the coefficients of the polynomial $q(x)$ of the form $(A_0,A_1,\ldots,A_{t−1}) = (g^s,g^{a_1},\ldots,g^{a_{t-1}})$.

These commitments enable each participant $i$ to verify that their share $s_i = (i,q(i))$ is consistent with respect to the polynomial $q(x)$ by checking that $g^{q(i)} = \prod_{j=0}^{t-1}(A_j)^{i^j}$ holds.

**Secret Reconstruction**: The recovery of secret $s$ works as in regular SSS with the difference that verified to be valid shares are used.

### Pedersen's distributed key generation (DKG)

Although VSS schemes protect against a malicious dealer, the dealer still knows the secret itself. To create a collectively shared secret $s$ such that no individual node gets any information about it, participants can utilize a [Distributed Key Generation](https://en.wikipedia.org/wiki/Distributed_key_generation) (DKG) protocol.

Medusa relies on a variation [Pedersen's DKG](https://www.cs.cornell.edu/courses/cs754/2001fa/129.PDF) scheme, which essentially runs $n$ instances of Feldman's VSS in parallel on top of some additional verification steps.
The final scheme is explained in the next section.

**Share Distribution**: Every participant $i$ creates a (random) secret $s_i \in \mathbb{Z}_p$ and shares it with all other participants using VSS by sending a share $s_{i,j}$ to each participant $j$ and broadcasting the list of commitments $(A{i,0},A_{i,1},\ldots,A_{i,t-1})$ to everyone.

**Share Verification**: Each participant verifies the shares it receives as prescribed by Feldman's VSS scheme. If participant $j$ receives an invalid share $s_{i,j}$ from participant $i$, then $j$ broadcasts a complaint. Afterward, participant $i$ must reveal the correct share $s_{i,j}$ or is considered an invalid dealer.

**Share Finalization**: At the end of the protocol, the final share of participant $i$ is $s_i = \sum_j s_{j,i}$ for all participants $j$ that are valid, i.e., for all those $j$ not excluded during the verification phase.

The collective public key associated with the valid shares can be computed as $S = \sum_j A_{j,0}$ for all valid participants $j$.

### Security

Even though this DKG allows for some biasability in the final private key, because 
participants don't commit to the polynomial beforehand as in the 
[Gennaro et al. one](https://link.springer.com/content/pdf/10.1007/s00145-006-0347-3.pdf), it has been proven that the resulting key can be used for any 
*re-keyable scheme* such as BLS signature or El Gamal encryption, in this 
[Mary et al. paper](https://eprint.iacr.org/2021/005.pdf). This is sufficient for our purposes.

### Neji DKG

In Medusa, we rely on a smart contract to do the communication and we also use it
for doing some verifications. Specifically, we employ [Neji's DKG version](https://onlinelibrary.wiley.com/doi/abs/10.1002/sec.1651) that makes use of the computation capabilities of the smart contract.

Specfically, it enables us to _skip_ the justification phase by having the contract
directly verify onchain if a complaint is valid or not.
If the complaint is valid, then the dealer is disqualified. If not valid, then the
complainer is disqualified.

### Spec {#dkg-spec}

Each participant registered with a temporary private/public keypair $K_i = k_i * G_1 \in \mathbb{G_1}$ at the beginning of the protocol. How and where is out of scope for this crypto spec but you can think of it as if every participant save their public keys on a common smart contract.

We assume there is $n$ participants and we set the threshold $T > n/2$ as being the number of parties necessary to perform an operation with the distributed secret key.

#### Deal Phase

**Proving:**

Each participant does the following:

1. Generate T random coefficients $a_1, … , a_T \in \mathbb{F}$ for a polynomial $f(x)$ of degree T-1
2. Compute $n$ shares $f(1), f(2), … , f(n)$
    1. Note in the future we might replace the indices with roots of unity $\omega^1, \omega^2…$
3. Compute commitment to the polynomial: $F(x) = f(x) G_1$ by multiplying all coefficients by the base generator $G_1$
4. Generate a random scalar $r \in \mathbb{F}$ and $R = rG_1$
5. Compute encryption of the share for each recipient:
    1. For recipient i, compute $C_i = H(rK_i) \oplus b(f(i))$ where $b(.)$ transforms the scalar into bytes in little endian format.
6. Output the deal consisting of:
    1. Coefficients of $F(x)$
    2. Randomizer $R$ 
    3. Encryption vector: $C_i$

**Verifying:**

Each recipient i perform the following verification:

1. Compute shared key $S_i = k_iR$ 
2. Decrypts share $f(i) = H(S_i) \oplus C_i$ (interprets results as a scalar)
3. Verify consistency: $F(i) == f(i)G_1$
4. If consistency check is not passing, then go to complaint phase.

#### Complaint Phase

**Proving:**

The recipient whose share is invalid will prove it to the smart contract by giving the shared key to the smart contract and proving it is the correct one without revealing its private key.

1. Generate a random $t \in \mathbb{F}$
2. Compute $w = tR$ and $w' = tG_1^{'}$
3. Compute $u' = k_iG_1^{'}$
4. Compute $e = H(C_i, S_i, u', w, w')$
5. Compute $f = t - e * k_i$
6. Output proof $[S_i, e, f, u']$

**Verifying:**

The smart contract will use the information from the deals and from the proof:

1. Compute $w = fG_1 + eS_i = (t - e*k_i)R + (e*k_i)R = tR$
2. Compute $w' = fG_1^{'} + eu' = (t - e*k_i)G_1^{'} + (e*k_i)G_1^{'} = tG_1^{'}$
3. Check if $e == H(C_i, S_i, u', w, w')$
    1. If not, the complaint is not valid (the smart contract can decide to slash etc, out of scope of this document)
    2. Note the verifier must have the ciphertext not from the complainer but from the first phase. Using smart contract it is either registered onchain or the hash of it.
4. If check is valid, then decrypt the share $sh_i = H(S_i) \oplus C_i$
5. Verify the consistency: $F(i) == sh_i G_1$
    1. If consistency is verified, complaint is not valid (the deal was correctly created)
    2. If consistency check fails, the complaint is valid and the **dealer must be excluded from the list of valid participants.**
    

#### Final Phase

This phase happens after the first two and is simply the phase where the distributed keypair can be computed.

**Secret Share for participant i:**

$s_i = \sum_j f_j(i)$ for all dealers $j$ that **were not excluded during the complaint phase.**

**Public Key**

$S = \sum_j F_j(0)$ for all dealers $j$ that **were not excluded during the complaint phase.**
