# Contributing to ShieldScore

Thank you for your interest in contributing to **ShieldScore — The Private Credit Passport for Midnight Network**! We welcome open-source contributions from developers, cryptographers, and DeFi researchers.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Docker**: For running the local Midnight Proof Server (`:6300`)
- **Compact Toolchain**: Managed via `compactup` (`0.28.0`)

### 2. Quickstart
```bash
# Clone the repository
git clone https://github.com/brindaban55/AegisSolv.git
cd AegisSolv

# Install dependencies across all monorepo workspaces
npm install

# Start local Docker proof server
docker run -d -p 6300:6300 midnightntwrk/proof-server:latest

# Run contract test suite
npm run contract:test

# Start frontend development server
npm run dev
```

---

## 🧪 Testing Guidelines

Before opening a pull request, ensure all tests pass:
```bash
# 1. Run Vitest circuit assertions
npm run contract:test

# 2. Assert multi-persona invariants
npm run test:70-users --prefix contract

# 3. Typecheck both workspaces
npm run typecheck --workspaces
```

---

## 📜 Code of Conduct & Contribution Standards

- All commits should follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- Zero-custody invariant: Never introduce external logging or transmission of private witness fields (`creditScore`, `annualIncome`, `debtToIncomeBps`, `collateralRatioBps`, `salt`).
