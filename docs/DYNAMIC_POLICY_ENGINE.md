# ShieldScore — Dynamic Lender Policy Engine & Syndicated Risk Pools

> **Core Capability**: Dynamic Zero-Knowledge Credit Policy Evaluation  
> **Underlying Circuit**: `verifyCustomPolicy(...)` in `src/shieldscore.compact`  
> **Target Audience**: Institutional Liquidity Pools, DAO Treasuries, and Fintech Syndicate Lenders

---

## 1. The Dynamic Policy Problem in DeFi

Traditional smart contracts for credit underwriting hardcode thresholds into protocol bytecode:
- Requiring a contract upgrade or redeployment whenever interest rate environments or risk appetites shift.
- Preventing multiple lenders with distinct risk profiles from sharing the same underlying verification infrastructure.

**ShieldScore solves this with Dynamic Circuit Policies.**

---

## 2. Dynamic Circuit Specification

Instead of reading a static ledger configuration, Circuit 2 (`verifyCustomPolicy`) allows an external caller or syndicate to supply an arbitrary policy tuple alongside the private borrower witness:

```compact
export circuit verifyCustomPolicy(
    witness: PrivateCreditProfile,
    policy: UnderwritingPolicy,
    policyId: Uint<64>
): CustomPolicyDisclosure {
    // 1. In-circuit threshold evaluation
    const scoreOk = witness.creditScore >= policy.minCreditScore;
    const incomeOk = witness.annualIncome >= policy.minIncome;
    const dtiOk = witness.debtToIncomeBps <= policy.maxDtiBps;
    const colOk = witness.collateralRatioBps >= policy.minCollateralRatioBps;

    const meetsRequirements = scoreOk && incomeOk && dtiOk && colOk;

    // 2. Selective disclosure of verification outcome
    return disclose(CustomPolicyDisclosure {
        policyId: policyId,
        isApproved: meetsRequirements,
        timestamp: currentTimestamp()
    });
}
```

---

## 3. Syndicated Pool Use Cases

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SYNDICATED RISK ARCHITECTURE                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│               [ BORROWER PRIVATE WITNESS ]                             │
│       (Score: 760, Income: $95,000, DTI: 32%, Collateral: 160%)        │
│                                │                                       │
│        ┌───────────────────────┼───────────────────────┐               │
│        ▼                       ▼                       ▼               │
│   POOL #101               POOL #202               POOL #303            │
│  (Conservative)       (Balanced Yield)        (High Yield)             │
│  Min Score: 780       Min Score: 740          Min Score: 680           │
│  Max DTI: 28%         Max DTI: 36%            Max DTI: 45%             │
│  Min Collateral: 180% Min Collateral: 130%    Min Collateral: 110%     │
│        │                       │                       │               │
│        ▼                       ▼                       ▼               │
│    REJECTED                APPROVED                APPROVED            │
│ (Zero PII leaked)     (Zero PII leaked)       (Zero PII leaked)        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Instant Multi-Pool Routing**: A borrower generates proofs against multiple syndicate policies simultaneously in client RAM.
2. **Deterministic Liquidity Matching**: The lending aggregator immediately matches the applicant to the pool offering the lowest APR and lowest collateral requirement.
3. **No Centralized Credit Broker**: No intermediary broker or bureau collects fees or aggregates applicant profiles.
