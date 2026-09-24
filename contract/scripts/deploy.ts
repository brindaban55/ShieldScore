import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ws from 'ws';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';

// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = ws;

import { resolveNetwork, getOrCreateWallet, recordDeployment, STATE_FILE_NAME } from './network.js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet.js';

import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

const PRIVATE_STATE_ID = 'shieldscorePrivateState';

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);
const SEED = WALLET.seed;

async function waitForProofServer(maxAttempts = 30, delayMs = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(networkConfig.proofServer, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      if (res.status === 200) return true;
    } catch {
      if (attempt < maxAttempts) {
        process.stdout.write(`\r  Waiting for proof server on ${networkConfig.proofServer}... (${attempt}/${maxAttempts})   `);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  return false;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'managed');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Compiled contract not found in managed/contract/index.js! Run: npm run compile\n');
  process.exit(1);
}

const ShieldScoreModule = await import(pathToFileURL(contractPath).href);

// Default witness callbacks for deploy simulation
const defaultWitnesses = {
  getCreditScore: (context: any): [any, bigint] => [context.privateState, 750n],
  getAnnualIncome: (context: any): [any, bigint] => [context.privateState, 85000n],
  getDebtToIncomeRatioBps: (context: any): [any, bigint] => [context.privateState, 3200n],
  getCollateralRatioBps: (context: any): [any, bigint] => [context.privateState, 16000n],
  getApplicantSecretSalt: (context: any): [any, Uint8Array] => [context.privateState, new Uint8Array(32).fill(7)],
};

const compiledContract = CompiledContract.make('shieldscore', ShieldScoreModule.Contract).pipe(
  CompiledContract.withWitnesses(defaultWitnesses),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

async function broadcastTransaction(api: ApiPromise, tx: any): Promise<string> {
  const rawIds = tx.identifiers && typeof tx.identifiers === 'function' ? tx.identifiers() : [];
  console.log('  Transaction identifiers:', rawIds);
  const candidateId = rawIds.length > 0 ? rawIds.at(-1) : undefined;

  const serialized = tx.serialize ? tx.serialize() : tx;
  const hex = u8aToHex(serialized);
  console.log(`  Broadcasting transaction (${hex.length} hex chars)...`);

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
      console.log('  Balancing deployment transaction with fee balancer...');
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      console.log('  Recipe created:', recipe.type);
      console.log('  Finalizing recipe with wallet...');
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
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║      Deploying ShieldScore to Midnight ${network.toUpperCase()}      ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('─── 1. Substrate Node Connection ───────────────────────────────\n');
  const relayWsUrl = networkConfig.node.replace(/^http/, 'ws');
  console.log(`  Connecting to node: ${relayWsUrl}`);
  const provider = new WsProvider(relayWsUrl);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  console.log(`  ✓ Connected to Midnight Substrate node on ${network}.\n`);

  console.log('─── 2. Wallet Initialization & Address ─────────────────────────\n');
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED, restore: true });
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log(`  Deployer Unshielded Address:`);
  console.log(`  >>> ${address} <<<\n`);

  if (WALLET.mnemonic) {
    console.log(`  --------------------------------------------------------------`);
    console.log(`  RECOVERY PHRASE (1AM / Lace Chrome Extension):`);
    console.log(`  ${WALLET.mnemonic}`);
    console.log(`  --------------------------------------------------------------\n`);
  }

  console.log('  Syncing state with Midnight network indexer...');
  const syncStart = Date.now();
  let lastLogTime = 0;

  const state = await new Promise<any>((resolve, reject) => {
    let resolved = false;
    const sub = walletCtx.wallet.state().subscribe({
      next: (s) => {
        const bal = s.unshielded?.balances?.[unshieldedToken().raw] ?? 0n;
        const dust = s.dust?.balance ? s.dust.balance(new Date()) : 0n;
        const dustApplied = s.dust?.progress?.appliedIndex ?? 0n;
        const dustMax = s.dust?.progress?.highestRelevantWalletIndex ?? 0n;
        const now = Date.now();
        if (now - lastLogTime > 4000) {
          lastLogTime = now;
          const dustPct = dustMax > 0n ? Math.min(100, Math.floor(Number((dustApplied * 100n) / dustMax))) : 0;
          console.log(`  ⏳ Sync: ${dustPct}% (${dustApplied}/${dustMax}) | tNIGHT: ${bal.toLocaleString()} | tDUST: ${dust.toLocaleString()}`);
        }
        if (!resolved && (s.isSynced || (bal > 0n && dust > 0n))) {
          resolved = true;
          sub.unsubscribe();
          resolve(s);
        }
      },
      error: (err) => {
        console.error('\n  Wallet sync error:', err);
      },
    });

    walletCtx.wallet.waitForSyncedState().then((s) => {
      if (!resolved) {
        resolved = true;
        sub.unsubscribe();
        resolve(s);
      }
    }).catch((err) => {
      if (!resolved) {
        reject(err);
      }
    });
  });

  const elapsed = Math.round((Date.now() - syncStart) / 1000);
  console.log(`  ✓ Synced with network in ${elapsed}s!\n`);

  await persistWalletState(network, walletCtx);

  const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`  🪙 tNIGHT Balance: ${tNightBalance.toLocaleString()}\n`);

  if (tNightBalance === 0n) {
    console.log('  ❌ Insufficient Funds for Deployment:');
    console.log(`  Please fund your wallet address via the Preview faucet:`);
    console.log(`  Faucet:  ${networkConfig.faucet}`);
    console.log(`  Address: ${address}\n`);
    console.log(`  TIP: If you want to use the browser wallet to generate DUST,`);
    console.log(`  import the recovery phrase shown above into your 1AM or Lace extension.\n`);
    await api.disconnect();
    await walletCtx.wallet.stop();
    process.exit(1);
  }

  console.log('─── 3. DUST Gas Status ─────────────────────────────────────────\n');
  const dustBal = state.dust?.balance ? state.dust.balance(new Date()) : 0n;
  console.log(`  ⛽ DUST Gas Available: ${dustBal.toLocaleString()}`);
  console.log('  ✓ DUST gas active on-chain.\n');

  console.log('─── 4. Checking Proof Server ───────────────────────────────────\n');
  const proofServerReady = await waitForProofServer(5, 1500);
  if (!proofServerReady) {
    console.log(`  ⚠️ Proof server is not running on ${networkConfig.proofServer}.`);
    console.log('  Start the proof server container via: docker compose up -d proof-server\n');
    await api.disconnect();
    await walletCtx.wallet.stop();
    process.exit(1);
  }
  console.log('  ✓ Proof server ready!\n');

  console.log('─── 5. Deploying ShieldScore Contract ──────────────────────────\n');
  console.log('  Generating ZK deployment proof and deploying contract...');
  const providers = await createProviders(walletCtx, api);

  const deployed = await deployContract(providers, {
    compiledContract: compiledContract as any,
    args: [],
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log('\n  🎉 ShieldScore Contract Deployed Successfully!');
  console.log(`  Contract Address: ${contractAddress}\n`);
  console.log(`  Explorer Link: ${networkConfig.explorer}/contract/${contractAddress}\n`);

  recordDeployment(network, contractAddress, address.toString());
  console.log(`  ✓ Saved deployment to ${STATE_FILE_NAME} for ${network}.\n`);

  await persistWalletState(network, walletCtx);
  await api.disconnect();
  await walletCtx.wallet.stop();
}

main().catch((err) => {
  console.error('\nDeployment error:', err);
  process.exit(1);
});
