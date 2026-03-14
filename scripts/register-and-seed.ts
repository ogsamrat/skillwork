/**
 * Register 4 worker agents and seed reputation in one shot.
 * Captures the minted tokenId from Transfer event logs, then uses those IDs for reputation.
 *
 * Usage: npx tsx scripts/register-and-seed.ts
 */
import 'dotenv/config';
import { createPublicClient, createWalletClient, http, parseAbiItem, decodeEventLog } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';

const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const;
const REPUTATION_REGISTRY = '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const;
const RPC_URL = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

const AGENTS = [
  { name: 'ResearchAgent1', url: 'http://localhost:3000/research-agent-1.json', reputationScore: 92n },
  { name: 'ResearchAgent2', url: 'http://localhost:3000/research-agent-2.json', reputationScore: 70n },
  { name: 'StatsAgent1',    url: 'http://localhost:3000/stats-agent-1.json',    reputationScore: 88n },
  { name: 'StatsAgent2',    url: 'http://localhost:3000/stats-agent-2.json',    reputationScore: 85n },
];

const REGISTER_ABI = [
  {
    inputs: [{ name: 'agentUrl', type: 'string' }],
    name: 'register',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const FEEDBACK_ABI = [
  {
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'score', type: 'int128' },
      { name: 'tag1', type: 'string' },
      { name: 'tag2', type: 'string' },
    ],
    name: 'giveFeedback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ERC-721 Transfer event
const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)');

async function main() {
  const privateKey = process.env.EVM_PRIVATE_KEY;
  if (!privateKey) throw new Error('EVM_PRIVATE_KEY not found in .env');

  const account = privateKeyToAccount(
    (privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`) as `0x${string}`
  );

  const publicClient = createPublicClient({ chain: avalancheFuji, transport: http(RPC_URL) });
  const walletClient = createWalletClient({ account, chain: avalancheFuji, transport: http(RPC_URL) });

  console.log('═══════════════════════════════════════════════════════');
  console.log('  STEP 1: Register agents on ERC-8004 Identity Registry');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Network:  Avalanche Fuji (43113)`);
  console.log(`Registry: ${IDENTITY_REGISTRY}`);
  console.log(`Wallet:   ${account.address}\n`);

  const agentIds: { name: string; agentId: bigint; score: bigint }[] = [];

  for (const agent of AGENTS) {
    console.log(`Registering ${agent.name}...`);
    console.log(`  URI: ${agent.url}`);

    try {
      const txHash = await walletClient.writeContract({
        address: IDENTITY_REGISTRY,
        abi: REGISTER_ABI,
        functionName: 'register',
        args: [agent.url],
      });

      console.log(`  ⏳ Waiting for Fuji confirmation...`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Extract tokenId from Transfer event log
      let tokenId: bigint | null = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: [TRANSFER_EVENT],
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === 'Transfer') {
            tokenId = (decoded.args as any).tokenId;
            break;
          }
        } catch {
          // not a Transfer event, skip
        }
      }

      if (tokenId !== null) {
        console.log(`  ✅ Registered! agentId=${tokenId}, txHash: ${txHash}`);
        agentIds.push({ name: agent.name, agentId: tokenId, score: agent.reputationScore });
      } else {
        console.log(`  ✅ Registered! txHash: ${txHash}`);
        console.log(`  ⚠️  Could not extract tokenId from receipt logs`);
      }
      console.log(`  📦 Block: ${receipt.blockNumber}\n`);
    } catch (err: any) {
      console.error(`  ❌ Failed: ${err.shortMessage || err.message}\n`);
    }
  }

  if (agentIds.length === 0) {
    console.log('\n⚠️  No agentIds captured. Cannot seed reputation.\n');
    return;
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  STEP 2: Seed reputation on ERC-8004 Reputation Registry');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Registry: ${REPUTATION_REGISTRY}\n`);

  for (const agent of agentIds) {
    console.log(`Giving feedback for ${agent.name} (agentId=${agent.agentId}, score=${agent.score})...`);

    try {
      const txHash = await walletClient.writeContract({
        address: REPUTATION_REGISTRY,
        abi: FEEDBACK_ABI,
        functionName: 'giveFeedback',
        args: [agent.agentId, agent.score, 'quality', ''],
      });

      console.log(`  ⏳ Waiting for Fuji confirmation...`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`  ✅ Feedback given! Block: ${receipt.blockNumber}\n`);
    } catch (err: any) {
      console.error(`  ❌ Failed: ${err.shortMessage || err.message}\n`);
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('  DONE — Agent IDs Summary');
  console.log('═══════════════════════════════════════════════════════\n');
  for (const a of agentIds) {
    console.log(`  ${a.name}: agentId=${a.agentId}, reputation=${a.score}`);
  }
  console.log('');
}

main().catch(console.error);
