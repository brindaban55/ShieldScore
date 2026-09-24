import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import fs from 'fs';
import path from 'path';
import { resolveNetwork, getOrCreateWallet } from './network.js';
import { createWallet, persistWalletState, unshieldedToken } from './wallet.js';

async function main() {
  const { network, config } = resolveNetwork();
  console.log(`\n================================================================`);
  console.log(`       ShieldScore On-Chain Transfer Test (${network.toUpperCase()})`);
  console.log(`================================================================\n`);

  const walletRecord = getOrCreateWallet(network);
  console.log(`Initializing Sender Wallet (Account 1 Deployer)...`);

  const senderCtx = await createWallet({
    network,
    networkConfig: config,
    seed: walletRecord.seed,
    restore: true,
  });

  console.log('Waiting for wallet synchronization...');
  const state = await senderCtx.wallet.waitForSyncedState();
  const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dustBalance = state.dust?.balance ? state.dust.balance(new Date()) : 0n;

  console.log(`  ✓ Synced!`);
  console.log(`  - tNIGHT Balance: ${(Number(tNightBalance) / 1_000_000).toLocaleString()} NIGHT (${tNightBalance} Stars)`);
  console.log(`  - tDUST Balance : ${dustBalance.toLocaleString()}\n`);

  // Target: Account 2 Borrower
  const accountsPath = path.resolve(process.cwd(), '.midnight-accounts.json');
  const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
  const targetAddressStr = accounts.account2_borrower.address;
  const transferAmount = 10_000_000n; // 10 tNIGHT (10 million stars)

  console.log(`Transferring 10 tNIGHT to:`);
  console.log(`>>> ${targetAddressStr} <<<\n`);

  const { MidnightBech32m, UnshieldedAddress } = await import('@midnight-ntwrk/wallet-sdk');
  const targetAddress = MidnightBech32m.parse(targetAddressStr).decode(UnshieldedAddress, 'preview');

  const ttl = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  console.log('Building transfer transaction recipe...');
  const recipe = await senderCtx.wallet.transferTransaction(
    [
      {
        type: 'unshielded',
        outputs: [
          {
            type: unshieldedToken().raw,
            receiverAddress: targetAddress as any,
            amount: transferAmount,
          },
        ],
      },
    ],
    {
      shieldedSecretKeys: senderCtx.shieldedSecretKeys,
      dustSecretKey: senderCtx.dustSecretKey,
    },
    {
      ttl,
      payFees: true,
    }
  );

  console.log('Signing recipe with unshielded keystore...');
  const signedRecipe = await senderCtx.wallet.signRecipe(recipe, (data) =>
    senderCtx.unshieldedKeystore.signData(data)
  );

  console.log('Finalizing transaction...');
  const finalizedTx = await senderCtx.wallet.finalizeRecipe(signedRecipe);

  console.log('Submitting transaction to Midnight Preview Network...');
  const txId = await senderCtx.wallet.submitTransaction(finalizedTx);

  console.log(`\n================================================================`);
  console.log(`✅ TRANSACTION SUBMITTED SUCCESSFULLY!`);
  console.log(`Transaction ID (Hash): ${txId}`);
  console.log(`Explorer Link: https://preview.midnightexplorer.com/tx/${txId}`);
  console.log(`================================================================\n`);

  await persistWalletState(network, senderCtx);
  await senderCtx.wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('Transfer test failed:', err);
  process.exit(1);
});
