# ShieldScore — Architectural Overview & Dual-State Privacy Model

> **Core Thesis**: *Borrowers must never be forced to choose between financial privacy and access to capital. By separating private witness evaluation from public ledger state, ShieldScore enables verifiable undercollateralized credit underwriting on the Midnight Network.*

---

## 1. High-Level System Architecture

ShieldScore is architected around a strict **dual-state paradigm** enabled by the Midnight Network and Compact smart contracts:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHIELDSCORE DUAL-STATE ARCHITECTURE                │
└─────────────────────────────────────────────────────────────────────────────┘

       CLIENT-SIDE PRIVATE RAM (Witness)              MIDNIGHT SUBSTRATE LEDGER
  ┌────────────────────────────────────────┐     ┌────────────────────────────────┐
  │ • creditScore (e.g., 785)              │     │                                │
  │ • annualIncome (e.g., $115,000)        │     │  Contract State (Public):      │
  │ • debtToIncome (e.g., 28.5% -> 2850bps)│     │  • minCreditScore: 700         │
  │ • collateralRatio (e.g., 21000bps)     │     │  • minIncome: 50,000           │
  │ • blindingSalt (32-byte CSPRNG)        │     │  • maxDtiBps: 4000 (40%)       │
  │ • timestamp                            │     │  • minCollateralBps: 12000     │
  └──────────────────┬─────────────────────┘     │  • policyAdmin: Address        │
                     │                           │  • totalVerifications: 42      │
                     ▼                           └───────────────▲────────────────┘
  ┌────────────────────────────────────────┐                     │
  │  Proof Generation Engine (:6300)       │                     │
  │  • Executes src/shieldscore.compact    │                     │
  │  • Computes polynomial constraints     │                     │
  │  • Outputs Groth16 Zero-Knowledge      │                     │
  │    Proof (π) + Public Disclosures      │                     │
  └──────────────────┬─────────────────────┘                     │
                     │                                           │
                     ▼                                           │
  ┌────────────────────────────────────────┐                     │
  │  Public Disclosures (Ledger Bound):    │                     │
  │  • isEligible: true (boolean)          │                     │
  │  • riskTier: 1 (Tier A Prime)          │                     │
  │  • verificationTimestamp: 1774421900   ├─────────────────────┘
  │  • zeroKnowledgeProof: π (Groth16)     │   Submits on-chain transaction
  └────────────────────────────────────────┘   via 1AM / Lace Wallet (CIP-0030)
```

---

## 2. The Zero-Custody RAM Guarantee

In conventional Web2 and Web3 financial architectures, applicant data is submitted to a server for processing:
- **Centralized Underwriters**: Store raw PII (tax returns, SSNs, bank statements) in persistent relational databases.
- **Public Blockchains (Ethereum, Solana)**: All state transitions are 100% public, forcing users to disclose balances, loan amounts, and credit ratings to all network observers.

In ShieldScore, **data custody is zero**:
1. Financial inputs exist exclusively in browser memory (JavaScript heap) while the tab is active.
2. The proof generator processes inputs through the ZK circuit locally via a localhost RPC bridge (`http://localhost:6300`) or client-side WebAssembly runtime.
3. Once the proof $\pi$ is synthesized, all private witness variables are zeroed out in memory.
4. The transaction transmitted across the peer-to-peer network contains only:
   - The Groth16 proof bytes ($\pi$).
   - The verified boolean eligibility flag (`isEligible`).
   - The derived institutional risk tier (`riskTier: 1 | 2 | 3`).
   - The commitment timestamp.

---

## 3. Cryptographic Circuit Pipeline

The verification pipeline consists of three sequential stages:

### Stage 1: Local Witness Conditioning
Raw user metrics are validated locally and scaled into integer basis points:
$$\text{dtiBps} = \left\lfloor \frac{\text{monthlyDebt}}{\text{monthlyIncome}} \times 10{,}000 \right\rfloor$$
$$\text{collateralBps} = \left\lfloor \frac{\text{pledgedCollateralUSD}}{\text{requestedBorrowUSD}} \times 10{,}000 \right\rfloor$$

### Stage 2: Polynomial Constraint Evaluation
The Compact compiler compiles `shieldscore.compact` into Zero-Knowledge Intermediate Representation (`.zkir`). The proof server evaluates algebraic constraints:
- Constraint 1: $C_1 = (\text{creditScore} \ge \text{policy.minCreditScore})$
- Constraint 2: $C_2 = (\text{annualIncome} \ge \text{policy.minAnnualIncome})$
- Constraint 3: $C_3 = (\text{dtiBps} \le \text{policy.maxDebtToIncomeBps})$
- Constraint 4: $C_4 = (\text{collateralBps} \ge \text{policy.minCollateralRatioBps})$

All constraints must simultaneously evaluate to true for `isEligible` to output `1`:
$$\text{isEligible} = C_1 \land C_2 \land C_3 \land C_4$$

### Stage 3: Algorithmic Tier Classification
If eligible, the circuit computes an autonomous credit tier inside the zero-knowledge boundary without revealing specific scores:
- **Tier A (Prime)**: $\text{creditScore} \ge 780 \land \text{dtiBps} \le 3000 \land \text{collateralBps} \ge 20000 \implies \text{Tier } 1$
- **Tier B (Standard)**: $\text{creditScore} \ge 720 \land \text{dtiBps} \le 3800 \land \text{collateralBps} \ge 15000 \implies \text{Tier } 2$
- **Tier C (Acceptable)**: Satisfies baseline underwriting policy $\implies \text{Tier } 3$

The output tier is selectively disclosed via `disclose()` and recorded on the public Midnight ledger for immediate consumption by lending smart contracts.
