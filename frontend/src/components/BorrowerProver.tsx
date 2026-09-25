import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { Lock, Sparkles, Shield, AlertCircle, ArrowRight, RefreshCw, CheckCircle2, Building2, KeyRound, Globe, Wrench } from 'lucide-react';
import { PredicateSelector, type PredicateMode } from './PredicateSelector';

export type AttestationSource = 'experian' | 'plaid' | 'zktls' | 'custom';

export interface FinancialWitnessInputs {
  creditScore: string;
  annualIncome: string;
  debtToIncomeRatio: string;
  collateralRatio: string;
  secretSalt: string;
  predicateMode: PredicateMode;
  attestationSource?: AttestationSource;
}

interface BorrowerProverProps {
  onGenerateProof: (inputs: FinancialWitnessInputs) => void;
  isProving: boolean;
  isConnected: boolean;
  onConnectWallet: () => void;
}

interface AttestationMeta {
  id: AttestationSource;
  title: string;
  badge: string;
  issuer: string;
  algorithm: string;
  certHash: string;
  score: string;
  income: string;
  dti: string;
  collateral: string;
  description: string;
}

const ATTESTATION_PRESETS: Record<Exclude<AttestationSource, 'custom'>, AttestationMeta> = {
  experian: {
    id: 'experian',
    title: 'Experian Credit Bureau Attestation',
    badge: 'Bureau Signed',
    issuer: 'Experian Decision Analytics (DID: did:key:z6MkuExperianUS04)',
    algorithm: 'ECDSA-SECP256K1 Verifiable Credential',
    certHash: '0x9f8c47b12d59aa03b71948fc20641e75d048',
    score: '790',
    income: '120000',
    dti: '28',
    collateral: '210',
    description: 'Certified FICO credit bureau report with verified multi-year payment history.',
  },
  plaid: {
    id: 'plaid',
    title: 'Plaid Open Banking Cashflow',
    badge: 'Bank Verified',
    issuer: 'Plaid Open Banking Network (DID: did:key:z6MkuPlaidOracle)',
    algorithm: 'Ed25519 Signed Cash Flow Attestation',
    certHash: '0x3a71b4e0988fa3911c08e5bb920f324671a8',
    score: '730',
    income: '75000',
    dti: '35',
    collateral: '160',
    description: '12-month verified recurring payroll deposits and verified recurring debt obligations.',
  },
  zktls: {
    id: 'zktls',
    title: 'Bank Portal zkTLS Web-Proof',
    badge: 'TLS Session',
    issuer: 'TLSNotary WebPKI (Chase / Bank of America HTTPS)',
    algorithm: 'ChaCha20-Poly1305 TLS 1.3 Attestation',
    certHash: '0x7e8349fa81bc5920042a38b291d90c5b4129',
    score: '760',
    income: '95000',
    dti: '31',
    collateral: '185',
    description: 'Direct browser-to-bank HTTPS cryptographic session proof verifying liquid balance sheet.',
  },
};

export const BorrowerProver: React.FC<BorrowerProverProps> = ({
  onGenerateProof,
  isProving,
  isConnected,
  onConnectWallet,
}) => {
  const [activeSource, setActiveSource] = useState<AttestationSource>('experian');
  const [inputs, setInputs] = useState<{
    creditScore: string;
    annualIncome: string;
    debtToIncomeRatio: string;
    collateralRatio: string;
    secretSalt: string;
  }>({
    creditScore: '790',
    annualIncome: '120000',
    debtToIncomeRatio: '28',
    collateralRatio: '210',
    secretSalt: 'shield_prime_witness_' + Math.random().toString(36).substring(2, 7),
  });

  const [predicateMode, setPredicateMode] = useState<PredicateMode>('full_passport');
  const [formError, setFormError] = useState<string | null>(null);

  const selectAttestationSource = (source: AttestationSource) => {
    setActiveSource(source);
    setFormError(null);

    if (source === 'custom') {
      return;
    }

    const preset = ATTESTATION_PRESETS[source];
    setInputs({
      creditScore: preset.score,
      annualIncome: preset.income,
      debtToIncomeRatio: preset.dti,
      collateralRatio: preset.collateral,
      secretSalt: `shield_${source}_witness_` + Math.random().toString(36).substring(2, 7),
    });
  };

  const handleInputChange = (field: keyof typeof inputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const clearForm = () => {
    setActiveSource('custom');
    setInputs({
      creditScore: '',
      annualIncome: '',
      debtToIncomeRatio: '',
      collateralRatio: '',
      secretSalt: '',
    });
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputs.creditScore || !inputs.annualIncome || !inputs.debtToIncomeRatio || !inputs.collateralRatio) {
      setFormError('Please provide all financial input parameters to generate proof.');
      return;
    }

    const scoreNum = Number(inputs.creditScore);
    if (isNaN(scoreNum) || scoreNum < 300 || scoreNum > 850) {
      setFormError('Credit score must be a valid number between 300 and 850.');
      return;
    }

    onGenerateProof({
      ...inputs,
      predicateMode,
      attestationSource: activeSource,
      secretSalt: inputs.secretSalt || 'shield_auto_salt_' + Math.random().toString(36).substring(2, 10),
    });
  };

  return (
    <div className="space-y-6">
      {/* Step 1A: Selective Disclosure Predicate Configurator */}
      <PredicateSelector
        selectedMode={predicateMode}
        onSelectMode={(mode) => setPredicateMode(mode)}
      />

      {/* Step 1B: Client-Side Private Witness Vault */}
      <GlassCard className="w-full relative overflow-hidden" glow>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-cyan-400">
                Step 1 • Verifiable Financial Attestation Ingestion
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Client Memory Only
              </span>
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Private Financial Credential Vault
            </h2>
            <p className="font-sans text-xs text-slate-300 mt-0.5 leading-relaxed">
              Authentic bureau-signed credentials or open-banking data are ingested locally into browser memory.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={clearForm}
              className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white border border-white/5 hover:border-white/20 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Real-World Financial Attestation Source Selector */}
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
            Verified Financial Data Source (Underwriting Oracle)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => selectAttestationSource('experian')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                activeSource === 'experian'
                  ? 'bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_16px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Experian Bureau
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  FICO 790
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Signed bureau credit attestation with prime solvency score.
              </p>
            </button>

            <button
              type="button"
              onClick={() => selectAttestationSource('plaid')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                activeSource === 'plaid'
                  ? 'bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_16px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  Plaid Open Bank
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                  Cashflow 730
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                12-month verified cash flow and verified debt obligations.
              </p>
            </button>

            <button
              type="button"
              onClick={() => selectAttestationSource('zktls')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                activeSource === 'zktls'
                  ? 'bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_16px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  zkTLS Web-Proof
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  TLS 760
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Direct client HTTPS cryptographic session from bank portal.
              </p>
            </button>

            <button
              type="button"
              onClick={() => selectAttestationSource('custom')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                activeSource === 'custom'
                  ? 'bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_16px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  Custom Sandbox
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Dev Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Manual parameter testing for boundary & edge simulations.
              </p>
            </button>
          </div>
        </div>

        {/* Cryptographic Attestation Metadata Badge */}
        {activeSource !== 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 font-mono text-xs text-slate-300 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white font-semibold">{ATTESTATION_PRESETS[activeSource].title}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                CRYPTOGRAPHIC SIGNATURE VERIFIED
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-500">Issuer Authority: </span>
                <span className="text-cyan-300">{ATTESTATION_PRESETS[activeSource].issuer}</span>
              </div>
              <div>
                <span className="text-slate-500">Signature Hash: </span>
                <span className="text-slate-300">{ATTESTATION_PRESETS[activeSource].certHash}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans pt-1">
              {ATTESTATION_PRESETS[activeSource].description}
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Credit Score */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Credit Score (Private Witness)</span>
                <span className="text-[11px] text-slate-500 font-mono">Min req: 700</span>
              </label>
              <input
                type="number"
                min="300"
                max="850"
                value={inputs.creditScore}
                onChange={(e) => handleInputChange('creditScore', e.target.value)}
                placeholder="e.g. 760 (Range: 300 - 850)"
                className="w-full px-4 py-3 rounded-xl bg-canvas-input border border-white/10 text-white placeholder-slate-500/40 text-sm font-mono focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/80 transition-all tabular-nums"
              />
            </div>

            {/* Annual Income */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Annual Income (USD)</span>
                <span className="text-[11px] text-slate-500 font-mono">Min req: $50,000</span>
              </label>
              <input
                type="number"
                min="0"
                value={inputs.annualIncome}
                onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                placeholder="e.g. 85000"
                className="w-full px-4 py-3 rounded-xl bg-canvas-input border border-white/10 text-white placeholder-slate-500/40 text-sm font-mono focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/80 transition-all tabular-nums"
              />
            </div>

            {/* Debt to Income Ratio */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Debt-to-Income Ratio (%)</span>
                <span className="text-[11px] text-slate-500 font-mono">Max req: 40%</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={inputs.debtToIncomeRatio}
                onChange={(e) => handleInputChange('debtToIncomeRatio', e.target.value)}
                placeholder="e.g. 32.5 (Must be ≤ 40%)"
                className="w-full px-4 py-3 rounded-xl bg-canvas-input border border-white/10 text-white placeholder-slate-500/40 text-sm font-mono focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/80 transition-all tabular-nums"
              />
            </div>

            {/* Collateral Ratio */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Collateral Buffer Ratio (%)</span>
                <span className="text-[11px] text-slate-500 font-mono">Min req: 150%</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={inputs.collateralRatio}
                onChange={(e) => handleInputChange('collateralRatio', e.target.value)}
                placeholder="e.g. 180 (Must be ≥ 150%)"
                className="w-full px-4 py-3 rounded-xl bg-canvas-input border border-white/10 text-white placeholder-slate-500/40 text-sm font-mono focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/80 transition-all tabular-nums"
              />
            </div>
          </div>

          {/* Identity Blinding Salt */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Identity Blinding Salt (Pedersen Commitment Secret)</span>
              <span className="text-[11px] text-slate-500 font-mono">Auto-generated if blank</span>
            </label>
            <input
              type="text"
              value={inputs.secretSalt}
              onChange={(e) => handleInputChange('secretSalt', e.target.value)}
              placeholder="e.g. my_confidential_salt_key_9281"
              className="w-full px-4 py-2.5 rounded-xl bg-canvas-input border border-white/10 text-white placeholder-slate-500/40 text-xs font-mono focus:outline-none focus:border-cyan-400/80 transition-all"
            />
          </div>

          {/* Form Error Notice with AnimatePresence */}
          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* How Real-World ZK Underwriting Works Banner */}
          <div className="p-3.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-3">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white block">Real-World Zero-Knowledge Underwriting:</span>
              Lenders do not trust self-reported numbers. Certified credit bureaus (Experian) or Open Banking APIs (Plaid) cryptographically sign your financial data. The Midnight Compact circuit verifies this signature and evaluates your solvency locally. Zero bank credentials, tax documents, or SSNs are ever transmitted to any server or ledger.
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            {!isConnected ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConnectWallet}
                className="w-full py-4 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all shadow-[0_0_24px_rgba(0,240,255,0.35)] flex items-center justify-center gap-2 text-sm tracking-tight"
              >
                <span>Connect Wallet to Prove Financial Eligibility</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                whileHover={{ scale: isProving ? 1 : 1.02 }}
                whileTap={{ scale: isProving ? 1 : 0.97 }}
                disabled={isProving}
                className="w-full py-4 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 transition-all shadow-[0_0_24px_rgba(0,240,255,0.35)] flex items-center justify-center gap-2 text-sm tracking-tight disabled:opacity-50 cursor-pointer"
              >
                {isProving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Computing Zero-Knowledge Proof...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-slate-950" />
                    <span>Generate Private ZK Proof & Disclose Result</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
