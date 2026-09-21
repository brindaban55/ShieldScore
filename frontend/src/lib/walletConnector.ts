export type WalletProviderType = '1am' | 'lace' | 'injected' | 'demo';

export interface WalletAccountState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  dustBalance: string | null;
  provider: WalletProviderType | null;
  error: string | null;
}

export interface DiscoveredWallet {
  id: string;
  name: string;
  icon?: string;
  apiVersion?: string;
}

/**
 * Discover all Midnight wallets injected into window.midnight
 */
export function discoverMidnightWallets(): DiscoveredWallet[] {
  if (typeof window === 'undefined') return [];
  const midnight = (window as any).midnight;
  if (!midnight || typeof midnight !== 'object') return [];

  const found: DiscoveredWallet[] = [];
  for (const key of Object.keys(midnight)) {
    const item = midnight[key];
    if (item && typeof item === 'object') {
      found.push({
        id: key,
        name: item.name || key,
        icon: item.icon,
        apiVersion: item.apiVersion,
      });
    }
  }
  return found;
}

/**
 * Resilient multi-method address extraction cascade supporting
 * modern v4 APIs and legacy v3 APIs without throwing "api.state is not a function"
 */
export async function extractAddressFromApi(api: any): Promise<string> {
  if (!api) return '';

  // 1. Modern v4 Unshielded Address
  try {
    if (typeof api.getUnshieldedAddress === 'function') {
      const res = await api.getUnshieldedAddress();
      if (res?.unshieldedAddress) return res.unshieldedAddress;
      if (typeof res === 'string') return res;
    }
  } catch (e) {
    // Continue to next probe
  }

  // 2. Modern v4 Shielded Addresses
  try {
    if (typeof api.getShieldedAddresses === 'function') {
      const res = await api.getShieldedAddresses();
      if (Array.isArray(res) && res.length > 0) return res[0];
      if (res?.shieldedAddress) return res.shieldedAddress;
    }
  } catch (e) {
    // Continue
  }

  // 3. Modern v4 Fee / Dust Address
  try {
    if (typeof api.getDustAddress === 'function') {
      const res = await api.getDustAddress();
      if (res?.dustAddress) return res.dustAddress;
      if (typeof res === 'string') return res;
    }
  } catch (e) {
    // Continue
  }

  // 4. Legacy v3 Fallback (.state())
  try {
    if (typeof api.state === 'function') {
      const res = await api.state();
      if (res?.address) return res.address;
    }
  } catch (e) {
    // Continue
  }

  if (api.address && typeof api.address === 'string') {
    return api.address;
  }

  return '';
}

/**
 * Connect to user's selected wallet extension on Midnight Preview
 */
export async function connectWalletProvider(
  providerType: WalletProviderType,
  networkId: string = 'preview'
): Promise<{ address: string; connectedApi: any }> {
  if (providerType === 'demo') {
    // Instant Read-Only Public Explorer Mode (zero extension / zero docker required)
    return {
      address: 'mn_addr_preview170a8t0cndggvvdx0x4c69s2fddavxggrw33e40jh6406ykg7sessmely7x',
      connectedApi: {
        isReadOnly: true,
        getUnshieldedAddress: async () => ({
          unshieldedAddress: 'mn_addr_preview170a8t0cndggvvdx0x4c69s2fddavxggrw33e40jh6406ykg7sessmely7x',
        }),
      },
    };
  }

  const midnight = (window as any).midnight;
  if (!midnight) {
    throw new Error('No Midnight-compatible wallet extension detected. Please install 1AM Wallet or Lace.');
  }

  let walletConnector: any = null;

  if (providerType === '1am') {
    walletConnector = midnight['1am'] || midnight['mn1am'] || midnight[Object.keys(midnight)[0]];
  } else if (providerType === 'lace') {
    walletConnector = midnight['mnLace'] || midnight['lace'] || midnight[Object.keys(midnight)[0]];
  } else {
    // Injected: pick first available
    const keys = Object.keys(midnight);
    if (keys.length > 0) walletConnector = midnight[keys[0]];
  }

  if (!walletConnector) {
    throw new Error(`Wallet provider "${providerType}" not found in browser extension registry.`);
  }

  // Request connection popup from wallet
  const connectedApi = typeof walletConnector.connect === 'function'
    ? await walletConnector.connect(networkId)
    : (typeof walletConnector.enable === 'function' ? await walletConnector.enable() : walletConnector);

  const address = await extractAddressFromApi(connectedApi);
  if (!address) {
    throw new Error('Wallet connected, but could not resolve account address.');
  }

  return { address, connectedApi };
}
