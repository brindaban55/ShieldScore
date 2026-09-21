import React from 'react';
import { Lock, Cpu, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export type ProvingPhase = 'idle' | 'witness' | 'circuit' | 'settlement' | 'verified' | 'failed';

interface ZKPipelineProps {
  phase: ProvingPhase;
  elapsedMs?: number;
}

export const ZKPipeline: React.FC<ZKPipelineProps> = ({ phase, elapsedMs = 0 }) => {
  const isWitnessActive = phase === 'witness' || phase === 'circuit' || phase === 'settlement' || phase === 'verified';
  const isCircuitActive = phase === 'circuit' || phase === 'settlement' || phase === 'verified';
  const isSettlementActive = phase === 'settlement' || phase === 'verified';
  const isComplete = phase === 'verified';

  return (
    <div className="w-full my-6 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Zero-Knowledge Proving Pipeline
        </span>
        {phase !== 'idle' && (
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {elapsedMs > 0 ? `${elapsedMs}ms` : 'Processing...'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
        {/* Step 1: Local Witness */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 ${
            phase === 'witness'
              ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_16px_rgba(0,240,255,0.25)]'
              : isWitnessActive
              ? 'bg-white/[0.04] border-emerald-500/40 text-emerald-300'
              : 'bg-white/[0.01] border-white/5 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">Step 1</span>
            {phase === 'witness' ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : isWitnessActive ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </div>
          <h4 className="text-sm font-semibold text-white">Private Witness Vault</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Raw income, credit score & collateral held in ephemeral client memory.
          </p>
        </div>

        {/* Step 2: Compact Circuit Prover */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 ${
            phase === 'circuit'
              ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_16px_rgba(0,240,255,0.25)]'
              : isCircuitActive
              ? 'bg-white/[0.04] border-emerald-500/40 text-emerald-300'
              : 'bg-white/[0.01] border-white/5 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">Step 2</span>
            {phase === 'circuit' ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : isCircuitActive ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Cpu className="w-4 h-4" />
            )}
          </div>
          <h4 className="text-sm font-semibold text-white">Compact ZK Circuit</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Evaluates threshold assertions & computes blinded cryptographic salt commitment.
          </p>
        </div>

        {/* Step 3: Public Ledger Settlement */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 ${
            phase === 'settlement'
              ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_16px_rgba(0,240,255,0.25)]'
              : isComplete
              ? 'bg-emerald-500/10 border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)] text-emerald-300'
              : 'bg-white/[0.01] border-white/5 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">Step 3</span>
            {phase === 'settlement' ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <h4 className="text-sm font-semibold text-white">Public Settlement</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Discloses only binary verification boolean and assigned risk tier to ledger.
          </p>
        </div>
      </div>
    </div>
  );
};
