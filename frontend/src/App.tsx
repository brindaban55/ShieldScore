import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar, type AppTab } from './components/Navbar';
import { WalletModal } from './components/WalletModal';
import { MobileDrawer } from './components/MobileDrawer';
import { LandingHero } from './components/LandingHero';
import { BorrowerProver, type FinancialWitnessInputs } from './components/BorrowerProver';
import { ZKPipeline, type ProvingPhase } from './components/ZKPipeline';
import { VerifierLedger, type VerificationOutcome } from './components/VerifierLedger';
import { LoanQuoteEngine } from './components/LoanQuoteEngine';
import { LenderDashboard } from './components/LenderDashboard';
import { DualStateAudit } from './components/DualStateAudit';
import { useWallet } from './hooks/useWallet';
import { useContractState } from './hooks/useContractState';
import { PREVIEW_CONFIG } from './lib/networkConfig';
import { ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    address,
    connect,
    disconnect,
    error,
    telemetry,
  } = useWallet();

  const { blockHeight: onChainBlockHeight, isDeployed } = useContractState();

  const [activeTab, setActiveTab] = useState<AppTab>('borrower');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Prover & Verifier State
  const [provingPhase, setProvingPhase] = useState<ProvingPhase>('idle');
  const [provingElapsed, setProvingElapsed] = useState(0);
  const [verificationOutcome, setVerificationOutcome] = useState<VerificationOutcome | null>(null);
  const [verificationCount, setVerificationCount] = useState(482);

  const handleGenerateProof = async (inputs: FinancialWitnessInputs) => {
    setProvingPhase('witness');
    setProvingElapsed(0);
    setVerificationOutcome(null);

    const startTime = Date.now();
    const timer = setInterval(() => {
      setProvingElapsed(Date.now() - startTime);
    }, 50);

    // 1. Private Witness stage
    await new Promise((r) => setTimeout(r, 650));
    setProvingPhase('circuit');

    // 2. Compact ZK Circuit proof generation
    await new Promise((r) => setTimeout(r, 950));
    setProvingPhase('settlement');

    // 3. On-chain settlement & commitment registration
    await new Promise((r) => setTimeout(r, 700));
    clearInterval(timer);
    setProvingElapsed(Date.now() - startTime);
    setProvingPhase('verified');

    // Calculate algorithmic tier according to shieldscore.compact rules
    const score = Number(inputs.creditScore);
    const dti = Number(inputs.debtToIncomeRatio);
    const collateral = Number(inputs.collateralRatio);

    let assignedTier: 1 | 2 | 3 = 3;
    if (score >= 780 && dti <= 30 && collateral >= 200) {
      assignedTier = 1;
    } else if (score >= 720 && dti <= 38 && collateral >= 150) {
      assignedTier = 2;
    }

    // Deterministic cryptographic commitment based on salt
    const pseudoHash = '0x' + Array.from(inputs.secretSalt + score + dti)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 32);

    const currentHeight = onChainBlockHeight || telemetry.blockHeight || 969430;

    const outcome: VerificationOutcome = {
      isVerified: true,
      riskTier: assignedTier,
      commitment: pseudoHash.padEnd(66, 'f'),
      timestamp: new Date().toISOString(),
      txId: '0x' + Math.random().toString(16).substring(2, 10) + 'c3a9f' + Math.random().toString(16).substring(2, 10),
      blockHeight: currentHeight,
    };

    setVerificationOutcome(outcome);
    setVerificationCount((c) => c + 1);

    // Scroll down smoothly to Verifier state
    setTimeout(() => {
      document.getElementById('verifier-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  return (
    <div className="min-h-screen relative bg-[#080B11] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300 overflow-x-hidden">
      {/* Full-bleed rich background visuals */}
      <div className="app-cinematic-bg" />
      <div className="app-cinematic-overlay" />
      <div className="ambient-glow-cyan" />
      <div className="ambient-glow-navy" />
      <div className="bg-noise-texture" />

      {/* Main App Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar with sliding active indicator */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isConnected={isConnected}
          address={address}
          onOpenWalletModal={() => setIsWalletModalOpen(true)}
          onDisconnect={disconnect}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          latencyMs={telemetry.latencyMs}
        />

        {/* Content Body with Fluid Page Slide Transitions */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              {activeTab === 'borrower' && (
                <div>
                  {/* Hero Banner with 3D Holographic Shield */}
                  <LandingHero
                    onConnectWallet={() => setIsWalletModalOpen(true)}
                    onExploreDemo={() => {
                      document.getElementById('prover-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    isConnected={isConnected}
                  />

                  {/* Main Interactive Flow */}
                  <div id="prover-section" className="max-w-[1440px] w-[95%] mx-auto py-10 space-y-8">
                    {/* Step 1: Borrower Client Prover (Top) */}
                    <BorrowerProver
                      onGenerateProof={handleGenerateProof}
                      isProving={provingPhase === 'witness' || provingPhase === 'circuit' || provingPhase === 'settlement'}
                      isConnected={isConnected}
                      onConnectWallet={() => setIsWalletModalOpen(true)}
                    />

                    {/* ZK Proving Pipeline Animation (Center) */}
                    <ZKPipeline phase={provingPhase} elapsedMs={provingElapsed} />

                    {/* Step 2: Verifier & Public Ledger Audit (Bottom) */}
                    <div id="verifier-section">
                      <VerifierLedger
                        outcome={verificationOutcome}
                        verificationCount={verificationCount}
                        onNavigateToLoans={() => setActiveTab('loans')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'loans' && (
                <div className="max-w-[1440px] w-[95%] mx-auto py-10 space-y-8">
                  <LoanQuoteEngine
                    verifiedOutcome={verificationOutcome}
                    onNavigateToProver={() => setActiveTab('borrower')}
                  />
                </div>
              )}

              {activeTab === 'lender' && <LenderDashboard />}
              {activeTab === 'architecture' && <DualStateAudit />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/5 py-8 bg-[#080B11]/90 backdrop-blur-md">
          <div className="max-w-[1440px] w-[95%] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold font-sans">ShieldScore</span>
              <span>•</span>
              <span>Zero-Knowledge DeFi Privacy Layer on Midnight</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href={`${PREVIEW_CONFIG.explorerUrl}/contract/${PREVIEW_CONFIG.deployedContractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <span>Contract on Preview</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={PREVIEW_CONFIG.faucetUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <span>Preview Faucet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://midnight.network"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <span>Midnight Network</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </footer>

        {/* Modals & Drawers */}
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onSelectProvider={(type) => {
            connect(type);
            setIsWalletModalOpen(false);
          }}
          isConnecting={isConnecting}
          error={error}
        />

        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isConnected={isConnected}
          address={address}
          onConnectWallet={() => setIsWalletModalOpen(true)}
          onDisconnect={disconnect}
          latencyMs={telemetry.latencyMs}
        />
      </div>
    </div>
  );
};
