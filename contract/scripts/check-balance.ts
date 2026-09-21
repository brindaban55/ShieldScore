import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import { resolveNetwork, getOrCreateWallet } from './network.js';
import { createWallet, persistWalletState, unshieldedToken } from './wallet.js';

async function main() {
  const { network, config } = resolveNetwork();
  console.log(`\n================================================================`);
  console.log(`       ShieldScore Wallet Balance Checker (${network.toUpperCase()})`);
  console.log(`================================================================\n`);

  const walletRecord = getOrCreateWallet(network);
  console.log(`Initializing HD wallet for network: ${network}...`);

  const walletCtx = await createWallet({
    network,
    networkConfig: config,
    seed: walletRecord.seed,
    restore: true,
  });

  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log(`\n  Wallet Address (Unshielded):`);
  console.log(`  >>> ${address} <<<\n`);

  if (walletRecord.mnemonic) {
    console.log(`  --------------------------------------------------------------`);
    console.log(`  RECOVERY PHRASE / SEED (1AM / Lace Wallet Chrome Extension):`);
    console.log(`  ${walletRecord.mnemonic}`);
    console.log(`  --------------------------------------------------------------\n`);
  }

  console.log(`  Waiting for network synchronization with Midnight ${network}...`);
  const syncStart = Date.now();
  const state = await new Promise<any>((resolve, reject) => {
    const sub = walletCtx.wallet.state().subscribe((s) => {
      if (s.isSynced) {
        sub.unsubscribe();
        resolve(s);
      }
    });
    walletCtx.wallet.waitForSyncedState().then((s) => {
      sub.unsubscribe();
      resolve(s);
    }).catch(reject);
  });

  const elapsed = Math.round((Date.now() - syncStart) / 1000);
  console.log(`  Network synced in ${elapsed}s.`);

  await persistWalletState(network, walletCtx);

  const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dustBalance = state.dust?.balance ? state.dust.balance(new Date()) : 0n;

  console.log(`\n  Balances:`);
  console.log(`    - tNIGHT (Unshielded Token): ${tNightBalance.toLocaleString()}`);
  console.log(`    - tDUST (Shielded Gas Resource): ${dustBalance.toLocaleString()}\n`);

  if (tNightBalance === 0n) {
    console.log(`  [Action Required] Wallet is not funded yet.`);
    console.log(`  1. Visit the faucet: ${config.faucet}`);
    console.log(`  2. Paste your address: ${address}`);
    console.log(`  3. Request tNIGHT tokens`);
    console.log(`  4. Re-run this script or deploy script\n`);
  } else {
    console.log(`  Wallet is funded! Ready for contract deployment.\n`);
  }

  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('Balance check error:', err);
  process.exit(1);
});
