/**
 * ShieldScore Frontend Protocol Domain Models
 */

export type NetworkId = 'preprod' | 'preview';

export type BorrowerTier = 'TIER_A' | 'TIER_B' | 'TIER_C' | 'UNVERIFIED';

export interface BorrowerFinancialProfile {
  creditScore: number;
  monthlyIncomeUSD: number;
  annualSalaryUSD: number;
  monthlyDebtObligationsUSD: number;
  pledgedCollateralUSD: number;
  requestedBorrowUSD: number;
  salt: string;
}

export interface LoanQuote {
  tier: BorrowerTier;
  tierName: string;
  isEligible: boolean;
  requiredCollateralUSD: number;
  collateralRatioBps: number;
  fixedAprBps: number;
  annualInterestUSD: number;
  capitalSavedUSD: number;
  monthlyPaymentUSD: number;
}

export interface PolicyRulePreset {
  id: string;
  name: string;
  description: string;
  minScore: number;
  minAnnualIncome: number;
  maxDtiPercent: number;
  minCollateralPercent: number;
}
