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
  console.log(`    ShieldScore Terminal DUST Registration Test (${network.toUpperCase()})`);
  console.log(`================================================================\n`);

  const accountsPath = path.resolve(process.cwd(), '.midnight-accounts.json');
  const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
  const account2 = accounts.account2_borrower;

  console.log(`Target: ${account2.label}`);
  console.log(`Address: ${account2.address}`);

  const walletCtx = await createWallet({
    network,
    networkConfig: config,
    seed: account2.seed,
    restore: false,
  });

  console.log('\nWaiting for Account 2 unshielded and dust synchronization...');
  await Promise.all([
    walletCtx.wallet.unshielded.waitForSyncedState(),
    walletCtx.wallet.dust.waitForSyncedState(),
  ]);

  // Read state from observable
  const { firstValueFrom } = await import('rxjs');
  const state = await firstValueFrom(walletCtx.wallet.state());
  const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dustBalance = state.dust?.balance ? state.dust.balance(new Date()) : 0n;

  console.log(`  ✓ Synced!`);
  console.log(`  - tNIGHT Balance: ${(Number(tNightBalance) / 1_000_000).toLocaleString()} NIGHT (${tNightBalance} Stars)`);
  console.log(`  - Current tDUST : ${dustBalance.toLocaleString()}\n`);

  const availableCoins = state.unshielded.availableCoins;
  console.log(`Total Unshielded UTXOs: ${availableCoins.length}`);

  const unregistered = availableCoins.filter((c: any) => !c.meta.registeredForDustGeneration);
  console.log(`Unregistered UTXOs for DUST: ${unregistered.length}`);

  if (unregistered.length === 0) {
    console.log(`\n✓ All UTXOs are already registered for DUST generation!`);
    console.log(`DUST is actively generating every second on the Midnight blockchain.`);
    await walletCtx.wallet.stop();
    process.exit(0);
  }

  console.log(`\nRegistering ${unregistered.length} NIGHT UTXO(s) for DUST generation via Terminal...`);

  // Check registration estimate
  try {
    const est = await walletCtx.wallet.estimateRegistration(unregistered as any);
    console.log(`Estimated Registration Fee: ${est.fee.toLocaleString()} Specks`);
  } catch (e: any) {
    console.log(`Note on estimation: ${e.message}`);
  }

  const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
    unregistered as any,
    walletCtx.unshieldedKeystore.getPublicKey(),
    (payload) => walletCtx.unshieldedKeystore.signData(payload)
  );

  console.log('Signing DUST registration recipe...');
  const signedRecipe = await walletCtx.wallet.signRecipe(recipe, (data) =>
    walletCtx.unshieldedKeystore.signData(data)
  );

  console.log('Finalizing DUST registration transaction...');
  const finalizedTx = await walletCtx.wallet.finalizeRecipe(signedRecipe);

  console.log('Submitting DUST registration to Midnight Preview Network...');
  const txId = await walletCtx.wallet.submitTransaction(finalizedTx);

  console.log(`\n================================================================`);
  console.log(`🎉 DUST GENERATION REGISTERED SUCCESSFULLY VIA TERMINAL!`);
  console.log(`Transaction ID (Hash): ${txId}`);
  console.log(`Explorer Link: https://preview.midnightexplorer.com/tx/${txId}`);
  console.log(`================================================================\n`);

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('DUST registration failed:', err);
  process.exit(1);
});
