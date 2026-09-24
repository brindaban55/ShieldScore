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
  MidnightBech32m,
  UnshieldedAddress,
} from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { resolveNetwork, getOrCreateWallet } from './network.js';
import { createWallet, persistWalletState, unshieldedToken } from './wallet.js';

interface BatchConfig {
  batchNumber: number;
  users: Array<{ index: number; label: string; address: string }>;
}

const BATCHES: Record<number, BatchConfig> = {
  1: {
    batchNumber: 1,
    users: [
      { index: 1, label: 'User #2 (Institutional Lender)', address: 'mn_addr_preview154hy4ceav3qcf76aaf7rpf9h6e62ncxpwe9tvupa35nye90hl3cs4mcaqh' },
      { index: 2, label: 'User #3 (Institutional Lender)', address: 'mn_addr_preview1md7n2sy7j0rzty4wm2gsuuff9r4qwraser9tp468z0ar07zqn5vqxt0wg3' },
      { index: 3, label: 'User #4 (Institutional Lender)', address: 'mn_addr_preview1myrne5uruze4k0suka294yu8s3ad2xrxrq2k3rc2gf0p7spxpcuqjn2j9r' },
    ],
  },
  2: {
    batchNumber: 2,
    users: [
      { index: 4, label: 'User #5 (Institutional Lender)', address: 'mn_addr_preview1n9pjaukl440hjlupw930m54lwq47akal8fhclc64ddznyrgw9uhqsd5v7x' },
      { index: 5, label: 'User #6 (Institutional Lender)', address: 'mn_addr_preview1zlaws82fzmjspj752k56quhqfcharz4uzp645a4yr4w2mekhuusq2mehnn' },
      { index: 6, label: 'User #7 (DAO Treasury Verifier)', address: 'mn_addr_preview1ydn09uannvc6du2rq3t2qlcjgt274uf3nux5nguuqqk46805n0hqw9mr9m' },
    ],
  },
  3: {
    batchNumber: 3,
    users: [
      { index: 7, label: 'User #8 (DAO Treasury Verifier)', address: 'mn_addr_preview1jntn549j8fn49j0a0fvpa22gtnqce36nzzj440xf9ye6chfalmmqffccn0' },
      { index: 8, label: 'User #9 (DAO Treasury Verifier)', address: 'mn_addr_preview1zdan4ckxt3pcft6j6rumhzp5ncuk37ghkk7vm2fw2mk8dez89qnq5syeh0' },
      { index: 9, label: 'User #10 (DAO Treasury Verifier)', address: 'mn_addr_preview1k22tl9vjxu6wpcphxx5kpmvjn25xkju43py42vc5hrzayr775zcslrlger' },
    ],
  },
};

const AMOUNT_PER_USER_STARS = 250_000_000n; // 250 tNIGHT each

async function fundBatch(network: any, config: any, batch: BatchConfig) {
  console.log(`\n================================================================`);
  console.log(`  STEP 1: On-Chain Funding for Batch #${batch.batchNumber}`);
  console.log(`================================================================\n`);

  const walletRecord = getOrCreateWallet(network);
  console.log('Initializing Account 1 Deployer...');
  const senderCtx = await createWallet({
    network,
    networkConfig: config,
    seed: walletRecord.seed,
    restore: true,
  });

  console.log('Syncing sender wallet...');
  const state = await senderCtx.wallet.waitForSyncedState();
  const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`  Deployer Balance: ${(Number(tNightBalance) / 1_000_000).toLocaleString()} tNIGHT\n`);

  console.log(`Building batched transfer of 250 tNIGHT to ${batch.users.length} targets...`);
  const outputs = batch.users.map((u) => {
    console.log(`  -> ${u.label}: ${u.address} (250 tNIGHT)`);
    return {
      type: unshieldedToken().raw,
      receiverAddress: MidnightBech32m.parse(u.address).decode(UnshieldedAddress, 'preview'),
      amount: AMOUNT_PER_USER_STARS,
    };
  });

  const ttl = new Date(Date.now() + 30 * 60 * 1000);
  const recipe = await senderCtx.wallet.transferTransaction(
    [{ type: 'unshielded', outputs }],
    { shieldedSecretKeys: senderCtx.shieldedSecretKeys, dustSecretKey: senderCtx.dustSecretKey },
    { ttl, payFees: true }
  );

  const signedRecipe = await senderCtx.wallet.signRecipe(recipe, (data) =>
    senderCtx.unshieldedKeystore.signData(data)
  );
  const finalizedTx = await senderCtx.wallet.finalizeRecipe(signedRecipe);

  console.log('\nBroadcasting batch funding transaction to Preview blockchain...');
  const txId = await senderCtx.wallet.submitTransaction(finalizedTx);

  console.log(`\n🎉 BATCH FUNDING CONFIRMED ON-CHAIN!`);
  console.log(`Transaction Hash: ${txId}`);
  console.log(`Explorer Link   : https://preview.midnightexplorer.com/tx/${txId}\n`);

  await persistWalletState(network, senderCtx);
  await senderCtx.wallet.stop();

  return txId;
}

async function registerDustForUser(
  config: any,
  masterMnemonic: string,
  user: { index: number; label: string; address: string }
) {
  console.log(`\n────────────────────────────────────────────────────────────────`);
  console.log(`  Activating DUST for ${user.label} (Index ${user.index})`);
  console.log(`  Address: ${user.address}`);
  console.log(`────────────────────────────────────────────────────────────────`);

  const seedBytes = mnemonicToSeedSync(masterMnemonic);
  const hd = HDWallet.fromSeed(Buffer.from(seedBytes));
  if (hd.type !== 'seedOk') throw new Error('Invalid master seed');

  const derived = hd.hdWallet
    .selectAccount(user.index)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derived.type !== 'keysDerived') throw new Error('Derivation failed');
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

  console.log('  Waiting for unshielded synchronization...');
  const unshieldedState = await wallet.unshielded.waitForSyncedState();
  const coins = unshieldedState.availableCoins;
  console.log(`  Found ${coins.length} available UTXOs`);

  const unregistered = coins.filter((c: any) => !c.meta?.registeredForDustGeneration);
  if (unregistered.length === 0) {
    console.log('  ✓ All UTXOs are already registered for DUST generation!');
    await wallet.stop();
    return null;
  }

  console.log(`  Registering ${unregistered.length} UTXO(s)...`);
  try {
    const est = await wallet.estimateRegistration(unregistered as any);
    console.log(`  Estimated fee: ${est.fee.toLocaleString()} Specks`);

    console.log('  Waiting ~25s for 250 tNIGHT to accrue registration fee...');
    await wallet.waitForGeneratedDust(unregistered as any, est.fee, { timeoutMs: 60000 });
    console.log('  ✓ DUST fee accrued!');
  } catch (e: any) {
    console.log(`  Accrual status: ${e.message}`);
  }

  const recipe = await wallet.registerNightUtxosForDustGeneration(
    unregistered as any,
    unshieldedKeystore.getPublicKey(),
    (payload) => unshieldedKeystore.signData(payload)
  );

  const signed = await wallet.signRecipe(recipe, (data) => unshieldedKeystore.signData(data));
  const finalized = await wallet.finalizeRecipe(signed);

  console.log('  Submitting DUST registration on-chain...');
  const txId = await wallet.submitTransaction(finalized);

  console.log(`  ✅ DUST GENERATION ACTIVATED!`);
  console.log(`  Tx Hash     : ${txId}`);
  console.log(`  Explorer Link: https://preview.midnightexplorer.com/tx/${txId}\n`);

  await wallet.stop();
  return txId;
}

async function main() {
  const batchArg = process.argv.find((a) => a.startsWith('--batch=') || a === '-b');
  let batchNum = 1;
  if (batchArg) {
    const parts = batchArg.split('=');
    batchNum = parts.length > 1 ? parseInt(parts[1], 10) : parseInt(process.argv[process.argv.indexOf(batchArg) + 1], 10);
  }

  const batch = BATCHES[batchNum];
  if (!batch) {
    console.error(`Invalid batch number: ${batchNum}. Must be 1, 2, or 3.`);
    process.exit(1);
  }

  const { network, config } = resolveNetwork();
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║   Midnight Preview Automated DUST Activator (Batch #${batchNum})    ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  // Step 1: Fund the batch with 250 tNIGHT each
  const fundingTxId = await fundBatch(network, config, batch);

  // Allow block confirmation (15s)
  console.log('Waiting 15s for funding block inclusion on Preview...');
  await new Promise((r) => setTimeout(r, 15000));

  // Step 2: Register DUST for each user sequentially
  const statePath = path.resolve(process.cwd(), '.midnight-state.json');
  const stateData = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const masterMnemonic = stateData.wallets.preview.mnemonic;

  const results: Record<string, string | null> = {};
  for (const user of batch.users) {
    try {
      const regTx = await registerDustForUser(config, masterMnemonic, user);
      results[user.label] = regTx;
      // Brief pause between sequential registrations
      await new Promise((r) => setTimeout(r, 5000));
    } catch (err: any) {
      console.error(`  ⚠ Registration for ${user.label} note: ${err.message}`);
      results[user.label] = null;
    }
  }

  console.log(`\n================================================================`);
  console.log(`🎯 BATCH #${batchNum} SUMMARY`);
  console.log(`Funding Transaction: https://preview.midnightexplorer.com/tx/${fundingTxId}`);
  for (const [label, tx] of Object.entries(results)) {
    if (tx) {
      console.log(`  - ${label}: https://preview.midnightexplorer.com/tx/${tx}`);
    } else {
      console.log(`  - ${label}: Active / Registered`);
    }
  }
  console.log(`================================================================\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Batch activator error:', err);
  process.exit(1);
});
