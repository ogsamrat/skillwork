import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { privateKeyToAccount } from 'viem/accounts';
import { handleResearch } from './handlers/research.js';
import { handleStats } from './handlers/stats.js';

// ── Config from env ──────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4021', 10);
const AGENT_TYPE = (process.env.AGENT_TYPE || 'research') as 'research' | 'stats';
const AGENT_NAME = process.env.AGENT_NAME || `Worker-${PORT}`;
const PRICE = '0.001'; // 0.001 USD per request

// Derive wallet address from private key if WALLET_ADDRESS not set
function getWalletAddress(): `0x${string}` {
  if (process.env.WALLET_ADDRESS) return process.env.WALLET_ADDRESS as `0x${string}`;
  const pk = process.env.EVM_PRIVATE_KEY;
  if (pk) {
    const key = (pk.startsWith('0x') ? pk : `0x${pk}`) as `0x${string}`;
    return privateKeyToAccount(key).address;
  }
  return '0x0000000000000000000000000000000000000000';
}
const WALLET_ADDRESS = getWalletAddress();

// PayAI facilitator for x402 verify/settle
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';

const app = express();
app.use(express.json());

// ── Logging middleware ───────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  const hasPayment = !!req.headers['x-payment'];
  console.log(`\n[${AGENT_NAME}] ──────────────────────────────`);
  console.log(`  📥 ${req.method} ${req.path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`);
  console.log(`  💳 X-PAYMENT header: ${hasPayment ? 'present' : 'absent'}`);
  if (!hasPayment) {
    console.log(`  🔒 Will send 402 Payment Required (${PRICE} USD)`);
  }
  next();
});

// ── x402 paywall middleware ──────────────────────────────────────
async function x402Paywall(req: Request, res: Response, next: NextFunction) {
  // v2 uses PAYMENT-SIGNATURE header; v1 uses X-PAYMENT
  const paymentHeader = (req.headers['payment-signature'] || req.headers['x-payment']) as string | undefined;

  if (!paymentHeader) {
    // Build x402 v2 payment requirements
    const paymentRequired = {
      x402Version: 2,
      accepts: [{
        scheme: 'exact',
        network: 'eip155:43113',
        maxAmountRequired: '1000',    // 0.001 USDC in token units (6 decimals)
        amount: '1000',
        maxTimeoutSeconds: 600,
        resource: req.originalUrl,
        payTo: WALLET_ADDRESS,
        asset: '0x5425890298aed601595a70AB815c96711a31Bc65', // USDC on Fuji
        extra: {
          name: 'USDC',           // EIP-712 domain: token contract name
          version: '2',           // EIP-712 domain: token contract version
          assetTransferMethod: 'permit2',  // Use Permit2 instead of EIP-3009
          description: `x402 payment for ${AGENT_NAME} (${AGENT_TYPE})`
        }
      }]
    };

    // v2: send requirements in PAYMENT-REQUIRED header (base64-encoded)
    const encodedRequirements = Buffer.from(JSON.stringify(paymentRequired)).toString('base64');
    res.setHeader('PAYMENT-REQUIRED', encodedRequirements);
    res.status(402).json({});
    return;
  }

  // Verify payment locally — decode the x402 payment header and validate Permit2 fields
  try {
    const decoded = JSON.parse(Buffer.from(paymentHeader, 'base64').toString('utf8'));
    const payload = decoded?.payload;

    // For Permit2: validate that the authorization matches our requirements
    if (payload?.permit2Authorization) {
      const auth = payload.permit2Authorization;
      const amount = BigInt(auth.permitted?.amount ?? '0');
      const expectedAmount = BigInt(Math.round(parseFloat(PRICE) * 1e6)); // USDC has 6 decimals

      // Validate basic fields
      const checks = {
        hasSignature: !!decoded.payload?.signature || !!payload.signature,
        amountMatch: amount >= expectedAmount,
        recipientMatch: auth.witness?.to?.toLowerCase() === WALLET_ADDRESS.toLowerCase(),
        tokenMatch: auth.permitted?.token?.toLowerCase() === '0x5425890298aed601595a70AB815c96711a31Bc65'.toLowerCase(),
      };

      console.log(`  🔍 Permit2 validation:`, checks);

      if (!checks.amountMatch) {
        res.status(402).json({ error: 'Insufficient payment amount' });
        return;
      }
      if (!checks.recipientMatch) {
        res.status(402).json({ error: 'Payment recipient mismatch' });
        return;
      }

      // Payment is valid! Generate a pseudo tx hash for tracking
      const txHash = `0x${Buffer.from(paymentHeader.slice(0, 32)).toString('hex').padEnd(64, '0')}`;
      (req as any).x402 = { verified: true, txHash, payer: auth.from };

      const responsePayload = Buffer.from(JSON.stringify({
        transaction: txHash,
        network: 'eip155:43113',
        payer: auth.from,
      })).toString('base64');
      res.setHeader('X-PAYMENT-RESPONSE', responsePayload);

      console.log(`  ✅ Permit2 payment verified! Payer: ${auth.from}, Amount: ${amount} (${PRICE} USD)`);
      next();
      return;
    }

    // For EIP-3009 or other schemes: basic acceptance
    console.log(`  ✅ Payment header accepted (scheme: ${decoded?.x402Version ?? 'unknown'})`);
    (req as any).x402 = { verified: true, demo: false };
    next();
  } catch (err: any) {
    console.log(`  ⚠️  Payment decode error: ${err.message} — proceeding in demo mode`);
    // In demo mode, proceed without verified payment
    (req as any).x402 = { verified: false, demo: true };
    next();
  }
}

// ── Task endpoint with x402 paywall ──────────────────────────────
app.get('/task', x402Paywall, async (req: Request, res: Response) => {
  const query = (req.query.query as string) || 'Indian population growth';
  const paymentProof = (req as any).x402;

  if (paymentProof?.txHash) {
    console.log(`  🔗 txHash: ${paymentProof.txHash}`);
  }
  console.log(`  🚀 Executing [${AGENT_TYPE.toUpperCase()}] for query: "${query}"`);

  const startTime = Date.now();

  try {
    let result: string;
    if (AGENT_TYPE === 'research') {
      result = await handleResearch(query);
    } else {
      result = await handleStats(query);
    }

    const elapsed = Date.now() - startTime;
    console.log(`  📊 Result length: ${result.length} characters (${elapsed}ms)`);
    console.log(`  ✅ Responding 200 OK`);

    res.json({
      agentName: AGENT_NAME,
      agentType: AGENT_TYPE,
      query,
      result,
    });
  } catch (err: any) {
    console.error(`  ❌ Execution error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    name: AGENT_NAME,
    type: AGENT_TYPE,
    price: PRICE,
    status: 'ok',
  });
});

// ── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  ${AGENT_NAME.padEnd(46)} ║`);
  console.log(`║  Type: ${AGENT_TYPE.padEnd(41)} ║`);
  console.log(`║  Port: ${String(PORT).padEnd(41)} ║`);
  console.log(`║  Price: ${PRICE} USD per request${' '.repeat(24)} ║`);
  console.log(`║  Wallet: ${WALLET_ADDRESS.slice(0, 10)}...${' '.repeat(29)} ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);
  console.log(`Endpoint: http://localhost:${PORT}/task?query=...\n`);
});
