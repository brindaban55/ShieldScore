# ShieldScore — Zero-Knowledge Compact Circuits Guide

> **Compact Version**: 0.23+ / 0.31+  
> **Source File**: `contract/src/shieldscore.compact`  
> **Proof System**: Groth16 zk-SNARK with BLS12-381 pairing curves  
> **Deployment Network**: Midnight Preview (`0x0794f000...`) & Preprod (`0xfc67e285...`)

---

## 📐 Circuit Architecture Overview

ShieldScore compiles zero-knowledge circuits using Midnight's **Compact** domain-specific language. Circuits act as verifiable state-transition functions that evaluate off-chain private witness inputs against on-chain public ledger policies without revealing the witness data.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SHIELDSCORE DUAL-STATE MODEL                    │
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
Enables a retail borrower or corporate borrower to generate a Zero-Knowledge Credit Passport proving solvency to prospective DeFi lenders without doxxing salary, bureau score, or debt.

### Circuit Signature
```compact
export circuit verifyCreditPassport(
    expectedCommitment: Bytes<32>, 
    currentTimestamp: Uint<64>
): Boolean
```

### Parameters
* **`expectedCommitment: Bytes<32>` (Public):** The Pedersen hash of the applicant's secret salt (`persistentHash(salt)`). Prevents witness substitution attacks.
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

// 2. Solvency Threshold Invariants
assert(score >= minCreditScore, "Credit score does not meet minimum requirement");
assert(income >= minAnnualIncome, "Annual income does not meet minimum requirement");
assert(dtiBps <= maxDebtToIncomeRatioBps, "Debt-to-income ratio exceeds maximum threshold");
assert(collateralBps >= minCollateralRatioBps, "Collateral ratio below minimum threshold");
```

### Algorithmic Tier Classification
* **Tier A (1) — Prime Solvency:** Score $\ge 780$, DTI $\le 30\%$, Collateral $\ge 200\%$. Unlocks prime borrowing rates (6.2% APR).
* **Tier B (2) — Standard Solvency:** Score $\ge 720$, DTI $\le 38\%$, Collateral $\ge 150\%$. Standard competitive DeFi rate (8.9% APR).
* **Tier C (3) — Baseline Solvency:** Satisfies active baseline policy. Standard rate (11.5% APR).

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
Empowers external DeFi liquidity pools, DAO treasuries, and syndicated underwriters to evaluate borrowers against bespoke underwriting criteria dynamically, without redeploying the contract.

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
* `expectedCommitment: Bytes<32>`: Borrower's cryptographic salt commitment.
* `reqMinScore: Uint<64>`: Pool-specific minimum credit score (e.g. `740`).
* `reqMinIncome: Uint<64>`: Pool-specific minimum annual income in USD (e.g. `$75,000`).
* `reqMaxDtiBps: Uint<64>`: Maximum allowable debt-to-income in basis points (e.g. `3200` = 32%).
* `reqMinCollateralBps: Uint<64>`: Minimum collateral coverage in basis points (e.g. `18000` = 180%).
* `customPolicyId: Uint<64>`: Unique pool or underwriter ID.
* `currentTimestamp: Uint<64>`: Verification timestamp.

### Assertions
```compact
assert(applicantCommitment == expectedCommitment, "Applicant commitment verification failed");
assert(score >= reqMinScore, "Custom Policy: Credit score requirement not satisfied");
assert(income >= reqMinIncome, "Custom Policy: Income requirement not satisfied");
assert(dtiBps <= reqMaxDtiBps, "Custom Policy: DTI ratio exceeds threshold");
assert(collateralBps >= reqMinCollateralBps, "Custom Policy: Collateral ratio below threshold");
```

---

## 3. Circuit 3: `updatePolicy`

### Objective
Allows authorized protocol administrators, DAO governance multisigs, or risk committees to update baseline lending standards in response to macroeconomic shifts (e.g. interest rate adjustments, credit contraction).

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
* `newMinScore`: New global minimum score (e.g. `700` $\to$ `710`).
* `newMinIncome`: New global minimum income (e.g. `$50,000` $\to$ `$55,000`).
* `newMaxDtiBps`: New maximum debt ratio (e.g. `4000` $\to$ `3800` = 38%).
* `newMinCollateralBps`: New minimum collateral buffer (e.g. `15000` $\to$ `16000` = 160%).
* `newPolicyId`: Incremented policy tracking index.

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
