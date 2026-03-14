import { createPublicClient, http, parseAbi } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { ERC8004, FUJI_RPC } from '../config.js';

const reputationAbi = parseAbi([
  'function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)',
  'function getIdentityRegistry() view returns (address)',
]);

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(FUJI_RPC),
});

/**
 * Get aggregated reputation for an agent.
 * clientAddresses must be non-empty (per EIP-8004); use a list of known client addresses or the orchestrator address.
 */
export async function getAgentSummary(
  agentId: bigint,
  clientAddresses: `0x${string}`[],
  tag1 = '',
  tag2 = ''
): Promise<{ count: bigint; summaryValue: bigint; summaryValueDecimals: number }> {
  const addrs = clientAddresses.length > 0 ? clientAddresses : [clientAddresses[0]];
  const [count, summaryValue, summaryValueDecimals] = await publicClient.readContract({
    address: ERC8004.REPUTATION_REGISTRY,
    abi: reputationAbi,
    functionName: 'getSummary',
    args: [agentId, addrs, tag1, tag2],
  });
  return { count, summaryValue, summaryValueDecimals };
}

/**
 * Normalize summary to a comparable number: value * 10^(-decimals).
 * Higher is better when used as a quality score.
 */
export function summaryToScore(summaryValue: bigint, summaryValueDecimals: number): number {
  const div = 10 ** summaryValueDecimals;
  return Number(summaryValue) / div;
}
