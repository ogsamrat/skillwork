import 'dotenv/config';
import { createPublicClient, http, parseAbi } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const RPC = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
const pk = process.env.EVM_PRIVATE_KEY!;
const account = privateKeyToAccount((pk.startsWith('0x') ? pk : `0x${pk}`) as `0x${string}`);

const USDC_FUJI = '0x5425890298aed601595a70AB815c96711a31Bc65';
const erc20 = parseAbi(['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)']);

async function main() {
  const c = createPublicClient({ chain: avalancheFuji, transport: http(RPC) });
  console.log(`Wallet: ${account.address}`);

  // AVAX balance
  const avax = await c.getBalance({ address: account.address });
  console.log(`AVAX:   ${Number(avax) / 1e18}`);

  // USDC balance
  const usdc = await c.readContract({ address: USDC_FUJI as `0x${string}`, abi: erc20, functionName: 'balanceOf', args: [account.address] });
  console.log(`USDC:   ${Number(usdc) / 1e6}`);
}
main().catch(console.error);
