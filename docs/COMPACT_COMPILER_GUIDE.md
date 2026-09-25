# ShieldScore — Compact Compiler Toolchain & Circuit Build Lifecycle

> **Language**: Compact (Midnight Network Domain-Specific ZK Language)  
> **Compiler Target**: 0.28.0 (Managed with `compactup`)  
> **Source Circuit**: `contract/src/shieldscore.compact`  
> **Artifacts Output**: `contract/managed/` (16 compiled circuit artifacts)

---

## 1. Toolchain Installation & Version Pinning

The Midnight Compact compiler toolchain is managed via the official `compactup` utility:

```bash
# 1. Download installer script
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

# 2. Add binaries to PATH
export PATH="$HOME/.compact/bin:$HOME/.local/bin:$PATH"

# 3. Pin compiler version
compactup default 0.28.0
```

---

## 2. Compilation Pipeline

When `compact compile src/shieldscore.compact managed` is executed, the compiler executes a four-stage transformation:

```
src/shieldscore.compact (Compact Source Code)
              │
              ▼
   [ AST Parse & Typecheck ]
              │
              ▼
   [ IR Synthesis (.zkir) ] ──────────► managed/zkir/*.zkir
              │
              ▼
   [ Binary Circuit (.bzkir) ] ───────► managed/zkir/*.bzkir
              │
              ├────────────────────────► managed/keys/*.prover
              │                          managed/keys/*.verifier
              ▼
   [ TS / JS Runtime Bindings ] ──────► managed/contract/index.js
                                         managed/contract/index.d.ts
```

---

## 3. Generated Circuit Artifacts

The compilation produces the following critical artifacts in `contract/managed/`:
1. `keys/verifyCreditPassport.prover` (2.81 MB): Proving key used by the client proof server.
2. `keys/verifyCreditPassport.verifier` (2.11 KB): Compact verification key loaded into on-chain contract state.
3. `zkir/verifyCreditPassport.zkir` (9.86 KB): Textual zero-knowledge intermediate representation.
4. `zkir/verifyCreditPassport.bzkir` (598 B): Compact binary ZK circuit for rapid deserialization.
5. `contract/index.js` (72.8 KB): Strongly typed JavaScript bindings for contract deployment and execution.
