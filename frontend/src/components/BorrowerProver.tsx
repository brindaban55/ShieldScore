import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Lock, Sparkles, Shield, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

export interface FinancialWitnessInputs {
  creditScore: string;
  annualIncome: string;
  debtToIncomeRatio: string;
  collateralRatio: string;
  secretSalt: string;
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
  const [inputs, setInputs] = useState<FinancialWitnessInputs>({
    creditScore: '',
    annualIncome: '',
    debtToIncomeRatio: '',
    collateralRatio: '',
    secretSalt: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FinancialWitnessInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  // Optional quick-fill chips for testing convenience
  const fillExample = (tier: 'prime' | 'near-prime') => {
    if (tier === 'prime') {
      setInputs({
        creditScore: '790',
        annualIncome: '120000',
        debtToIncomeRatio: '28',
        collateralRatio: '210',
        secretSalt: 'shield_prime_key_2026',
      });
    } else {
      setInputs({
        creditScore: '730',
        annualIncome: '75000',
        debtToIncomeRatio: '35',
        collateralRatio: '160',
        secretSalt: 'shield_standard_key_2026',
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
      setFormError('Credit score must be between 300 and 850.');
      return;
    }

    onGenerateProof({
      ...inputs,
      secretSalt: inputs.secretSalt || 'shield_auto_salt_' + Math.random().toString(36).substring(2, 10),
    });
  };

  return (
    <GlassCard className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block mb-1">
            Step 1 • Client-Side Prover
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Private Financial Credential Vault
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your credentials stay locked in client memory. Only the cryptographic proof leaves your device.
          </p>
        </div>

        {/* Quick Helper Chips for convenience */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fillExample('prime')}
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fill Prime (Tier A)</span>
          </button>
          <button
            type="button"
            onClick={() => fillExample('near-prime')}
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 border border-white/10 hover:bg-white/[0.08] transition-colors"
          >
            <span>Fill Standard (Tier B)</span>
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="text-[11px] font-mono px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>
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

        {/* Form Error Notice */}
        {formError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Privacy Invariant Guarantee Banner */}
        <div className="p-3.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-3">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white block">Client-Side Zero-Knowledge Guarantee:</span>
            Your income and credit score values are evaluated strictly inside the local Compact witness environment. The verifier only receives a cryptographic polynomial confirmation (<code className="text-cyan-300 font-mono">disclose(true)</code>).
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          {!isConnected ? (
            <button
              type="button"
              onClick={onConnectWallet}
              className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all shadow-[0_0_24px_rgba(0,240,255,0.35)] flex items-center justify-center gap-2 text-sm"
            >
              <span>Connect Wallet to Prove Financial Eligibility</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isProving}
              className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all shadow-[0_0_24px_rgba(0,240,255,0.35)] flex items-center justify-center gap-2 text-sm disabled:opacity-50 active:scale-[0.99]"
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
            </button>
          )}
        </div>
      </form>
    </GlassCard>
  );
};
