# ShieldScore — Private Credit Passport Walkthrough

## Overview

ShieldScore is an institutional-grade, privacy-preserving financial eligibility and confidential credit-verification platform built natively on the **Midnight Network (Preview)**.

Borrowers hold sensitive personal financial metrics (credit score, income, debt-to-income ratio, collateral ratio) exclusively on their local device. Using client-side zero-knowledge circuits, users generate mathematical proofs ($\pi$) demonstrating compliance with lender underwriting policies without exposing any raw financial data.

---

## 🌐 Dual-Network Deployments: Preprod & Preview

ShieldScore features native dual-network deployment across both official Midnight test networks:

### 1. Midnight Preprod Deployment (Live)

| Action / Operation | Scope / Users | Transaction Hash / Contract Address | Live Preprod Explorer Proof Link |
| :--- | :--- | :--- | :--- |
| **Contract Deployment** | Protocol Contract Initialization | `fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b` | [View Preprod Contract](https://preprod.midnightexplorer.com/contract/fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b) |
| **Deployment Transaction** | Deployer Fee & State Allocation | `0011bbbdced984ef7addf6d457fbdb71303153dbd2be4577bb19ec7675e0b54a2d` | [View Preprod Block `0xd34460...`](https://preprod.midnightexplorer.com/contract/fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b) |
| **Deployer Account** | Admin / Deployer ($5,000\text{ tNIGHT}$) | `mn_addr_preprod170a8t0cndggvvdx0x4c69s2fddavxggrw33e40jh6406ykg7sessmcp5dm` | [View Address on Preprod](https://preprod.midnightexplorer.com) |
| **DUST Registration** | On-Chain UTXO DUST Generation | Active ($2.57 \times 10^{16}\text{ Specks}$) | `registeredForDustGeneration: true` |

### 2. Midnight Preview Deployment (Live)

Every transaction and contract execution below is permanently indexed and verifiable on the **Midnight Preview Testnet**:

| Action / Operation | Scope / Users | Transaction Hash / Contract Address | Live Preview Explorer Proof Link |
| :--- | :--- | :--- | :--- |
| **Contract Deployment** | Protocol Contract Initialization | `0x0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123` | [View Contract #976,200](https://preview.midnightexplorer.com/contracts/0x0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123) |
| **Deployment Transaction** | Deployer Fee & State Allocation | `0xce79ed221100049c4a93dd1bc98d198900165355b8ef595ff9f9d8437733a177` | [View Block #976,200](https://preview.midnightexplorer.com/contracts/0x0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123) |
| **Genesis Token Transfer** | Account 1 ➔ Account 2 (10 tNIGHT) | `00a316392a69bef3ee1d034c20c8db898b2e34748857f61780c28e13fa9d1684c4` | [View Transaction](https://preview.midnightexplorer.com/tx/00a316392a69bef3ee1d034c20c8db898b2e34748857f61780c28e13fa9d1684c4) |
| **Batch 0 Onboarding Seed** | Users #2 – #10 (10 tNIGHT each) | `0073fbd0995a2ccd3767eb8fb71bb60e33ddd17bdb782538dd53cda653a8527a02` | [View Transaction](https://preview.midnightexplorer.com/tx/0073fbd0995a2ccd3767eb8fb71bb60e33ddd17bdb782538dd53cda653a8527a02) |
| **Batch 1 Funding** | Users #2, #3, #4 (250 tNIGHT each) | `004cb8841572fac6c8874501b9e28ed1e1928908cfe3a6a75722c1c00523d0b164` | [View Transaction](https://preview.midnightexplorer.com/tx/004cb8841572fac6c8874501b9e28ed1e1928908cfe3a6a75722c1c00523d0b164) |
| **Batch 2 Funding** | Users #5, #6, #7 (250 tNIGHT each) | `00346e6f820af748f6f7c0351ced5650f24a48b60cade85f688b5f34a2577a25ad` | [View Transaction](https://preview.midnightexplorer.com/tx/00346e6f820af748f6f7c0351ced5650f24a48b60cade85f688b5f34a2577a25ad) |
| **Batch 3 Funding** | Users #8, #9, #10 (250 tNIGHT each) | `00efbc81dfeb4acedef160930ace50fd2683c2d09794fb8f4967df8c99b8dbb30b` | [View Transaction](https://preview.midnightexplorer.com/tx/00efbc81dfeb4acedef160930ace50fd2683c2d09794fb8f4967df8c99b8dbb30b) |
| **ZK Circuit 1 Execution** | `verifyCreditPassport(...)` | `006b14c4042b270192a9c29090b1fc1782c43de098b1963154cf9eb977e82c9a43` | [View Transaction](https://preview.midnightexplorer.com/tx/006b14c4042b270192a9c29090b1fc1782c43de098b1963154cf9eb977e82c9a43) |
| **ZK Circuit 2 Execution** | `updatePolicy(...)` | `00b32de90ba1d2f3db5be6ad86a682de5ed1030e85592f83ab2b102872092236de` | [View Transaction](https://preview.midnightexplorer.com/tx/00b32de90ba1d2f3db5be6ad86a682de5ed1030e85592f83ab2b102872092236de) |
| **ZK Circuit 3 Execution** | `verifyCustomPolicy(...)` | `00714ec931a8267e02148c9de8bc6c5d211b74582d4bffdee26b7bfdedd512bf70` | [View Transaction](https://preview.midnightexplorer.com/tx/00714ec931a8267e02148c9de8bc6c5d211b74582d4bffdee26b7bfdedd512bf70) |

---

## 👥 70-User Multi-Account Architecture

To establish enterprise-grade identity testing and simulate a decentralized credit network, ShieldScore implements a deterministic HD derivation architecture (`m/44'/2360'/0'/0/*`) generating 70 verifiable participant identities:

- **1 Protocol Deployer & Super Admin** (`mn_addr_preview170a8...` — funded with $2,650\text{ tNIGHT}$)
- **5 Institutional Lenders & Liquidity Pools** (Users #2 – #6 — funded with $260\text{ tNIGHT}$ each)
- **5 DAO Treasury Risk Verifiers** (Users #7 – #11 — funded with $260\text{ tNIGHT}$ each)
- **24 Prime Tier A Borrowers** (Score $\ge 780$, DTI $\le 30\%$, Collateral $\ge 200\%$)
- **22 Standard Tier B Borrowers** (Score $\ge 720$, DTI $\le 38\%$, Collateral $\ge 150\%$)
- **13 Near-Prime Tier C Borrowers** (Satisfying baseline policy)

The full directory of 70 addresses, witness parameters, and risk assignments is documented in [`USERS-70.md`](./USERS-70.md).

---

## 🔬 Mathematical Breakdown of DUST Generation & Gas Balancing

Understanding Midnight's dual-token gas mechanics was critical to architecting reliable multi-account automated scripts:

### 1. The Token Math
- $1\text{ NIGHT} = 1,000,000\text{ Stars}$ ($10^6\text{ Stars}$)
- $1\text{ DUST} = 1,000,000,000,000,000\text{ Specks}$ ($10^{15}\text{ Specks}$)
- **Network Generation Rate**: **`8,267 Specks per Star per second`**

### 2. Time-to-Gas Ratio
- **Account 1 (Deployer)**: Holds $2,650\text{ NIGHT}$ ($2.65 \times 10^9\text{ Stars}$).
  $$\text{Generation Rate} = 2.65 \times 10^9 \times 8,267 = 2.19 \times 10^{13}\text{ Specks/sec} \approx 1.31\text{ DUST/minute}$$
  A typical ZK circuit transaction fee is $\sim 0.05$ to $0.2\text{ DUST}$ ($\sim 2 \times 10^{14}\text{ Specks}$). Account 1 regenerates enough gas to submit a full SNARK transaction in **$< 10\text{ seconds}$**!
- **Funded Users (260 NIGHT)**:
  $$\text{Generation Rate} = 260 \times 10^6 \times 8,267 = 2.15 \times 10^{12}\text{ Specks/sec} \approx 0.13\text{ DUST/minute}$$
  Accumulates its own standalone transaction gas in **$\sim 90\text{ seconds}$**!
- **Small Balance (10 NIGHT)**:
  Takes $\sim 35\text{ minutes}$ to accumulate transaction gas. By bumping our batch funding to **250 tNIGHT**, each user is immediately self-sustaining.

### 3. Why 1AM Wallet is Instant vs Fresh Terminal Scripts
- **1AM Wallet Extension**: Maintains an IndexedDB local cache of the chain tip continuously. When you open the extension or click "Dust", it does not rescan from block 0.
- **Node.js Headless Script**: Without persistent state (`restore: false`), the SDK's `DustWallet` and `ShieldedWallet` attempt to query every block from 0 to 982,750+, causing network timeouts and WebSocket closure (`1000:: Normal Closure`).
- **Our Persistent Architecture**: By saving wallet state to `.midnight-wallet-state`, our scripts sync in **under 2 seconds** and execute transactions seamlessly.

### 4. Explorer "DUST GEN" Status
- UTXOs returning change to registered accounts (like Account 1 and Account 2) are automatically tagged with **`DUST GEN: YES`** on [Midnight Explorer](https://preview.midnightexplorer.com).
- Newly created recipient UTXOs remain **`DUST GEN: NO`** until an on-chain registration intent is finalized.

---

## ⚡ Real On-Chain ZK Circuit Invocations

All three circuits defined in `contract/src/shieldscore.compact` were executed live against contract `0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123`:

### 1. `verifyCreditPassport(...)`
- **Witnesses Used**:
  - Credit Score: 785 (Confidential)
  - Annual Income: $115,000 (Confidential)
  - DTI: 28.5% / 2850 bps (Confidential)
  - Collateral: 210% / 21000 bps (Confidential)
  - Blinding Salt: 32 bytes (Confidential)
- **Pedersen Commitment**: `0x4bb06f8e4e3a7715d201d573d0aa423762e55dabd61a2c02278fa56cc6d294e0`
- **ZKP Prover**: Local Proof Server (`http://127.0.0.1:6300`)
- **Block Included**: `0x0a1cf577ca46e94aa9c40a6470bb2c88f50389dd4bd37a7661001e06ad6a9cd2`
- **Transaction Hash**: `006b14c4042b270192a9c29090b1fc1782c43de098b1963154cf9eb977e82c9a43`
- **Outcome**: Verified Prime Tier A. Disclosed binary `true`, tier `1`, and timestamp.

### 2. `updatePolicy(...)`
- **Updated Parameters**:
  - Min Credit Score: 710
  - Min Annual Income: $55,000
  - Max DTI: 38% (3800 bps)
  - Min Collateral: 160% (16000 bps)
  - Policy ID: 2 (Commercial SME Lending)
- **Block Included**: `0xa51ee8c4d29e9d3eead49e82e0a60fbb066423cda9996515cf62df6de1f9223c`
- **Transaction Hash**: `00b32de90ba1d2f3db5be6ad86a682de5ed1030e85592f83ab2b102872092236de`
- **Outcome**: Public ledger policy updated across the Midnight validator network.

### 3. `verifyCustomPolicy(...)`
- **Custom Dynamic Parameters**:
  - Required Score: 750
  - Required Income: $80,000
  - Max DTI: 35%
  - Min Collateral: 180%
  - Custom Policy ID: 777 (Institutional Syndicate)
- **Block Included**: `0xbebc62e0ef0968d7681ab817fbd4f47e2d098010f2ac231bbf3cce605d4e60c7`
- **Transaction Hash**: `00714ec931a8267e02148c9de8bc6c5d211b74582d4bffdee26b7bfdedd512bf70`
- **Outcome**: Custom compliance validated with zero disclosure of private applicant metrics.

---

## 💻 Full-Stack UI Implementation

The frontend is live and running at `http://localhost:5173`:

1. **Borrower Prover**: Step-by-step credit verification flow with interactive financial sliders, cryptographic blinding salt generator, and animated ZK proof pipeline.
2. **DeFi Loan Quote Engine**: Real-time loan terms calculator showing exact collateral reduction and interest rate discounts unlocked by verified risk tiers.
3. **Lender Underwriting Console**: Institutional dashboard for setting policy thresholds and reviewing on-chain disclosures.
4. **Dual-State Visualizer**: Interactive architectural diagram displaying the separation between private client memory and public Midnight ledger state.
5. **Multi-Wallet Support**: Seamless connection with 1AM Wallet, Lace, and CIP-0030 compatible extensions.

---

## 🏁 Summary of Verified Capabilities

| Protocol Domain / Component | Engineering Phase | Verification Status |
| :--- | :---: | :---: |
| **Toolchain & Compact Smart Contract** | Phase 1: Core | ✅ Deployed on Midnight Preview (`0x0794f0...`) |
| **Multi-Circuit ZK Logic** | Phase 2: Circuits | ✅ 3 Circuits (`verifyCreditPassport`, `updatePolicy`, `verifyCustomPolicy`) |
| **Full Unit Test Suite** | Phase 3: Invariants | ✅ 10/10 Passing Vitest Tests |
| **Client-Side Proof Generation** | Phase 4: Prover | ✅ Local Proof Server (`:6300`) integrated |
| **50+ User Accounts** | Phase 5: Cohorts | ✅ 70 Deterministic Accounts (`USERS-70.md`) |
| **Real Multi-Account On-Chain Transfers** | Phase 5: Transfers | ✅ 4 Batch Funding Txs confirmed on Preview |
| **On-Chain Circuit Execution** | Phase 6: Settlement | ✅ 3 Live Transactions confirmed in blocks |
| **Zero Mock Data Invariant** | Integrity | ✅ 100% Real Preprod & Preview Testnet Transactions |
