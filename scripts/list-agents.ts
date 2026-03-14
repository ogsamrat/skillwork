/**
 * Test direct tokenURI read on known agentIds 70-73.
 * Also try ownerOf to see if these are valid.
 */
import 'dotenv/config';
import { createPublicClient, http, parseAbi } from 'viem';
import { avalancheFuji } from 'viem/chains';

const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const;
const RPC_URL = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

const abi = parseAbi([
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
]);

async function main() {
  const client = createPublicClient({ chain: avalancheFuji, transport: http(RPC_URL) });

  // Try totalSupply
  try {
    const ts = await client.readContract({ address: IDENTITY_REGISTRY, abi, functionName: 'totalSupply' });
    console.log(`totalSupply: ${ts}`);
  } catch (e: any) {
    console.log(`totalSupply FAILED: ${e.shortMessage || e.message}`);
  }

  // Try balanceOf for our wallet
  try {
    const bal = await client.readContract({ address: IDENTITY_REGISTRY, abi, functionName: 'balanceOf', args: ['0x2666bf1ee7168D451d56cd109664EecA78D3E186'] });
    console.log(`balanceOf(our wallet): ${bal}`);
  } catch (e: any) {
    console.log(`balanceOf FAILED: ${e.shortMessage || e.message}`);
  }

  // Try each ID 66-78
  for (let id = 66; id <= 78; id++) {
    try {
      const uri = await client.readContract({ address: IDENTITY_REGISTRY, abi, functionName: 'tokenURI', args: [BigInt(id)] });
      const owner = await client.readContract({ address: IDENTITY_REGISTRY, abi, functionName: 'ownerOf', args: [BigInt(id)] });
      console.log(`ID ${id}: URI=${uri}  Owner=${owner}`);
    } catch (e: any) {
      console.log(`ID ${id}: ${e.shortMessage || 'not found'}`);
    }
  }
}

main().catch(console.error);
