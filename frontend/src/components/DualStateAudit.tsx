import React from 'react';
import { GlassCard } from './GlassCard';
import { EyeOff, ShieldCheck, Database, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import { PREVIEW_CONFIG } from '../lib/networkConfig';

export const DualStateAudit: React.FC = () => {
  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest block mb-2">
          ARCHITECTURE AUDIT
        </span>
        <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
          Midnight Dual-State Privacy Model
        </h1>
        <p className="font-sans text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Understanding how AegisSolv executes off-chain witness logic with zero-knowledge mathematical verification while maintaining complete public ledger transparency.
        </p>
      </div>

      {/* Generated 3D Architectural Visualization Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.8)]">
        <img
          src="/hero_banner.jpg"
          alt="AegisSolv Dual-State Architecture"
          className="w-full h-auto max-h-[460px] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#080B11]/80 backdrop-blur-md border border-cyan-500/30">
          <div>
            <h3 className="font-display text-sm font-bold text-white tracking-tight">
              End-to-End Zero-Knowledge Verification Flow
            </h3>
            <p className="font-sans text-xs text-slate-300">
              Encrypted Local Memory (Left) ➔ Client Proof Generation (Center) ➔ Midnight Consensus Settlement (Right)
            </p>
          </div>
          <a
            href="https://docs.midnight.network"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0"
          >
            <span>Midnight Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3 Columns Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* State Pool 1 */}
        <GlassCard>
          <div className="flex items-center gap-2 text-cyan-400 mb-3">
            <EyeOff className="w-5 h-5" />
            <h3 className="font-display text-sm font-bold tracking-tight uppercase text-white">
              1. Private Witness State
            </h3>
          </div>
          <p className="font-sans text-xs text-slate-300 leading-relaxed">
            Resides strictly inside the user's browser memory via TypeScript witness callbacks. Never broadcast, serialized, or transmitted over the internet.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-canvas-void border border-white/5 font-mono text-[11px] text-cyan-300/80">
            <code>
              witness getCreditScore(): Uint&lt;64&gt;;<br />
              witness getAnnualIncome(): Uint&lt;64&gt;;
            </code>
          </div>
        </GlassCard>

        {/* State Pool 2 */}
        <GlassCard>
          <div className="flex items-center gap-2 text-indigo-400 mb-3">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-display text-sm font-bold tracking-tight uppercase text-white">
              2. Compact Circuit (ZK)
            </h3>
          </div>
          <p className="font-sans text-xs text-slate-300 leading-relaxed">
            Encodes mathematical arithmetic constraints. If assertions hold, generates a succinct zero-knowledge proof (&pi;) verifying compliance.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-canvas-void border border-white/5 font-mono text-[11px] text-indigo-300/80">
            <code>
              assert(score &gt;= minCreditScore);<br />
              assert(income &gt;= minAnnualIncome);
            </code>
          </div>
        </GlassCard>

        {/* State Pool 3 */}
        <GlassCard>
          <div className="flex items-center gap-2 text-emerald-400 mb-3">
            <Database className="w-5 h-5" />
            <h3 className="font-display text-sm font-bold tracking-tight uppercase text-white">
              3. Public Ledger State
            </h3>
          </div>
          <p className="font-sans text-xs text-slate-300 leading-relaxed">
            Verified on-chain by Midnight consensus nodes. Contains strictly the declassified boolean verification state and cryptographic commitments.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-canvas-void border border-white/5 font-mono text-[11px] text-emerald-300/80">
            <code>
              export ledger lastVerificationResult;<br />
              export ledger lastVerifiedRiskTier;
            </code>
          </div>
        </GlassCard>
      </div>

      {/* Security Properties Checklist */}
      <GlassCard>
        <h3 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2 tracking-tight">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>Cryptographic Security Invariants Enforced</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Zero Knowledge: Syndicate learns nothing beyond mathematical truth of solvency covenants.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Soundness: Counterparty failing solvency covenants cannot produce a valid Groth16 proof.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Completeness: Counterparty satisfying covenants is guaranteed a valid proof generation.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Identity Non-Replayability: Pedersen salt hash binds commitment to unique applicant.</span>
          </div>
        </div>
      </GlassCard>

      {/* Protocol Economics & Business Value Architecture */}
      <GlassCard glow className="p-6">
        <div className="flex items-center gap-2 text-cyan-400 mb-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest">
            SUSTAINABLE UNIT ECONOMICS & PROTOCOL REVENUE
          </span>
        </div>
        <h3 className="font-display text-xl font-bold text-white tracking-tight">
          How AegisSolv Drives Real-World Value & Sustainable Revenue
        </h3>
        <p className="font-sans text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          DeFi currently has over $30 Billion trapped in idle overcollateralization because protocols cannot evaluate risk anonymously. AegisSolv solves this capital inefficiency while generating protocol revenue.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {/* Pillar 1: Borrower Value */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-cyan-500/20 space-y-2.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              For Counterparties & Borrowers
            </span>
            <h4 className="font-display text-sm font-bold text-white">70% Lower Collateral Locked</h4>
            <ul className="text-xs font-sans text-slate-300 space-y-1.5 leading-relaxed">
              <li>• <strong>Capital Efficiency:</strong> Deposit only 105%-110% collateral vs 180% in standard DeFi.</li>
              <li>• <strong>Interest Reduction:</strong> Pay 4.2%-6.2% Prime APR vs 15.4% anonymous DeFi penalty.</li>
              <li>• <strong>Zero Privacy Breach:</strong> Tax records and financial statements never touch public explorers.</li>
            </ul>
          </div>

          {/* Pillar 2: Institutional Lender Value */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-indigo-500/20 space-y-2.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              For Syndicates & Liquidity Pools
            </span>
            <h4 className="font-display text-sm font-bold text-white">High Yield Prime Underwriting</h4>
            <ul className="text-xs font-sans text-slate-300 space-y-1.5 leading-relaxed">
              <li>• <strong>Higher Yield:</strong> Earn 6.5% - 8.5% APY on prime undercollateralized facilities (vs 2.5% on Aave).</li>
              <li>• <strong>Zero Data Breach Liability:</strong> Lenders never store user PII, eliminating GDPR/FCRA liability.</li>
              <li>• <strong>Cryptographic Enforcement:</strong> Covenants and risk tiers verified autonomously by Midnight Compact circuits.</li>
            </ul>
          </div>

          {/* Pillar 3: Protocol Revenue Engine */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-emerald-500/20 space-y-2.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Protocol Cash Flow
            </span>
            <h4 className="font-display text-sm font-bold text-white">3-Stream Monetization</h4>
            <ul className="text-xs font-sans text-slate-300 space-y-1.5 leading-relaxed">
              <li>• <strong>0.35% Facility Origination Fee:</strong> Collected on every capital facility drawdown originated.</li>
              <li>• <strong>$1.50 Attestation Query Fee:</strong> Paid by institutional lending pools per verified passport.</li>
              <li>• <strong>10% Performance Spread:</strong> Accrues to the AegisSolv DAO treasury from pool yield.</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

