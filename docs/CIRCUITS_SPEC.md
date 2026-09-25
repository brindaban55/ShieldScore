# ShieldScore: Zero-Knowledge Circuits Specification

> **Contract File**: `contract/src/shieldscore.compact`  
> **Compiler**: Compact v0.23+ / v0.31+  
> **Proof System**: Groth16 zk-SNARK with BLS12-381 Curve  
> **Proving Engine**: Client-Side Proof Server (`http://localhost:6300`) / WASM

---

## 📐 Circuit 1: `verifyCreditPassport`

### Objective
Enables a borrower to mathematically prove they satisfy the active protocol underwriting policy without disclosing their exact credit score, salary, or debt balances.

### Private Witness Inputs (Never Disclosed)
| Witness Variable | Type | Description | Privacy Guarantee |
| :--- | :--- | :--- | :--- |
| `creditScore` | `Uint<16>` | FICO / Bureau score (e.g. 785) | Stays in local RAM |
| `annualIncome` | `Uint<64>` | Annual verifiable salary in USD (e.g. 115,000) | Stays in local RAM |
| `debtToIncomeRatioBps` | `Uint<16>` | Debt-to-income ratio in basis points (e.g. 2850 = 28.50%) | Stays in local RAM |
| `collateralRatioBps` | `Uint<16>` | Committed collateral buffer in basis points (e.g. 21000 = 210.00%) | Stays in local RAM |
| `applicantSecretSalt` | `Bytes<32>` | 256-bit cryptographically secure blinding factor | Stays in local RAM |

### Public Inputs & Consensus State
| Parameter | Type | Provenance |
| :--- | :--- | :--- |
| `expectedCommitment` | `Bytes<32>` | Pedersen hash commitment of applicant identity |
| `currentTimestamp` | `Uint<64>` | Verification epoch timestamp |
| `activePolicy.minCreditScore` | `Uint<16>` | Read from on-chain public ledger |
| `activePolicy.minAnnualIncome` | `Uint<64>` | Read from on-chain public ledger |
| `activePolicy.maxDebtToIncomeBps` | `Uint<16>` | Read from on-chain public ledger |
| `activePolicy.minCollateralRatioBps` | `Uint<16>` | Read from on-chain public ledger |

### Mathematical Constraints Evaluated
1. **Solvency Gate**:
   $$\text{creditScore} \ge \text{activePolicy.minCreditScore}$$
   $$\text{annualIncome} \ge \text{activePolicy.minAnnualIncome}$$
   $$\text{debtToIncomeRatioBps} \le \text{activePolicy.maxDebtToIncomeBps}$$
   $$\text{collateralRatioBps} \ge \text{activePolicy.minCollateralRatioBps}$$

2. **Algorithmic Risk Tiering**:
   $$\text{Tier A (Prime)} \iff \text{creditScore} \ge 780 \;\wedge\; \text{debtToIncomeRatioBps} \le 3000$$
   $$\text{Tier B (Standard)} \iff \text{creditScore} \ge 720 \;\wedge\; \text{debtToIncomeRatioBps} \le 3800$$
   $$\text{Tier C (Near-Prime)} \iff \text{satisfies baseline criteria}$$

3. **Selective Disclosure**:
   ```compact
   disclose(isSatisfied);
   disclose(derivedRiskTier);
   disclose(currentTimestamp);
   ```

---

## 📐 Circuit 2: `verifyCustomPolicy`

### Objective
Permits external DeFi liquidity pools, syndicated lenders, or DAO treasuries to specify custom underwriting requirements on the fly without deploying a new contract instance.

### Additional Circuit Arguments
* `reqMinScore`: `Uint<16>` (Custom minimum score)
* `reqMinIncome`: `Uint<64>` (Custom minimum income)
* `reqMaxDti`: `Uint<16>` (Custom maximum debt ratio)
* `reqMinCollateral`: `Uint<16>` (Custom collateral requirement)
* `policyId`: `Uint<32>` (Unique pool / institutional identifier)
* `timestamp`: `Uint<64>` (Execution timestamp)

---

## 📐 Circuit 3: `updatePolicy`

### Objective
Enables authorized protocol administrators or DAO governance multi-sigs to adjust baseline underwriting standards on-chain in response to macroeconomic shifts.

### Ledger State Updates
```compact
ledger.minScore = newMinScore;
ledger.minIncome = newMinIncome;
ledger.maxDti = newMaxDti;
ledger.minCollateral = newMinCollateral;
ledger.activePolicyId = newPolicyId;
```
