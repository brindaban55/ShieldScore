import { useState, useEffect, useCallback } from 'react';
import { PREVIEW_CONFIG } from '../lib/networkConfig';

export interface OnChainContractState {
  address: string;
  stateHex: string | null;
  blockHeight: number | null;
  stateByteLength: number;
  isDeployed: boolean;
  network: string;
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useContractState() {
  const [contractData, setContractData] = useState<OnChainContractState>({
    address: PREVIEW_CONFIG.deployedContractAddress,
    stateHex: null,
    blockHeight: null,
    stateByteLength: 0,
    isDeployed: true,
    network: 'Midnight Preview',
    lastUpdated: null,
    isLoading: true,
    error: null,
  });

  const fetchLiveState = useCallback(async () => {
    try {
      const query = JSON.stringify({
        query: `
          query GetLiveContractInfo($contractAddress: String!) {
            block {
              height
            }
            contract(address: $contractAddress) {
              address
              state
            }
          }
        `,
        variables: {
          contractAddress: PREVIEW_CONFIG.deployedContractAddress,
        },
      });

      const response = await fetch(PREVIEW_CONFIG.indexerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: query,
      });

      if (!response.ok) {
        throw new Error(`Indexer responded with HTTP ${response.status}`);
      }

      const json = await response.json();
      const contract = json?.data?.contract;
      const block = json?.data?.block;
      const stateStr = contract?.state || '';

      setContractData({
        address: contract?.address || PREVIEW_CONFIG.deployedContractAddress,
        stateHex: stateStr,
        blockHeight: block?.height || null,
        stateByteLength: stateStr ? Math.floor(stateStr.length / 2) : 0,
        isDeployed: !!contract?.address,
        network: 'Midnight Preview (Dual-State)',
        lastUpdated: new Date().toLocaleTimeString(),
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.warn('Live indexer fetch error (using cached on-chain state):', err);
      setContractData((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to query live indexer.',
      }));
    }
  }, []);

  useEffect(() => {
    fetchLiveState();
    // Poll every 15 seconds to keep synchronized with newly minted blocks
    const interval = setInterval(fetchLiveState, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveState]);

  return {
    ...contractData,
    refetch: fetchLiveState,
  };
}
