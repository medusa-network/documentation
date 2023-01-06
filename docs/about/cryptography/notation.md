---
sidebar_position: 1
---

# Notation

We note $n$ the number of nodes that have a secret share, and $t < n$ the threshold of the network. Each node $i$ is identified by their long term public key $P_i$ and have a secret key $sk_i$.

We call $Q$ the set of qualified node that have successfully ran the DKG, i.e. each node in $Q$ have a partial share $s_i$ corresponding to the distributed secret key $s$ and public key $P = sG$ where $G$ is the generator of the group (without indices means we refer to the "keys of the DKG").

We call the threshold network $GT$ as Generalized Threshold. 

We call the Lagrange basis polynomials the following:

$$
\delta_j(x) = \prod_
{i, i \neq j} \frac{x - x_i}{x_j - x_i}
$$

such that $\delta_j(x_j) = 1$ and $\delta_j(x_i) = 0$ with $i ≠ j$

When not specified otherwise, we will use a pairing equipped elliptic curve of type III. Namely:

- There are three groups $\mathbb{G_1},\mathbb{G_2},\mathbb{G_T}$ of order $q$, with associated generators $G_1,G_2,G_t$.
- There exists an efficiently computable bilinear map $e: \mathbb{G_1} \times \mathbb{G_2} \rightarrow \mathbb{G_T}$.
- We will place the key on the $\mathbb{G_1}$ group: $P = sG_1$ but that is not fixed.

Specifically for our current deployment, Medusa uses the bn254 family of curves.