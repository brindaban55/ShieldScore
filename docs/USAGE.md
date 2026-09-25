# ShieldScore — User, Auditor & Investor Usage Guide

> **Confidential Credit Underwriting & Zero-Knowledge Solvency Verification on Midnight Network**  
> *Official Walkthrough for Hackathon Evaluators, DeFi Integrators, and Node Operators.*

---

## 📑 Table of Contents
1. [Overview & Value Proposition](#overview--value-proposition)
2. [Supported Networks & Deployed Contracts](#supported-networks--deployed-contracts)
3. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
4. [Step-by-Step Protocol Walkthrough](#step-by-step-protocol-walkthrough)
   - [Step 1: Connecting Your Midnight Wallet](#step-1-connecting-your-midnight-wallet)
   - [Step 2: Financial Attestation Ingestion](#step-2-financial-attestation-ingestion)
   - [Step 3: Generating Private ZK Proof (`verifyCreditPassport`)](#step-3-generating-private-zk-proof-verifycreditpassport)
   - [Step 4: On-Chain Public Ledger Audit](#step-4-on-chain-public-ledger-audit)
   - [Step 5: DeFi Loan Rate Locking](#step-5-defi-loan-rate-locking)
   - [Step 6: Institutional Policy Management (`updatePolicy`)](#step-6-institutional-policy-management-updatepolicy)
   - [Step 7: Syndicated Custom Underwriting (`verifyCustomPolicy`)](#step-7-syndicated-custom-underwriting-verifycustompolicy)
5. [Cryptographic Privacy Invariants](#cryptographic-privacy-invariants)
6. [Explorer Verification Guide](#explorer-verification-guide)

---

## 1. Overview & Value Proposition

Traditional DeFi lending requires **150%–200% overcollateralization** because blockchains cannot natively evaluate borrower creditworthiness without doxxing sensitive personal finances.

**ShieldScore resolves this dilemma using Midnight's Dual-State Architecture:**
* **Private State (Off-chain client witness):** Contains the borrower's exact FICO score, annual income, monthly debt obligations, and secret salt. This data **never touches the network**.
* **Public Ledger State (On-chain Midnight consensus):** Stores only the boolean verification outcome, assigned risk tier (Tier A/B/C), settlement block, and cryptographic Pedersen commitment.

Borrowers unlock **undercollateralized loan rates (as low as 6.2% APR)** while maintaining 100% financial confidentiality.

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

### Step 2: Financial Attestation Ingestion
1. Under **Borrower Passport**, select an authorized attestation authority (e.g. *Experian Credit Bureau*, *Equifax Verified API*, or *Decentralized Oracle*).
2. Input representative financial metrics:
   - **Credit Score:** `790` (Qualifies for Tier A Prime Solvency)
   - **Annual Income:** `$120,000` (Verifiable earner threshold)
   - **Monthly Debt:** `$2,800` (Calculates 28.0% Debt-to-Income ratio)
   - **Collateral Value:** `$210,000` (210% collateral coverage)
3. Observe the dynamic Solvency Invariant checklist turn green.

### Step 3: Generating Private ZK Proof (`verifyCreditPassport`)
1. Click **Generate Private ZK Proof & Disclose Result**.
2. The local proving engine:
   - Constructs the private witness payload in local memory.
   - Computes the Pedersen identity commitment `H(salt)`.
   - Executes Groth16 zero-knowledge constraint assertions against active on-chain policy parameters.
   - Generates the SNARK proof in ~1.8 seconds.
3. Submits the proof transaction to Midnight Preview consensus.

### Step 4: On-Chain Public Ledger Audit
1. The **Public Credit Verification State** panel displays:
   - **Status:** `VERIFIED (ZK-SNARK VALID)`
   - **Assigned Risk Tier:** `Tier A — Prime Solvency`
   - **Settlement Block:** `#1016024`
   - **On-Chain Contract:** `0x0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123`
2. Click **Audit in Preview Explorer ↗** to inspect the live contract bytecode and state in Midnight Explorer.

### Step 5: DeFi Loan Rate Locking
1. Click **Apply Verified Passport to DeFi Loan Engine →**.
2. Adjust the borrow slider between **$10,000 and $250,000**.
3. Because your verified status is **Tier A**, the borrow APR automatically drops from the baseline **14.8% down to 6.2%**.
4. Click **Lock Instant Zero-Knowledge Loan Offer** to secure your undercollateralized term sheet.

### Step 6: Institutional Policy Management (`updatePolicy`)
1. Navigate to the **Lender Console** tab.
2. Underwriters and pool administrators can adjust macroeconomic risk parameters:
   - Minimum Credit Score (e.g. `710`)
   - Minimum Annual Income (e.g. `$55,000`)
   - Maximum DTI Ratio (e.g. `38%`)
   - Minimum Collateral (e.g. `160%`)
3. Click **Commit Policy to Midnight Preview Ledger**.
4. The `updatePolicy` circuit mutates the public ledger state (Tx ID: `00c2304e46dfba925be34227e69b9b2876b3117b...`).

### Step 7: Syndicated Custom Underwriting (`verifyCustomPolicy`)
Institutional syndicates can specify bespoke underwriting requirements dynamically without deploying a separate contract:
```typescript
await contract.verifyCustomPolicy({
  expectedCommitment: borrowerCommitment,
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
| **Credit Score** | `790` | `NOT STORED` | **0.0%** (Mathematical guarantee) |
| **Annual Income** | `$120,000` | `NOT STORED` | **0.0%** (Mathematical guarantee) |
| **Debt Obligations** | `$2,800/mo` | `NOT STORED` | **0.0%** (Mathematical guarantee) |
| **Collateral Assets** | `$210,000` | `NOT STORED` | **0.0%** (Mathematical guarantee) |
| **Identity / SSN** | `Witness Salt` | `Pedersen Hash` | **0.0%** (Pre-image resistant) |
| **Underwriting Gate** | `Passed` | `true` | Publicly verifiable |
| **Assigned Risk Tier** | `Tier A` | `1` | Publicly verifiable |

---

## 6. Explorer Verification Guide

When verifying transactions and contracts on Midnight Explorer:
1. **Contract Search:** Always use the full contract address prefixed with `0x`:  
   `0x0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123`
2. **Commitment Hashes:** Blinded commitments (e.g. `0x4bb06f8e...`) are private ZK witness secrets stored in local client state and are **not** indexed in public block explorer search bars.
3. **Block Verification:** Search mined block `#1016024` on [Midnight Preview Explorer Blocks](https://preview.midnightexplorer.com/blocks/1016024).
