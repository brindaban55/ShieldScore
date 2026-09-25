# ShieldScore: Security Architecture & Threat Model

> **Topic**: Zero-Knowledge Privacy Isolation, Attack Vector Analysis, and Cryptographic Invariants

---

## 🔒 1. Client-Side Memory Isolation Architecture

ShieldScore adheres to the **Zero-Custody Principle**:
* **Ephemeral Witness State**: All sensitive financial records (`creditScore`, `annualIncome`, `dtiBps`, `salt`) are computed solely inside client RAM or the local Docker proof server instance.
* **No Cloud Telemetry of Financials**: Neither the frontend UI nor the backend indexer ever logs or transmits raw financial numbers.
* **WASM Sandboxing**: Proof synthesis executes within an isolated WebAssembly virtual machine, preventing script injection or cross-origin leakage.

---

## 🛡️ 2. Threat Vector Mitigation Analysis

| Threat Vector | Potential Vulnerability | ShieldScore Mitigation |
| :--- | :--- | :--- |
| **Witness Brute-Forcing** | Attacker attempts to invert circuit outputs to guess credit score | Every proof requires a **256-bit cryptographically random secret salt** (`Bytes<32>`). The search space of $2^{256}$ renders rainbow tables and exhaustive search computationally infeasible. |
| **Proof Replay Attack** | Malicious actor captures a valid proof and submits it as their own | The circuit binds the verification to a **Pedersen commitment** containing the applicant's unique public key and an active Unix epoch timestamp. Replays on different accounts or stale epochs fail contract verification. |
| **Selective Disclosure Tampering** | Compromised frontend client attempts to forge a "Tier A" outcome | Verification logic is enforced **inside the zero-knowledge circuit itself** via polynomial constraints. The smart contract validates the Groth16 cryptographic proof $\pi$; forged claims produce invalid proofs rejected by the Midnight consensus node. |
| **Network Mismatch Exploits** | User signs a Preprod proof while connected to a Preview ledger | Frontend enforces strict **Bech32 address prefix inspection** (`mn_addr_preprod` vs `mn_addr_preview`). Network changes immediately revoke active wallet sessions. |

---

## ✅ 3. Formal Cryptographic Invariants

1. **Completeness**: If an honest applicant possesses financial metrics satisfying $\text{Policy}(P)$, the prover will generate a valid proof $\pi$ accepted by `verifyCreditPassport` with probability $1$.
2. **Computational Soundness**: A dishonest applicant possessing financial metrics failing $\text{Policy}(P)$ cannot generate a valid proof $\pi$ accepted by the verifier, except with negligible probability $\le 2^{-128}$.
3. **Zero-Knowledge**: The proof $\pi$ reveals no information regarding `creditScore`, `annualIncome`, or `debtToIncomeRatioBps` beyond the single truth value of the predicate evaluated.
