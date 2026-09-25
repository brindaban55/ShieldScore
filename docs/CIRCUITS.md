# AegisSolv — Zero-Knowledge Compact Circuits Guide

> **Compact Version**: 0.23+ / 0.31+  
> **Source File**: `contract/src/shieldscore.compact`  
> **Proof System**: Groth16 zk-SNARK with BLS12-381 pairing curves  
> **Deployment Network**: Midnight Preview (`0xae6c1533...`) & Preprod (`0xfc67e285...`)

---

## 📐 Circuit Architecture Overview

AegisSolv compiles zero-knowledge circuits using Midnight's **Compact** domain-specific language. Circuits act as verifiable state-transition functions that evaluate off-chain private witness inputs against on-chain public underwriting covenants without revealing the witness data. This architecture enables institutional counterparties to prove solvency and debt-service capacity without surrendering proprietary financial positions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                         AEGISSOLV DUAL-STATE MODEL                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   PRIVATE WITNESS (Client RAM Only)          PUBLIC LEDGER STATE       │
│   • getCreditScore(): Uint<64>              • minCreditScore: Uint<64> │
│   • getAnnualIncome(): Uint<64>             • minAnnualIncome: Uint<64>│
│   • getDebtToIncomeRatioBps(): Uint<64>     • maxDebtToIncome: Uint<64>│
│   • getCollateralRatioBps(): Uint<64>       • minCollateral: Uint<64>  │
│   • getApplicantSecretSalt(): Bytes<32>     • verificationCount: Uint  │
│                     │                       • lastVerifiedRiskTier     │
│                     ▼                                  ▲               │
│          ┌──────────────────────┐                      │               │
│          │ Compact ZK Circuit   │──────────────────────┘               │
│          │ (Mathematical Proof) │  Discloses ONLY: Boolean Valid,      │
│          └──────────────────────┘  Risk Tier (1/2/3), Timestamp        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Circuit 1: `verifyCreditPassport`

### Objective
Enables an institutional counterparty — private credit fund, RWA originator, or corporate borrower — to generate a Zero-Knowledge Solvency Attestation proving financial capacity to prospective lending syndicates without disclosing revenue, asset coverage ratios, or debt-service schedules.

### Circuit Signature
```compact
export circuit verifyCreditPassport(
    expectedCommitment: Bytes<32>, 
    currentTimestamp: Uint<64>
): Boolean
```

### Parameters
* **`expectedCommitment: Bytes<32>` (Public):** The Pedersen hash of the counterparty's secret salt (`persistentHash(salt)`). Prevents witness substitution attacks.
* **`currentTimestamp: Uint<64>` (Public):** Epoch time of verification, anchoring the proof to a specific time window.

### Private Witness Functions (Off-Chain RAM)
```compact
witness getCreditScore(): Uint<64>;
witness getAnnualIncome(): Uint<64>;
witness getDebtToIncomeRatioBps(): Uint<64>;
witness getCollateralRatioBps(): Uint<64>;
witness getApplicantSecretSalt(): Bytes<32>;
```

### Mathematical Assertions
```compact
// 1. Salt Commitment Invariant
assert(applicantCommitment == expectedCommitment, "Applicant commitment verification failed");

// 2. Solvency Covenant Invariants
assert(score >= minCreditScore, "Solvency score does not meet minimum covenant requirement");
assert(income >= minAnnualIncome, "Verifiable revenue does not meet minimum covenant requirement");
assert(dtiBps <= maxDebtToIncomeRatioBps, "Debt service coverage exceeds maximum covenant threshold");
assert(collateralBps >= minCollateralRatioBps, "Collateral coverage below minimum covenant threshold");
```

### Algorithmic Tier Classification
* **Tier A (1) — Investment Grade:** Score $\ge 780$, DSCR $\le 30\%$, Collateral $\ge 200\%$. Unlocks investment-grade facility rates (6.2% APR).
* **Tier B (2) — Standard:** Score $\ge 720$, DSCR $\le 38\%$, Collateral $\ge 150\%$. Standard institutional rate (8.9% APR).
* **Tier C (3) — Baseline Acceptable:** Satisfies active baseline covenants. Standard rate (11.5% APR).

### Disclosed State Updates
```compact
lastVerificationResult = true;
lastVerifiedRiskTier = disclose(assignedTier);
lastVerifiedTimestamp = disclose(currentTimestamp);
verificationCount = disclose((verificationCount + 1) as Uint<64>);
return disclose(lastVerificationResult);
```

---

## 2. Circuit 2: `verifyCustomPolicy`

### Objective
Empowers external DeFi liquidity pools, DAO treasuries, RWA originators, and syndicated underwriters to evaluate counterparties against bespoke underwriting covenants dynamically, without redeploying the contract. This enables multi-syndicate deal structures where each participant has different risk appetites.

### Circuit Signature
```compact
export circuit verifyCustomPolicy(
    expectedCommitment: Bytes<32>,
    reqMinScore: Uint<64>,
    reqMinIncome: Uint<64>,
    reqMaxDtiBps: Uint<64>,
    reqMinCollateralBps: Uint<64>,
    customPolicyId: Uint<64>,
    currentTimestamp: Uint<64>
): Boolean
```

### Parameters
* `expectedCommitment: Bytes<32>`: Counterparty's cryptographic salt commitment.
* `reqMinScore: Uint<64>`: Syndicate-specific minimum solvency score (e.g. `740`).
* `reqMinIncome: Uint<64>`: Syndicate-specific minimum verifiable revenue in USD (e.g. `$75,000`).
* `reqMaxDtiBps: Uint<64>`: Maximum allowable debt-service coverage in basis points (e.g. `3200` = 32%).
* `reqMinCollateralBps: Uint<64>`: Minimum collateral coverage in basis points (e.g. `18000` = 180%).
* `customPolicyId: Uint<64>`: Unique syndicate or underwriter ID.
* `currentTimestamp: Uint<64>`: Verification timestamp.

### Assertions
```compact
assert(applicantCommitment == expectedCommitment, "Applicant commitment verification failed");
assert(score >= reqMinScore, "Custom Covenant: Solvency score requirement not satisfied");
assert(income >= reqMinIncome, "Custom Covenant: Revenue requirement not satisfied");
assert(dtiBps <= reqMaxDtiBps, "Custom Covenant: DSCR exceeds threshold");
assert(collateralBps >= reqMinCollateralBps, "Custom Covenant: Collateral coverage below threshold");
```

---

## 3. Circuit 3: `updatePolicy`

### Objective
Allows authorized protocol administrators, DAO governance multisigs, or institutional risk committees to update baseline underwriting covenants in response to macroeconomic shifts (e.g. rate cycle adjustments, credit contraction, regulatory mandates).

### Circuit Signature
```compact
export circuit updatePolicy(
    newMinScore: Uint<64>,
    newMinIncome: Uint<64>,
    newMaxDtiBps: Uint<64>,
    newMinCollateralBps: Uint<64>,
    newPolicyId: Uint<64>
): Boolean
```

### Parameters
* `newMinScore`: New global minimum solvency score (e.g. `700` $\to$ `710`).
* `newMinIncome`: New global minimum verifiable revenue (e.g. `$50,000` $\to$ `$55,000`).
* `newMaxDtiBps`: New maximum debt service ratio (e.g. `4000` $\to$ `3800` = 38%).
* `newMinCollateralBps`: New minimum collateral coverage (e.g. `15000` $\to$ `16000` = 160%).
* `newPolicyId`: Incremented covenant tracking index.

### Public Ledger Mutations
```compact
minCreditScore = disclose(newMinScore);
minAnnualIncome = disclose(newMinIncome);
maxDebtToIncomeRatioBps = disclose(newMaxDtiBps);
minCollateralRatioBps = disclose(newMinCollateralBps);
activePolicyId = disclose(newPolicyId);
return true;
```

---

## 4. How Circuits are Invoked

### Via TypeScript SDK (Node.js / DApp)
```typescript
import { Contract, createWitnessProviders } from '@shieldscore/contracts';

// 1. Define private witness in memory
const witnesses = createWitnessProviders({
  getCreditScore: () => 790n,
  getAnnualIncome: () => 120000n,
  getDebtToIncomeRatioBps: () => 2800n,
  getCollateralRatioBps: () => 21000n,
  getApplicantSecretSalt: () => secretSaltBytes,
});

// 2. Invoke circuit locally via Proof Server
const tx = await contract.verifyCreditPassport(
  witnesses,
  expectedCommitment,
  BigInt(Date.now())
);

// 3. Submit proof to Midnight consensus
const txReceipt = await tx.submit();
console.log('Proof verified on Midnight block:', txReceipt.blockHeight);
```

### Via Proof Server CLI (Direct Prover)
```bash
curl -X POST http://localhost:6300/prove \
  -H "Content-Type: application/json" \
  -d '{
    "circuit": "verifyCreditPassport",
    "publicInputs": {
      "expectedCommitment": "0x4bb06f8e4e3a7715d201d573d0aa423762e55dabd61a2c02278fa56cc6d294e0",
      "currentTimestamp": 1726054800
    }
  }'
```
