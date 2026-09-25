# ShieldScore — Midnight Dual-Token Economics & DUST Gas Mechanics

> **Protocol Mechanics**: Substrate Dual-Token Architecture (`NIGHT` and `DUST`)  
> **Registration Method**: Extrinsic `registerForDustGeneration(true)`  
> **Network Scope**: Midnight Preprod & Preview

---

## 1. Dual-Token Architecture Overview

Unlike monolithic single-token blockchains (e.g. Ethereum using ETH for both value transfer and gas fees), the Midnight Network employs an innovative dual-token design:

1. **`NIGHT` (Native Shielded Asset)**:
   - Primary store of value, governance token, and staking asset on Midnight.
   - Denominated in whole `NIGHT` units ($1\text{ NIGHT} = 10^6\text{ Specks}$).
   - Held in unshielded and shielded UTXO balances.

2. **`DUST` (Dynamic Network Resource)**:
   - Dynamic fee token used exclusively to meter computation, zero-knowledge verification, and state storage.
   - Automatically generated continuously by UTXOs holding `NIGHT`.
   - Cannot be transferred or traded independently; bound directly to the generating wallet address.

---

## 2. On-Chain Extrinsic Registration

To participate in DUST generation, a newly funded wallet address must submit a registration extrinsic to the Midnight Substrate consensus layer:

```typescript
// Submitting DUST generation registration via Midnight SDK
const dustRegistrationTx = await wallet.submitExtrinsic({
  section: 'dustModule',
  method: 'registerForDustGeneration',
  args: [true] // enable continuous generation
});
```

On ShieldScore's live Preprod deployer address (`mn_addr_preprod170a8...`):
- `registeredForDustGeneration: true`
- Accumulated Dust Balance: $2.57 \times 10^{16}\text{ Specks}$
- Ensures 100% autonomous transaction execution without third-party gas relays or fee sponsor dependencies.

---

## 3. Gas Metering in Zero-Knowledge Execution

When executing a ShieldScore Compact circuit:
1. Local proving consumes zero on-chain gas (executed in client CPU/RAM).
2. The transaction submitted to the ledger pays a flat base fee plus state modification units metered in `DUST`.
3. Verifying Groth16 pairings on-chain consumes approximately $1.2 \times 10^9\text{ DUST Specks}$, ensuring predictable and micro-cost settlement.
