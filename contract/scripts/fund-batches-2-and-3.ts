import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import { resolveNetwork, getOrCreateWallet } from './network.js';
import { createWallet, persistWalletState, unshieldedToken } from './wallet.js';
import { MidnightBech32m, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk';

const BATCH_2_USERS = [
  { label: 'User #5 (Institutional Lender)', address: 'mn_addr_preview1n9pjaukl440hjlupw930m54lwq47akal8fhclc64ddznyrgw9uhqsd5v7x' },
  { label: 'User #6 (Institutional Lender)', address: 'mn_addr_preview1zlaws82fzmjspj752k56quhqfcharz4uzp645a4yr4w2mekhuusq2mehnn' },
  { label: 'User #7 (DAO Treasury Verifier)', address: 'mn_addr_preview1ydn09uannvc6du2rq3t2qlcjgt274uf3nux5nguuqqk46805n0hqw9mr9m' },
];

const BATCH_3_USERS = [
  { label: 'User #8 (DAO Treasury Verifier)', address: 'mn_addr_preview1jntn549j8fn49j0a0fvpa22gtnqce36nzzj440xf9ye6chfalmmqffccn0' },
  { label: 'User #9 (DAO Treasury Verifier)', address: 'mn_addr_preview1zdan4ckxt3pcft6j6rumhzp5ncuk37ghkk7vm2fw2mk8dez89qnq5syeh0' },
  { label: 'User #10 (DAO Treasury Verifier)', address: 'mn_addr_preview1k22tl9vjxu6wpcphxx5kpmvjn25xkju43py42vc5hrzayr775zcslrlger' },
];

const AMOUNT_PER_USER = 250_000_000n; // 250 tNIGHT

async function sendBatch(network: any, config: any, senderCtx: any, batchName: string, users: typeof BATCH_2_USERS) {
  console.log(`\n================================================================`);
  console.log(`  Executing ${batchName} (250 tNIGHT to each user)`);
  console.log(`================================================================\n`);

  const outputs = users.map((u) => {
    console.log(`  -> ${u.label}: ${u.address} (250 tNIGHT)`);
    return {
      type: unshieldedToken().raw,
      receiverAddress: MidnightBech32m.parse(u.address).decode(UnshieldedAddress, 'preview'),
      amount: AMOUNT_PER_USER,
    };
  });

  const ttl = new Date(Date.now() + 30 * 60 * 1000);
  const recipe = await senderCtx.wallet.transferTransaction(
    [{ type: 'unshielded', outputs }],
    { shieldedSecretKeys: senderCtx.shieldedSecretKeys, dustSecretKey: senderCtx.dustSecretKey },
    { ttl, payFees: true }
  );

  const signedRecipe = await senderCtx.wallet.signRecipe(recipe, (data: any) =>
    senderCtx.unshieldedKeystore.signData(data)
  );
  const finalizedTx = await senderCtx.wallet.finalizeRecipe(signedRecipe);

  console.log(`Broadcasting ${batchName} to Preview blockchain...`);
  const txId = await senderCtx.wallet.submitTransaction(finalizedTx);

  console.log(`\n🎉 ${batchName.toUpperCase()} CONFIRMED ON-CHAIN!`);
  console.log(`Transaction Hash: ${txId}`);
  console.log(`Explorer Link   : https://preview.midnightexplorer.com/tx/${txId}\n`);

  return txId;
}

async function main() {
  const { network, config } = resolveNetwork();
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║       Midnight Preview Batch Funding (Batches 2 & 3)         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

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
  const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`Deployer Balance: ${(Number(balance) / 1_000_000).toLocaleString()} tNIGHT\n`);

  // Send Batch 2
  const tx2 = await sendBatch(network, config, senderCtx, 'Batch 2 (Users #5, #6, #7)', BATCH_2_USERS);

  // Wait 15s between blocks
  console.log('Waiting 15s for block inclusion...');
  await new Promise((r) => setTimeout(r, 15000));

  // Send Batch 3
  const tx3 = await sendBatch(network, config, senderCtx, 'Batch 3 (Users #8, #9, #10)', BATCH_3_USERS);

  await persistWalletState(network, senderCtx);
  await senderCtx.wallet.stop();

  console.log('\n================================================================');
  console.log('🎯 ALL BATCHES FUNDED SUCCESSFULLY ON-CHAIN!');
  console.log(`Batch 1: https://preview.midnightexplorer.com/tx/004cb8841572fac6c8874501b9e28ed1e1928908cfe3a6a75722c1c00523d0b164`);
  console.log(`Batch 2: https://preview.midnightexplorer.com/tx/${tx2}`);
  console.log(`Batch 3: https://preview.midnightexplorer.com/tx/${tx3}`);
  console.log('================================================================\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('Batch error:', err);
  process.exit(1);
});
