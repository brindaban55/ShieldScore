# ShieldScore — Institutional Lender Integration Manual & LOS Guide

> **Audience**: Fintech Lenders, Credit Unions, Decentralized Debt Funds, and Treasury Managers  
> **Integration Goal**: Embedding ShieldScore Zero-Knowledge Verification into Loan Origination Systems (LOS)

---

## 1. Executive Overview

Traditional loan origination requires borrowers to submit documentation packets containing unencrypted personally identifiable information (PII). This exposes lenders to stringent regulatory overhead (GLBA, GDPR, CCPA) and catastrophic cybersecurity liability.

By integrating ShieldScore, institutional lenders can **verify creditworthiness with mathematical certainty while assuming zero data custody liability**:
- Borrower submits a cryptographic proof $\pi$.
- The lender's LOS queries the Midnight Substrate indexer or on-chain verifier.
- The LOS receives a cryptographic attestation of eligibility and risk tier.
- Capital is disbursed automatically via smart contract or ACH.

---

## 2. Institutional Integration Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   INSTITUTIONAL LOS INTEGRATION                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ BORROWER BROWSER ]                            [ LENDER LOS ]       │
│   Generates proof via ShieldScore ──────────────► Loan Application API │
│   { proof: π, tier: 1, txHash: "0x..." }                  │            │
│                                                           │            │
│                                           [ QUERY MIDNIGHT EXPLORER ]  │
│                                           Verify transaction on-chain  │
│                                           Confirm contract verifier ok │
│                                                           │            │
│                                           [ UNDERWRITING DECISION ]    │
│                                           • Tier 1: Auto-Approve $200k │
│                                           • Collateral: 110%           │
│                                           • APR: 4.2% Fixed            │
│                                                           │            │
│                                           [ DISBURSE CAPITAL ]         │
│                                           Funds released to borrower   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Verification API Code Sample

```typescript
import { verifyProofOnChain } from '@shieldscore/contract-client';

async function processLoanApplication(applicationPayload: {
  borrowerAddress: string;
  txHash: string;
  requestedAmount: number;
}) {
  // Verify on Midnight Preprod / Preview
  const verification = await verifyProofOnChain({
    txHash: applicationPayload.txHash,
    network: 'preprod'
  });

  if (verification.isApproved && verification.tier === 'TIER_A') {
    return {
      status: 'APPROVED',
      approvedAmount: applicationPayload.requestedAmount,
      requiredCollateralMultiplier: 1.10, // 110%
      fixedAprBps: 420 // 4.20%
    };
  }

  return { status: 'REVIEW_REQUIRED' };
}
```
