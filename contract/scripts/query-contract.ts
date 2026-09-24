import { resolveNetwork, loadState } from './network.js';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';

async function main() {
  const { network, config } = resolveNetwork();
  const state = loadState();
  const deployment = state?.deployments?.[network];

  if (!deployment?.address) {
    console.error(`No deployment record found for ${network} in .midnight-state.json`);
    process.exit(1);
  }

  const contractAddress = deployment.address;
  console.log(`\nQuerying ShieldScore on Midnight ${network.toUpperCase()}:`);
  console.log(`  Contract Address: ${contractAddress}`);
  console.log(`  Indexer URL:      ${config.indexer}\n`);

  const publicDataProvider = indexerPublicDataProvider(config.indexer, config.indexerWS);

  console.log('─── On-Chain Verification ───────────────────────────');
  try {
    const contractState = await publicDataProvider.queryContractState(contractAddress);
    console.log('  Contract Found On-Chain:    ✅ YES');
    console.log('  Contract State Type:        ', typeof contractState);
    console.log('  Contract State Data:        ', contractState ? 'Active' : 'Empty');
  } catch (err: any) {
    console.log('  Contract Found On-Chain:    ❌ Error querying contract state:', err?.message || err);
  }

  console.log('  Deployer Account:           ', deployment.deployer);
  console.log('  Deployed At:                ', deployment.deployedAt);
  console.log('  Explorer URL:               ', `${config.explorer}/contract/${contractAddress}\n`);
}

main().catch(console.error);
