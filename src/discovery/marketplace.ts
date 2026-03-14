import * as identity from './identity.js';
import * as reputation from './reputation.js';
import type { AgentRegistration } from './identity.js';

export interface MarketplaceAgent {
  agentId: bigint;
  name: string;
  description?: string;
  endpoint?: string;
  reputationScore: number;
  capability?: string;
  registration: AgentRegistration | null;
}

/**
 * Infer agent capability from registration metadata (name, description, capability field).
 */
function inferCapability(registration: AgentRegistration): string {
  const text = [
    registration.name,
    registration.description,
    (registration as any).capability,
    (registration as any).metadata?.agentType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (text.includes('research')) return 'research';
  if (
    text.includes('statistic') ||
    text.includes('stats') ||
    text.includes('analytics') ||
    text.includes('statistical-analytics')
  )
    return 'statistical-analytics';

  return 'unknown';
}

/**
 * List agents from ERC-8004 Identity registry, attach reputation, filter by x402Support, sort by highest reputation.
 * clientAddresses: non-empty list for getSummary (e.g. orchestrator wallet or known clients).
 */
export async function listMarketplaceAgents(
  clientAddresses: `0x${string}`[],
  maxAgents = 20
): Promise<MarketplaceAgent[]> {
  const ids = await identity.listAgentIds(maxAgents);
  const agents: MarketplaceAgent[] = [];

  for (const agentId of ids) {
    let uri: string;
    try {
      uri = await identity.getAgentURI(agentId);
    } catch {
      continue;
    }

    const registration = await identity.fetchRegistration(uri);
    if (!registration) continue;
    if (registration.x402Support === false) continue;

    const endpoint = registration.services?.find(
      (s) => s.name === 'web' || s.name === 'A2A' || s.name === 'MCP' || s.name === 'OASF'
    )?.endpoint;

    let reputationScore = 0;
    try {
      const summary = await reputation.getAgentSummary(agentId, clientAddresses);
      reputationScore = reputation.summaryToScore(
        summary.summaryValue,
        summary.summaryValueDecimals
      );
    } catch {
      // no feedback yet
    }

    agents.push({
      agentId,
      name: registration.name ?? `Agent #${agentId}`,
      description: registration.description,
      endpoint,
      reputationScore,
      capability: inferCapability(registration),
      registration,
    });
  }

  agents.sort((a, b) => b.reputationScore - a.reputationScore);
  return agents;
}
