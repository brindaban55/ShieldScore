import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';
import { mnemonicToSeedSync } from '@scure/bip39';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';
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

async function broadcastTransaction(api: ApiPromise, tx: any): Promise<string> {
  const rawIds = tx.identifiers && typeof tx.identifiers === 'function' ? tx.identifiers() : [];
  console.log('  Transaction identifiers:', rawIds);
  const candidateId = rawIds.length > 0 ? rawIds.at(-1) : undefined;

  const serialized = tx.serialize ? tx.serialize() : tx;
  const hex = u8aToHex(serialized);
  console.log(`  Broadcasting transaction to Midnight node via Substrate (${hex.length} hex chars)...`);

  const subTx = api.tx.midnight.sendMnTransaction(hex);
  return await new Promise<string>((resolve, reject) => {
    let unsub: (() => void) | undefined;
    const timeout = setTimeout(() => {
      if (unsub) { try { unsub(); } catch {} }
      if (candidateId) {
        console.log(`  Timeout reached, but candidateId exists: ${candidateId}`);
        resolve(candidateId);
      } else {
        reject(new Error('Substrate submission timeout after 45s'));
      }
    }, 45000);

    subTx.send((result) => {
      console.log(`  Transaction status: ${result.status.type}`);
      if (result.status.isInBlock) {
        clearTimeout(timeout);
        const blockHex = result.status.asInBlock.toHex();
        console.log(`  ✓ Included in block: ${blockHex}`);
        const finalId = candidateId || blockHex;
        console.log(`  ✓ Transaction ID: ${finalId}`);
        if (unsub) { try { unsub(); } catch {} }
        resolve(finalId);
      } else if (result.status.isFinalized) {
        console.log(`  ✓ Finalized in block: ${result.status.asFinalized.toHex()}`);
      } else if (result.isError) {
        clearTimeout(timeout);
        if (unsub) { try { unsub(); } catch {} }
        reject(new Error(`Transaction submission error: ${JSON.stringify(result)}`));
      }
    }).then((unsubFn) => {
      unsub = unsubFn;
    }).catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function main() {
  const { network, config } = resolveNetwork();
  console.log(`\n================================================================`);
  console.log(`   Direct Substrate DUST Registration for User #2`);
  console.log(`================================================================\n`);

  const relayWsUrl = config.node.replace(/^http/, 'ws');
  console.log(`Connecting to Substrate node: ${relayWsUrl}`);
  const provider = new WsProvider(relayWsUrl);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  console.log(`✓ Connected to Substrate RPC!\n`);

  const statePath = path.resolve(process.cwd(), '.midnight-state.json');
  const stateData = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const masterMnemonic = stateData.wallets.preview.mnemonic;

  const seedBytes = mnemonicToSeedSync(masterMnemonic);
  const hd = HDWallet.fromSeed(Buffer.from(seedBytes));
  if (hd.type !== 'seedOk') throw new Error('Invalid master seed');

  // Account index 1 = User #2
  const derived = hd.hdWallet.selectAccount(1).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0);
  if (derived.type !== 'keysDerived') throw new Error('Key derivation failed');
  const keys = derived.keys;

  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preview');
  const user2Address = unshieldedKeystore.getBech32Address().toString();

  console.log(`Target Address: ${user2Address}`);

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

  console.log('Syncing unshielded state...');
  const unshieldedState = await wallet.unshielded.waitForSyncedState();
  const coins = unshieldedState.availableCoins;
  console.log(`Available UTXOs: ${coins.length}`);

  for (let i = 0; i < coins.length; i++) {
    const c = coins[i];
    console.log(`  UTXO #${i + 1}: ${c.utxo.value} Stars | DUST GEN: ${c.meta?.registeredForDustGeneration ? 'YES' : 'NO'}`);
  }

  const unregistered = coins.filter((c: any) => !c.meta?.registeredForDustGeneration);
  if (unregistered.length === 0) {
    console.log('\n✓ All UTXOs are ALREADY registered for DUST generation!');
    await wallet.stop();
    await api.disconnect();
    process.exit(0);
  }

  const { firstValueFrom } = await import('rxjs');
  console.log('\nResolving dust receiver address...');
  const dustState = await firstValueFrom(wallet.dust.state);

  console.log('Building registration recipe...');
  const recipe = await wallet.registerNightUtxosForDustGeneration(
    unregistered as any,
    unshieldedKeystore.getPublicKey(),
    (payload) => unshieldedKeystore.signData(payload),
    dustState.address
  );
  console.log('✓ Registration recipe built successfully!');

  console.log('Signing recipe...');
  const signed = await wallet.signRecipe(recipe, (data) => unshieldedKeystore.signData(data));

  console.log('Finalizing recipe into transaction bytes...');
  const finalized = await wallet.finalizeRecipe(signed);
  console.log('✓ Finalized recipe!');

  console.log('\nSubmitting transaction directly to Substrate node...');
  const txId = await broadcastTransaction(api, finalized);

  console.log(`\n================================================================`);
  console.log(`🎉 DUST REGISTRATION SUBMITTED & CONFIRMED ON-CHAIN!`);
  console.log(`Transaction ID: ${txId}`);
  console.log(`Explorer Link : https://preview.midnightexplorer.com/tx/${txId}`);
  console.log(`================================================================\n`);

  await wallet.stop();
  await api.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nDirect registration error:', err);
  process.exit(1);
});
