import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Sliders, FileCode2, ExternalLink, Radio, Wallet, Coins, Cpu } from 'lucide-react';
import { PREVIEW_CONFIG } from '../lib/networkConfig';
import type { AppTab } from './Navbar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
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

  const handleNav = (tab: AppTab) => {
    setActiveTab(tab);
    onClose();
  };

  const navItems: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'borrower', label: 'Borrower Passport', icon: Shield },
    { id: 'loans', label: 'DeFi Loan Engine', icon: Coins },
    { id: 'lender', label: 'Lender Console', icon: Sliders },
    { id: 'architecture', label: 'Dual-State Audit', icon: Cpu },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-4/5 max-w-sm bg-[#0A0E17] border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <img src="/shieldscore_logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-bold text-base text-white">SHIELDSCORE</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.04]"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Navigation Items */}
            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNav(item.id)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-semibold'
                        : 'text-slate-400 hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
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
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-medium"
                >
                  Disconnect Wallet
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onConnectWallet();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,240,255,0.3)]"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </motion.button>
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
