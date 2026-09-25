import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';
import { mnemonicToSeedSync } from '@scure/bip39';
import { HDWallet, Roles, createKeystore, PublicKey, UnshieldedWallet, DustWallet, WalletFacade, NoOpTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { resolveNetwork } from './network.js';

async function main() {
  const { network, config } = resolveNetwork();
  const statePath = path.resolve(process.cwd(), '.midnight-state.json');
  const stateData = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const masterMnemonic = stateData.wallets.preview.mnemonic;

  const seedBytes = mnemonicToSeedSync(masterMnemonic);
  const hd = HDWallet.fromSeed(Buffer.from(seedBytes));
  if (hd.type !== 'seedOk') throw new Error('Invalid master seed');

  const derived = hd.hdWallet.selectAccount(1).selectRoles([Roles.NightExternal, Roles.Dust]).deriveKeysAt(0);
  if (derived.type !== 'keysDerived') throw new Error('Key derivation failed');
  const keys = derived.keys;

  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preview');
  const address = unshieldedKeystore.getBech32Address().toString();

  console.log('Querying User #2:', address);

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

  const unshielded = await UnshieldedWallet(walletConfig as any).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
  const dust = await DustWallet(walletConfig as any).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);

  console.log('Syncing unshielded...');
  const state = await unshielded.waitForSyncedState();
  console.log(`Total UTXOs: ${state.availableCoins.length}`);
  for (let i = 0; i < state.availableCoins.length; i++) {
    const c = state.availableCoins[i];
    console.log(`  UTXO #${i + 1}: ${Number(c.utxo.value) / 1_000_000} tNIGHT | DUST GEN: ${c.meta?.registeredForDustGeneration ? 'YES' : 'NO'}`);
  }

  console.log('Syncing dust...');
  const dustState = await dust.waitForSyncedState();
  const dBalance = dustState.balance ? dustState.balance(new Date()) : 0n;
  console.log(`User #2 tDUST Balance: ${dBalance.toString()}`);

  await unshielded.stop();
  await dust.stop();
  process.exit(0);
}

main().catch(console.error);
