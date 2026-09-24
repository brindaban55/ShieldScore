import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';
import { mnemonicToSeedSync } from '@scure/bip39';
import {
  HDWallet,
  Roles,
  createKeystore,
  PublicKey,
  UnshieldedWallet,
  ShieldedWallet,
  DustWallet,
  WalletFacade,
  NoOpTransactionHistoryStorage,
} from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { resolveNetwork } from './network.js';

async function main() {
  const { network, config } = resolveNetwork();
  const statePath = path.resolve(process.cwd(), '.midnight-state.json');
  const stateData = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const masterMnemonic = stateData.wallets.preview.mnemonic;

  const seedBytes = mnemonicToSeedSync(masterMnemonic);
  const hd = HDWallet.fromSeed(Buffer.from(seedBytes));
  const derived = hd.hdWallet.selectAccount(1).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0);
  const keys = derived.keys;

  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preview');

  const walletConfig = {
    networkId: 'preview' as any,
    indexerClientConnection: {
      indexerHttpUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
      bufferSize: 50000,
      resumeThreshold: 5000,
    },
    batchUpdates: { size: 5000, timeout: 100, spacing: 0 },
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, 'ws')),
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  };

  const wallet = await WalletFacade.init({
    configuration: walletConfig as any,
    shielded: async (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (cfg) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (cfg) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  const unshieldedState = await wallet.unshielded.waitForSyncedState();
  const coins = unshieldedState.availableCoins;
  const unregistered = coins.filter((c: any) => !c.meta?.registeredForDustGeneration);

  const { firstValueFrom } = await import('rxjs');
  const dustState = await firstValueFrom(wallet.dust.state);

  const recipe = await wallet.registerNightUtxosForDustGeneration(
    unregistered as any,
    unshieldedKeystore.getPublicKey(),
    (payload) => unshieldedKeystore.signData(payload),
    dustState.address
  );

  console.log('Recipe type:', recipe.type);
  const tx: any = recipe.transaction;
  console.log('Unshielded inputs count:', tx.unshielded?.inputs?.length ?? 0);
  console.log('Unshielded signatures count in raw recipe:', tx.signatures?.length ?? tx.unshielded?.signatures?.length ?? 0);

  const signed = await wallet.signRecipe(recipe, (data) => unshieldedKeystore.signData(data));
  const signedTx: any = (signed as any).transaction;
  console.log('Unshielded signatures count AFTER signRecipe:', signedTx.signatures?.length ?? signedTx.unshielded?.signatures?.length ?? 0);

  const finalized = await wallet.finalizeRecipe(signed);
  console.log('Finalized identifiers:', finalized.identifiers ? finalized.identifiers() : 'none');

  await wallet.stop();
  process.exit(0);
}

main().catch(console.error);
