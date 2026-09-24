import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import fs from 'fs';
import path from 'path';
import { resolveNetwork } from './network.js';
import { createWallet, persistWalletState, unshieldedToken } from './wallet.js';

async function main() {
  const { network, config } = resolveNetwork();
  console.log(`\n================================================================`);
  console.log(`    Terminal DUST Registration & Sync Monitor (${network.toUpperCase()})`);
  console.log(`================================================================\n`);

  const accountsPath = path.resolve(process.cwd(), '.midnight-accounts.json');
  const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
  const account2 = accounts.account2_borrower;

  console.log(`Target: ${account2.label}`);
  console.log(`Address: ${account2.address}\n`);

  // Use a dedicated cache folder for Account 2
  const cacheDir = path.resolve(process.cwd(), '.wallet-cache-account2');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const walletCtx = await createWallet({
    network,
    networkConfig: config,
    seed: account2.seed,
    restore: true,
    cwd: cacheDir,
  });

  console.log('Connecting to Midnight Preview Indexer and monitoring sync progress...');

  let lastLogged = 0;
  const syncPromise = new Promise<any>((resolve, reject) => {
    const sub = walletCtx.wallet.unshielded.state.subscribe({
      next: (s) => {
        const prog = (s as any).state?.progress;
        if (prog) {
          const applied = Number(prog.appliedId ?? 0);
          const highest = Number(prog.highestTransactionId ?? 0);
          const now = Date.now();
          if (now - lastLogged > 5000) {
            lastLogged = now;
            if (highest > 0) {
              const pct = Math.min(100, Math.round((applied / highest) * 100));
              console.log(`  [Sync Progress] ${applied.toLocaleString()} / ${highest.toLocaleString()} txs (${pct}%)`);
            } else {
              console.log(`  [Sync] Connecting... applied tx ${applied}`);
            }
          }
        }
      },
      error: reject,
    });

    walletCtx.wallet.unshielded.waitForSyncedState().then((s) => {
      sub.unsubscribe();
      resolve(s);
    }).catch(reject);
  });

  const unshieldedState = await syncPromise;
  console.log('\n  ✓ Unshielded sync complete!');

  const availableCoins = unshieldedState.availableCoins;
  console.log(`  Total Unshielded UTXOs: ${availableCoins.length}`);

  for (let i = 0; i < availableCoins.length; i++) {
    const coin = availableCoins[i];
    console.log(`    UTXO #${i + 1}: ${coin.value} Stars (${Number(coin.value) / 1_000_000} tNIGHT) | DUST GEN: ${coin.meta?.registeredForDustGeneration ? 'YES' : 'NO'}`);
  }

  const unregistered = availableCoins.filter((c: any) => !c.meta?.registeredForDustGeneration);
  console.log(`\n  Unregistered UTXOs to activate for DUST: ${unregistered.length}`);

  if (unregistered.length === 0) {
    console.log('  ✓ All UTXOs are already registered for DUST generation!');
    await persistWalletState(network, walletCtx, cacheDir);
    await walletCtx.wallet.stop();
    process.exit(0);
  }

  console.log('\nBuilding DUST registration recipe...');
  const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
    unregistered as any,
    walletCtx.unshieldedKeystore.getPublicKey(),
    (payload) => walletCtx.unshieldedKeystore.signData(payload)
  );

  console.log('Signing DUST registration recipe with unshielded keystore...');
  const signedRecipe = await walletCtx.wallet.signRecipe(recipe, (data) =>
    walletCtx.unshieldedKeystore.signData(data)
  );

  console.log('Finalizing DUST registration transaction...');
  const finalizedTx = await walletCtx.wallet.finalizeRecipe(signedRecipe);

  console.log('Broadcasting DUST registration to Midnight Preview blockchain...');
  const txId = await walletCtx.wallet.submitTransaction(finalizedTx);

  console.log(`\n================================================================`);
  console.log(`🎉 DUST GENERATION ACTIVATED ON-CHAIN VIA TERMINAL!`);
  console.log(`Transaction Hash: ${txId}`);
  console.log(`Explorer Link   : https://preview.midnightexplorer.com/tx/${txId}`);
  console.log(`Status          : DUST GEN status is now changing to YES!`);
  console.log(`================================================================\n`);

  await persistWalletState(network, walletCtx, cacheDir);
  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('Execution note:', err.message || err);
  process.exit(1);
});
