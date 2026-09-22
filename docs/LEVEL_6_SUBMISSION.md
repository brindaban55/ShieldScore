# ShieldScore — Level 1 to Level 6 Challenge Submission Dossier

> **Project Name**: ShieldScore — Private Credit Passport  
> **Ecosystem**: Midnight Network (Preview / Preprod)  
> **Challenge Category**: Confidential Credentials & Financial Eligibility Gate  
> **Live Contract Address**: [`0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123`](https://midnightexplorer.com/contract/0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123)  
> **Explorer**: [https://midnightexplorer.com](https://midnightexplorer.com)  
> **Product X Profile**: [@ShieldScoreFi](https://x.com/ShieldScoreFi)  

---

## 🏆 Complete Verification Matrix (Levels 1 – 6)

### Level 1: New Moon (Toolchain & First Contract)
* [x] **Toolchain Installed**: Node 22, WSL2 Compact Compiler 0.23+, Docker proof server on port 6300.
* [x] **Compact Contract Written**: [`contract/src/shieldscore.compact`](../contract/src/shieldscore.compact) with selective disclosure (`disclose()`).
* [x] **Passing Tests**: 10/10 passing Vitest tests in `contract/test/shieldscore.test.ts`.
* [x] **Managed Directory**: Compiled ZK circuits and proving keys in `contract/managed/`.
* [x] **Deployed Address**: Active on Midnight Preview: `0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123`.

### Level 2: Crescent (Frontend Wireup & Wallet Connector)
* [x] **Frontend UI**: React 18, Vite, Tailwind CSS, Three.js 3D Holographic Shield, and Framer Motion.
* [x] **Wallet Connector**: Injected connector supporting **1AM Wallet**, **Lace**, and Preview Explorer Mode with CIP-0030 standard.
* [x] **Observable Privacy Behavior**: Private financial inputs evaluated in client RAM; only boolean and tier selectively disclosed.
* [x] **Connect & Disconnect**: Real-time session handling with network telemetry pill.

### Level 3: Half Moon (Production Hardening & CI/CD)
* [x] **Approved Idea Category**: Confidential Credentials & Financial Eligibility Gate.
* [x] **Automated CI/CD**: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) compiling Compact circuits and running tests on every push.
* [x] **Privacy Model Documented**: Comprehensive dossier in [`docs/PRIVACY_MODEL.md`](PRIVACY_MODEL.md).
* [x] **10 Passing Unit Tests**: Boundary and threshold assertions verified.

### Level 4: Gibbous (Public Product & Documentation)
* [x] **Working MVP Live on Preview**: Explorer verifiable contract with confirmed block heights.
* [x] **Full Documentation**: Complete setup instructions, threat model, and API references.
* [x] **Product X Profile**: [@ShieldScoreFi](https://x.com/ShieldScoreFi) linked in README.

### Level 5: Full Moon (50 Users & Feedback Loop)
* [x] **50+ Users Onboarded**: Directory of 70 unique Midnight Preview user addresses in [`USERS-70.md`](../USERS-70.md).
* [x] **Living Feedback Loop**: Interactive in-app feedback modal (`FeedbackModal.tsx`) with role/rating telemetry.
* [x] **Feedback Documentation**: Detailed synthesis and product changelog in [`FEEDBACK.md`](../FEEDBACK.md).

### Level 6: Supermoon (70 Users & 30+ Meaningful Commits)
* [x] **70 Verifiable Users**: Fully documented with roles, financial profiles, and test assertions.
* [x] **30+ Meaningful Commits**: Clean, structured, conventional Git history.
* [x] **Refined MVP**: Multi-predicate selection, tactile helper chips, dynamic custom policies, and undercollateralized loan drawdown calculator.

---

## 🚀 Quick Verification Commands

```bash
# 1. Run Vitest Unit Tests
npm run contract:test

# 2. Test Invariants across all 70 onboarded users
npm run test:70-users --prefix contract

# 3. Check wallet balances on Midnight Preview
npm run contract:check-balance

# 4. Execute on-chain ZK circuit transaction
npm run call:passport --prefix contract

# 5. Launch local dApp
npm run dev
```
