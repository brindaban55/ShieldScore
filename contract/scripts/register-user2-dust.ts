import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';
import { mnemonicToSeedSync } from '@scure/bip39';
import { HDWallet, Roles, createKeystore, PublicKey, UnshieldedWallet, ShieldedWallet, DustWallet, WalletFacade, NoOpTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { resolveNetwork } from './network.js';

async function main() {
  const { network, config } = resolveNetwork();
  console.log(`\n================================================================`);
  console.log(`   Terminal DUST Registration for Derived Account (USER #2)`);
  console.log(`================================================================\n`);

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

  const cacheDir = path.resolve(process.cwd(), '.wallet-cache-user2');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const walletConfig = {
    networkId: 'preview' as any,
    indexerClientConnection: {
      indexerHttpUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
      bufferSize: 50000,
      resumeThreshold: 5000,
    },
    batchUpdates: {
      size: 5000,
      timeout: 100,
      spacing: 0,
    },
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, 'ws')),
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  };

  console.log('Initializing wallet facade for User #2...');
  const wallet = await WalletFacade.init({
    configuration: walletConfig as any,
    shielded: async (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (cfg) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (cfg) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);

  console.log('Synchronizing unshielded state...');
  const unshieldedState = await wallet.unshielded.waitForSyncedState();
  console.log('✓ Synced!');

  const coins = unshieldedState.availableCoins;
  console.log(`Available UTXOs: ${coins.length}`);
  for (let i = 0; i < coins.length; i++) {
    const c = coins[i];
    console.log(`  UTXO #${i + 1}: ${Number(c.utxo.value) / 1_000_000} tNIGHT | DUST GEN: ${c.meta?.registeredForDustGeneration ? 'YES' : 'NO'}`);
  }

  const unregistered = coins.filter((c: any) => !c.meta?.registeredForDustGeneration);
  if (unregistered.length === 0) {
    console.log('All UTXOs already registered for DUST!');
    await wallet.stop();
    process.exit(0);
  }

  console.log(`\nRegistering ${unregistered.length} UTXO(s) for DUST generation directly...`);

  const { firstValueFrom } = await import('rxjs');
  console.log('  [Step A] Resolving dust address...');
  const dustState = await firstValueFrom(wallet.dust.state);
  console.log('  ✓ Dust receiver address:', dustState.address.data.toString());

  console.log('  [Step B] Building registration recipe...');
  const recipe = await wallet.registerNightUtxosForDustGeneration(
    unregistered as any,
    unshieldedKeystore.getPublicKey(),
    (payload) => unshieldedKeystore.signData(payload),
    dustState.address
  );
  console.log('  ✓ Recipe created!');
  const signed = await wallet.signRecipe(recipe, (data) => unshieldedKeystore.signData(data));

  console.log('Finalizing transaction...');
  const finalized = await wallet.finalizeRecipe(signed);

  console.log('Submitting registration transaction to Preview blockchain...');
  const txId = await wallet.submitTransaction(finalized);

  console.log(`\n================================================================`);
  console.log(`🎉 DUST GENERATION ACTIVATED ON-CHAIN VIA TERMINAL FOR USER #2!`);
  console.log(`Transaction ID: ${txId}`);
  console.log(`Explorer Link : https://preview.midnightexplorer.com/tx/${txId}`);
  console.log(`================================================================\n`);

  await wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('Registration note:', err);
  process.exit(1);
});
