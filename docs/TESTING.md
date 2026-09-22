# ShieldScore — Test Suite & Circuit Verification Guide

## Overview
ShieldScore features an automated test suite implemented using **Vitest** and the **`@midnight-ntwrk/compact-runtime`** framework. The suite rigorously verifies the cryptographic boundaries, policy constraints, and selective disclosure guarantees of all three Compact circuits.

## Test Summary (10/10 Passing)
- **Suite Execution Time**: ~210 ms
- **Test File**: `contract/test/shieldscore.test.ts`
- **Compiler Target**: Compact 0.23+ (`shieldscore.compact`)

### Tested Scenarios
1. **Successful Verification (Tier A & B)**: Proves that valid applicant witnesses produce cryptographic confirmation and correct risk tier disclosures.
2. **Exact Boundary Compliance**: Asserts proper handling at exact policy thresholds (e.g. score = 700, income = $50,000, DTI = 40%).
3. **Threshold Rejection Checks**:
   - Rejection when credit score < 700.
   - Rejection when annual income < $50,000.
   - Rejection when DTI ratio > 40.00%.
   - Rejection when collateral buffer < 150.00%.
4. **Dynamic Custom Policies**: Verifies that third-party lenders can evaluate bespoke parameters via `verifyCustomPolicy`.
5. **Lender Policy Governance**: Confirms that authorized pool managers can update baseline ledger thresholds via `updatePolicy`.
6. **Privacy Invariants**: Mathematically verifies that raw financial values (`creditScore`, `annualIncome`, `debtToIncomeRatioBps`) are **never** present on the public ledger.

## Running Tests Locally
```bash
npm test --prefix contract
```
