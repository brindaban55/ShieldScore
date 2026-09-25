import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ws from 'ws';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';

// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import { resolveNetwork, getOrCreateWallet, STATE_FILE_NAME } from './network.js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet.js';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as compactRuntime from '@midnight-ntwrk/compact-runtime';

const PRIVATE_STATE_ID = 'shieldscorePrivateState';

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);
const SEED = WALLET.seed;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const statePath = path.resolve(__dirname, '..', '..', STATE_FILE_NAME);
const zkConfigPath = path.resolve(__dirname, '..', 'managed');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Compiled contract not found in managed/contract/index.js! Run: npm run compile\n');
  process.exit(1);
}

const ShieldScoreModule = await import(pathToFileURL(contractPath).href);

// Read deployed contract address from .midnight-state.json
let contractAddress = '';
if (fs.existsSync(statePath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    contractAddress = raw?.deployments?.[network]?.address || '';
  } catch (e) {}
}

if (!contractAddress) {
  contractAddress = '0794f000c1446592b46446d9ce4929f43867dd86f5dc1660e25827ebaaf56123';
}

async function broadcastTransaction(api: ApiPromise, tx: any): Promise<string> {
  const rawIds = tx.identifiers && typeof tx.identifiers === 'function' ? tx.identifiers() : [];
  console.log('  Transaction identifiers:', rawIds);
  const candidateId = rawIds.length > 0 ? rawIds.at(-1) : undefined;

  const serialized = tx.serialize ? tx.serialize() : tx;
  const hex = u8aToHex(serialized);
  console.log(`  Broadcasting transaction to Midnight node (${hex.length} hex chars)...`);

  const subTx = api.tx.midnight.sendMnTransaction(hex);
  return await new Promise<string>((resolve, reject) => {
    let unsub: (() => void) | undefined;
    subTx.send((result) => {
      console.log(`  Transaction status: ${result.status.type}`);
      if (result.status.isInBlock) {
        const blockHex = result.status.asInBlock.toHex();
        console.log(`  ✓ Included in block: ${blockHex}`);
        const finalId = candidateId || blockHex;
        console.log(`  ✓ Transaction ID: ${finalId}`);
        if (unsub) {
          try { unsub(); } catch {}
        }
        resolve(finalId);
      } else if (result.status.isFinalized) {
        console.log(`  ✓ Finalized in block: ${result.status.asFinalized.toHex()}`);
      } else if (result.isError) {
        if (unsub) {
          try { unsub(); } catch {}
        }
        reject(new Error(`Transaction submission error: ${JSON.stringify(result)}`));
      }
    }).then((unsubFn) => {
      unsub = unsubFn;
    }).catch(reject);
  });
}

async function createProviders(walletCtx: WalletContext, api: ApiPromise) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'ShieldScore-Midnight-Preview-Key-2026';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      console.log('  Balancing transaction with tDUST fee balancer...');
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      console.log('  Recipe created:', recipe.type);
      console.log('  Finalizing transaction recipe...');
      const finalized = await walletCtx.wallet.finalizeRecipe(recipe);
      console.log('  Recipe finalized successfully!');
      return finalized;
    },
    submitTx: async (tx: any) => {
      return broadcastTransaction(api, tx);
    },
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'shieldscore-private-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

async function main() {
  const circuitArg = process.argv[2] || 'passport'; // 'passport', 'policy', 'custom'

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║     ShieldScore — On-Chain Circuit Invocation Engine        ║`);
  console.log(`║     Target Circuit: ${circuitArg.toUpperCase().padEnd(39)}║`);
  console.log(`║     Network: Midnight ${network.toUpperCase().padEnd(43)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`  Deployed Contract: ${contractAddress}`);
  console.log(`  Explorer Link: ${networkConfig.explorer}/contract/${contractAddress}\n`);

  console.log('─── 1. Connecting to Substrate Relay & Indexer ─────────────────');
  const relayWsUrl = networkConfig.node.replace(/^http/, 'ws');
  console.log(`  Node RPC: ${relayWsUrl}`);
  const provider = new WsProvider(relayWsUrl);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  console.log(`  ✓ Connected to Substrate Node!\n`);

  console.log('─── 2. Initializing Wallet & Syncing Balances ──────────────────');
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED, restore: true });
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log(`  Caller Address: ${address}`);

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
  console.log(`  ✓ Synced with Midnight Preview Indexer in ${Math.round((Date.now() - syncStart) / 1000)}s!`);

  const tNight = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dust = state.dust?.balance ? state.dust.balance(new Date()) : 0n;
  console.log(`  🪙 tNIGHT: ${tNight.toLocaleString()} | ⛽ tDUST: ${dust.toLocaleString()}\n`);

  // Define borrower witness data for Circuit 1 & 2
  const borrowerSalt = new Uint8Array(32).fill(7);
  const descBytes32 = new compactRuntime.CompactTypeBytes(32);
  const expectedCommitment = compactRuntime.persistentHash(descBytes32, borrowerSalt);
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

  const witnesses = {
    getCreditScore: (context: any): [any, bigint] => {
      console.log('    [Witness] Reading Credit Score: 785 (CONFIDENTIAL)');
      return [context.privateState, 785n];
    },
    getAnnualIncome: (context: any): [any, bigint] => {
      console.log('    [Witness] Reading Annual Income: $115,000 (CONFIDENTIAL)');
      return [context.privateState, 115000n];
    },
    getDebtToIncomeRatioBps: (context: any): [any, bigint] => {
      console.log('    [Witness] Reading DTI: 28.5% (2850 bps) (CONFIDENTIAL)');
      return [context.privateState, 2850n];
    },
    getCollateralRatioBps: (context: any): [any, bigint] => {
      console.log('    [Witness] Reading Collateral Ratio: 210% (21000 bps) (CONFIDENTIAL)');
      return [context.privateState, 21000n];
    },
    getApplicantSecretSalt: (context: any): [any, Uint8Array] => {
      console.log('    [Witness] Reading Secret Blinding Salt (CONFIDENTIAL)');
      return [context.privateState, borrowerSalt];
    },
  };

  console.log('─── 3. Locating Deployed Contract on Midnight ──────────────────');
  const compiledContract = (CompiledContract.make('shieldscore', ShieldScoreModule.Contract) as any).pipe(
    (CompiledContract.withWitnesses as any)(witnesses),
    (CompiledContract.withCompiledFileAssets as any)(zkConfigPath),
  );

  const providers = await createProviders(walletCtx, api);

  console.log(`  Querying contract at address ${contractAddress}...`);
  const deployed = await findDeployedContract(providers, {
    compiledContract: compiledContract as any,
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });
  console.log(`  ✓ Deployed contract located and verified!\n`);

  console.log('─── 4. Executing ZK Circuit & Generating SNARK Proof ───────────');

  let callTxData: any;
  if (circuitArg === 'policy' || circuitArg === 'update') {
    // CIRCUIT 3: updatePolicy
    const newMinScore = 710n;
    const newMinIncome = 55000n;
    const newMaxDtiBps = 3800n; // 38.00%
    const newMinCollateralBps = 16000n; // 160.00%
    const newPolicyId = 2n; // Tier 2 / Commercial Policy

    console.log(`  Invoking Circuit: updatePolicy(...)`);
    console.log(`  Updating ledger baseline policy:`);
    console.log(`    - Min Credit Score: ${newMinScore}`);
    console.log(`    - Min Annual Income: $${newMinIncome}`);
    console.log(`    - Max DTI: ${Number(newMaxDtiBps) / 100}%`);
    console.log(`    - Min Collateral: ${Number(newMinCollateralBps) / 100}%`);
    console.log(`    - Policy ID: ${newPolicyId}`);

    callTxData = await deployed.callTx.updatePolicy(
      newMinScore,
      newMinIncome,
      newMaxDtiBps,
      newMinCollateralBps,
      newPolicyId
    );
  } else if (circuitArg === 'custom') {
    // CIRCUIT 2: verifyCustomPolicy
    const reqMinScore = 750n;
    const reqMinIncome = 80000n;
    const reqMaxDtiBps = 3500n;
    const reqMinCollateralBps = 18000n;
    const customPolicyId = 777n;

    console.log(`  Invoking Circuit: verifyCustomPolicy(...)`);
    console.log(`  Custom Dynamic Parameters:`);
    console.log(`    - Required Score: ${reqMinScore}`);
    console.log(`    - Required Income: $${reqMinIncome}`);
    console.log(`    - Max DTI: ${Number(reqMaxDtiBps) / 100}%`);
    console.log(`    - Min Collateral: ${Number(reqMinCollateralBps) / 100}%`);
    console.log(`    - Custom Policy ID: ${customPolicyId}`);

    callTxData = await deployed.callTx.verifyCustomPolicy(
      expectedCommitment,
      reqMinScore,
      reqMinIncome,
      reqMaxDtiBps,
      reqMinCollateralBps,
      customPolicyId,
      currentTimestamp
    );
  } else {
    // CIRCUIT 1: verifyCreditPassport
    console.log(`  Invoking Circuit: verifyCreditPassport(...)`);
    console.log(`  Expected Commitment: 0x${Buffer.from(expectedCommitment).toString('hex')}`);
    console.log(`  Timestamp: ${currentTimestamp}`);

    callTxData = await deployed.callTx.verifyCreditPassport(
      expectedCommitment,
      currentTimestamp
    );
  }

  console.log('\n─── 5. Transaction Finalized On-Chain! ─────────────────────────');
  console.log('  🎉 Circuit execution confirmed on Midnight Preview network!');
  console.log(`  Block / Tx ID: ${callTxData.public?.txId || callTxData.public?.blockHash || 'Included in Block'}`);
  console.log(`  Explorer URL: ${networkConfig.explorer}/contract/${contractAddress}\n`);

  await persistWalletState(network, walletCtx);
  await api.disconnect();
  await walletCtx.wallet.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nCircuit call failed:', err);
  process.exit(1);
});
