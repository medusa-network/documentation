---
sidebar_position: 3
---

# Encryption

Medusa's threshold network can manipulate ciphertexts in two ways: 
- Private Decryption is where the threshold network's output is 
only decryptable by a given party with a specified private/public 
key pair

- Public Decryption (NOT YET DEPLOYED) is where the threshold network will reveal a key that allows anybody to decrypt a
ciphertext, using the identity based paradigm. Think of it as if
a trusted third party were decrypting messages that were encrypted 
to it. If this third party obeys to a smart contract, it's
equivalent to say that it gives the smart contract the
functionality to decrypt messages encrypted to it.

## Private Decryption

### **Overview:**

This mode uses basic El Gamal encryption where (1) a client encrypts a message to the network, then (2) the network can decrypt it to a particular recipient according to some conditions. 

In comparison with the previous section, this is useful when we want that the plaintext is only revealed to the intended recipient.

**Use cases:** data management policies (see [Calypso](https://eprint.iacr.org/2018/209.pdf)), private API access, the whole set of "proxy re-encryption" use cases (like distributed encrypted file storage).

### Protocols Description

To decrypt the nodes will each generate a partial decryption share. There are two ways to aggregate the shares:

1. **Local Decryption:**  the nodes send the partial decryption shares directly to recipient which will aggregate them locally and decrypt locally
    1. **Practical Consideration:** The client needs to receive  on a private channel and aggregate at least t shares.The first requirement may be hard to achieve (general connectivity between any two points on the internet is not granted). The latter one can quickly become a problem as soon as we want to grow the network size, for security reason. This tends to trap us in the "security vs usability" false dichotomy.
2. **Public Aggregation:** Either the nodes re-encrypt their share with the recipient public key, in a way that a liveness-trusted aggregator node can "group" them (interpolation) such the recipient perform a single constant time operation to decrypt.
    1. **Practical Consideration:** The client in this case only makes one decryption locally. The network only needs to aggregate the shares "off chain", it can be a special aggregator node rewarded for this (if we can prove it).

Obviously the second method is preferable, but we describe first 1. and then describe 2. in the spirit of the "straw man approach".

### Encryption to the DKG network:

Client wants to encrypt a message $m$ to the public dist. key $P = s G$ of the network:

1. Generate random $r \in \mathbb{F_q}$
2. Compute ciphertext $c$:

$$
C = \{C_1,C_2\} = \{  rG_1, H(rP) \oplus m\} = \{rG_1, H(rsG_1) \oplus m \}
$$

with $H(rP) \in \mathbb{F_q}$.

$$

$$

The encryption is bundled with a DLEQ proof of correctness.

**Bundle with DLEQ proof of correctness**

The prover also has to include a proof of correct encryption that shows:

1. He really holds the secret $r$ (via DLEQ proof)
2. This encryption has been made by him and for the given access control address

He does the following:

1. Generate random $t$ 
2. Compute $w = tG_1$  , $w' = tG_1^{'}$ where $G_1^{'}$ is another public *random* base
3. Compute $u' = rG_1^{'}$
4. Compute label $L = H(P, I, K)$ where P is the public key of the Medusa, I is the address the policy smart contract, and $K$ is the address of the encryptor
5. Compute $e = H_1(C_2,L, C_1, u', w, w')$ and then $f = t - re$
6. Output the full ciphertext: $C, e, f, u'$

**Verification of proof of correctness:**

Verifier (depending on the context it can be the Medusa nodes or the smart contract) perform the following verification:

1. Compute $w = fG_1 + eC_1 = (t - re)G_1 + reG_1 = tG_1$
2. Compute $w' = fG_1^{'} + eu' = (t - re)G_1^{'} + erG'_1 = tG_1^{'}$
3. Check if $e == H(C_2, L,C_1, u', w, w')$ 
    1. Note $L$ can be computed from public information
    2. Reason of this confusing order: treat C_1 = u, and then it means that we put all the “public info” at the beginning of the hash, and then all the DLEQ related info afterwards.

**Submitting a ciphertext on chain**

The Medusa smart contract will verify the ciphertext proof associated in the manner described just above.

### Local Decryption

Each DKG node $i$ compute the decryption share and send it to recipient:

$$
D_i = s_iC_1 = s_irG_2\in G_2
$$

The node also computes a proof of correctness almost as similar as the encryptor.

 **Proof of correctness:**

 — **TODO**: since this functionality is not part of Medusa at the moment, it's left as is.

The recipient can then interpolate locally

$$
m = H(\sum_i \delta_i(0)D_i) \oplus c_2
 = H(rsG_2) \oplus c_2 = H(rP)  \oplus H(rP) \oplus m
$$

### Public Aggregation

In this mode, the encryption to the network is done in the same way as before, however, it offers the possibility of *aggregating* the partial decryptions first and only send one message to the final recipient.

Each DKG node $i$ will *encrypt its decryption share* to the recipient's public key, such that an aggregator node can perform the Lagrange interpolation itself.

Let's call $U = uG_2$ the public key of the recipient (with private key $u$).

1. Each node computes its local encrypted decryption share

$$
D_i = s_iC_1 + s_iU = s_i(C_1+U)
$$

You can see the node decrypts its share and then re-encrypts it towards the public key of the recipient, but instead of using a random scalar, it uses its own share.

**Proof of correctness:**

The $i$-th node does the following:

1. Generate random scalar $t_i$
2. Compute $w_i=t_i(C_1 + U)$ and $w_i^{'} = t_iG_1$
3. Compute $e_i = H(D_i,w_i,w_i^{'})$ and $f_i = t_i - e_i * s_i$
4. Output proofs $[D_i,e_i,f_i]$ **signed by the node** (threshold key or longterm key if there is one)

**Verification of the proof of correctness:**

When receiving such partial reencryption, one perform the following check:

1. Computes $w_i = f_i(C_1 + U) + e_iD_i = (t_i - e_i*s_i)(C_1 + U) + (e_i*s_i)(C_1 + U) = t_i(C_1 + U)$
2. Computes $w_i^{'} = f_iG_1 + e_i(s_iG_1) = (t_i - e_i*s_i)G_1 + (e_i *s_i)G_1 = t_iG_1$
    1. Note that $s_iG_1$ is available publicly since we know the whole public threshold polynomial $F(x)$ so $F(i) = s_iG_1$
3. Check that $e_i == H(D_i,w_i,w_i^{'})$

This proofs says that the node took ciphertext C1, re-encrypted it towards U and it can be publicly verifiable. 

**Aggregation of partial reencryptions**

The aggregator collects enough shares **with valid proofs** and aggregate locally the ciphertext and sends it to the recipient (or to the bulletin board so the recipient sees it):

$$
c' = \sum_i \delta_i(0)D_i = srG + sU = srG_2 + suG_2 = (r + u)sG_2
$$

1. The recipient decrypts locally in constant time:

$$

m = H(c' - usG_2) \oplus C_2 = H(rsG_2) \oplus H(rsG_2) \oplus m
$$

The recipient can compute $-usG_2$ because he knows $P = sG_2$ and his own private key $u$.

## Public Decryption (IBE)

### Intuition in blockchain context

Think of it as if a trusted third party were decrypting messages that were encrypted to it. If this third party obeys to a smart contract, it's equivalent to say that it gives the smart contract the functionality to decrypt messages encrypted to it. Note however in practice, everybody can decrypt the ciphertexts *thanks to released material from the threshold network.* The plaintext is not hidden in the smart contract (as currently, nothing is hidden). 

The network will only decrypt the message upon a certain condition. For example, "timed encryption" means the network will release the private key material only after a certain time. If the condition is based on the exchange of tokens, the network will only release the material after the exhange has taken place. Etc.

**Usages:** Sealed bid auctions, timed encryptions, complex reward system (a complex condition will trigger the public decryption of the reward) etc

**Performance:** 

- For the network, it is similar to threshold BLS
- For the decrypting an encrypted message client performs 1-2 pairings + XOR
    - Some pre-computation can be done

**Future:**

Look into using IBE for everything (public/private encryption). See FAQ.

### Protocol details

This scheme is a direct application of the [Identity Based Encryption scheme](https://crypto.stanford.edu/~dabo/papers/bfibe.pdf) from Boneh et al. (section 4.2) to the threshold and BLS setting.

For each instance of the protocol, we designate an $id$ and the corresponding public key. For example, for "timed encryption", the ID would be the round number $r$:

$$
Q_{id} = H_1(id) = H_1(r) \in \mathbb{G_2}
$$

**Encryption**: A client that wishes to encrypt a message $m \in \{0,1\}^l$ "towards" the ID will perform the following:

1. Compute $G_{id} = e(P,Q_{id}) = e(P,H_1(id))$
    - This can be pre-computed
2. Choose a random $\sigma \in \{0,1\}^l$
3. Set $r = H_3 (\sigma, m)$ where $H_3: \{0,1\}^* \rightarrow F_q$ is a secure hash function
4. Output the ciphertext:

$$
C = \{U,V,W\} = \{ rG_1, \sigma \oplus H_2(r G_{id}), m \oplus H_4(\sigma)\}
$$

where $H_2: \mathbb{G_t} \rightarrow \{0,1\}^l$ and $H_4: \{0,1\}^l \rightarrow \{0,1\}^l$ are both secure hash functions.

**Decryption:** 

1. Once the threshold network decides it can decrypt the ciphertext, i.e. that the condition is validated, then it computes the BLS signature over the $id$ in a threshold way:
    1. $\pi_{id} = sH(id) \in G_1$
    2. It publishes $\pi_{id}$
2. At this point, anybody can decrypt the ciphertext in the following way
    1. Compute $\sigma = V \oplus H_2(e(U, \pi_{id}))$ 
    2. Compute $M = W \oplus H_4(\sigma)$
    3. Set $r = H_3(\sigma, m)$
    4. Test that $U = rG_1$ - if not, reject.
    5. M is the decrypted ciphertext

**Completeness:**

1. Computation of $\sigma$

$$
\begin{gather*}
    \sigma = V \oplus H_2(e(U,\pi_{id})) =\\ \sigma \oplus H_2(rG_{id}) \oplus H_2(e(rG_1,sH_1(id))) = \\ \sigma \oplus H_2(rse(G_1,H_1(id))) \oplus H_2(rse(G_1,H_1(id))) = \\\sigma
\end{gather*}
$$

1. Computation of  $M$:

$$
M = W \oplus H_4(\sigma) = M \oplus H_4(\sigma) \oplus H_4(\sigma)= M
$$

### Optimization: precomputation

The decryption still requires one pre-computed pairing and one individual pairing per decryption. A pairing can be costly and thus, having a way to batch decrypt would be very beneficial to using this method at scale and on-chain.

We introduce here roles to differentiate the computations: 

- The **encrypter** (the persons encrypting the message**,**
- The **helper (**the party precomputing expensive operations to help decryption)**,**
- The **decrypter** (the party actually doing the decryption, can be onchain).

**Signature Embedding**:

The encrypter will prefix/suffix its message $m$ with a signature $\pi_M$ over $m$ and it encrypts the results:

$$
m' = Sig(m) \textrm{ } || \textrm{ }  m
$$

Once the helper has access to the signature related to the $id$, then it precomputes the following for all encrypted transactions for this epoch:

$$
\sigma_i = V \oplus H_2(e(U_i, \pi_{id}))
$$

and submits this to the decrypter.

The decrypter actually decrypts all the messages with a simple XOR:

$$
m_i' = W_i \oplus \sigma_i 
$$

and verifies if the embedded signature is correct for each $m'$.
If it is correct, it outputs the message $m_i$ . If it is not correct, it has to decide whether the encrypter or the helper has been misbehaving, i.e. either the signature is incorrect or the $\sigma_i$ given is incorrect. To do this he continues the decryption check:

$$
r_i = H_4(\sigma_i, m_i') \textrm{ } ^ \textrm{ } U_i =^? r_iG_1
$$

- If the check doesn't pass, that means the **helper** has been misbehaving. In this case, the **decrypter** has to run the full decryption algorithm (either onchain or as part of recovery protocol with additional delay)
- If the check pass, that means the **encrypter** has inserted an invalid signature into its message and in this case, the decryption should be discarded.

In the case of a honest helper, then he can try to decrypt all the ciphertext himself before, and only include ciphertext that leads to valid signatures and reject the ones that are not. The right incentives will bias the behavior towards the honest one.


## FAQ

- Why not using proxy re-encryption techniques with a single node ?
    - It is assumed the recipient and the proxy are not colluding, one of them is honest. By decentralizing the proxy, we ensure that the proxy is honest.
- In private decryption, why are encryption done on $G_2$ ?
    - Using naive ElGamal encryption, it's either we put the public keys on $G_1$ but then the randomness signatures have to be on $G_2$ and therefore they're bigger. Or we put public keys on $G_2$ but then ciphertext are on $G_2$: it's a tradeoff. We can play with both.
- Why don't we use IBE for everything ? (public and private decryption)
    - WE CAN ! Maybe we should ! Questions for private decryption is of integration: how do someone proves its identity, what is the identity based on etc.
    - Need more literature review on this - don't know enough atm

## Research/Protocol Questions

1. Free Riding problem: how do incentivize nodes to DO something, and not just gaining money without actually not running any software.
2. In private decryption:
    1. Can we get a proof of correct encryption of message $m$ ? i.e. that $C$ is well formed for any message $m$ ?
    2. For local aggregation, can we get non-interactive proofs that the decryption shares are valid wrt to the original ciphertext ?
    3. For public aggregation, can we get non-interactive proofs that the aggregated ciphertext is valid wrt to the original ciphertext?
    4. Is there a "pairing" enabled encryption scheme such that ciphertexts are on $G_1$ , like BLS signature ? 
        1. Maybe can we re-use IBE and encrypt the result
3. Public decryption:
    1. Can we a "batchable" decryption algorithm, for the same $id$  ?
4. Do we need receiver privacy ?  This is likely to be tackled at the protocol level though.
5. Get a solid ground on the security of using El Gamal with type 3 bilinear maps without isomorphism between G1 and G2 (i.e. encryption only uses one or the other) , so under XDH setting → can we get cca there ?


## References

**Re-encryption:**

Overview: [https://www.cs.jhu.edu/~susan/600.641/scribes/lecture17.pdf](https://www.cs.jhu.edu/~susan/600.641/scribes/lecture17.pdf)

Green et al. [https://eprint.iacr.org/2005/028.pdf](https://eprint.iacr.org/2005/028.pdf)

ID based, Green et al. : [https://eprint.iacr.org/2006/473.pdf](https://eprint.iacr.org/2006/473.pdf)

Key private (hiding recipient): [https://eprint.iacr.org/2008/463.pdf](https://eprint.iacr.org/2008/463.pdf) 

Calypso: El Gamal based data management [https://infoscience.epfl.ch/record/287444/files/3436905.3436917 (1).pdf](https://infoscience.epfl.ch/record/287444/files/3436905.3436917%20%281%29.pdf)