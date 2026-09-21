import React from 'react';
import { X, Shield, ExternalLink, Zap, Lock, Compass } from 'lucide-react';
import type { WalletProviderType } from '../lib/walletConnector';
import { PREVIEW_CONFIG } from '../lib/networkConfig';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProvider: (type: WalletProviderType) => void;
  isConnecting: boolean;
  error: string | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onSelectProvider,
  isConnecting,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl p-[1px] bg-gradient-to-b from-white/15 via-white/[0.04] to-transparent shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-[calc(1rem-1px)] bg-[#0D131F] p-6 text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Connect Wallet</h3>
                <p className="text-[11px] font-mono text-slate-400">Target: Midnight Preview</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Zero Docker Guarantee Callout */}
          <div className="my-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-white">Zero Docker Required for Clients</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                ZK proof generation executes directly on your client hardware via browser WebAssembly and wallet cryptography.
              </p>
            </div>
          </div>

          {/* Provider Options */}
          <div className="space-y-2.5">
            {/* 1AM Wallet */}
            <button
              onClick={() => onSelectProvider('1am')}
              disabled={isConnecting}
              className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.06] flex items-center justify-between transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                  1AM
                </div>
                <div className="text-left">
                  <span className="font-medium text-sm text-white group-hover:text-cyan-300 transition-colors block">
                    1AM Wallet
                  </span>
                  <span className="text-[11px] text-slate-400">Privacy by default • In-browser proving</span>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Connect →
              </span>
            </button>

            {/* Lace Wallet */}
            <button
              onClick={() => onSelectProvider('lace')}
              disabled={isConnecting}
              className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.06] flex items-center justify-between transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs">
                  LACE
                </div>
                <div className="text-left">
                  <span className="font-medium text-sm text-white group-hover:text-cyan-300 transition-colors block">
                    Lace Wallet
                  </span>
                  <span className="text-[11px] text-slate-400">Official IOG Midnight connector</span>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Connect →
              </span>
            </button>

            {/* Injected Generic */}
            <button
              onClick={() => onSelectProvider('injected')}
              disabled={isConnecting}
              className="w-full p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 flex items-center justify-between transition-all text-slate-400 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 ml-2 text-slate-400" />
                <span className="text-xs">Any Injected Midnight Provider (CIP-0030)</span>
              </div>
            </button>

            {/* Read-Only Demo Explorer Mode */}
            <button
              onClick={() => onSelectProvider('demo')}
              disabled={isConnecting}
              className="w-full p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 flex items-center justify-between transition-all text-cyan-300"
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 ml-2 text-cyan-400" />
                <div className="text-left">
                  <span className="text-xs font-medium block text-white">Preview Explorer Mode</span>
                  <span className="text-[10px] text-slate-400">Direct on-chain contract auditor (no extension required)</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">Launch →</span>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* Footer Faucet Link */}
          <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Need Preview test tokens?</span>
            <a
              href={PREVIEW_CONFIG.faucetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              Preview Faucet <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
