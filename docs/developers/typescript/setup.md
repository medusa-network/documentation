---
sidebar_position: 2
---

# Setup

First, you need to initialize the Medusa SDK by giving:
* The Medusa encryption oracle contract address
* The web3 provider


```typescript
import { Medusa } from "@medusa-network/medusa-sdk";

// TODO put real address
const medusaAddress = "0x00sdadqwdqwdqwd";
const medusa = Medusa.init(medusaAddress, provider);
const 
```

This initialization steps automatically fetch both (a) the suite type and (b) the public key to 
encrypt to Medusa, from the Medusa contract.

**Note**: Currently we only support ethers but we will generalize to more generic 
way in the near future.

