# ShieldScore — Deterministic HD Derivation Architecture & 70-Persona Specification

> **Identity Standard**: BIP-44 Derivation Path for Midnight Network (`m/44'/2360'/0'/0/*`)  
> **Ecosystem Integration**: Official `@midnight-ntwrk/wallet-sdk`  
> **Target Scope**: 70 Onboarded User Personas Across Preprod and Preview Testnets

---

## 1. Cryptographic Derivation Standard

To simulate a diverse decentralized lending market and test high-volume multi-account concurrency, ShieldScore implements a deterministic HD derivation generator:

```
                          ROOT SEED (256-bit Entropy)
                                      │
                                      ▼
                        m/44'/2360'/0'/0/* (BIP-44)
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
     Index 0                      Index 1                      Index 2..70
  (Super Admin)             (Alice Borrower)             (Institutional & Retail)
`mn_addr_preprod1...`        `mn_addr_preprod1...`        `mn_addr_preprod1...`
`mn_addr_preview1...`        `mn_addr_preview1...`        `mn_addr_preview1...`
```

---

## 2. Demographic Persona Distribution

The 70 onboarded participant identities represent real-world market actors across 6 distinct risk and liquidity profiles:

| Persona Group | Count | Score Profile | DTI Profile | Primary Protocol Action |
| :--- | :---: | :---: | :---: | :--- |
| **Super Admin / Deployer** | 1 | Master Key | N/A | Protocol contract deployment & policy administration |
| **Institutional Lenders** | 5 | 800+ | < 20% | Underwriting pool capitalization & custom policy creation |
| **DAO Treasury Verifiers** | 5 | 770+ | < 25% | Multi-sig balance verification & collateral audits |
| **Prime Tier A Borrowers** | 24 | 780–850 | 18%–30% | Undercollateralized 110% loan drawdowns at 4.2% APR |
| **Standard Tier B Borrowers**| 22 | 720–779 | 31%–38% | 130% collateral loans at 6.9% APR |
| **Near-Prime Tier C** | 13 | 680–719 | 39%–42% | Baseline policy compliance at 9.8% APR |
| **Total Testnet Cohort** | **70** | Full Spectrum | Full Spectrum | Verified on Preprod & Preview |

---

## 3. Dual-Network Address Resolution

Because Midnight uses bech32m-encoded public addresses prefixed by network identifier, each HD index maps deterministically to both network addresses:
- **Preprod**: `mn_addr_preprod1...`
- **Preview**: `mn_addr_preview1...`

All 70 personas are fully documented with corresponding transaction hashes, balance allocations, and explorer proof links in [`USERS.md`](../USERS.md) and [`LAUNCH_USERS.md`](../LAUNCH_USERS.md).
