import * as fs from 'node:fs';
import * as path from 'node:path';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

export type NetworkId = 'preview' | 'preprod' | 'undeployed';

export const NETWORK_IDS: readonly NetworkId[] = ['preview', 'preprod', 'undeployed'] as const;

export interface NetworkConfig {
  networkId: NetworkId;
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
  faucet: string;
  explorer: string;
  composeServices: string[];
}

export interface DeploymentRecord {
  address: string;
  deployedAt: string;
  deployer: string;
}

export interface WalletRecord {
  seed: string;
  mnemonic?: string;
  createdAt: string;
}

export interface NetworkState {
  version: 1;
  activeNetwork: NetworkId;
  wallets: Partial<Record<NetworkId, WalletRecord>>;
  deployments: Partial<Record<NetworkId, DeploymentRecord>>;
}

export const STATE_FILE_NAME = '.midnight-state.json';
export const STATE_VERSION = 1 as const;

export const NETWORK_CONFIGS: Record<NetworkId, NetworkConfig> = {
  preview: {
    networkId: 'preview',
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preview.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
    faucet: 'https://faucet.preview.midnight.network/',
    explorer: 'https://midnightexplorer.com',
    composeServices: ['proof-server'],
  },
  preprod: {
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
    faucet: 'https://faucet.preprod.midnight.network/',
    explorer: 'https://midnightexplorer.com',
    composeServices: ['proof-server'],
  },
  undeployed: {
    networkId: 'undeployed',
    indexer: 'http://127.0.0.1:8088/api/v4/graphql',
    indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
    node: 'ws://127.0.0.1:9944',
    proofServer: 'http://127.0.0.1:6300',
    faucet: 'http://127.0.0.1:8088',
    explorer: 'http://127.0.0.1:8088',
    composeServices: ['node', 'indexer', 'proof-server'],
  },
};

export function isNetworkId(v: unknown): v is NetworkId {
  return typeof v === 'string' && (NETWORK_IDS as readonly string[]).includes(v as NetworkId);
}

export interface FsOptions {
  cwd?: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');

function statePath(opts: FsOptions = {}): string {
  return opts.cwd ? path.join(opts.cwd, STATE_FILE_NAME) : path.join(ROOT_DIR, STATE_FILE_NAME);
}

export function loadState(opts: FsOptions = {}): NetworkState | null {
  const p = statePath(opts);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== STATE_VERSION) {
      return null;
    }
    return parsed as NetworkState;
  } catch {
    return null;
  }
}

export function saveState(state: NetworkState, opts: FsOptions = {}): void {
  const p = statePath(opts);
  fs.writeFileSync(p, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

export function recordDeployment(
  networkId: NetworkId,
  address: string,
  deployer: string,
  opts: FsOptions = {}
): void {
  const current = loadState(opts) ?? {
    version: STATE_VERSION,
    activeNetwork: networkId,
    wallets: {},
    deployments: {},
  };
  current.deployments[networkId] = {
    address,
    deployedAt: new Date().toISOString(),
    deployer,
  };
  saveState(current, opts);
}

export function resolveNetwork(opts: FsOptions = {}): {
  network: NetworkId;
  config: NetworkConfig;
} {
  const envTarget = process.env.MIDNIGHT_NETWORK;
  if (envTarget && isNetworkId(envTarget)) {
    return { network: envTarget, config: NETWORK_CONFIGS[envTarget] };
  }
  const state = loadState(opts);
  if (state?.activeNetwork && isNetworkId(state.activeNetwork)) {
    return { network: state.activeNetwork, config: NETWORK_CONFIGS[state.activeNetwork] };
  }
  // Default network is PREVIEW
  return { network: 'preview', config: NETWORK_CONFIGS.preview };
}

export function generateBip39Seed(): { seed: string; mnemonic: string } {
  const mnemonic = generateMnemonic(wordlist, 256);
  const seedBytes = mnemonicToSeedSync(mnemonic);
  return { seed: Buffer.from(seedBytes).toString('hex'), mnemonic };
}

export function getOrCreateWallet(networkId: NetworkId, opts: FsOptions = {}): WalletRecord {
  const state = loadState(opts) ?? {
    version: STATE_VERSION,
    activeNetwork: networkId,
    wallets: {},
    deployments: {},
  };

  const existing = state.wallets[networkId];
  if (existing?.seed) {
    return existing;
  }

  const generated = generateBip39Seed();
  const created: WalletRecord = {
    seed: generated.seed,
    mnemonic: generated.mnemonic,
    createdAt: new Date().toISOString(),
  };

  state.wallets[networkId] = created;
  saveState(state, opts);
  return created;
}
