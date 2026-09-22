# ShieldScore — Video Demo Script & Presentation Walkthrough

## Video Overview
This document provides the click-by-click walkthrough for recording the 1–2 minute demonstration video required across Midnight Builder Challenge Levels 2–6.

---

## Part 1: Interactive Web DApp & 1AM Wallet Connect
1. **Open Frontend**: Navigate to `http://localhost:5173`.
2. **Connect Wallet**: Click **"Connect Wallet"** in the top navigation bar. Select **1AM Wallet**, **Lace**, or **Preview Explorer Mode**.
3. **Show Status**: Point out the live telemetry badge displaying `< 40ms` latency and network synchronization with Midnight Preview.
4. **Select Predicate**: In Step 1, click **"Full Financial Passport"**.
5. **Private Witness Input**: Click the quick-fill chip **"✨ Fill Prime (Tier A)"**. Notice inputs (Score: 790, Income: $120,000, DTI: 28%, Collateral: 210%).
6. **Generate Proof**: Click **"Generate Private ZK Proof & Disclose Result"**.
7. **ZK Pipeline Animation**: Watch the 3-phase live proving pipeline (Private Witness $\to$ SNARK Constraints $\to$ On-Chain Settlement).
8. **Audit Verifier Ledger**: Show the verified outcome:
   - Verification Status: **`VERIFIED (TRUE)`**
   - Assigned Risk Tier: **`TIER A (PRIME)`**
   - Commitment Hash & On-Chain Block Height.
9. **Claim Loan Offer**: Click **"View Verified Loan Quotes →"** to showcase unlocked prime lending terms (3.4% APR, 105% collateral).

---

## Part 2: Terminal On-Chain Consensus & Block Minting
Open the terminal side-by-side with the browser:
```powershell
# 1. Verify wallet balances on Midnight Preview
npm run contract:check-balance

# 2. Execute on-chain ZK credit passport circuit
npm run call:passport --prefix contract

# 3. Update lender policy rules on-chain
npm run call:policy --prefix contract
```
Highlight that transactions are sealed into real Midnight blocks with confirmed transaction hashes and visible on Midnight Explorer.
