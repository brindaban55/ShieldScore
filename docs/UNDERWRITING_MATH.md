# ShieldScore: Underwriting Formulas & Capital Efficiency Models

> **Topic**: Mathematical Models for Zero-Knowledge Underwriting, Risk Tiering & Collateralization Ratios

---

## 1. Debt-to-Income (DTI) Representation in Basis Points

To prevent precision loss from floating-point arithmetic inside zero-knowledge polynomial circuits, all ratios are represented in **integer basis points (bps)**, where:
$$10,000 \text{ bps} = 100.00\% \quad (1 \text{ bps} = 0.01\%)$$

$$\text{DTI}_{\text{bps}} = \left\lfloor \frac{\text{Monthly Debt Obligations}}{\text{Monthly Gross Income}} \times 10,000 \right\rfloor$$

### Worked Example:
* Monthly Gross Income = $\$9,583.33$ ($\$115,000 / 12$)
* Monthly Debt Payments = $\$2,731.25$
$$\text{DTI}_{\text{bps}} = \frac{2,731.25}{9,583.33} \times 10,000 = 2,850 \text{ bps} \; (28.50\%)$$

---

## 2. Risk Tier Classification Matrix

The on-chain Compact smart contract evaluates verified applicants into three risk tiers based on zero-knowledge solvency predicates:

| Risk Tier | Minimum Credit Score | Maximum DTI Ratio | Collateral Requirement | Unlocked APR Range | Capital Efficiency Index |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Tier A (Prime)** | $\ge 780$ | $\le 30.00\%$ ($3,000$ bps) | **105%** | **3.40% – 4.20%** | **2.85x vs Legacy DeFi** |
| **Tier B (Standard)** | $\ge 720$ | $\le 38.00\%$ ($3,800$ bps) | **120%** | **5.50% – 6.80%** | **1.67x vs Legacy DeFi** |
| **Tier C (Near-Prime)** | $\ge 700$ | $\le 40.00\%$ ($4,000$ bps) | **135%** | **7.80% – 9.20%** | **1.22x vs Legacy DeFi** |
| **Legacy DeFi** | *None (Blind)* | *None (Blind)* | **150% – 200%** | **12.00% – 18.00%** | **Baseline (1.00x)** |

---

## 3. Dynamic Loan Drawdown & Capital Efficiency Formula

The maximum borrowable principal $P_{\text{max}}$ for a given posted collateral value $C_{\text{value}}$ is governed by the risk tier collateral factor $CF_{\text{tier}}$:

$$P_{\text{max}} = \frac{C_{\text{value}}}{CF_{\text{tier}}}$$

### Capital Efficiency Example ($50,000 Collateral):
* **Legacy DeFi Protocol (150% Collateralization)**:
  $$P_{\text{max}} = \frac{\$50,000}{1.50} = \$33,333 \quad (\text{Idle Capital Locked}: \$16,667)$$
* **ShieldScore Prime Tier A (105% Collateralization)**:
  $$P_{\text{max}} = \frac{\$50,000}{1.05} = \$47,619 \quad (\text{Capital Freed}: \$14,286)$$

This mechanism allows prime institutional and retail borrowers to access an additional **\$14,286 (+42.8%)** in immediate liquidity against the exact same collateral assets, completely secured by on-chain zero-knowledge solvency verification.
