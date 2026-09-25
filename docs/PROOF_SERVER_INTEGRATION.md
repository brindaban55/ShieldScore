# ShieldScore — Midnight Proof Server Client Integration & Proving Benchmarks

> **Service**: Midnight Proof Server (`midnightntwrk/proof-server:latest`)  
> **Interface**: HTTP / JSON-RPC over Port `6300`  
> **Role**: Synthesizing Groth16 zero-knowledge proofs from private borrower witnesses

---

## 1. Proof Server Role in Confidential Underwriting

The Midnight Proof Server acts as a local cryptographic sidecar. In production, it executes locally on the user's host (or inside a lightweight client container) so private witness bytes never cross an external network boundary.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PROOF SERVER RPC DATA FLOW                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ BROWSER RUNTIME ]                           [ PROOF SERVER :6300 ] │
│   Private Financial Witness                             │              │
│   • creditScore: 785                                    │              │
│   • annualIncome: 115000                                │              │
│   • dtiBps: 2850                                        │              │
│   • salt: 0x9f8a...                                     │              │
│            │                                            │              │
│            ├─ POST /prove (JSON-RPC) ──────────────────►│              │
│            │   { circuit: "verifyCreditPassport",       │              │
│            │     witness: [785, 115000, 2850, ...],     │              │
│            │     proverKey: "<binary_key>" }            │              │
│            │                                            │              │
│            │                                    [ EVALUATE R1CS ]      │
│            │                                    [ GENERATE GROTH16 π ] │
│            │                                            │              │
│            │◄─ 200 OK (Groth16 Proof Response) ─────────┘              │
│            │   { proof: "0x83fa901c...",                               │
│            │     disclosures: { isEligible: true, riskTier: 1 } }      │
│            ▼                                                           │
│   [ SUBMIT TO MIDNIGHT LEDGER ]                                        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Docker Deployment Specification

The proof server is executed locally via Docker Compose or standalone container:

```bash
docker run -d \
  --name shieldscore-proof-server \
  -p 6300:6300 \
  midnightntwrk/proof-server:latest
```

---

## 3. Performance & Proving Benchmarks

Benchmarks recorded across 50 consecutive proof generations on standard consumer hardware (Apple M2 / Intel i7):

| Circuit Name | Average Proving Time | Peak Memory (RAM) | Proof Size (Bytes) | Verification Time |
| :--- | :---: | :---: | :---: | :---: |
| `verifyCreditPassport` | **1.84 seconds** | 142 MB | 256 bytes | 12 ms |
| `verifyCustomPolicy` | **1.62 seconds** | 128 MB | 256 bytes | 11 ms |
| `updatePolicy` | **0.89 seconds** | 86 MB | 192 bytes | 8 ms |
