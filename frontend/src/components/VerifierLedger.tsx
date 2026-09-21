import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { CheckCircle2, ShieldAlert, ExternalLink, Copy, Check, Terminal, FileCode2 } from 'lucide-react';
import { PREVIEW_CONFIG } from '../lib/networkConfig';

export interface VerificationOutcome {
  isVerified: boolean;
  riskTier: 1 | 2 | 3;
  commitment: string;
  timestamp: string;
  txId: string;
  blockHeight: number;
}

interface VerifierLedgerProps {
  outcome: VerificationOutcome | null;
  verificationCount: number;
}

export const VerifierLedger: React.FC<VerifierLedgerProps> = ({
  outcome,
  verificationCount,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return { name: 'Tier A — Prime Solvency', color: 'text-cyan-300', bg: 'bg-cyan-500/10 border-cyan-500/30' };
      case 2:
        return { name: 'Tier B — Standard Qualifying', color: 'text-sky-300', bg: 'bg-sky-500/10 border-sky-500/30' };
      default:
        return { name: 'Tier C — Baseline Acceptable', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  // Mock public on-chain ledger state (demonstrates mathematical privacy invariant)
  const publicLedgerJson = outcome
    ? {
        contractAddress: PREVIEW_CONFIG.deployedContractAddress,
        network: 'Midnight Preview (Dual-State Ledger)',
        verificationCount: verificationCount + 1,
        lastVerificationResult: outcome.isVerified,
        lastVerifiedRiskTier: outcome.riskTier,
        lastVerifiedTimestamp: outcome.timestamp,
        applicantCommitment: outcome.commitment,
        privacyInvariantCheck: {
          containsUserCreditScore: false,
          containsUserIncome: false,
          containsUserDtiRatio: false,
          containsUserCollateral: false,
          containsPersonallyIdentifiableInformation: false,
        },
      }
    : {
        contractAddress: PREVIEW_CONFIG.deployedContractAddress,
        network: 'Midnight Preview (Dual-State Ledger)',
        status: 'Awaiting Client-Side Zero-Knowledge Proof Evaluation',
        activePolicy: {
          minCreditScore: 700,
          minAnnualIncomeUSD: 50000,
          maxDtiRatioBps: 4000,
          minCollateralRatioBps: 15000,
        },
      };

  return (
    <div className="w-full space-y-6 mt-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
            Step 2 • Verifier & Public Ledger Audit
          </span>
          <h2 className="text-xl font-bold text-white">Public Credit Verification State</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            What on-chain lenders, DeFi protocols, and external observers can mathematically verify.
          </p>
        </div>

        <a
          href={`${PREVIEW_CONFIG.explorerUrl}/contract/${PREVIEW_CONFIG.deployedContractAddress}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all w-fit"
        >
          <span>Audit in Preview Explorer</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Verified Passport Card */}
        <div className="lg:col-span-5">
          <GlassCard className="relative overflow-hidden" glow={!!outcome?.isVerified}>
            {outcome?.isVerified ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-mono font-bold text-sm">STATUS: VERIFIED</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    ZK-SNARK VALID
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">ASSIGNED RISK TIER</span>
                    <span className={`text-base font-bold font-mono ${getTierLabel(outcome.riskTier).color}`}>
                      {getTierLabel(outcome.riskTier).name}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">BLINDED COMMITMENT</span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <code className="text-xs font-mono text-slate-200 truncate">
                        {outcome.commitment}
                      </code>
                      <button
                        onClick={() => handleCopy(outcome.commitment)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">SETTLEMENT BLOCK</span>
                      <span className="text-slate-300 tabular-nums">#{outcome.blockHeight}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">TX IDENTIFIER</span>
                      <span className="text-cyan-400 truncate block">{outcome.txId.slice(0, 10)}...</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Borrower satisfies lender underwriting policy without revealing income or debt.</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400">
                  <FileCode2 className="w-7 h-7 text-cyan-400/80" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">No Proof Evaluated Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Input your financial parameters in Step 1 above and click "Generate Private ZK Proof" to verify.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-[11px] font-mono text-cyan-400">
                  Ready for Preview Circuit Execution
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Live On-Chain JSON State Audit Terminal */}
        <div className="lg:col-span-7">
          <GlassCard className="h-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>On-Chain Public State Terminal</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Network: Midnight Preview
              </span>
            </div>

            <div className="relative rounded-xl bg-canvas-void p-4 border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto max-h-[320px] scrollbar-thin">
              <pre>{JSON.stringify(publicLedgerJson, null, 2)}</pre>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Zero PII Leakage Verified
              </span>
              <span>Total Proofs Processed: {verificationCount + (outcome ? 1 : 0)}</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
