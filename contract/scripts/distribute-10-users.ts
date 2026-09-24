import ws from 'ws';
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import { resolveNetwork, getOrCreateWallet } from './network.js';
import { createWallet, persistWalletState, unshieldedToken } from './wallet.js';
import { MidnightBech32m, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk';

const targetAddresses = [
  // User 2
  'mn_addr_preview154hy4ceav3qcf76aaf7rpf9h6e62ncxpwe9tvupa35nye90hl3cs4mcaqh',
  // User 3
  'mn_addr_preview1md7n2sy7j0rzty4wm2gsuuff9r4qwraser9tp468z0ar07zqn5vqxt0wg3',
  // User 4
  'mn_addr_preview1myrne5uruze4k0suka294yu8s3ad2xrxrq2k3rc2gf0p7spxpcuqjn2j9r',
  // User 5
  'mn_addr_preview1n9pjaukl440hjlupw930m54lwq47akal8fhclc64ddznyrgw9uhqsd5v7x',
  // User 6
  'mn_addr_preview1zlaws82fzmjspj752k56quhqfcharz4uzp645a4yr4w2mekhuusq2mehnn',
  // User 7
  'mn_addr_preview1ydn09uannvc6du2rq3t2qlcjgt274uf3nux5nguuqqk46805n0hqw9mr9m',
  // User 8
  'mn_addr_preview1jntn549j8fn49j0a0fvpa22gtnqce36nzzj440xf9ye6chfalmmqffccn0',
  // User 9
  'mn_addr_preview1zdan4ckxt3pcft6j6rumhzp5ncuk37ghkk7vm2fw2mk8dez89qnq5syeh0',
  // User 10
  'mn_addr_preview1k22tl9vjxu6wpcphxx5kpmvjn25xkju43py42vc5hrzayr775zcslrlger',
];

async function main() {
  const { network, config } = resolveNetwork();
  console.log(`\n================================================================`);
  console.log(`     ShieldScore Batch Distribution to 10 Users (${network.toUpperCase()})`);
  console.log(`================================================================\n`);

  const walletRecord = getOrCreateWallet(network);
  console.log(`Initializing Sender Wallet (Account 1 Deployer)...`);

  const senderCtx = await createWallet({
    network,
    networkConfig: config,
    seed: walletRecord.seed,
    restore: true,
  });

  console.log('Synchronizing sender wallet state...');
  const state = await senderCtx.wallet.waitForSyncedState();
  const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dustBalance = state.dust?.balance ? state.dust.balance(new Date()) : 0n;

  console.log(`  ✓ Synced!`);
  console.log(`  - tNIGHT Balance: ${(Number(tNightBalance) / 1_000_000).toLocaleString()} NIGHT (${tNightBalance} Stars)`);
  console.log(`  - tDUST Balance : ${dustBalance.toLocaleString()}\n`);

  const amountPerUser = 10_000_000n; // 10 tNIGHT each
  console.log(`Building batched transfer of 10 tNIGHT to each of ${targetAddresses.length} users...`);

  const outputs = targetAddresses.map((addrStr, idx) => {
    const decoded = MidnightBech32m.parse(addrStr).decode(UnshieldedAddress, 'preview');
    console.log(`  [User ${idx + 2}]: ${addrStr} -> 10 tNIGHT`);
    return {
      type: unshieldedToken().raw,
      receiverAddress: decoded,
      amount: amountPerUser,
    };
  });

  const ttl = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  console.log('\nSubmitting batched transfer to wallet pipeline...');
  const recipe = await senderCtx.wallet.transferTransaction(
    [
      {
        type: 'unshielded',
        outputs,
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

  console.log('Broadcasting transaction to Midnight Preview blockchain...');
  const txId = await senderCtx.wallet.submitTransaction(finalizedTx);

  console.log(`\n================================================================`);
  console.log(`🎉 BATCH TRANSACTION SUBMITTED SUCCESSFULLY!`);
  console.log(`Transaction Hash: ${txId}`);
  console.log(`Explorer Link   : https://preview.midnightexplorer.com/tx/${txId}`);
  console.log(`Recipients      : 9 Users (Users #2 through #10) funded on-chain!`);
  console.log(`Total Distributed: ${(Number(amountPerUser * BigInt(targetAddresses.length)) / 1_000_000).toLocaleString()} tNIGHT`);
  console.log(`================================================================\n`);

  await persistWalletState(network, senderCtx);
  await senderCtx.wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('Batch distribution failed:', err);
  process.exit(1);
});
