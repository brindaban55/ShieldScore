import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Radio, Wallet, LogOut, Menu, Coins, Cpu, Users } from 'lucide-react';
import type { WalletProviderType } from '../lib/walletConnector';

export type AppTab = 'borrower' | 'loans' | 'lender' | 'architecture';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isConnected: boolean;
  address: string | null;
  onOpenWalletModal: () => void;
  onDisconnect: () => void;
  onOpenMobileDrawer: () => void;
  latencyMs: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isConnected,
  address,
  onOpenWalletModal,
  onDisconnect,
  onOpenMobileDrawer,
  latencyMs,
}) => {
  const truncatedAddress = address
    ? `${address.slice(0, 10)}...${address.slice(-6)}`
    : null;

  const navTabs: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'borrower', label: 'Borrower Passport', icon: Shield },
    { id: 'loans', label: 'DeFi Loan Engine', icon: Coins },
    { id: 'lender', label: 'Lender Console', icon: Users },
    { id: 'architecture', label: 'Dual-State Audit', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#080B11]/85 backdrop-blur-xl transition-all">
      <div className="max-w-[1440px] w-[95%] mx-auto h-16 flex items-center justify-between">
        {/* Brand Logo & Title with Tactile Micro-Interactions */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('borrower')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.25)] group-hover:border-cyan-400/60 group-hover:shadow-[0_0_24px_rgba(0,240,255,0.4)] transition-all">
              <img src="/shieldscore_logo.jpg" alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  SHIELDSCORE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  ZK-DEFI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide hidden sm:block">
                Confidential Credit Passport
              </p>
            </div>
          </motion.button>

          {/* Clean Network Status Pill */}
          <div className="hidden lg:flex items-center gap-2 ml-4 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300">Midnight Preview</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              {latencyMs}ms
            </span>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs with Framer Motion Sliding Indicator */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/70 border border-white/5 backdrop-blur-md relative">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 z-10 ${
                  isActive ? 'text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Sliding Indicator Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/15 border border-cyan-400/40 shadow-[0_0_14px_rgba(0,240,255,0.25)] -z-10"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Wallet Connection Action with Tactile Click Micro-Interactions */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="tabular-nums">{truncatedAddress}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={onDisconnect}
                title="Disconnect Wallet"
                className="p-2 rounded-xl bg-white/[0.04] border border-white/5 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenWalletModal}
              className="relative px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center gap-2"
            >
              <Wallet className="w-3.5 h-3.5 text-slate-950" />
              <span>Connect Wallet</span>
            </motion.button>
          )}

          {/* Mobile Menu Trigger */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenMobileDrawer}
            className="md:hidden p-2 rounded-xl bg-white/[0.04] border border-white/5 text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
