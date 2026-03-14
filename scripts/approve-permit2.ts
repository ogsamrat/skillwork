/**
 * One-time approval: allow the Permit2 contract to spend your Fuji USDC.
 * This is required for x402 Permit2 payment flow.
 *
 * Usage: npx tsx scripts/approve-permit2.ts
 */
import 'dotenv/config';
import { createPublicClient, createWalletClient, http, parseAbi, maxUint256 } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';

const USDC_FUJI = '0x5425890298aed601595a70AB815c96711a31Bc65' as const;
const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3' as const; // Universal Permit2
const RPC_URL = process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

const erc20Abi = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
]);

async function main() {
  const pk = process.env.EVM_PRIVATE_KEY;
  if (!pk) throw new Error('EVM_PRIVATE_KEY not in .env');

  const account = privateKeyToAccount((pk.startsWith('0x') ? pk : `0x${pk}`) as `0x${string}`);
  const publicClient = createPublicClient({ chain: avalancheFuji, transport: http(RPC_URL) });
  const walletClient = createWalletClient({ account, chain: avalancheFuji, transport: http(RPC_URL) });

  console.log(`Wallet:  ${account.address}`);
  console.log(`USDC:    ${USDC_FUJI}`);
  console.log(`Permit2: ${PERMIT2_ADDRESS}\n`);

  // Check current allowance
  const currentAllowance = await publicClient.readContract({
    address: USDC_FUJI,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account.address, PERMIT2_ADDRESS],
  });
  console.log(`Current Permit2 allowance: ${currentAllowance}`);

  if (currentAllowance > 0n) {
    console.log('✅ Permit2 already approved! No action needed.');
    return;
  }

  // Approve Permit2 to spend max USDC
  console.log('Approving Permit2 to spend USDC (max uint256)...');
  const txHash = await walletClient.writeContract({
    address: USDC_FUJI,
    abi: erc20Abi,
    functionName: 'approve',
    args: [PERMIT2_ADDRESS, maxUint256],
  });

  console.log(`⏳ Waiting for confirmation... txHash: ${txHash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log(`✅ Permit2 approved! Block: ${receipt.blockNumber}`);

  // Verify
  const newAllowance = await publicClient.readContract({
    address: USDC_FUJI,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account.address, PERMIT2_ADDRESS],
  });
  console.log(`New Permit2 allowance: ${newAllowance}`);
}

main().catch(console.error);
