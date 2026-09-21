import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import {
  Coins,
  TrendingDown,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles,
  Percent,
  DollarSign,
  Lock,
} from 'lucide-react';
import type { VerificationOutcome } from './VerifierLedger';

interface LoanQuoteEngineProps {
  verifiedOutcome: VerificationOutcome | null;
  onNavigateToProver?: () => void;
}

export const LoanQuoteEngine: React.FC<LoanQuoteEngineProps> = ({
  verifiedOutcome,
  onNavigateToProver,
}) => {
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [manualTier, setManualTier] = useState<1 | 2 | 3>(1);
  const [isQuoting, setIsQuoting] = useState<boolean>(false);
  const [quoteSuccess, setQuoteSuccess] = useState<boolean>(false);

  // Active risk tier: if user has a verified outcome from Step 1, use that; otherwise allow interactive exploration
  const activeTier = verifiedOutcome ? verifiedOutcome.riskTier : manualTier;

  // Rate structures based on algorithmic risk tier
  const tierConfig = {
    1: {
      name: 'Tier A — Prime Solvency',
      badge: 'Prime',
      apr: 4.2,
      collateralRatio: 110, // 110% required collateral vs 180% standard
      maxLoan: 200000,
      color: 'text-cyan-400',
      border: 'border-cyan-500/40',
      bgGlow: 'bg-cyan-500/10',
    },
    2: {
      name: 'Tier B — Standard Qualifying',
      badge: 'Standard',
      apr: 6.9,
      collateralRatio: 130, // 130% required collateral
      maxLoan: 100000,
      color: 'text-sky-400',
      border: 'border-sky-500/40',
      bgGlow: 'bg-sky-500/10',
    },
    3: {
      name: 'Tier C — Baseline Acceptable',
      badge: 'Baseline',
      apr: 9.8,
      collateralRatio: 150, // 150% required collateral
      maxLoan: 50000,
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bgGlow: 'bg-emerald-500/10',
    },
  };

  const config = tierConfig[activeTier];
  const standardOvercollateralRatio = 180; // Standard unverified anonymous DeFi
  const standardApr = 15.4;

  const requiredCollateral = Math.round((loanAmount * config.collateralRatio) / 100);
  const standardCollateral = Math.round((loanAmount * standardOvercollateralRatio) / 100);
  const collateralSavings = standardCollateral - requiredCollateral;

  const annualInterest = Math.round((loanAmount * config.apr) / 100);
  const standardInterest = Math.round((loanAmount * standardApr) / 100);
  const annualInterestSavings = standardInterest - annualInterest;

  const handleRequestQuote = () => {
    setIsQuoting(true);
    setTimeout(() => {
      setIsQuoting(false);
      setQuoteSuccess(true);
    }, 900);
  };

  return (
    <GlassCard className="w-full relative overflow-hidden" glow>
      {/* Decorative subtle ambient highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              Confidential DeFi Application
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Low-Collateral Credit Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-cyan-400" />
            Undercollateralized Loan Quotation Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Turn your zero-knowledge ShieldScore proof into instant, high-efficiency borrowing terms on Midnight.
          </p>
        </div>

        {/* Tier Selector Chips if no proof generated yet */}
        {!verifiedOutcome ? (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 px-2 hidden md:inline">
              Simulate:
            </span>
            {([1, 2, 3] as const).map((t) => (
              <motion.button
                key={t}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setManualTier(t)}
                className={`relative px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  manualTier === t
                    ? 'text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {manualTier === t && (
                  <motion.div
                    layoutId="activeTierPill"
                    className="absolute inset-0 bg-cyan-500/20 border border-cyan-400/30 rounded-lg shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Tier {t === 1 ? 'A' : t === 2 ? 'B' : 'C'}</span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Active Proof: {config.badge}</span>
          </div>
        )}
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Loan Amount Slider */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                <span>Requested Borrow Amount</span>
              </label>
              <div className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                ${loanAmount.toLocaleString()}
                <span className="text-xs text-slate-400 font-normal ml-1">USDC / NIGHT</span>
              </div>
            </div>

            <input
              type="range"
              min="5000"
              max={config.maxLoan}
              step="5000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Min: $5,000</span>
              <span>Max for {config.badge}: ${config.maxLoan.toLocaleString()}</span>
            </div>
          </div>

          {/* Verification Status Banner */}
          <div className={`p-4 rounded-xl border ${config.border} ${config.bgGlow} transition-all`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{config.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
                    ZK-Enabled
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Evaluated with Compact ZK-SNARK circuit. Proof demonstrates compliance without revealing your income, debt, or credit score.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">BORROW APR</span>
                <span className="text-base font-bold font-mono text-cyan-300">
                  {config.apr}% <span className="text-[10px] font-normal text-slate-400">fixed</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">REQUIRED COLLATERAL</span>
                <span className="text-base font-bold font-mono text-white">
                  {config.collateralRatio}% <span className="text-[10px] font-normal text-emerald-400">(-{standardOvercollateralRatio - config.collateralRatio}%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRequestQuote}
              disabled={isQuoting}
              className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isQuoting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Locking Liquidity Terms on Preview...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-slate-950" />
                  <span>Lock Instant Undercollateralized Rate</span>
                </>
              )}
            </motion.button>

            {quoteSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Quote locked for 24 hours at <strong>{config.apr}% APR</strong> with <strong>{config.collateralRatio}%</strong> collateral requirement.
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Comparative Economic Analysis */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              The ShieldScore Advantage vs Standard DeFi
            </h3>

            {/* Metric 1: Collateral Comparison */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Required Collateral Deposit</span>
                <span className="font-mono text-cyan-300 font-bold">${requiredCollateral.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-white/5">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(config.collateralRatio / standardOvercollateralRatio) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-400">
                  ShieldScore: {config.collateralRatio}% (${requiredCollateral.toLocaleString()})
                </span>
                <span className="text-slate-500">
                  Anonymous: {standardOvercollateralRatio}% (${standardCollateral.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Metric 2: APR Comparison */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Annual Interest Rate</span>
                <span className="font-mono text-emerald-300 font-bold">{config.apr}% APR</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-white/5">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(config.apr / standardApr) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-400">ShieldScore Rate: {config.apr}%</span>
                <span className="text-slate-500">Traditional Anonymous DeFi: {standardApr}%</span>
              </div>
            </div>

            {/* Financial Savings Highlight Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-emerald-950/30 border border-cyan-500/20 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">CAPITAL FREED UP</span>
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                  +${collateralSavings.toLocaleString()}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Less collateral locked</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 block">ANNUAL INTEREST SAVED</span>
                <span className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                  ${annualInterestSavings.toLocaleString()}/yr
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Compared to 15.4% APR</p>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              The lending contract settles solely on the Midnight blockchain using the verified Pedersen commitment. The liquidity pool never sees your salary, credit score, or bank statement.
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
