import React from 'react';
import { X, Shield, Sliders, FileCode2, ExternalLink, Radio, Wallet } from 'lucide-react';
import { PREVIEW_CONFIG } from '../lib/networkConfig';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'borrower' | 'lender' | 'architecture';
  setActiveTab: (tab: 'borrower' | 'lender' | 'architecture') => void;
  isConnected: boolean;
  address: string | null;
  onConnectWallet: () => void;
  onDisconnect: () => void;
  latencyMs: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  isConnected,
  address,
  onConnectWallet,
  onDisconnect,
  latencyMs,
}) => {
  if (!isOpen) return null;

  const handleNav = (tab: 'borrower' | 'lender' | 'architecture') => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed right-0 top-0 bottom-0 w-4/5 max-w-sm bg-[#0D131F] border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <img src="/shieldscore_logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-bold text-base text-white">SHIELDSCORE</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-6 space-y-2">
            <button
              onClick={() => handleNav('borrower')}
              className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                activeTab === 'borrower'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-white/[0.03]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Borrower Passport</span>
            </button>

            <button
              onClick={() => handleNav('lender')}
              className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                activeTab === 'lender'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-white/[0.03]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span className="text-sm font-medium">Lender Console</span>
            </button>

            <button
              onClick={() => handleNav('architecture')}
              className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                activeTab === 'architecture'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-white/[0.03]'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span className="text-sm font-medium">Dual-State Audit</span>
            </button>
          </nav>

          {/* Network Status in Drawer */}
          <div className="mt-8 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Network:</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Midnight Preview
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">RPC Latency:</span>
              <span className="text-cyan-400">{latencyMs}ms</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          {isConnected ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-mono truncate text-cyan-300">
                {address}
              </div>
              <button
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-medium"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onConnectWallet();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}

          <a
            href={PREVIEW_CONFIG.faucetUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs font-mono text-cyan-400 py-1"
          >
            <span>Get Preview Faucet Tokens</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
