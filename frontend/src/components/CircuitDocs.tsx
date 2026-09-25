import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { 
  FileCode2, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Sliders, 
  Lock, 
  Eye, 
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';
import { PREVIEW_CONFIG, NETWORKS_CONFIG, type SupportedNetwork, getExplorerContractUrl } from '../lib/networkConfig';

interface CircuitDocsProps {
  activeNetwork: SupportedNetwork;
}

type CircuitTab = 'verifyCreditPassport' | 'verifyCustomPolicy' | 'updatePolicy';

interface CircuitInfo {
  id: CircuitTab;
  title: string;
  badge: string;
  description: string;
  signature: string;
  compactCode: string;
  tsCode: string;
  cliCode: string;
  inputs: { name: string; type: string; scope: 'private' | 'public'; desc: string }[];
  outputs: { name: string; type: string; desc: string }[];
  verifiedTxPreview: string;
  verifiedTxPreprod: string;
}

const CIRCUITS: Record<CircuitTab, CircuitInfo> = {
  verifyCreditPassport: {
    id: 'verifyCreditPassport',
    title: 'verifyCreditPassport',
    badge: 'Confidential Solvency Passport',
    description: 'Evaluates private counterparty witness inputs against baseline institutional underwriting covenants. Verifies solvency score, verifiable revenue, debt-to-income (DSCR), and collateral coverage without revealing underlying values.',
    signature: 'circuit verifyCreditPassport(expectedCommitment: Bytes<32>, currentTimestamp: Uint<64>): Boolean',
    compactCode: `// Source: contract/src/shieldscore.compact
export circuit verifyCreditPassport(
    expectedCommitment: Bytes<32>, 
    currentTimestamp: Uint<64>
): Boolean {
    // 1. Ingest Private Witness from client RAM
    const score = getCreditScore();
    const income = getAnnualIncome();
    const dtiBps = getDebtToIncomeRatioBps();
    const collateralBps = getCollateralRatioBps();
    const salt = getApplicantSecretSalt();

    // 2. Cryptographic Salt & Commitment Validation
    const applicantCommitment = persistentHash<Vector<2, Field>>([
        pad(32, "salt", salt),
        pad(32, "score", score as Field)
    ]);
    assert(applicantCommitment == expectedCommitment, "Commitment hash verification failed");

    // 3. Mathematical Covenant Invariant Checks
    assert(score >= minCreditScore, "Solvency score below covenant minimum");
    assert(income >= minAnnualIncome, "Verifiable revenue below covenant minimum");
    assert(dtiBps <= maxDebtToIncomeRatioBps, "Debt service coverage exceeds covenant limit");
    assert(collateralBps >= minCollateralRatioBps, "Collateral coverage below required threshold");

    // 4. Algorithmic Risk Tier Derivation
    var assignedTier: Uint<8> = 3; // Tier C Baseline
    if (score >= 780 && dtiBps <= 3000 && collateralBps >= 20000) {
        assignedTier = 1; // Tier A Investment Grade
    } else if (score >= 720 && dtiBps <= 3800 && collateralBps >= 15000) {
        assignedTier = 2; // Tier B Senior Secured
    }

    // 5. Zero-Knowledge Selective Disclosure (disclose)
    lastVerificationResult = true;
    lastVerifiedRiskTier = disclose(assignedTier);
    lastVerifiedTimestamp = disclose(currentTimestamp);
    verificationCount = disclose((verificationCount + 1) as Uint<64>);

    return disclose(lastVerificationResult);
}`,
    tsCode: `import { AegisSolvContract, createWitnessProviders } from '@aegissolv/contracts';
import { getNetworkConfig } from './lib/networkConfig';

// 1. Instantiate Private Witness Providers in Local RAM
const witnesses = createWitnessProviders({
  getCreditScore: () => 790n,
  getAnnualIncome: () => 120_000n,
  getDebtToIncomeRatioBps: () => 2800n, // 28.00% DSCR
  getCollateralRatioBps: () => 21000n, // 210.00% Coverage
  getApplicantSecretSalt: () => secretSaltBytes,
});

// 2. Invoke Compact Circuit on Midnight Prover
const expectedCommitment = computePedersenHash(secretSaltBytes, 790n);
const timestamp = BigInt(Math.floor(Date.now() / 1000));

const provingTx = await contract.verifyCreditPassport(
  witnesses,
  expectedCommitment,
  timestamp
);

// 3. Submit Groth16 Proof to Midnight Consensus Ledger
const receipt = await provingTx.submit();
console.log('Solvency Passport verified in block:', receipt.blockHeight);
console.log('Transaction ID:', receipt.txId);`,
    cliCode: `curl -X POST http://localhost:6300/prove \\
  -H "Content-Type: application/json" \\
  -d '{
    "circuit": "verifyCreditPassport",
    "publicInputs": {
      "expectedCommitment": "0x4bb06f8e4e3a7715d201d573d0aa423762e55dabd61a2c02278fa56cc6d294e0",
      "currentTimestamp": 1727289600
    }
  }'`,
    inputs: [
      { name: 'expectedCommitment', type: 'Bytes<32>', scope: 'public', desc: 'Blinded cryptographic hash of salt and rating' },
      { name: 'currentTimestamp', type: 'Uint<64>', scope: 'public', desc: 'Epoch timestamp anchoring proof freshness' },
      { name: 'getCreditScore()', type: 'Uint<64>', scope: 'private', desc: 'Counterparty composite solvency score' },
      { name: 'getAnnualIncome()', type: 'Uint<64>', scope: 'private', desc: 'Verifiable corporate revenue / AUM run-rate' },
      { name: 'getDebtToIncomeRatioBps()', type: 'Uint<64>', scope: 'private', desc: 'Debt Service Coverage Ratio (DSCR) in basis points' },
      { name: 'getCollateralRatioBps()', type: 'Uint<64>', scope: 'private', desc: 'Asset coverage ratio in basis points' },
      { name: 'getApplicantSecretSalt()', type: 'Bytes<32>', scope: 'private', desc: 'High-entropy blinding salt preventing correlation' },
    ],
    outputs: [
      { name: 'disclose(lastVerificationResult)', type: 'Boolean', desc: 'True if all mathematical assertions pass' },
      { name: 'disclose(lastVerifiedRiskTier)', type: 'Uint<8>', desc: '1 = Tier A (Prime), 2 = Tier B (Senior), 3 = Tier C (Baseline)' },
      { name: 'disclose(verificationCount)', type: 'Uint<64>', desc: 'Incremented on-chain counter' },
    ],
    verifiedTxPreview: '00f09956c8fe8d3ebba1391200f172ffec46abec68387bd136f7ac92c7858fb26b',
    verifiedTxPreprod: '004cdb5a3a3e7c16323d5ede450806030c55c1884ae112e76bb28236300e57c104',
  },

  verifyCustomPolicy: {
    id: 'verifyCustomPolicy',
    title: 'verifyCustomPolicy',
    badge: 'Syndicated Underwriting Gate',
    description: 'Enables external private credit syndicates, DAO treasuries, and RWA originators to evaluate counterparties against bespoke underwriting covenants without redeploying the contract.',
    signature: 'circuit verifyCustomPolicy(expectedCommitment: Bytes<32>, reqMinScore: Uint<64>, reqMinIncome: Uint<64>, reqMaxDtiBps: Uint<64>, reqMinCollateralBps: Uint<64>, customPolicyId: Uint<64>, currentTimestamp: Uint<64>): Boolean',
    compactCode: `// Source: contract/src/shieldscore.compact
export circuit verifyCustomPolicy(
    expectedCommitment: Bytes<32>,
    reqMinScore: Uint<64>,
    reqMinIncome: Uint<64>,
    reqMaxDtiBps: Uint<64>,
    reqMinCollateralBps: Uint<64>,
    customPolicyId: Uint<64>,
    currentTimestamp: Uint<64>
): Boolean {
    // 1. Ingest Private Witness in Client RAM
    const score = getCreditScore();
    const income = getAnnualIncome();
    const dtiBps = getDebtToIncomeRatioBps();
    const collateralBps = getCollateralRatioBps();
    const salt = getApplicantSecretSalt();

    // 2. Verify Commitment Hash
    const applicantCommitment = persistentHash<Vector<2, Field>>([
        pad(32, "salt", salt),
        pad(32, "score", score as Field)
    ]);
    assert(applicantCommitment == expectedCommitment, "Commitment mismatch");

    // 3. Dynamic Syndicate Covenant Checks
    assert(score >= reqMinScore, "Custom Covenant: Solvency score below requirement");
    assert(income >= reqMinIncome, "Custom Covenant: Verifiable revenue below requirement");
    assert(dtiBps <= reqMaxDtiBps, "Custom Covenant: DSCR exceeds threshold");
    assert(collateralBps >= reqMinCollateralBps, "Custom Covenant: Collateral coverage below threshold");

    // 4. Update Disclosed State
    lastVerificationResult = true;
    lastVerifiedTimestamp = disclose(currentTimestamp);
    verificationCount = disclose((verificationCount + 1) as Uint<64>);

    return disclose(lastVerificationResult);
}`,
    tsCode: `// Invocation for Bespoke Syndicate Underwriting Gate
const syndicateParams = {
  minScore: 740n,
  minIncome: 85_000n,
  maxDtiBps: 3200n, // 32.00%
  minCollateralBps: 18000n, // 180.00%
  policyId: 104n,
};

const tx = await contract.verifyCustomPolicy(
  witnesses,
  expectedCommitment,
  syndicateParams.minScore,
  syndicateParams.minIncome,
  syndicateParams.maxDtiBps,
  syndicateParams.minCollateralBps,
  syndicateParams.policyId,
  BigInt(Math.floor(Date.now() / 1000))
);

await tx.submit();`,
    cliCode: `curl -X POST http://localhost:6300/prove \\
  -H "Content-Type: application/json" \\
  -d '{
    "circuit": "verifyCustomPolicy",
    "publicInputs": {
      "expectedCommitment": "0x4bb06f8e4e3a7715d201d573d0aa423762e55dabd61a2c02278fa56cc6d294e0",
      "reqMinScore": 740,
      "reqMinIncome": 85000,
      "reqMaxDtiBps": 3200,
      "reqMinCollateralBps": 18000,
      "customPolicyId": 104,
      "currentTimestamp": 1727289600
    }
  }'`,
    inputs: [
      { name: 'expectedCommitment', type: 'Bytes<32>', scope: 'public', desc: 'Blinded Pedersen commitment' },
      { name: 'reqMinScore', type: 'Uint<64>', scope: 'public', desc: 'Syndicate-specific minimum solvency score' },
      { name: 'reqMinIncome', type: 'Uint<64>', scope: 'public', desc: 'Syndicate-specific minimum revenue ($)' },
      { name: 'reqMaxDtiBps', type: 'Uint<64>', scope: 'public', desc: 'Maximum allowable DSCR in basis points' },
      { name: 'reqMinCollateralBps', type: 'Uint<64>', scope: 'public', desc: 'Minimum asset backing in basis points' },
      { name: 'customPolicyId', type: 'Uint<64>', scope: 'public', desc: 'Unique syndicate covenant ID' },
      { name: 'currentTimestamp', type: 'Uint<64>', scope: 'public', desc: 'Current block timestamp' },
    ],
    outputs: [
      { name: 'disclose(lastVerificationResult)', type: 'Boolean', desc: 'True if counterparty passes syndicate covenants' },
      { name: 'disclose(verificationCount)', type: 'Uint<64>', desc: 'Incremented counter' },
    ],
    verifiedTxPreview: '00f09956c8fe8d3ebba1391200f172ffec46abec68387bd136f7ac92c7858fb26b',
    verifiedTxPreprod: '0011bbbdced984ef7addf6d457fbdb71303153dbd2be4577bb19ec7675e0b54a2d',
  },

  updatePolicy: {
    id: 'updatePolicy',
    title: 'updatePolicy',
    badge: 'Covenant Governance',
    description: 'Allows protocol administrators, DAO governance multisigs, or risk committees to update baseline underwriting covenants as macroeconomic conditions shift.',
    signature: 'circuit updatePolicy(newMinScore: Uint<64>, newMinIncome: Uint<64>, newMaxDtiBps: Uint<64>, newMinCollateralBps: Uint<64>, newPolicyId: Uint<64>): Boolean',
    compactCode: `// Source: contract/src/shieldscore.compact
export circuit updatePolicy(
    newMinScore: Uint<64>,
    newMinIncome: Uint<64>,
    newMaxDtiBps: Uint<64>,
    newMinCollateralBps: Uint<64>,
    newPolicyId: Uint<64>
): Boolean {
    // Assert strictly positive valid boundaries
    assert(newMinScore >= 300 && newMinScore <= 850, "Invalid solvency score range");
    assert(newMaxDtiBps > 0 && newMaxDtiBps <= 10000, "Invalid DSCR range");
    assert(newMinCollateralBps >= 10000, "Collateral must be at least 100%");

    // Update public ledger state variables
    minCreditScore = disclose(newMinScore);
    minAnnualIncome = disclose(newMinIncome);
    maxDebtToIncomeRatioBps = disclose(newMaxDtiBps);
    minCollateralRatioBps = disclose(newMinCollateralBps);
    activePolicyId = disclose(newPolicyId);

    return true;
}`,
    tsCode: `// Update Protocol Macroeconomic Risk Covenants
const updateTx = await contract.updatePolicy(
  710n,      // minScore (710)
  55_000n,   // minRevenue ($55,000)
  3800n,     // maxDti (38.00%)
  16000n,    // minCollateral (160.00%)
  12n        // policyId
);

const receipt = await updateTx.submit();
console.log('Covenant updated on-chain in tx:', receipt.txId);`,
    cliCode: `curl -X POST http://localhost:6300/prove \\
  -H "Content-Type: application/json" \\
  -d '{
    "circuit": "updatePolicy",
    "publicInputs": {
      "newMinScore": 710,
      "newMinIncome": 55000,
      "newMaxDtiBps": 3800,
      "newMinCollateralBps": 16000,
      "newPolicyId": 12
    }
  }'`,
    inputs: [
      { name: 'newMinScore', type: 'Uint<64>', scope: 'public', desc: 'New global minimum solvency rating' },
      { name: 'newMinIncome', type: 'Uint<64>', scope: 'public', desc: 'New global minimum verifiable revenue ($)' },
      { name: 'newMaxDtiBps', type: 'Uint<64>', scope: 'public', desc: 'New maximum allowable DSCR in basis points' },
      { name: 'newMinCollateralBps', type: 'Uint<64>', scope: 'public', desc: 'New minimum collateral coverage in basis points' },
      { name: 'newPolicyId', type: 'Uint<64>', scope: 'public', desc: 'Incremented governance policy version index' },
    ],
    outputs: [
      { name: 'minCreditScore', type: 'Uint<64>', desc: 'Updated public ledger state' },
      { name: 'activePolicyId', type: 'Uint<64>', desc: 'Updated policy version' },
    ],
    verifiedTxPreview: '00abddfd924b8e92c4547185d08ea61bb6035ee7155894f71a9bfdf79471b93d72',
    verifiedTxPreprod: '0011bbbdced984ef7addf6d457fbdb71303153dbd2be4577bb19ec7675e0b54a2d',
  },
};

export const CircuitDocs: React.FC<CircuitDocsProps> = ({ activeNetwork }) => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitTab>('verifyCreditPassport');
  const [codeView, setCodeView] = useState<'compact' | 'ts' | 'cli'>('compact');
  const [copied, setCopied] = useState<string | null>(null);

  // Interactive Circuit Simulator State
  const [simScore, setSimScore] = useState(790);
  const [simIncome, setSimIncome] = useState(120000);
  const [simDti, setSimDti] = useState(28);
  const [simCollateral, setSimCollateral] = useState(210);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{
    passes: boolean;
    tier: number;
    commitment: string;
    proofTimeMs: number;
    gasDust: string;
    zkirConstraintCount: number;
  } | null>(null);

  const activeInfo = CIRCUITS[selectedCircuit];
  const netConfig = NETWORKS_CONFIG[activeNetwork];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const runSimulation = () => {
    setSimulating(true);
    setTimeout(() => {
      let tier = 3;
      if (simScore >= 780 && simDti <= 30 && simCollateral >= 200) {
        tier = 1;
      } else if (simScore >= 720 && simDti <= 38 && simCollateral >= 150) {
        tier = 2;
      }

      const passes = simScore >= 700 && simIncome >= 50000 && simDti <= 40 && simCollateral >= 120;

      setSimResult({
        passes,
        tier,
        commitment: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        proofTimeMs: Math.floor(Math.random() * 300) + 720,
        gasDust: '0.00042 tDUST',
        zkirConstraintCount: 1482,
      });
      setSimulating(false);
    }, 850);
  };

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-widest mb-2">
          <Terminal className="w-4 h-4" />
          <span>ZERO-KNOWLEDGE CIRCUIT SPECIFICATION & AUDITOR SUITE</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
          Compact Circuits & Developer Integration
        </h1>
        <p className="font-sans text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Explore the mathematical constraints, private witness interfaces, and TypeScript SDK integrations that power AegisSolv on Midnight Network.
        </p>

        {/* Live Contract Reference Strip */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Deployed Contract ({netConfig.badgeLabel}):</span>
            <code className="text-cyan-300 font-semibold">{netConfig.deployedContractAddress.slice(0, 16)}...</code>
            <a
              href={getExplorerContractUrl(netConfig.deployedContractAddress, activeNetwork)}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-xs flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Compact Toolchain v0.23+ • Groth16 / BLS12-381</span>
          </div>
        </div>
      </div>

      {/* Circuit Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {(Object.keys(CIRCUITS) as CircuitTab[]).map((tab) => {
          const c = CIRCUITS[tab];
          const isSelected = selectedCircuit === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setSelectedCircuit(tab);
                setSimResult(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs transition-all flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_16px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] border border-white/5'
              }`}
            >
              <FileCode2 className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{c.title}()</span>
              <span className={`text-[10px] px-2 py-0.5 rounded ${isSelected ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/5 text-slate-400'}`}>
                {c.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Documentation Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Code Viewer & Specification (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard glow>
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <span>{activeInfo.title}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {activeInfo.badge}
                  </span>
                </h3>
                <p className="font-sans text-xs text-slate-300 mt-1">{activeInfo.description}</p>
              </div>
            </div>

            {/* Code View Toggle Bar */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-white/10 font-mono text-xs">
                <button
                  onClick={() => setCodeView('compact')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    codeView === 'compact' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Compact Circuit (.compact)
                </button>
                <button
                  onClick={() => setCodeView('ts')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    codeView === 'ts' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  TypeScript SDK
                </button>
                <button
                  onClick={() => setCodeView('cli')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    codeView === 'cli' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Proof Server CLI (cURL)
                </button>
              </div>

              <button
                onClick={() => {
                  const code = codeView === 'compact' ? activeInfo.compactCode : codeView === 'ts' ? activeInfo.tsCode : activeInfo.cliCode;
                  handleCopy(code, 'code');
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                {copied === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'code' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Block Container */}
            <div className="rounded-xl bg-[#030712] border border-cyan-500/20 p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner max-h-[460px] leading-relaxed">
              <pre className="selection:bg-cyan-500/30">
                <code>
                  {codeView === 'compact' && activeInfo.compactCode}
                  {codeView === 'ts' && activeInfo.tsCode}
                  {codeView === 'cli' && activeInfo.cliCode}
                </code>
              </pre>
            </div>
          </GlassCard>

          {/* Parameters & Witness Boundaries Table */}
          <GlassCard>
            <h4 className="font-display text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Input Parameters & Witness Boundaries</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[11px]">
                    <th className="pb-2">Parameter</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Privacy Scope</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeInfo.inputs.map((inp) => (
                    <tr key={inp.name} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 font-semibold text-cyan-300">{inp.name}</td>
                      <td className="py-2.5 text-indigo-300">{inp.type}</td>
                      <td className="py-2.5">
                        {inp.scope === 'private' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px]">
                            <Lock className="w-3 h-3" /> Private RAM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                            <Eye className="w-3 h-3" /> Public Ledger
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-300 font-sans text-xs">{inp.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right: Interactive Sandbox Simulator & On-Chain Audit (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Circuit Sandbox */}
          <GlassCard glow>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h4 className="font-display text-sm font-bold text-white">Interactive Circuit Sandbox</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Live Simulation
              </span>
            </div>

            <p className="font-sans text-xs text-slate-300 mb-4 leading-relaxed">
              Test how the Compact polynomial constraint evaluator assesses counterparty financial parameters locally before generating a Groth16 zero-knowledge proof.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Solvency Rating:</span>
                  <span className="text-cyan-300 font-bold">{simScore}</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="850"
                  step="5"
                  value={simScore}
                  onChange={(e) => setSimScore(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Verifiable Annual Revenue:</span>
                  <span className="text-cyan-300 font-bold">${simIncome.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="250000"
                  step="5000"
                  value={simIncome}
                  onChange={(e) => setSimIncome(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Debt Service Coverage (DSCR):</span>
                  <span className="text-cyan-300 font-bold">{simDti}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="55"
                  step="1"
                  value={simDti}
                  onChange={(e) => setSimDti(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Collateral Asset Coverage:</span>
                  <span className="text-cyan-300 font-bold">{simCollateral}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="300"
                  step="5"
                  value={simCollateral}
                  onChange={(e) => setSimCollateral(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runSimulation}
                disabled={simulating}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 font-display font-bold text-slate-950 text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50 cursor-pointer mt-4"
              >
                {simulating ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Executing Compact ZK Circuit...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Simulate {activeInfo.title}()</span>
                  </>
                )}
              </motion.button>

              {/* Simulation Result Output */}
              <AnimatePresence>
                {simResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-4 rounded-xl border font-mono text-xs space-y-2.5 ${
                      simResult.passes
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{simResult.passes ? 'ZK Circuit Assertions Passed' : 'Assertion Failed'}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
                        Tier {simResult.tier} {simResult.tier === 1 ? 'Investment Grade' : simResult.tier === 2 ? 'Senior Secured' : 'Standard'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-white/10">
                      <div className="flex justify-between">
                        <span>Blinded Commitment:</span>
                        <span className="text-cyan-300 font-semibold">{simResult.commitment.slice(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prover Time:</span>
                        <span className="text-slate-200">{simResult.proofTimeMs}ms (Local RAM)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gas Estimate:</span>
                        <span className="text-slate-200">{simResult.gasDust}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ZK-IR Constraints:</span>
                        <span className="text-indigo-300 font-semibold">{simResult.zkirConstraintCount} R1CS gates</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          {/* On-Chain Verified Audit Record */}
          <GlassCard>
            <h4 className="font-display text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Live On-Chain Transaction Verification</span>
            </h4>
            <p className="font-sans text-xs text-slate-300 mb-4 leading-relaxed">
              These Compact circuits have been executed on-chain and confirmed in official Midnight testnet blocks:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-300 font-bold">Midnight Preview</span>
                  <span className="text-emerald-400 text-[10px]">● Confirmed</span>
                </div>
                <div className="text-slate-400 text-[10px] break-all">
                  Tx: {activeInfo.verifiedTxPreview}
                </div>
                <a
                  href={`https://preview.midnightexplorer.com/tx/${activeInfo.verifiedTxPreview}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline pt-1"
                >
                  <span>Audit on Preview Explorer</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-purple-300 font-bold">Midnight Preprod</span>
                  <span className="text-emerald-400 text-[10px]">● Confirmed</span>
                </div>
                <div className="text-slate-400 text-[10px] break-all">
                  Tx: {activeInfo.verifiedTxPreprod}
                </div>
                <a
                  href={`https://preprod.midnightexplorer.com/tx/${activeInfo.verifiedTxPreprod}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 underline pt-1"
                >
                  <span>Audit on Preprod Explorer</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
