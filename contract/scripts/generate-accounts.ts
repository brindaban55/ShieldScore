import * as fs from 'node:fs';
import * as path from 'node:path';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { HDWallet, Roles, createKeystore } from '@midnight-ntwrk/wallet-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const ACCOUNTS_FILE = path.join(ROOT_DIR, '.midnight-accounts.json');
const STATE_FILE = path.join(ROOT_DIR, '.midnight-state.json');

setNetworkId('preview');

function deriveAddressFromSeed(seedHex: string): string {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();

  const keystore = createKeystore(result.keys[Roles.NightExternal], 'preview');
  return keystore.getBech32Address().toString();
}

function generateNewWallet(label: string) {
  const mnemonic = generateMnemonic(wordlist, 256);
  const seedBytes = mnemonicToSeedSync(mnemonic);
  const seedHex = Buffer.from(seedBytes).toString('hex');
  const address = deriveAddressFromSeed(seedHex);
  return {
    label,
    mnemonic,
    seed: seedHex,
    address,
    network: 'preview',
    createdAt: new Date().toISOString(),
  };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║    Midnight Preview Multi-Account Wallet Generator SDK       ║');
  console.log('║    Compatible with 1AM Wallet & Lace Chrome Extensions       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let accounts: Record<string, any> = {};

  // Check if .midnight-accounts.json already exists
  if (fs.existsSync(ACCOUNTS_FILE)) {
    try {
      accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
    } catch (e) {}
  }

  // Check if primary account exists in .midnight-state.json
  if (!accounts.account1_deployer && fs.existsSync(STATE_FILE)) {
    try {
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
      const previewWallet = state?.wallets?.preview;
      if (previewWallet) {
        accounts.account1_deployer = {
          label: 'Account 1: Protocol Deployer / Admin',
          mnemonic: previewWallet.mnemonic,
          seed: previewWallet.seed,
          address: deriveAddressFromSeed(previewWallet.seed),
          network: 'preview',
          isPreFunded: true,
          createdAt: previewWallet.createdAt || new Date().toISOString(),
        };
      }
    } catch (e) {}
  }

  if (!accounts.account1_deployer) {
    accounts.account1_deployer = generateNewWallet('Account 1: Protocol Deployer / Admin');
  }

  if (!accounts.account2_borrower) {
    accounts.account2_borrower = generateNewWallet('Account 2: Alice Borrower (ZK Credit Passport Applicant)');
  }

  if (!accounts.account3_lender) {
    accounts.account3_lender = generateNewWallet('Account 3: Bob Institutional Lender (Underwriting Pool Manager)');
  }

  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2) + '\n', 'utf-8');

  for (const [key, acc] of Object.entries(accounts)) {
    console.log('────────────────────────────────────────────────────────────────');
    console.log(`📌 ${acc.label.toUpperCase()}`);
    console.log('────────────────────────────────────────────────────────────────');
    console.log(`  Network:            Midnight Preview`);
    console.log(`  Unshielded Address: ${acc.address}`);
    console.log(`  Funding Status:     ${acc.isPreFunded ? '✅ ALREADY FUNDED (5 Billion tNIGHT, 17.65+ Q tDUST)' : '⏳ Awaiting Faucet Funding'}`);
    console.log('\n  24-Word Recovery Phrase (Import into 1AM Wallet / Lace):');
    console.log(`  >>> ${acc.mnemonic} <<<\n`);
  }

  console.log('════════════════════════════════════════════════════════════════');
  console.log('💡 INSTRUCTIONS FOR IMPORTING INTO 1AM WALLET / LACE CHROME EXTENSION:');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('1. Open your 1AM Wallet or Lace extension in Chrome.');
  console.log('2. Click "Add Account" or "Import Wallet via Recovery Phrase".');
  console.log('3. Paste the 24 words for Account 2 or Account 3.');
  console.log('4. Ensure the network selector is set to "Preview".');
  console.log('5. Visit the Midnight Preview Faucet:');
  console.log('   🔗 https://faucet.preview.midnight.network/');
  console.log('6. Paste the Unshielded Address and request tNIGHT tokens.');
  console.log('7. In 1AM Wallet, click "Generate DUST" to create gas for transactions!');
  console.log('════════════════════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Error generating accounts:', err);
  process.exit(1);
});
