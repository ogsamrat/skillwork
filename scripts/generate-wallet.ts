import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';

const pk = generatePrivateKey();
const account = privateKeyToAccount(pk);

console.log('═══════════════════════════════════════════════════════');
console.log('  GENERATED NEW WALLET FOR REPUTATION FEEDBACK');
console.log('═══════════════════════════════════════════════════════\n');
console.log(`Address: ${account.address}`);
console.log('\nPlease send ~0.1 Fuji AVAX to this address.\n');

const envPath = path.resolve('.env');
let envContent = fs.readFileSync(envPath, 'utf8');

if (!envContent.includes('FEEDBACK_PRIVATE_KEY')) {
  fs.appendFileSync(envPath, `\n# Wallet for giving reputation (cannot be agent owner)\nFEEDBACK_PRIVATE_KEY=${pk}\n`);
  console.log('✅ Added FEEDBACK_PRIVATE_KEY to .env');
} else {
  console.log('⚠️  FEEDBACK_PRIVATE_KEY already exists in .env. Skipping append.');
}
