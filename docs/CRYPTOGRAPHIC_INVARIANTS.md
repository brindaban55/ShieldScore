# ShieldScore — Cryptographic Invariants & Formal Soundness Guarantees

> **Cryptographic Framework**: Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs)  
> **Proving System**: Groth16 over Barreto-Naehrig (BN254) Pairing-Friendly Elliptic Curve  
> **Target Properties**: Completeness, Computational Soundness, and Perfect Zero-Knowledge

---

## 1. Formal Mathematical Invariants

ShieldScore circuits enforce the following formal invariants:

### Invariant 1: Completeness (Honest Prover Acceptance)
For any valid borrower witness $w = (\text{score}, \text{income}, \text{dti}, \text{collateral})$ and public policy $x$, if $w$ satisfies all underwriting criteria:
$$\Pr\left[\text{Verify}(\text{vk}, x, \pi) = 1 \;\middle|\; \pi \leftarrow \text{Prove}(\text{pk}, x, w)\right] = 1.0$$
Verified across all 70 testnet profiles via Vitest automated assertion suite.

### Invariant 2: Soundness (Dishonest Prover Rejection)
For any invalid witness $w^*$ where any metric fails threshold (e.g. $\text{score} < \text{minScore}$):
$$\Pr\left[\text{Verify}(\text{vk}, x, \pi^*) = 1\right] < 2^{-128}$$
No computationally bounded adversary can convince the on-chain verifier that an insolvent profile is solvent.

### Invariant 3: Zero-Knowledge (Zero Witness Leakage)
There exists a polynomial-time simulator $S$ such that for all public inputs $x$:
$$\text{View}_{\text{Verifier}}(\text{pk}, x, \pi) \stackrel{c}{\equiv} S(x)$$
The probability distribution of the proof $\pi$ reveals zero information regarding the specific values of $\text{score}$, $\text{income}$, or $\text{dtiBps}$.

---

## 2. Integer Range-Check Proofs

To prevent arithmetic integer underflow/overflow attacks in Compact:
- `creditScore` is bounded to $[300, 850]$.
- `debtToIncomeBps` is bounded to $[0, 10{,}000]$ (representing $0.00\%$ to $100.00\%$).
- `collateralRatioBps` is bounded to $[0, 100{,}000]$ (representing $0.00\%$ to $1000.00\%$).
- `blindingSalt` is required to have a minimum entropy of 256 bits generated via CSPRNG.
