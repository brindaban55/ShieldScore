export type SupportedNetwork = 'preview' | 'preprod';

export interface NetworkEndpoints {
  networkId: SupportedNetwork;
  networkName: string;
  badgeLabel: string;
  indexerUrl: string;
  indexerWsUrl: string;
  nodeUrl: string;
  proofServerUrl: string;
  explorerUrl: string;
  faucetUrl: string;
  deployedContractAddress: string;
  addressPrefix: string;
  demoAddress: string;
}

export const NETWORKS_CONFIG: Record<SupportedNetwork, NetworkEndpoints> = {
  preview: {
    networkId: 'preview',
    networkName: 'Midnight Preview',
    badgeLabel: 'Preview',
    indexerUrl: import.meta.env.VITE_INDEXER_URL || 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWsUrl: import.meta.env.VITE_INDEXER_WS_URL || 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    nodeUrl: import.meta.env.VITE_NODE_URL || 'https://rpc.preview.midnight.network',
    proofServerUrl: import.meta.env.VITE_PROOF_SERVER || 'http://localhost:6300',
    explorerUrl: import.meta.env.VITE_EXPLORER_URL || 'https://preview.midnightexplorer.com',
    faucetUrl: 'https://faucet.preview.midnight.network/',
    deployedContractAddress: '0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123',
    addressPrefix: 'mn_addr_preview',
    demoAddress: 'mn_addr_preview170a8t0cndggvvdx0x4c69s2fddavxggrw33e40jh6406ykg7sessmely7x',
  },
  preprod: {
    networkId: 'preprod',
    networkName: 'Midnight Preprod',
    badgeLabel: 'Preprod',
    indexerUrl: import.meta.env.VITE_PREPROD_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWsUrl: import.meta.env.VITE_PREPROD_INDEXER_WS_URL || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    nodeUrl: import.meta.env.VITE_PREPROD_NODE_URL || 'https://rpc.preprod.midnight.network',
    proofServerUrl: import.meta.env.VITE_PROOF_SERVER || 'http://localhost:6300',
    explorerUrl: import.meta.env.VITE_PREPROD_EXPLORER_URL || 'https://preprod.midnightexplorer.com',
    faucetUrl: 'https://faucet.preprod.midnight.network/',
    deployedContractAddress: 'fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b',
    addressPrefix: 'mn_addr_preprod',
    demoAddress: 'mn_addr_preprod170a8t0cndggvvdx0x4c69s2fddavxggrw33e40jh6406ykg7sessmcp5dm',
  },
};

// Default export for backward compatibility
export const PREVIEW_CONFIG = NETWORKS_CONFIG.preview;

export function getNetworkConfig(networkId: SupportedNetwork): NetworkEndpoints {
  return NETWORKS_CONFIG[networkId] || NETWORKS_CONFIG.preview;
}
