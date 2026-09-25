# ShieldScore — Institutional Usage, Auditor & Investor Guide

> **Confidential Solvency Attestation & Institutional Private Credit Underwriting on Midnight Network**  
> *Official Walkthrough for Hackathon Evaluators, Institutional Integrators, and Compliance Auditors.*

---

## 📑 Table of Contents
1. [Overview & Value Proposition](#overview--value-proposition)
2. [Supported Networks & Deployed Contracts](#supported-networks--deployed-contracts)
3. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
4. [Step-by-Step Protocol Walkthrough](#step-by-step-protocol-walkthrough)
   - [Step 1: Connecting Your Midnight Wallet](#step-1-connecting-your-midnight-wallet)
   - [Step 2: Institutional Financial Attestation Ingestion](#step-2-institutional-financial-attestation-ingestion)
   - [Step 3: Generating Confidential Solvency Proof (`verifyCreditPassport`)](#step-3-generating-confidential-solvency-proof-verifycreditpassport)
   - [Step 4: On-Chain Public Ledger Audit](#step-4-on-chain-public-ledger-audit)
   - [Step 5: Capital Facility Pricing & Rate Locking](#step-5-capital-facility-pricing--rate-locking)
   - [Step 6: Institutional Covenant Management (`updatePolicy`)](#step-6-institutional-covenant-management-updatepolicy)
   - [Step 7: Syndicated Custom Underwriting (`verifyCustomPolicy`)](#step-7-syndicated-custom-underwriting-verifycustompolicy)
5. [Cryptographic Privacy Invariants](#cryptographic-privacy-invariants)
6. [Explorer Verification Guide](#explorer-verification-guide)

---

## 1. Overview & Value Proposition

Traditional institutional private credit origination and RWA (Real-World Asset) tokenization requires counterparties to surrender audited financial statements, capitalization tables, and proprietary revenue data to every prospective lender in a syndicated deal. In DeFi, the absence of verifiable solvency attestations forces protocols to mandate **150%–200% overcollateralization**, locking billions in idle capital.

**ShieldScore resolves this using Midnight's Dual-State Architecture:**
* **Private State (Off-chain client witness):** Contains the counterparty's exact solvency metrics — asset coverage ratios, verifiable revenue, debt service coverage, and secret salt. This data **never touches the network**.
* **Public Ledger State (On-chain Midnight consensus):** Stores only the boolean verification outcome, assigned risk tier (Tier A/B/C), settlement block, and cryptographic Pedersen commitment.

Institutional counterparties unlock **capital-efficient facility terms (as low as 6.2% APR at 110% collateral)** while maintaining complete financial confidentiality.

---

## 2. Supported Networks & Deployed Contracts

| Network | Contract Address | Explorer Verification Link | Block Height |
| :--- | :--- | :--- | :--- |
| **Midnight Preview** | `0x0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123` | [Audit on Preview Explorer](https://preview.midnightexplorer.com/contracts/0x0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123) | `#1016024` |
| **Midnight Preprod** | `0xfc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b` | [Audit on Preprod Explorer](https://preprod.midnightexplorer.com/contract/fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b) | `#841920` |

---

## 3. Prerequisites & Environment Setup

### Option A: Testing via Live Web dApp (Zero Setup)
1. Open the deployed application: `http://localhost:5174/` (or production URL).
2. Works directly in modern web browsers (Chrome, Brave, Edge).

### Option B: Local Development & Proof Server
```bash
# Clone the repository
git clone https://github.com/brindaban55/ShieldScore.git
cd ShieldScore

# Start Midnight Proof Server (Docker)
docker run -p 6300:6300 midnightnetwork/proof-server:latest

# Install dependencies and start frontend
cd frontend
npm install
npm run dev
```

---

## 4. Step-by-Step Protocol Walkthrough

### Step 1: Connecting Your Midnight Wallet
1. Navigate to the top-right header and click **Connect Wallet**.
2. Select your provider:
   - **Lace Midnight Wallet (Extension):** Standard browser extension flow. When transactions are executed, a Lace confirmation popup prompts for tDUST fee approval.
   - **Preview Explorer Mode:** Direct zero-friction developer mode communicating directly with the Midnight Preview network indexer and proof server.

### Step 2: Institutional Financial Attestation Ingestion
1. Under **Solvency Attestation**, select an authorized attestation source (e.g. *Institutional Credit Bureau*, *Verified Financial API*, or *Decentralized Oracle*).
2. Input representative institutional financial metrics:
   - **Solvency Score:** `790` (Qualifies for Tier A Investment Grade)
   - **Verifiable Revenue / AUM:** `$120,000` (Verifiable revenue threshold)
   - **Monthly Debt Service:** `$2,800` (Calculates 28.0% Debt Service Coverage Ratio)
   - **Collateral Coverage Value:** `$210,000` (210% collateral coverage)
3. Observe the dynamic Solvency Covenant checklist turn green.

### Step 3: Generating Confidential Solvency Proof (`verifyCreditPassport`)
1. Click **Generate Private ZK Proof & Disclose Result**.
2. The local proving engine:
   - Constructs the private witness payload in local memory.
   - Computes the Pedersen identity commitment `H(salt)`.
   - Executes Groth16 zero-knowledge constraint assertions against active on-chain covenant parameters.
   - Generates the SNARK proof in ~1.8 seconds.
3. Submits the proof transaction to Midnight Preview consensus.

### Step 4: On-Chain Public Ledger Audit
1. The **Public Solvency Verification State** panel displays:
   - **Status:** `VERIFIED (ZK-SNARK VALID)`
   - **Assigned Risk Tier:** `Tier A — Investment Grade`
   - **Settlement Block:** `#1016024`
   - **On-Chain Contract:** `0x0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123`
2. Click **Audit in Preview Explorer ↗** to inspect the live contract bytecode and state in Midnight Explorer.

### Step 5: Capital Facility Pricing & Rate Locking
1. Click **Apply Verified Passport to Capital Facility Engine →**.
2. Adjust the facility slider between **\$10,000 and \$250,000**.
3. Because your verified status is **Tier A**, the facility APR automatically drops from the baseline **14.8% down to 6.2%**.
4. Click **Lock Instant Zero-Knowledge Facility Offer** to secure your capital-efficient term sheet.

### Step 6: Institutional Covenant Management (`updatePolicy`)
1. Navigate to the **Underwriting Console** tab.
2. Risk committees and syndicate administrators can adjust macroeconomic underwriting covenants:
   - Minimum Solvency Score (e.g. `710`)
   - Minimum Verifiable Revenue (e.g. `$55,000`)
   - Maximum Debt Service Coverage Ratio (e.g. `38%`)
   - Minimum Collateral Coverage (e.g. `160%`)
3. Click **Commit Covenant to Midnight Preview Ledger**.
4. The `updatePolicy` circuit mutates the public ledger state (Tx ID: `00c2304e46dfba925be34227e69b9b2876b3117b...`).

### Step 7: Syndicated Custom Underwriting (`verifyCustomPolicy`)
Institutional syndicates, RWA originators, and private credit funds can specify bespoke underwriting covenants dynamically without deploying a separate contract:
```typescript
await contract.verifyCustomPolicy({
  expectedCommitment: counterpartyCommitment,
  reqMinScore: 740n,
  reqMinIncome: 75000n,
  reqMaxDtiBps: 3200n,
  reqMinCollateralBps: 18000n,
  customPolicyId: 104n,
  currentTimestamp: BigInt(Date.now()),
});
```

---

## 5. Cryptographic Privacy Invariants

The table below outlines what is disclosed versus what is cryptographically sealed:

| Financial Field | Plaintext Value | On-Chain State | Leakage Risk |
| :--- | :--- | :--- | :--- |
| **Solvency Score** | `790` | `NOT STORED` | **0.0%** (Mathematical guarantee) |
| **Verifiable Revenue** | `$120,000` | `NOT STORED` | **0.0%** (Mathematical guarantee) |
| **Debt Service Obligations** | `$2,800/mo` | `NOT STORED` | **0.0%** (Mathematical guarantee) |
| **Collateral Coverage** | `$210,000` | `NOT STORED` | **0.0%** (Mathematical guarantee) |
| **Identity / Salt** | `Witness Salt` | `Pedersen Hash` | **0.0%** (Pre-image resistant) |
| **Underwriting Gate** | `Passed` | `true` | Publicly verifiable |
| **Assigned Risk Tier** | `Tier A` | `1` | Publicly verifiable |

---

## 6. Explorer Verification Guide

When verifying transactions and contracts on Midnight Explorer:
1. **Contract Search:** Always use the full contract address prefixed with `0x`:  
   `0x0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123`
2. **Commitment Hashes:** Blinded commitments (e.g. `0x4bb06f8e...`) are private ZK witness secrets stored in local client state and are **not** indexed in public block explorer search bars.
3. **Block Verification:** Search mined block `#1016024` on [Midnight Preview Explorer Blocks](https://preview.midnightexplorer.com/blocks/1016024).
