import { useState, useEffect, useCallback } from 'react';
import { getNetworkConfig, type SupportedNetwork } from '../lib/networkConfig';

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

export function useContractState(network: SupportedNetwork = 'preview') {
  const netConfig = getNetworkConfig(network);

  const [contractData, setContractData] = useState<OnChainContractState>({
    address: netConfig.deployedContractAddress,
    stateHex: null,
    blockHeight: null,
    stateByteLength: 0,
    isDeployed: true,
    network: netConfig.networkName,
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
          contractAddress: netConfig.deployedContractAddress,
        },
      });

      const response = await fetch(netConfig.indexerUrl, {
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
        address: contract?.address || netConfig.deployedContractAddress,
        stateHex: stateStr,
        blockHeight: block?.height || null,
        stateByteLength: stateStr ? Math.floor(stateStr.length / 2) : 0,
        isDeployed: !!contract?.address,
        network: `${netConfig.networkName} (Dual-State)`,
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
  }, [netConfig.deployedContractAddress, netConfig.indexerUrl, netConfig.networkName]);

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
