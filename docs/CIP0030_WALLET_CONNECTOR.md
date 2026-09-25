# ShieldScore — CIP-0030 Injected Wallet Connector & Session Architecture

> **Specification**: Injected Browser Extension Integration for the Midnight Ecosystem  
> **Supported Wallets**: **1AM Wallet** (Recommended), **Lace Midnight Preview**, and **Explorer Sandbox Mode**  
> **Standard**: Cardano / Midnight Injected DApp Standard (CIP-0030 derivative)

---

## 1. Overview & Provider Discovery

ShieldScore implements a resilient, non-blocking wallet discovery mechanism that probes browser injection points at document mount time.

The connector adheres to the following detection cascade:

```typescript
// Wallet detection sequence
if (window.midnight?.['1am']) {
  // Primary Midnight wallet connector
  provider = window.midnight['1am'];
} else if (window.midnight?.lace) {
  // Midnight preview Lace connector
  provider = window.midnight.lace;
} else if (window.cardano?.lace) {
  // Multi-chain Lace bridge
  provider = window.cardano.lace;
} else {
  // Fallback to Interactive Explorer Sandbox
  provider = createSandboxProvider();
}
```

---

## 2. Injected API Interface

The injected wallet exposes the following interface conforming to the Midnight client runtime:

```typescript
export interface InjectedMidnightWallet {
  name: string;
  icon: string;
  apiVersion: string;
  isEnabled(): Promise<boolean>;
  enable(): Promise<{
    getUsedAddresses(): Promise<string[]>;
    getChangeAddress(): Promise<string>;
    getNetworkId(): Promise<number>; // 0 = Devnet, 1 = Preview, 2 = Preprod
    getBalances(): Promise<Record<string, bigint>>;
    signTx(txPayload: string): Promise<string>;
    submitTx(signedTx: string): Promise<string>;
  }>;
}
```

---

## 3. Session Lifecycle & State Machine

The React frontend manages wallet state via `useWallet.ts` using a deterministic 5-stage state machine:

```
┌──────────────┐     User clicks Connect     ┌─────────────────┐
│ DISCONNECTED ├────────────────────────────►│ CONNECTING_WAIT │
└──────────────┘                             └────────┬────────┘
       ▲                                              │
       │                                              ▼
       │ Disconnect / Revoke                 ┌─────────────────┐
       ├─────────────────────────────────────┤  AUTHORIZING    │
       │                                     └────────┬────────┘
       │                                              │
       │ User rejects prompt                          ▼
       ├─────────────────────────────────────┌─────────────────┐
       │                                     │    CONNECTED    │
       │                                     └────────┬────────┘
       │                                              │
       │ User switches network in wallet              ▼
       └─────────────────────────────────────┌─────────────────┐
                                             │ NETWORK_CHANGED │
                                             └─────────────────┘
```

### Key Lifecycle Guarantees:
1. **Zero Silent Reconnections**: On hard refresh, session tokens are validated against current extension state before reconnecting.
2. **Network Alignment**: If the wallet is switched to `Preprod` while the DApp is in `Preview` mode, the DApp prompts a one-click network resynchronization.
3. **Session Revocation**: Disconnecting immediately clears all cached addresses, balances, and public signing keys from React state.
