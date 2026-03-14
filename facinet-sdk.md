FACINET
EST. 2025
[Home](/)
[API](/api)
[Facilitator](/facilitator)
[Explorer](/explorer)
[Chain](/chain)
[Institution](/institution)
[Docs](/docs)
CONNECT WALLET
NET: ACTIVE
TPS: 0

# Facinet SDK

Add gasless USDC payments to any app in minutes. Paywall APIs, process payments, and let facilitators handle the gas.

`npm install facinet-sdk`
v0.2.3
[Starter Kit](https://facinet-starter-kit.vercel.app/)

## Quick Start

Install

```
npm install facinet-sdk
```

Basic Payment

```
import { Facinet } from 'facinet-sdk'

const facinet = new Facinet({ network: 'avalanche-fuji' })

// Pay USDC — facilitator pays gas
const result = await facinet.pay({
  amount: '1.00',
  recipient: '0xRecipient...',
})

console.log('TX:', result.txHash)
```

## Paywall Middleware

Charge USDC for API access with one line of code. Returns HTTP 402 Payment Required when no payment is provided, automatically verifies payments when included.

Express.js

```
import { paywall } from 'facinet-sdk'

// Charge 0.10 USDC per request
app.get('/api/premium', paywall({
  amount: '0.10',
  recipient: '0xYourWallet...',
}), (req, res) => {
  // req.x402 contains payment proof
  res.json({ data: 'premium content' })
})
```

Next.js

```
import { paywallNextjs } from 'facinet-sdk'

export const GET = paywallNextjs({
  amount: '0.10',
  recipient: '0xYourWallet...',
})(async (req) => {
  return Response.json({ data: 'premium content' })
})
```

## Gasless API

Make any on-chain transaction gasless with a single API call. Your users never pay gas — Facinet facilitators handle it. Each API key includes 1,000 calls.

Usage — Single API Call

```
curl -X POST https://facinet.vercel.app/api/v1/execute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: fk_your_api_key_here" \
  -d '{
    "network": "avalanche-fuji",
    "contractAddress": "0xYourContract...",
    "functionName": "mint",
    "abi": [{"inputs":[...],"name":"mint","outputs":[],"type":"function"}],
    "functionArgs": ["0xRecipient", 1]
  }'
```

Response

```
{
  "success": true,
  "txHash": "0xabc123...",
  "network": "avalanche-fuji",
  "contractAddress": "0xYourContract...",
  "functionName": "mint",
  "gasUsed": "52341",
  "callsUsed": 1,
  "callsRemaining": 999
}
```

### Connect Wallet

Connect to purchase an API key or view your existing keys

Connect Wallet

## How x402 Protocol Works

01

### Client Requests API

Client calls your paywalled endpoint. No payment header? Server returns HTTP 402 with payment requirements (amount, recipient, network).

02

### User Signs Authorization

Client signs an ERC-3009 authorization off-chain (no gas). This gives permission to transfer USDC — user never sends a transaction themselves.

03

### Facilitator Settles

A Facinet facilitator executes the USDC transfer on-chain, paying gas. Client retries the API with payment proof. Server verifies and responds.

## SDK Reference

`new Facinet({ network })`
Initialize SDK for a specific chain
`facinet.pay({ amount, recipient })`
Gasless USDC payment via facilitator
`facinet.executeContract({ contractAddress, functionName, abi, functionArgs })`
Execute any contract call through facilitator
`facinet.getFacilitators()`
List active facilitators on the network
`facinet.selectRandomFacilitator()`
Pick a random active facilitator
`paywall({ amount, recipient })`
Express middleware — returns 402, verifies payments
`paywallNextjs({ amount, recipient })`
Next.js wrapper — same as paywall for API routes

## CLI Commands

CLI Commands

```
# Install globally
npm install -g facinet-sdk

# Make a payment
facinet pay --amount 1.00 --to 0xRecipient...

# List facilitators
facinet facilitator list

# Check facilitator status
facinet facilitator status
```

## Supported Networks

Avalanche Fuji
Chain
43113
Settlement Chain
Ethereum Sepolia
Chain
11155111
Base Sepolia
Chain
84532
Polygon Amoy
Chain
80002
Arbitrum Sepolia
Chain
421614
Optimism Sepolia
Chain
11155420
Monad Testnet
Chain
10143

## Run a Facilitator

Facilitators are the backbone of Facinet. They execute on-chain transactions and pay gas fees on behalf of users, earning fees for every payment they process.

→
Register with 1 USDC on Avalanche Fuji
→
Fund wallet with at least 1 AVAX for gas
→
Earn fees on every payment you process
→
On-chain identity via ERC-8004 NFT

## Core Standards

### x402 Protocol

HTTP 402 Payment Required standard. APIs return payment requirements, clients pay, facilitators settle on-chain.

### ERC-3009

Gasless USDC transfers via off-chain signatures. Users sign authorizations, facilitators execute TransferWithAuthorization.

### ERC-8004

On-chain facilitator identity as ERC-721 NFTs. Decentralized reputation with feedback scores 0-100.

### AES-256-GCM

Dual-layer encryption for facilitator keys. User password + system master key, PBKDF2 with 100k iterations.

## API Endpoints

POST
`/api/x402/verify`
Verify a payment authorization
POST
`/api/x402/settle`
Settle a verified payment on-chain
POST
`/api/x402/execute-contract`
Execute arbitrary contract call
GET
`/api/facilitator/list`
List all facilitators
POST
`/api/facilitator/create`
Register a new facilitator
GET
`/api/stats/network`
Get real-time network statistics
GET
`/api/explorer/logs`
Get recent transaction logs
GET
`/api/demo/weather`
Demo paywalled endpoint (returns 402)
FACINET
V0.2.3
RENDERING
FRAME: INF


Table of Contents
Overview
Features
Installation
Quick Start
API Reference
Examples
CLI Usage
Configuration
TypeScript Support
Error Handling
Development
Overview
Facinet is a decentralized facilitator network that enables gasless transactions on multiple blockchain networks. Users sign transaction authorizations off-chain, and facilitators execute them on-chain while paying gas fees.

What Facinet Can Do
✅ USDC Payments - Gasless ERC-3009 USDC transfers
✅ Arbitrary Contract Calls - Execute any smart contract function (registry.register, transferFrom, etc.)
✅ Multichain Support - 7 supported testnet networks
✅ Network-Aware Selection - Automatically selects facilitators for your network
✅ EIP-712 Meta-Transactions - Support for signed meta-transactions

Features
🚀 Gasless Transactions - Users sign, facilitators pay gas
🌐 Multichain - Support for 7 testnet networks
🔒 Secure - EIP-712 typed data signing
📦 TypeScript - Full type definitions included
🎯 Network-Aware - Automatic facilitator filtering by network
⚡ Simple API - Easy-to-use SDK and CLI
Installation
As a Library (SDK)
npm install facinet
As a CLI Tool
npm install -g facinet
Requirements
Node.js: >= 18.0.0
npm or yarn
Quick Start
Browser (MetaMask)
import { Facinet } from 'facinet';

// Initialize for Ethereum Sepolia (network is REQUIRED)
const facinet = new Facinet({
  network: 'ethereum-sepolia', // Must specify network!
});

// Make a gasless USDC payment
const result = await facinet.pay({
  amount: '1',                              // 1 USDC
  recipient: '0xYourMerchantAddress',       // Your wallet address
});

console.log('Payment successful!', result.txHash);
console.log('Processed by:', result.facilitator.name);
Node.js (Private Key)
import { Facinet } from 'facinet';

const facinet = new Facinet({
  privateKey: process.env.PRIVATE_KEY,
  network: 'base-sepolia',
});

const result = await facinet.pay({
  amount: '5',
  recipient: '0xYourMerchantAddress',
});

console.log('Transaction:', result.txHash);
Execute Contract Call
import { Facinet } from 'facinet';

const facinet = new Facinet({
  network: 'ethereum-sepolia',
});

// Execute arbitrary contract call (e.g., 8004 registry)
const result = await facinet.executeContract({
  contractAddress: '0x...',              // Your contract address
  functionName: 'register',             // Function to call
  functionArgs: ['https://example.com'], // Function arguments
  abi: registryABI,                     // Contract ABI
});

console.log('Contract call successful!', result.txHash);
API Reference
Facinet Class
Constructor
new Facinet(config?: FacinetConfig)
Parameters:

Parameter	Type	Required	Default	Description
apiUrl	string	No	'https://facinet.vercel.app'	API endpoint URL
privateKey	string	No	-	Private key for signing (Node.js only)
network	NetworkName	Yes	-	Network to use (must be specified)
rpcUrl	string	No	-	Custom RPC URL
Network Options:

'avalanche-fuji' (Chain ID: 43113)
'ethereum-sepolia' (Chain ID: 11155111)
'base-sepolia' (Chain ID: 84532)
'polygon-amoy' (Chain ID: 80002)
'arbitrum-sepolia' (Chain ID: 421614)
'monad-testnet' (Chain ID: 10143)
'optimism-sepolia' (Chain ID: 11155420)
Legacy Aliases (backwards compatible):

'avalanche' → 'avalanche-fuji'
'ethereum' → 'ethereum-sepolia'
'base' → 'base-sepolia'
'polygon' → 'polygon-amoy'
'arbitrum' → 'arbitrum-sepolia'
'monad' → 'monad-testnet'
Methods
pay(params: PaymentParams): Promise<PaymentResult>
Make a gasless USDC payment via ERC-3009.

Parameters:

interface PaymentParams {
  amount: string;                    // Amount in USDC (e.g., '1')
  recipient: `0x${string}`;         // Recipient address
  payerAddress?: `0x${string}`;     // Optional: Payer address (uses wallet if not provided)
}
Returns:

interface PaymentResult {
  success: boolean;
  txHash: string;
  facilitator: {
    id: string;
    name: string;
    wallet: string;
  };
  payment: {
    from: string;
    to: string;
    amount: string;
    network: string;
  };
}
Example:

const result = await facinet.pay({
  amount: '1',
  recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
});

console.log(result.txHash);              // Transaction hash
console.log(result.facilitator.name);    // Facilitator name
console.log(result.payment.network);     // Network used
executeContract(params: ExecuteContractParams): Promise<ExecuteContractResult>
Execute an arbitrary smart contract call. Facilitator pays gas fees.

Parameters:

interface ExecuteContractParams {
  contractAddress: `0x${string}`;    // Contract address to call
  functionName: string;              // Function name (e.g., 'register')
  functionArgs: any[];               // Function arguments array
  abi: any[];                        // Contract ABI (required)
  value?: string;                    // Optional: Native token value (for payable functions)
  signTypedData?: {                  // Optional: EIP-712 signature for meta-transactions
    domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: `0x${string}`;
    };
    types: Record<string, any[]>;
    message: any;
  };
}
Returns:

interface ExecuteContractResult {
  success: boolean;
  txHash: string;
  facilitator: {
    id: string;
    name: string;
    wallet: string;
  };
  contract: {
    address: string;
    functionName: string;
    network: string;
  };
  gasUsed?: string;
  gasSpent?: string;
}
Example:

// Register an agent on 8004 registry
const registryABI = [
  {
    inputs: [{ name: 'agentUrl', type: 'string' }],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const result = await facinet.executeContract({
  contractAddress: '0x8004RegistryAddress',  // Your 8004 registry address
  functionName: 'register',
  functionArgs: ['https://example.com/agent'],
  abi: registryABI,
});

console.log('Agent registered!', result.txHash);
getFacilitators(): Promise<Facilitator[]>
Get all active facilitators for the current network.

Returns:

interface Facilitator {
  id: string;
  name: string;
  facilitatorWallet: string;
  paymentRecipient: string;
  status: 'active' | 'inactive' | 'needs_funding';
  totalPayments: number;
  network?: string;
  chainId?: number;
}
Example:

const facilitators = await facinet.getFacilitators();

facilitators.forEach(fac => {
  console.log(`${fac.name} (${fac.id})`);
  console.log(`  Network: ${fac.network}`);
  console.log(`  Status: ${fac.status}`);
});
selectRandomFacilitator(): Promise<Facilitator>
Select a random active facilitator for the current network.

Returns: Facilitator

Example:

const facilitator = await facinet.selectRandomFacilitator();
console.log('Selected:', facilitator.name);
getChain(): ChainConfig
Get the current chain configuration.

Returns:

interface ChainConfig {
  name: string;
  displayName: string;
  chainId: number;
  rpcUrl: string;
  usdcAddress: `0x${string}`;
  usdcDecimals: number;
  gasToken: string;
  blockExplorer: string;
  erc3009DomainName: string;
  erc3009DomainVersion: string;
}
Static Methods
Facinet.getSupportedChains(): ChainConfig[]
Get all supported chain configurations.

Example:

const chains = Facinet.getSupportedChains();
chains.forEach(chain => {
  console.log(`${chain.displayName} (${chain.chainId})`);
});
Facinet.getSupportedNetworks(): string[]
Get all supported network names.

Example:

const networks = Facinet.getSupportedNetworks();
// ['avalanche-fuji', 'ethereum-sepolia', 'base-sepolia', ...]
Facinet.quickPay(params): Promise<PaymentResult>
Quick payment helper (static method).

Example:

await Facinet.quickPay({
  amount: '1',
  recipient: '0x...',
  privateKey: process.env.PRIVATE_KEY,
  network: 'base-sepolia',
});
Examples
Network-Specific Contract Addresses
When using Facinet with contracts like the 8004 registry, you can configure network-specific addresses:

import { Facinet } from 'facinet';

// Define your contract addresses per network
const CONTRACT_ADDRESSES = {
  'ethereum-sepolia': '0x...',  // 8004 registry on Ethereum Sepolia
  'base-sepolia': '0x...',      // 8004 registry on Base Sepolia
  'polygon-amoy': '0x...',      // 8004 registry on Polygon Amoy
  // ... other networks
};

// Initialize SDK for a specific network
const facinet = new Facinet({
  network: 'ethereum-sepolia',
});

// Use network-specific contract address
const registryAddress = CONTRACT_ADDRESSES[facinet.getChain().name];

// Execute contract call
const result = await facinet.executeContract({
  contractAddress: registryAddress,
  functionName: 'register',
  functionArgs: ['https://example.com/agent'],
  abi: registryABI,
});
8004 Registry Example
import { Facinet } from 'facinet';

// 8004 Registry ABI (simplified)
const REGISTRY_ABI = [
  {
    inputs: [{ name: 'agentUrl', type: 'string' }],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'uri', type: 'string' },
    ],
    name: 'setAgentURI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Network-specific registry addresses
const REGISTRY_ADDRESSES = {
  'ethereum-sepolia': '0xYourRegistryAddressOnSepolia',
  'base-sepolia': '0xYourRegistryAddressOnBase',
  'polygon-amoy': '0xYourRegistryAddressOnPolygon',
};

async function registerAgent(network: string, agentUrl: string) {
  const facinet = new Facinet({ network });
  const registryAddress = REGISTRY_ADDRESSES[network];

  const result = await facinet.executeContract({
    contractAddress: registryAddress,
    functionName: 'register',
    functionArgs: [agentUrl],
    abi: REGISTRY_ABI,
  });

  return result.txHash;
}

// Usage
await registerAgent('ethereum-sepolia', 'https://example.com/agent');
EIP-712 Meta-Transaction Example
import { Facinet } from 'facinet';

const facinet = new Facinet({
  network: 'ethereum-sepolia',
});

// Sign EIP-712 typed data for meta-transaction
const result = await facinet.executeContract({
  contractAddress: '0x...',
  functionName: 'setAgentWallet',
  functionArgs: [tokenId, walletAddress],
  abi: registryABI,
  signTypedData: {
    domain: {
      name: 'AgentRegistry',
      version: '1',
      chainId: 11155111,
      verifyingContract: '0x...',
    },
    types: {
      SetWallet: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'wallet', type: 'address' },
      ],
    },
    message: {
      tokenId: tokenId,
      wallet: walletAddress,
    },
  },
});
React Hook Example
import { useState } from 'react';
import { Facinet } from 'facinet';

function PaymentButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const facinet = new Facinet({ network: 'base-sepolia' });

      const paymentResult = await facinet.pay({
        amount: '1',
        recipient: '0xYourMerchantAddress',
      });

      setResult(paymentResult);
    } catch (error: any) {
      console.error('Payment failed:', error.message);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay 1 USDC'}
      </button>
      {result && (
        <div>
          <p>Transaction: {result.txHash}</p>
          <p>Facilitator: {result.facilitator.name}</p>
          <p>Network: {result.payment.network}</p>
        </div>
      )}
    </div>
  );
}
CLI Usage
Installation
npm install -g facinet
Commands
Make a Payment
# Pay on specific network (network is required)
facinet pay --amount 1 --to 0xRecipientAddress --network avalanche-fuji
facinet pay --amount 1 --to 0xRecipientAddress --network base-sepolia
facinet pay --amount 1 --to 0xRecipientAddress --network ethereum-sepolia
facinet pay --amount 1 --to 0xRecipientAddress --network polygon-amoy
List Facilitators
# List all active facilitators for configured network
facinet facilitator list

# List facilitators for specific network
facinet facilitator list --network base-sepolia
Check Facilitator Status
facinet facilitator status fac_xyz123
facinet facilitator balance fac_xyz123
Configuration
SDK Configuration
const facinet = new Facinet({
  apiUrl: 'https://facinet.vercel.app',  // Optional: Override API URL
  privateKey: '0x...',                    // Optional: For Node.js
  network: 'base-sepolia',                // REQUIRED: Network selection
  rpcUrl: 'https://...',                  // Optional: Custom RPC
});
CLI Configuration
Facinet CLI stores configuration in ~/.facinet/config.json:

{
  "privateKey": "0x...",
  "address": "0x...",
  "network": "avalanche-fuji",
  "apiUrl": "https://facinet.vercel.app"
}
TypeScript Support
Facinet is written in TypeScript and includes full type definitions:

import type {
  FacinetConfig,
  PaymentParams,
  PaymentResult,
  ExecuteContractParams,
  ExecuteContractResult,
  Facilitator,
  ChainConfig,
} from 'facinet';

const config: FacinetConfig = {
  network: 'base-sepolia',
};

const params: PaymentParams = {
  amount: '1',
  recipient: '0x...',
};

const result: PaymentResult = await facinet.pay(params);
Error Handling
try {
  const facinet = new Facinet({ network: 'base-sepolia' });
  const result = await facinet.pay({
    amount: '1',
    recipient: '0x...',
  });
} catch (error: any) {
  if (error.message.includes('No active facilitators available')) {
    console.error('No active facilitators found for this network');
  } else if (error.message.includes('invalid signature')) {
    console.error('Signature validation failed');
  } else {
    console.error('Payment failed:', error.message);
  }
}
Common Errors:

No active facilitators available - No facilitators registered for the selected network
Invalid contract address format - Contract address is not a valid Ethereum address
Function not found in provided ABI - Function name doesn't exist in the ABI
Contract execution failed - Transaction reverted on-chain
Supported Networks
Network	Network ID	Chain ID	Gas Token	Explorer
Avalanche Fuji	avalanche-fuji	43113	AVAX	testnet.snowtrace.io
Ethereum Sepolia	ethereum-sepolia	11155111	ETH	sepolia.etherscan.io
Base Sepolia	base-sepolia	84532	ETH	sepolia.basescan.org
Polygon Amoy	polygon-amoy	80002	MATIC	amoy.polygonscan.com
Arbitrum Sepolia	arbitrum-sepolia	421614	ETH	sepolia.arbiscan.io
Monad Testnet	monad-testnet	10143	MON	testnet.monadvision.com
Optimism Sepolia	optimism-sepolia	11155420	ETH	sepolia-optimism.etherscan.io
How It Works
Payment Flow (USDC)
Initialize SDK - Create Facinet instance with network selection
Select Facilitator - SDK automatically selects an active facilitator for your network
Sign Authorization - User signs ERC-3009 authorization (gasless!)
Facilitator Executes - Selected facilitator submits transaction and pays gas
Payment Complete - USDC transferred to recipient address
Contract Execution Flow
Initialize SDK - Create Facinet instance with network selection
Select Facilitator - SDK selects an active facilitator for your network
Sign (Optional) - If using EIP-712 meta-transactions, sign typed data
Facilitator Executes - Facilitator calls contract function and pays gas
Transaction Confirmed - Contract call executed on-chain
Network-Aware Facilitator Selection
SDK filters facilitators by network and chainId
Only active facilitators are selected
Facilitators must match the selected network exactly
Random selection from filtered pool
Development
Build from Source
cd facinet-sdk

# Install dependencies
npm install

# Build
npm run build

# Link for local testing
npm link

# Test
facinet --help
Project Structure
facinet-sdk/
├── src/
│   ├── sdk/
│   │   ├── Facinet.ts      # Main SDK class
│   │   └── types.ts        # TypeScript types
│   ├── commands/           # CLI commands
│   ├── utils/              # Utility functions
│   └── index.ts            # CLI entry point
├── dist/                   # Compiled output
└── README.md
Changelog
v2.4.5
✨ Arbitrary Contract Calls - New executeContract() method for executing any smart contract function
🔧 Network-Aware Selection - Strict facilitator filtering by network/chainId
📝 Enhanced Documentation - Complete API reference and examples
🚀 Backend Endpoint - New /api/x402/execute-contract endpoint
v2.4.4
🌐 Optimism Sepolia Support - Added Optimism Sepolia testnet
🔍 Network Filtering - Backend /api/facilitator/list accepts ?network= query param
✅ Strict Filtering - SDK strictly filters facilitators by network (no fallback)
v2.4.0
🌐 Multichain Support - 7 supported testnet networks
🎯 Network-Specific Selection - Automatic facilitator filtering by network
📊 Enhanced Facilitator Info - Network and chainId in facilitator objects
License
MIT © x402 Team

Support
Documentation: GitHub Repository
Issues: GitHub Issues
API Endpoint: https://facinet.vercel.app
Made with ❤️ by the x402 Team