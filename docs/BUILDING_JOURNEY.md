# ShieldScore: Engineering Journey & Architectural Development Log

> **Protocol Name**: ShieldScore — Zero-Knowledge Private Credit Passport  
> **Ecosystem**: Midnight Network (Preprod & Preview)  
> **Core Primitive**: Client-Side Groth16 Zero-Knowledge Verification & Selective Disclosure  
> **Author & Lead Contributor**: brindaban55 (`brindabankishored@gmail.com`)  
> **Repository**: [https://github.com/brindaban55/ShieldScore](https://github.com/brindaban55/ShieldScore)

---

## 🗺️ Architectural Roadmap & Building Journey Overview

This document chronicles the step-by-step engineering progression of **ShieldScore**—from initial environment scaffolding, Docker proof server setup, and zero-knowledge circuit compilation, through client-side Web3 terminal development, dynamic institutional underwriting, multi-account HD derivation, dual-network contract deployment, and production cloud orchestration.

```
┌────────────────────────────────────────────────────────────────────────┐
│ SHIELDSCORE STEP-BY-STEP ENGINEERING TIMELINE                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ STEP 1: FOUNDATIONS & CRYPTOGRAPHIC TOOLCHAIN ]                     │
│    • Node.js 22 LTS, npm workspaces monorepo architecture              │
│    • Docker proof-server container on port 6300                        │
│    • Midnight Compact Compiler toolchain installation                  │
│                                                                        │
│  [ STEP 2: ZERO-KNOWLEDGE CIRCUIT & SMART CONTRACT ]                   │
│    • shieldscore.compact source implementation                         │
│    • Private witness data isolation (Score, Income, DTI, Collateral)   │
│    • disclose() selective disclosure boundaries & Pedersen commitment  │
│    • Multi-circuit compilation into Groth16 keys and managed TS bridge │
│                                                                        │
│  [ STEP 3: AUTOMATED TESTING & INVARIANT ASSERTIONS ]                  │
│    • 10/10 passing Vitest cryptographic boundary unit tests            │
│    • Mathematical simulation of solvency gates and risk tiers         │
│    • Continuous Integration (CI/CD) GitHub Actions pipeline            │
│                                                                        │
│  [ STEP 4: REACTIVE FINTECH TERMINAL & 3D CYBERPUNK UI ]               │
│    • React 18, Vite 6, Tailwind CSS, Framer Motion spring physics      │
│    • Three.js WebGL 3D Holographic Shield component                    │
│    • Multi-tier typography hierarchy (Syne, Plus Jakarta Sans, Mono)   │
│                                                                        │
│  [ STEP 5: WEB3 WALLET CONNECTOR & SESSION MANAGEMENT ]                │
│    • Injected CIP-0030 DApp connector (1AM Wallet, Lace)               │
│    • Real-time address telemetry and network prefix inspection         │
│    • Local session caching and graceful fallback handling              │
│                                                                        │
│  [ STEP 6: DUAL-STATE PRIVACY AUDIT & CAPITAL EFFICIENCY ]             │
│    • DualStateAudit component comparing client RAM vs public ledger    │
│    • Selective disclosure predicate configurator                       │
│    • Undercollateralized LoanQuoteEngine (3.4% APR, 105% collateral)   │
│                                                                        │
│  [ STEP 7: DYNAMIC LENDER UNDERWRITING & CUSTOM CIRCUITS ]             │
│    • Circuit 2: verifyCustomPolicy for arbitrary liquidity pools       │
│    • Circuit 3: updatePolicy for decentralized DAO governance          │
│    • LenderDashboard with real-time risk tier distribution telemetry   │
│                                                                        │
│  [ STEP 8: SYNTHETIC HD ACCOUNTS & VERIFIABLE COHORT ]                 │
│    • 70 deterministic BIP-44 account derivations (m/44'/2360'/0'/0/*)  │
│    • 20 launch cohort accounts with confirmed on-chain extrinsics      │
│    • Multi-batch funding and DUST gas registration scripts             │
│                                                                        │
│  [ STEP 9: DUAL-NETWORK CONTRACT DEPLOYMENT ]                          │
│    • Contract deployment to Midnight Preview (0794f000...)             │
│    • Contract deployment to Midnight Preprod (fc67e285...)             │
│    • On-chain indexing and Substrate block explorer verification       │
│                                                                        │
│  [ STEP 10: IN-APP DUAL-NETWORK SWITCHER & AUTO-REVOCATION ]           │
│    • Segmented network toggle [ Preview | Preprod ] in navigation bar  │
│    • Automatic session disconnection upon network prefix mismatch      │
│                                                                        │
│  [ STEP 11: LIVING FEEDBACK LOOP & USER TELEMETRY ]                    │
│    • Interactive FeedbackModal with star ratings & role telemetry      │
│    • Public Google Form and spreadsheet response ledger integration    │
│    • Documented feedback-driven code iterations in FEEDBACK.md         │
│                                                                        │
│  [ STEP 12: ENTERPRISE CLOUD DEPLOYMENT & VERCEL INTEGRATION ]         │
│    • Zero-configuration vercel.json with Vite preset & SPA rewrites    │
│    • Enterprise security headers (nosniff, DENY, XSS protection)       │
│    • Sub-10 second production builds and automated deployments         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Step-by-Step Technical Implementation Breakdown

### Step 1: Foundations, Monorepo Scaffolding & Proof Server Architecture
* **Repository Architecture**: Established a modular npm workspaces monorepo separating smart contract logic (`/contract`) from client-side frontend orchestration (`/frontend`).
* **Proof Server Container**: Configured local zero-knowledge proving infrastructure using Docker:
  ```bash
  docker run -d --name midnight-proof-server -p 6300:6300 midnightntwrk/proof-server:latest
  ```
* **Compact Compiler Toolchain**: Integrated the official Midnight Compact compiler (`v0.23+` / `v0.31+`) to compile high-level declarative privacy circuits into intermediate zero-knowledge constraint systems.

### Step 2: Smart Contract & Zero-Knowledge Circuits Design
Created [`contract/src/shieldscore.compact`](../contract/src/shieldscore.compact) implementing three core zero-knowledge circuits:
1. **`verifyCreditPassport`**:
   * Takes private borrower inputs: `creditScore`, `annualIncome`, `debtToIncomeRatioBps`, `collateralRatioBps`, and a 32-byte secret blinding salt.
   * Compares them against the on-chain baseline underwriting criteria.
   * Derives an algorithmic risk tier: **Tier A** (Prime), **Tier B** (Standard), or **Tier C** (Near-Prime).
   * Calls `disclose()` **strictly** on the boolean outcome, the risk tier integer, and the timestamp. The raw financial metrics never leave local RAM.
2. **`verifyCustomPolicy`**:
   * Allows institutional liquidity pools and DAO treasuries to pass dynamic underwriting criteria (`reqMinScore`, `reqMinIncome`, `reqMaxDti`, `reqMinCollateral`) on the fly without redeploying the contract.
3. **`updatePolicy`**:
   * Enables protocol administrators or governance multi-sigs to update the default baseline underwriting thresholds as macroeconomic conditions shift.

### Step 3: Comprehensive Vitest Cryptographic Test Suite
* Authored 10 thorough simulation tests in [`contract/test/shieldscore.test.ts`](../contract/test/shieldscore.test.ts) covering:
  * Prime applicant approval and Tier A classification.
  * Standard applicant approval and Tier B classification.
  * Near-Prime applicant approval and Tier C classification.
  * Score deficiency rejection (`creditScore < minScore`).
  * Income threshold failure (`income < minIncome`).
  * Debt-to-Income breach rejection (`dti > maxDti`).
  * Insufficient collateral ratio rejection.
  * Dynamic custom lender policy parameter validation.
  * Governance policy updates and ledger state persistence.
  * Tamper resistance against invalid witness commitments.

### Step 4: Reactive Fintech Terminal & 3D Holographic UI
* Built a high-performance Web3 application in `/frontend` using **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**.
* Implemented a **Three.js WebGL Holographic Shield** with custom vertex shaders, particle rotations, and interactive mouse-tracking geometry.
* Configured a bold cyberpunk fintech styling with full-bleed ambient background artwork, frosted glassmorphism cards (`GlassCard.tsx`), and smooth tab transitions powered by **Framer Motion**.
* Embedded fast tactile helper chips (**`Fill Prime (Tier A)`**, **`Fill Standard (Tier B)`**, **`Clear`**) to allow rapid testing in under 3 seconds.

### Step 5: Web3 Multi-Wallet Connector (CIP-0030 Standard)
* Built a unified injected wallet connector (`walletConnector.ts` & `useWallet.ts`) compliant with the Cardano / Midnight CIP-0030 DApp connector specification.
* Direct support for **1AM Wallet** and **Lace Wallet** with automated fallback to demo explorer mode when no extension is detected.
* Provides real-time balance tracking, Bech32 address truncation, and connection state persistence across browser reloads.

### Step 6: Dual-State Privacy Audit & Capital Efficiency Calculator
* **Dual-State Audit Table**: Created `DualStateAudit.tsx` giving users absolute transparency into the zero-knowledge privacy boundary—displaying exact private witness variables retained in client memory alongside the public outputs disclosed to the blockchain ledger.
* **Undercollateralized Loan Drawdown Engine**: Built `LoanQuoteEngine.tsx` illustrating how zero-knowledge credit verification unlocks capital efficiency:
  * Prime borrowers access competitive loans at **3.4% APR** with **105% collateralization**.
  * Eliminates the traditional DeFi overcollateralization penalty of 150%–200%.

### Step 7: Synthetic Identity Generation & 70 Verifiable Accounts
* Built `contract/scripts/generate-70-users.ts` utilizing `@midnight-ntwrk/wallet-sdk` and BIP-39 mnemonic seeds to deterministically derive 70 unique user accounts (`m/44'/2360'/0'/0/*`).
* Configured diverse participant personas:
  * 1 Protocol Deployer & Super Admin
  * 5 Institutional Liquidity Underwriters
  * 5 DAO Treasury Risk Verifiers
  * 24 Prime Tier A Borrowers
  * 22 Standard Tier B Borrowers
  * 13 Near-Prime Tier C Borrowers
* Documented the entire cohort with both **Preprod (`mn_addr_preprod1...`)** and **Preview (`mn_addr_preview1...`)** Bech32 addresses in [`USERS.md`](../USERS.md).
* Recorded 20 launch cohort accounts with on-chain transaction hashes in [`LAUNCH_USERS.md`](../LAUNCH_USERS.md).

### Step 8: Multi-Network Contract Deployment (Preprod & Preview)
Deployed and verified the ShieldScore Compact smart contract on both official decentralized Midnight testnets:
* **Midnight Preprod**:
  * Contract Address: `fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b`
  * Block Hash: `0xd34460737d7acbb9f309ab2a667744ee5911cd40b20a183163318d044428bb5a`
  * Transaction ID: `0011bbbdced984ef7addf6d457fbdb71303153dbd2be4577bb19ec7675e0b54a2d`
  * Explorer: [https://preprod.midnightexplorer.com/contract/fc67e285...](https://preprod.midnightexplorer.com/contract/fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b)
* **Midnight Preview**:
  * Contract Address: `0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123`
  * Block Hash: `0xca0e2a65adef658fe7b94d79d6abaaa66dd7ab7cb69d262996a900b791014eb3`
  * Transaction ID: `00028ae43852775aa60a42561aca808ca7052529e4a22cc188f8ae538878ef07b4`
  * Explorer: [https://midnightexplorer.com/contract/0794f000...](https://midnightexplorer.com/contract/0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123)

### Step 9: In-App Dual-Network Switcher & Automatic Revocation
* Integrated a segmented network toggle `[ 🌐 Preview | Preprod ]` in `Navbar.tsx` and `MobileDrawer.tsx`.
* Engineered automatic network detection in `useWallet.ts`: if the connected wallet's address prefix (`mn_addr_preview` vs `mn_addr_preprod`) mismatches the active UI network, the session is revoked immediately with a clear visual toast alerting the user to re-authenticate on the selected ledger.

### Step 10: Living Feedback Loop & User Telemetry
* Implemented an in-app feedback modal (`FeedbackModal.tsx`) collecting quantitative ratings (1–5 stars), participant roles, topic categories, and qualitative comments, persisting to a local feedback ledger.
* Integrated public Google Form and Google Sheets telemetry for external community testers.
* Documented 6 feedback-driven technical iterations in [`FEEDBACK.md`](../FEEDBACK.md) mapped directly to Git commits.

### Step 11: Production CI/CD Pipeline & Vercel Auto-Deployment
* Configured automated GitHub Actions workflow (`.github/workflows/ci.yml`) compiling Compact circuits, running Vitest suites, and verifying frontend builds on every commit.
* Created root [`vercel.json`](../vercel.json) enabling zero-touch Vercel cloud deployments with Vite preset, SPA rewrite rules, and enterprise HTTP security headers.
