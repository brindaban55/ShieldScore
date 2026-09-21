export interface NetworkEndpoints {
  networkId: 'preview';
  networkName: string;
  indexerUrl: string;
  indexerWsUrl: string;
  nodeUrl: string;
  proofServerUrl: string;
  explorerUrl: string;
  faucetUrl: string;
  deployedContractAddress: string;
}

export const PREVIEW_CONFIG: NetworkEndpoints = {
  networkId: 'preview',
  networkName: 'Midnight Preview',
  indexerUrl: import.meta.env.VITE_INDEXER_URL || 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWsUrl: import.meta.env.VITE_INDEXER_WS_URL || 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  nodeUrl: import.meta.env.VITE_NODE_URL || 'https://rpc.preview.midnight.network',
  proofServerUrl: import.meta.env.VITE_PROOF_SERVER || 'http://localhost:6300',
  explorerUrl: import.meta.env.VITE_EXPLORER_URL || 'https://midnightexplorer.com',
  faucetUrl: 'https://faucet.preview.midnight.network/',
  // Once deployed on-chain, this holds the live contract address
  deployedContractAddress: '43973c7336b9409893d58fc8d147ca17caecba63307d90f8c36cf3e0215bbb1',
};
