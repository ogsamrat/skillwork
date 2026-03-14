import { createPublicClient, http, parseAbi } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { ERC8004, FUJI_RPC } from '../config.js';

const identityAbi = parseAbi([
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function tokenByIndex(uint256 index) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
]);

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(FUJI_RPC),
});

export interface AgentRegistration {
  type?: string;
  name: string;
  description?: string;
  image?: string;
  services?: Array<{ name: string; endpoint: string; version?: string }>;
  x402Support?: boolean;
  active?: boolean;
  registrations?: Array<{ agentId: number; agentRegistry: string }>;
}

export async function getTotalSupply(): Promise<bigint> {
  return publicClient.readContract({
    address: ERC8004.IDENTITY_REGISTRY,
    abi: identityAbi,
    functionName: 'totalSupply',
  });
}

export async function getAgentIdByIndex(index: number): Promise<bigint> {
  return publicClient.readContract({
    address: ERC8004.IDENTITY_REGISTRY,
    abi: identityAbi,
    functionName: 'tokenByIndex',
    args: [BigInt(index)],
  });
}

export async function getAgentURI(agentId: bigint): Promise<string> {
  return publicClient.readContract({
    address: ERC8004.IDENTITY_REGISTRY,
    abi: identityAbi,
    functionName: 'tokenURI',
    args: [agentId],
  });
}

export async function fetchRegistration(uri: string): Promise<AgentRegistration | null> {
  try {
    const url = uri.startsWith('ipfs://')
      ? `https://ipfs.io/ipfs/${uri.slice(7)}`
      : uri;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const json = (await res.json()) as AgentRegistration;
    return json?.name ? json : null;
  } catch {
    return null;
  }
}

/**
 * List agent IDs from the Identity Registry.
 * Strategy:
 *  1. Try ERC-721 Enumerable (totalSupply + tokenByIndex)
 *  2. If that fails, scan a range of known IDs by trying tokenURI on each
 *     The KNOWN_AGENT_IDS env or default range covers recently registered agents.
 */
export async function listAgentIds(maxAgents = 50): Promise<bigint[]> {
  // Strategy 1: ERC-721 Enumerable
  try {
    const total = await getTotalSupply();
    const count = Number(total > BigInt(maxAgents) ? maxAgents : total);
    const ids: bigint[] = [];
    for (let i = 0; i < count; i++) {
      try {
        const id = await getAgentIdByIndex(i);
        ids.push(id);
      } catch {
        break;
      }
    }
    if (ids.length > 0) return ids;
  } catch {
    // Enumerable not supported or RPC error — fall through to Strategy 2
  }

  // Strategy 2: Scan known ID range by probing tokenURI
  // Use KNOWN_AGENT_IDS env (comma-separated) or scan a range
  const knownIds = process.env.KNOWN_AGENT_IDS;
  if (knownIds) {
    return knownIds.split(',').map((s) => BigInt(s.trim()));
  }

  // Scan a range — look for IDs 1..maxAgents and also recent IDs (60-100)
  console.log('  ⚡ Enumerable not supported — scanning ID range...');
  const ids: bigint[] = [];
  const ranges = [
    ...Array.from({ length: 20 }, (_, i) => BigInt(i + 1)),  // 1-20
    ...Array.from({ length: 50 }, (_, i) => BigInt(i + 50)),  // 50-99
  ];

  for (const id of ranges) {
    try {
      await getAgentURI(id); // if this succeeds, the ID exists
      ids.push(id);
    } catch {
      // ID doesn't exist, skip
    }
    if (ids.length >= maxAgents) break;
  }

  return ids;
}
