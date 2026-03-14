/**
 * Seed reputation for agents already registered on ERC-8004.
 * Uses the ACTUAL 8-parameter giveFeedback per EIP-8004 spec.
 *
 * Usage: npx tsx scripts/seed-reputation.ts
 * 
 * Update AGENT_FEEDBACK with the actual agentIds from registration.
 */
import 'dotenv/config';
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';

const REPUTATION_REGISTRY = '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const;
const RPC_URL = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

// Actual agentIds from registration output (update after running register)
const AGENT_FEEDBACK = [
  { agentId: 70n, name: 'ResearchAgent1', value: 92n, valueDecimals: 0 },
  { agentId: 71n, name: 'ResearchAgent2', value: 70n, valueDecimals: 0 },
  { agentId: 72n, name: 'StatsAgent1',    value: 88n, valueDecimals: 0 },
  { agentId: 73n, name: 'StatsAgent2',    value: 85n, valueDecimals: 0 },
];

// Correct EIP-8004 giveFeedback signature (8 parameters)
const REPUTATION_ABI = parseAbi([
  'function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external',
]);

const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

async function main() {
  const privateKey = process.env.FEEDBACK_PRIVATE_KEY;
  if (!privateKey) throw new Error('FEEDBACK_PRIVATE_KEY not found in .env');

  const account = privateKeyToAccount(
    (privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`) as `0x${string}`
  );

  console.log('=== Seeding Reputation for agents (EIP-8004 giveFeedback) ===\n');
  console.log(`Network:  Avalanche Fuji (43113)`);
  console.log(`Registry: ${REPUTATION_REGISTRY}`);
  console.log(`Wallet:   ${account.address}\n`);

  const publicClient = createPublicClient({ chain: avalancheFuji, transport: http(RPC_URL) });
  const walletClient = createWalletClient({ account, chain: avalancheFuji, transport: http(RPC_URL) });

  for (const agent of AGENT_FEEDBACK) {
    console.log(`Giving feedback for ${agent.name} (agentId=${agent.agentId}, value=${agent.value})...`);

    try {
      const txHash = await walletClient.writeContract({
        address: REPUTATION_REGISTRY,
        abi: REPUTATION_ABI,
        functionName: 'giveFeedback',
        args: [
          agent.agentId,         // agentId
          agent.value,           // value (int128)
          agent.valueDecimals,   // valueDecimals (uint8)
          'quality',             // tag1
          '',                    // tag2
          '',                    // endpoint (optional)
          '',                    // feedbackURI (optional)
          ZERO_HASH,             // feedbackHash (optional, bytes32(0))
        ],
      });

      console.log(`  ⏳ Waiting for Fuji confirmation...`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`  ✅ Done! txHash: ${txHash}, Block: ${receipt.blockNumber}\n`);
    } catch (err: any) {
      console.error(`  ❌ Failed: ${err.shortMessage || err.message}\n`);
    }
  }

  console.log('=== Reputation seeding complete ===');
}

main().catch(console.error);
