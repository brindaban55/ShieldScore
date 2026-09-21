import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Sliders, Shield, ArrowRight, RefreshCw, CheckCircle2, Building2, HelpCircle } from 'lucide-react';

interface LenderPolicy {
  policyName: string;
  minScore: number;
  minIncome: number;
  maxDti: number;
  minCollateral: number;
}

export const LenderDashboard: React.FC = () => {
  const [policy, setPolicy] = useState<LenderPolicy>({
    policyName: 'Prime DeFi Liquidity Pool Tier 1',
    minScore: 720,
    minIncome: 65000,
    maxDti: 38,
    minCollateral: 160,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3500);
    }, 1200);
  };

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-2">
          <Building2 className="w-4 h-4" />
          <span>INSTITUTIONAL LENDER CONSOLE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Configurable Credit Policies & Underwriting
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Define customized financial eligibility thresholds. ShieldScore's Compact circuits evaluate applicant compliance confidentially on Midnight without exposing borrower data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Policy Configuration Form */}
        <div className="lg:col-span-7">
          <GlassCard>
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">Underwriting Policy Rules</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.04] text-slate-300 border border-white/5">
                Circuit: updatePolicy()
              </span>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Policy Name / Pool Identifier
                </label>
                <input
                  type="text"
                  value={policy.policyName}
                  onChange={(e) => setPolicy({ ...policy, policyName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-canvas-input border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                    <span>Minimum Credit Score</span>
                    <span className="font-mono text-cyan-300">{policy.minScore}</span>
                  </label>
                  <input
                    type="range"
                    min="580"
                    max="800"
                    step="5"
                    value={policy.minScore}
                    onChange={(e) => setPolicy({ ...policy, minScore: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                    <span>Minimum Annual Income ($)</span>
                    <span className="font-mono text-cyan-300">${policy.minIncome.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min="25000"
                    max="150000"
                    step="5000"
                    value={policy.minIncome}
                    onChange={(e) => setPolicy({ ...policy, minIncome: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                    <span>Maximum Debt-to-Income (%)</span>
                    <span className="font-mono text-cyan-300">{policy.maxDti}%</span>
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="1"
                    value={policy.maxDti}
                    onChange={(e) => setPolicy({ ...policy, maxDti: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between">
                    <span>Minimum Collateral Ratio (%)</span>
                    <span className="font-mono text-cyan-300">{policy.minCollateral}%</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="250"
                    step="5"
                    value={policy.minCollateral}
                    onChange={(e) => setPolicy({ ...policy, minCollateral: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              {updateSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Policy parameters committed to Midnight Preview public ledger!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 transition-all flex items-center justify-center gap-2 text-xs"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting Policy Update...</span>
                  </>
                ) : (
                  <>
                    <span>Commit Policy to Midnight Ledger</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Explainer Column */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>How Lenders Integrate ShieldScore</span>
            </h3>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                1. <strong>Publish Criteria:</strong> Lenders register their credit parameters directly on Midnight via <code className="text-cyan-300 font-mono">updatePolicy</code>.
              </p>
              <p>
                2. <strong>Zero Data Ingestion:</strong> Borrowers invoke the <code className="text-cyan-300 font-mono">verifyCreditPassport</code> circuit locally on their own devices.
              </p>
              <p>
                3. <strong>Instant Verification:</strong> The lender queries the contract state for the borrower's commitment to confirm <code className="text-emerald-400 font-mono">verificationResult == true</code>.
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Institutional Risk Mitigation</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              By never possessing borrower tax returns, bank credentials, or social security numbers, lending platforms eliminate catastrophic data breach liability and regulatory exposure under GDPR/CCPA.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
