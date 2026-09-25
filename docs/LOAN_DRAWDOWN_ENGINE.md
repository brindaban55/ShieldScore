# ShieldScore — Undercollateralized Loan Drawdown Engine & Capital Efficiency

> **Economic Problem**: Overcollateralized lending (150%–200%) traps capital and restricts borrowing to existing wealth holders.  
> **ShieldScore Innovation**: Algorithmic risk tiers derived via Zero-Knowledge proofs dynamically reduce required collateral down to 105%–110% and slash interest rates by up to 68%.

---

## 1. Capital Preservation Matrix

The table below contrasts the capital requirements of an unverified borrower against ShieldScore-verified tiers for a **$100,000 USD** credit line:

| Metric | Unverified Baseline | Tier C (Near-Prime) | Tier B (Standard) | Tier A (Prime) |
| :--- | :---: | :---: | :---: | :---: |
| **Minimum Credit Score** | None | 680 | 720 | 780 |
| **Maximum DTI** | None | 42.0% | 38.0% | 30.0% |
| **Required Collateral Ratio** | **180%** | **150%** | **130%** | **110%** |
| **Pledged Capital Required** | $180,000 | $150,000 | $130,000 | $110,000 |
| **Capital Unlocked / Saved** | **$0** | **$30,000** | **$50,000** | **$70,000** |
| **Fixed Annual APR** | **13.5%** | **9.8%** | **6.9%** | **4.2%** |
| **Annual Interest Cost** | $13,500 | $9,800 | $6,900 | $4,200 |
| **Annual Interest Savings** | **$0** | **$3,700** | **$6,600** | **$9,300** |

---

## 2. Mathematical Underwriting Formulas

### 2.1 Collateral Requirement Formula
$$\text{RequiredCollateral}(L, \tau) = L \times \text{CollateralMultiplier}(\tau)$$
where $L$ is loan principal and $\tau \in \{\text{Unverified}, \text{Tier C}, \text{Tier B}, \text{Tier A}\}$.

### 2.2 Capital Efficiency Metric ($\eta$)
$$\eta = \frac{\text{CapitalUnlocked}}{\text{BaselineCollateral}} = \frac{180\% - \text{TierCollateralRatio}}{180\%}$$
- For **Tier A**: $\eta = \frac{180\% - 110\%}{180\%} = 38.89\%$ capital efficiency gain.

### 2.3 Integrated Drawdown Engine (`LoanQuoteEngine.ts`)
The client frontend provides a real-time reactive calculator allowing borrowers to toggle loan principal from \$5,000 to \$500,000 with dynamic recalculation of collateral requirements, monthly debt service, and interest savings.
