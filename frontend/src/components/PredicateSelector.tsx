import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { Shield, EyeOff, Eye, Check, SlidersHorizontal, Lock, Cpu } from 'lucide-react';

export type PredicateMode = 'full_passport' | 'income_only' | 'solvency_only' | 'collateral_only';

interface PredicateSelectorProps {
  selectedMode: PredicateMode;
  onSelectMode: (mode: PredicateMode) => void;
}

export const PredicateSelector: React.FC<PredicateSelectorProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  const modes: {
    id: PredicateMode;
    title: string;
    subtitle: string;
    privateWitness: string[];
    publicDisclosed: string[];
    tag: string;
  }[] = [
    {
      id: 'full_passport',
      title: 'Full Credit Passport',
      subtitle: 'Comprehensive multi-metric eligibility for prime DeFi borrowing',
      tag: 'Recommended for DeFi',
      privateWitness: [
        'Exact Credit Score (e.g. 780)',
        'Exact Annual Income (e.g. $120k)',
        'Exact Debt-to-Income (e.g. 28%)',
        'Exact Collateral Buffer (e.g. 210%)',
      ],
      publicDisclosed: [
        'Risk Tier (Tier A / B / C)',
        'Boolean Eligibility (Pass/Fail)',
        'Blinded Pedersen Commitment',
      ],
    },
    {
      id: 'income_only',
      title: 'Income Gate Only',
      subtitle: 'Prove financial capacity without revealing your credit score or debts',
      tag: 'Accredited Gate',
      privateWitness: [
        'Exact Annual Income',
        'Source of Funds Witness',
        'Blinding Salt',
      ],
      publicDisclosed: [
        'Annual Income >= $50,000 (true/false)',
        'Blinded Pedersen Commitment',
      ],
    },
    {
      id: 'solvency_only',
      title: 'Solvency & Leverage Gate',
      subtitle: 'Prove low debt obligations without revealing total wealth or assets',
      tag: 'Debt Refinance',
      privateWitness: [
        'Monthly Debt Obligations',
        'Gross Monthly Income',
        'Blinding Salt',
      ],
      publicDisclosed: [
        'Debt-to-Income <= 40% (true/false)',
        'Blinded Pedersen Commitment',
      ],
    },
    {
      id: 'collateral_only',
      title: 'Collateral Buffer Proof',
      subtitle: 'Prove liquidation buffer adequacy without revealing total balance sheet',
      tag: 'Liquidity Pools',
      privateWitness: [
        'Portfolio Liquidation Value',
        'Borrowed Position Value',
        'Blinding Salt',
      ],
      publicDisclosed: [
        'Collateral Buffer >= 150% (true/false)',
        'Blinded Pedersen Commitment',
      ],
    },
  ];

  const activeModeData = modes.find((m) => m.id === selectedMode) || modes[0];

  return (
    <GlassCard className="w-full relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              Selective Disclosure Policy
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Compact Predicate Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            Zero-Knowledge Selective Disclosure Mode
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose what specific financial predicates the verifier is authorized to evaluate from your witness.
          </p>
        </div>
      </div>

      {/* Preset Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {modes.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <motion.button
              key={mode.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectMode(mode.id)}
              className={`relative p-3.5 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_16px_rgba(0,240,255,0.15)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activePredicateBorder"
                  className="absolute inset-0 rounded-xl border-2 border-cyan-400 pointer-events-none"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
                  {mode.tag}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <h4 className="text-xs font-bold text-white mb-1">{mode.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {mode.subtitle}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Visual Contrast: Private Witness vs Public Disclosure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/5">
        {/* Left: What Stays Private */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span>Locked in Private Witness (Zero Leakage)</span>
          </div>

          <ul className="space-y-1.5 text-xs font-mono text-slate-300">
            {activeModeData.privateWitness.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: What Gets Disclosed */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span>Disclosed to Public Midnight Ledger</span>
          </div>

          <ul className="space-y-1.5 text-xs font-mono text-cyan-200">
            {activeModeData.publicDisclosed.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
};
