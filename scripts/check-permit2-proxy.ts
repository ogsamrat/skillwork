import 'dotenv/config';
import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';

const PERMIT2_PROXY = '0x402085c248EeA27D92E8b30b2C58ed07f9E20001' as const;
const RPC_URL = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

async function main() {
  const c = createPublicClient({ chain: avalancheFuji, transport: http(RPC_URL) });
  
  console.log(`Checking Permit2 proxy at ${PERMIT2_PROXY} on Fuji...`);
  const code = await c.getCode({ address: PERMIT2_PROXY });
  
  if (code && code !== '0x') {
    console.log(`✅ Contract EXISTS! Code length: ${(code.length - 2) / 2} bytes`);
  } else {
    console.log(`❌ No contract deployed at this address on Fuji`);
  }
}
main().catch(console.error);
