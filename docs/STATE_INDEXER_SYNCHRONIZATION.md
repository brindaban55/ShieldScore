# ShieldScore — On-Chain Contract State Indexing & Reactive Synchronization

> **Substrate RPC Target**: Midnight Preview & Preprod Consensus Nodes  
> **Client Hook**: `useContractState.ts`  
> **Synchronization Strategy**: Polling + Optimistic State Updates with Fallback Recovery

---

## 1. The Indexing Challenge on Confidential Blockchains

Because the Midnight Network partitions state between private shielded records and public unshielded ledger state, querying contract variables requires querying the public contract storage trie:
- Contract address: `0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123` (Preview)
- Storage keys: `minCreditScore`, `minIncome`, `maxDtiBps`, `minCollateralBps`, `totalVerifications`

---

## 2. Reactive Polling Architecture in `useContractState.ts`

```typescript
export function useContractState(contractAddress: string, network: 'preview' | 'preprod') {
  const [state, setState] = useState<PolicyState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const rpcEndpoint = getNetworkConfig(network).indexerUri;

    async function fetchState() {
      try {
        const response = await fetch(`${rpcEndpoint}/api/v1/contract/${contractAddress}/state`);
        const data = await response.json();
        if (isMounted) {
          setState(data);
          setLoading(false);
        }
      } catch (err) {
        // Fallback to verified local baseline if indexer is catching up
        if (isMounted) {
          setState(FALLBACK_BASELINE_POLICY);
          setLoading(false);
        }
      }
    }

    fetchState();
    const intervalId = setInterval(fetchState, 15000); // 15-second block cadence
    return () => { isMounted = false; clearInterval(intervalId); };
  }, [contractAddress, network]);

  return { state, loading, error };
}
```

---

## 3. Optimistic Verification Reconciliation

When a user executes `verifyCreditPassport(...)`, the client updates the UI optimistically within 100ms showing verification status, before confirming the block on the Substrate explorer within 10–15 seconds.
