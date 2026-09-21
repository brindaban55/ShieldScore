import React from 'react';
import { HolographicShield } from './HolographicShield';
import { GlassCard } from './GlassCard';
import { ShieldCheck, EyeOff, Scale, ChevronRight, Lock } from 'lucide-react';

interface LandingHeroProps {
  onConnectWallet: () => void;
  onExploreDemo: () => void;
  isConnected: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onConnectWallet,
  onExploreDemo,
  isConnected,
}) => {
  return (
    <section className="relative pt-6 pb-12 overflow-hidden">
      {/* 3D Holographic Core Hero Section */}
      <div className="max-w-[1440px] w-[95%] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Typography Column */}
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-6 shadow-[0_0_16px_rgba(0,240,255,0.2)]">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Confidential DeFi Credit Passport</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Prove your financial eligibility.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 block mt-1">
              Keep your profile private.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            ShieldScore inverts traditional lending: instead of exposing tax records, credit scores, and debt histories, prove mathematical compliance via Midnight zero-knowledge circuits.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            {!isConnected ? (
              <button
                onClick={onConnectWallet}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-[0_0_24px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Connect Wallet</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onExploreDemo}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 transition-all shadow-[0_0_24px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
              >
                <span>Launch Proof Console</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-slate-300 bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 hover:text-white transition-all backdrop-blur-md"
            >
              Explore Interactive Demo
            </button>
          </div>

          {/* Value Props Micro Bar */}
          <div className="mt-10 pt-6 border-t border-white/5 grid grid-cols-3 gap-4 text-center lg:text-left">
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">100%</span>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Off-Chain Witness Privacy</p>
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-cyan-400 tabular-nums">&lt;500ms</span>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Client-Side ZK Proof</p>
            </div>
            <div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">0 PII</span>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Disclosed On-Chain</p>
            </div>
          </div>
        </div>

        {/* Right 3D Interactive Holographic Sphere */}
        <div className="flex-1 w-full max-w-[500px] lg:max-w-none">
          <HolographicShield />
        </div>
      </div>

      {/* 3 Pillar Architectural Cards */}
      <div className="max-w-[1440px] w-[95%] mx-auto mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Private Financial Witness</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Exact income, credit scores, debt obligations, and banking details are computed exclusively in client memory. Raw data never touches any server.
          </p>
        </GlassCard>

        <GlassCard>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Compact Zero-Knowledge Circuit</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Evaluates financial conditions against lender policies using cryptographic polynomial assertions. Verified without leaking intermediate values.
          </p>
        </GlassCard>

        <GlassCard>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">On-Chain Settlement</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Discloses only the binary verification result, assigned risk category, and immutable timestamp to Midnight Preview's public ledger.
          </p>
        </GlassCard>
      </div>
    </section>
  );
};
