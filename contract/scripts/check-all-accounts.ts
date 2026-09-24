import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import fs from 'fs';
import path from 'path';
import { resolveNetwork } from './network.js';
import { createWallet, unshieldedToken } from './wallet.js';

async function main() {
  const accountsPath = path.resolve(process.cwd(), '.midnight-accounts.json');
  if (!fs.existsSync(accountsPath)) {
    console.error('No .midnight-accounts.json found');
    process.exit(1);
  }

  const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
  const { network, config } = resolveNetwork();

  console.log('================================================================');
  console.log(`Checking All 3 Funded Accounts on Midnight ${network.toUpperCase()}`);
  console.log('================================================================\n');

  for (const [key, acc] of Object.entries(accounts)) {
    const account = acc as any;
    console.log(`Checking ${account.label}...`);
    console.log(`Address: ${account.address}`);

    try {
      const walletCtx = await createWallet({
        network,
        networkConfig: config,
        seed: account.seed,
        restore: false,
      });

      const state = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Sync timeout after 25s'));
        }, 25000);

        const sub = walletCtx.wallet.state().subscribe((s) => {
          if (s.isSynced) {
            clearTimeout(timeout);
            sub.unsubscribe();
            resolve(s);
          }
        });
      });

      const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
      const dustBalance = state.dust?.balance ? state.dust.balance(new Date()) : 0n;

      console.log(`  ✓ Synced!`);
      console.log(`  - tNIGHT Balance: ${tNightBalance.toLocaleString()}`);
      console.log(`  - tDUST Balance : ${dustBalance.toLocaleString()}`);
      console.log('');

      await walletCtx.wallet.stop();
    } catch (err: any) {
      console.log(`  ⚠ Sync/Check note: ${err.message}\n`);
    }
  }

  process.exit(0);
}

main().catch(console.error);
