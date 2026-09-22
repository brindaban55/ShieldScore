import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { Lock, Sparkles, Shield, AlertCircle, ArrowRight, RefreshCw, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { PredicateSelector, type PredicateMode } from './PredicateSelector';

export interface FinancialWitnessInputs {
  creditScore: string;
  annualIncome: string;
  debtToIncomeRatio: string;
  collateralRatio: string;
  secretSalt: string;
  predicateMode: PredicateMode;
}

interface BorrowerProverProps {
  onGenerateProof: (inputs: FinancialWitnessInputs) => void;
  isProving: boolean;
  isConnected: boolean;
  onConnectWallet: () => void;
}

export const BorrowerProver: React.FC<BorrowerProverProps> = ({
  onGenerateProof,
  isProving,
  isConnected,
  onConnectWallet,
}) => {
  // STRICT FORM PHILOSOPHY: Empty strings by default, zero pre-filled dummy mock strings
  const [inputs, setInputs] = useState<{
    creditScore: string;
    annualIncome: string;
    debtToIncomeRatio: string;
    collateralRatio: string;
    secretSalt: string;
  }>({
    creditScore: '',
    annualIncome: '',
    debtToIncomeRatio: '',
    collateralRatio: '',
    secretSalt: '',
  });

  const [predicateMode, setPredicateMode] = useState<PredicateMode>('full_passport');
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof inputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  // Quick helper fills with tactile feedback
  const fillExample = (tier: 'prime' | 'near-prime') => {
    if (tier === 'prime') {
      setInputs({
        creditScore: '790',
        annualIncome: '120000',
        debtToIncomeRatio: '28',
        collateralRatio: '210',
        secretSalt: 'shield_prime_witness_' + Math.random().toString(36).substring(2, 7),
      });
    } else {
      setInputs({
        creditScore: '730',
        annualIncome: '75000',
        debtToIncomeRatio: '35',
        collateralRatio: '160',
        secretSalt: 'shield_std_witness_' + Math.random().toString(36).substring(2, 7),
      });
    }
    setFormError(null);
  };

  const clearForm = () => {
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
                Step 1 • Client-Side Witness Input
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Client Memory Only
              </span>
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Private Financial Credential Vault
            </h2>
            <p className="font-sans text-xs text-slate-300 mt-0.5 leading-relaxed">
              Your credentials stay locked in client memory. Only the cryptographic proof leaves your device.
            </p>
          </div>

          {/* Quick Helper Chips with Tactile Micro-Interactions */}
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fillExample('prime')}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Fill Prime (Tier A)</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fillExample('near-prime')}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-white/[0.04] text-slate-300 border border-white/10 hover:bg-white/[0.08] transition-all"
            >
              <span>Fill Standard (Tier B)</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearForm}
              className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </motion.button>
          </div>
        </div>

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

          {/* Privacy Invariant Guarantee Banner */}
          <div className="p-3.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-3">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white block">Client-Side Zero-Knowledge Guarantee:</span>
              Your income and credit score values are evaluated strictly inside the local Compact witness environment. The verifier only receives a cryptographic polynomial confirmation (<code className="text-cyan-300 font-mono">disclose(true)</code>).
            </div>
          </div>

          {/* Primary Action Button with Framer Motion tactile physics */}
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
