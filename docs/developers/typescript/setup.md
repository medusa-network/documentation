---
sidebar_position: 2
---

# Setup

First, you need to initialize the Medusa SDK by giving:
* The Medusa encryption oracle contract address
* The web3 signer connected to a provider

```typescript
import { Medusa } from "@medusa-network/medusa-sdk";
import { Wallet } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

// Filecoin Hyperspace Testnet
// const medusaAddress = "0xd466a3c66ad402aa296ab7544bce90bbe298f6a0";

// Arbitrum Goerli Testnet
const medusaAddress = "0xf1d5A4481F44fe0818b6E7Ef4A60c0c9b29E3118";
const provider = new JsonRpcProvider("https://goerli-rollup.arbitrum.io/rpc");
const signer = new Wallet("abc-my-privatekey").connect(provider);

const medusa = Medusa.init(medusaAddress, signer);
```

This initialization steps automatically fetch both (a) the suite type and (b) the public key to 
encrypt to Medusa, from the Medusa contract.

**Note**: Currently we only support ethers but we will generalize to more generic 
way in the near future.

