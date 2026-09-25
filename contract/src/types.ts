/**
 * ShieldScore Protocol Types & Cryptographic Interfaces
 */

export interface PrivateCreditWitness {
  creditScore: number;
  annualIncome: number;
  debtToIncomeBps: number;
  collateralRatioBps: number;
  blindingSalt: string;
}

export interface OnChainUnderwritingPolicy {
  minCreditScore: number;
  minIncome: number;
  maxDtiBps: number;
  minCollateralRatioBps: number;
}

export interface CreditPassportDisclosure {
  isEligible: boolean;
  riskTier: 1 | 2 | 3;
  verificationTimestamp: number;
  policyId: number;
}

export interface CustomPolicyDisclosure {
  policyId: number;
  isApproved: boolean;
  timestamp: number;
}

export interface VerificationProofPayload {
  circuit: 'verifyCreditPassport' | 'verifyCustomPolicy' | 'updatePolicy';
  proofBytes: string;
  disclosures: CreditPassportDisclosure | CustomPolicyDisclosure;
  txHash?: string;
  blockHeight?: number;
}
