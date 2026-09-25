/**
 * ShieldScore Protocol Constants
 * Standardized constants for underwriting policies, tier thresholds, and network addresses.
 */

export const PROTOCOL_METADATA = {
  name: 'ShieldScore',
  tagline: 'Prove financial eligibility. Keep your financial profile private.',
  version: '1.0.0',
  license: 'Apache-2.0',
} as const;

export const CONTRACT_ADDRESSES = {
  preprod: 'fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b',
  preview: '0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123',
} as const;

export const NETWORK_ENDPOINTS = {
  preprod: {
    nodeRpc: 'https://rpc.preprod.midnight.network',
    indexerUri: 'https://indexer.preprod.midnight.network/api/v1',
    explorerUri: 'https://preprod.midnightexplorer.com',
  },
  preview: {
    nodeRpc: 'https://rpc.preview.midnight.network',
    indexerUri: 'https://indexer.preview.midnight.network/api/v1',
    explorerUri: 'https://midnightexplorer.com',
  },
} as const;

export const DEFAULT_UNDERWRITING_POLICY = {
  minCreditScore: 700,
  minAnnualIncome: 50_000,
  maxDebtToIncomeBps: 4000, // 40.00%
  minCollateralRatioBps: 12000, // 120.00%
} as const;

export const RISK_TIERS = {
  TIER_A: {
    id: 1,
    name: 'Prime (Tier A)',
    minScore: 780,
    maxDtiBps: 3000, // 30.00%
    minCollateralBps: 11000, // 110.00%
    aprBps: 420, // 4.20% fixed APR
  },
  TIER_B: {
    id: 2,
    name: 'Standard (Tier B)',
    minScore: 720,
    maxDtiBps: 3800, // 38.00%
    minCollateralBps: 13000, // 130.00%
    aprBps: 690, // 6.90% fixed APR
  },
  TIER_C: {
    id: 3,
    name: 'Near-Prime (Tier C)',
    minScore: 680,
    maxDtiBps: 4200, // 42.00%
    minCollateralBps: 15000, // 150.00%
    aprBps: 980, // 9.80% fixed APR
  },
} as const;
