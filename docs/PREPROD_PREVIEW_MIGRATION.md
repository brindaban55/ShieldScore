# ShieldScore — Multi-Network Topology: Preprod & Preview Dual Settlement

> **Multi-Chain Scope**: Midnight Preprod (Staging Consensus) & Midnight Preview (Public Developer Testnet)  
> **Contract Addresses**:
> - **Preprod**: `fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b`
> - **Preview**: `0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123`

---

## 1. Network Topologies & RPC Endpoints

ShieldScore operates simultaneously on both official Midnight networks to ensure continuous availability:

| Parameter | Midnight Preprod | Midnight Preview |
| :--- | :--- | :--- |
| **Network Identifier** | `preprod` | `preview` |
| **Node RPC Endpoint** | `https://rpc.preprod.midnight.network` | `https://rpc.preview.midnight.network` |
| **Indexer Endpoint** | `https://indexer.preprod.midnight.network/api/v1` | `https://indexer.preview.midnight.network/api/v1` |
| **Substrate Explorer** | [preprod.midnightexplorer.com](https://preprod.midnightexplorer.com) | [midnightexplorer.com](https://midnightexplorer.com) |
| **Contract Address** | `fc67e2850565d285f2c51ece80eb4894a32961f317d91703f4cd98a9ebef088b` | `0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123` |
| **Genesis Settlement Block** | Block `#1,148,220` | Block `#976,200` |
| **DUST Status** | Active ($2.57 \times 10^{16}\text{ Specks}$) | Active ($4.18 \times 10^{14}\text{ Specks}$) |

---

## 2. Dynamic Network Switching in Frontend

The React frontend includes a segmented network pill (`NetworkSwitcher.tsx`):
- Switching networks immediately re-routes RPC indexer queries.
- Revalidates the connected wallet's active network ID (warns if wallet is on `Preview` while app is on `Preprod`).
- Updates contract address references dynamically across all verification triggers.
