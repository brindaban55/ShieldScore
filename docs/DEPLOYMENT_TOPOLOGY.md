# ShieldScore: Multi-Network Deployment & Node Topology

> **Networks**: Midnight Preprod & Midnight Preview  
> **Consensus**: Substrate-based Midnight Ledger with DUST Gas Abstraction  
> **API Standards**: JSON-RPC over HTTPS, GraphQL over HTTP/WebSocket, CIP-0030 DApp Connector

---

## 🌐 Network Endpoints Matrix

| Configuration Parameter | Midnight Preprod (`preprod`) | Midnight Preview (`preview`) |
| :--- | :--- | :--- |
| **Network Identifier** | `preprod` | `preview` |
| **Contract Address** | `fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b` | `0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123` |
| **RPC Node URL** | `https://rpc.preprod.midnight.network` | `https://rpc.preview.midnight.network` |
| **GraphQL Indexer HTTP** | `https://indexer.preprod.midnight.network/api/v4/graphql` | `https://indexer.preview.midnight.network/api/v4/graphql` |
| **GraphQL Indexer WS** | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` | `wss://indexer.preview.midnight.network/api/v4/graphql/ws` |
| **Block Explorer** | [https://preprod.midnightexplorer.com](https://preprod.midnightexplorer.com) | [https://midnightexplorer.com](https://midnightexplorer.com) |
| **Address Bech32 HRP** | `mn_addr_preprod` | `mn_addr_preview` |
| **Shielded Address HRP**| `mn_shielded_preprod` | `mn_shielded_preview` |
| **Official Faucet** | `https://faucet.preprod.midnight.network/` | `https://faucet.preview.midnight.network/` |

---

## ⛽ DUST Token Gas Mechanics & Account Registration

Unlike Ethereum where transactions consume public $ETH for gas, Midnight employs a dual-token economic model:
1. **$NIGHT**: The unshielded governance and staking asset of the Midnight network.
2. **$DUST**: The shielded, auto-regenerating computational gas token required to submit zero-knowledge state transitions.

### DUST Activation Sequence:
```
1. Receive testnet tNIGHT via public faucet
2. Execute Substrate extrinsic: system.registerDustGeneration(account)
3. Wait for block inclusion (~10-15 seconds)
4. DUST balance accrues automatically up to capacity limit based on held NIGHT
5. Spend DUST to submit Groth16 circuit proofs to the contract
```

In ShieldScore, account registration and DUST tracking are automated via `contract/scripts/wallet.ts` and tracked in `networkConfig.ts`.
