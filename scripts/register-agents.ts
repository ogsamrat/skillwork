/**
 * Register 4 worker agents on the official ERC-8004 Identity Registry (Fuji).
 * Uses viem for direct contract interaction.
 *
 * Usage: npx tsx scripts/register-agents.ts
 *
 * Prerequisite: Registration JSON files must be hosted at accessible URLs.
 * The http-server in registrations/ folder serves them at localhost:3000.
 */
import 'dotenv/config';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';

const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const;
const RPC_URL = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

// Registration file URLs — update these to your actual hosted URLs
const AGENTS = [
  { name: 'ResearchAgent1', registrationUrl: 'http://localhost:3000/research-agent-1.json' },
  { name: 'ResearchAgent2', registrationUrl: 'http://localhost:3000/research-agent-2.json' },
  { name: 'StatsAgent1',    registrationUrl: 'http://localhost:3000/stats-agent-1.json' },
  { name: 'StatsAgent2',    registrationUrl: 'http://localhost:3000/stats-agent-2.json' },
];

// Minimal ABI for the Identity Registry register function
const IDENTITY_ABI = [
  {
    inputs: [{ name: 'agentUrl', type: 'string' }],
    name: 'register',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

async function main() {
  const privateKey = process.env.EVM_PRIVATE_KEY;
  if (!privateKey) throw new Error('EVM_PRIVATE_KEY not found in .env');

  const account = privateKeyToAccount(
    (privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`) as `0x${string}`
  );

  console.log('=== Registering 4 agents on ERC-8004 Identity Registry ===\n');
  console.log(`Network:  Avalanche Fuji (43113)`);
  console.log(`Registry: ${IDENTITY_REGISTRY}`);
  console.log(`Wallet:   ${account.address}\n`);

  const publicClient = createPublicClient({ chain: avalancheFuji, transport: http(RPC_URL) });
  const walletClient = createWalletClient({ account, chain: avalancheFuji, transport: http(RPC_URL) });

  for (const agent of AGENTS) {
    console.log(`Registering ${agent.name}...`);
    console.log(`  URI: ${agent.registrationUrl}`);

    try {
      const txHash = await walletClient.writeContract({
        address: IDENTITY_REGISTRY,
        abi: IDENTITY_ABI,
        functionName: 'register',
        args: [agent.registrationUrl],
      });

      console.log(`  ⏳ Waiting for confirmation...`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`  ✅ Registered! txHash: ${txHash}`);
      console.log(`  📦 Block: ${receipt.blockNumber}, Gas used: ${receipt.gasUsed}\n`);
    } catch (err: any) {
      console.error(`  ❌ Failed to register ${agent.name}: ${err.message}\n`);
    }
  }

  console.log('=== Registration complete ===');
}

main().catch(console.error);
