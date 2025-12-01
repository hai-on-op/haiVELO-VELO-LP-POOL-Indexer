import { EvmBatchProcessor } from "@subsquid/evm-processor";
import * as poolAbi from "./abi/pool";

// Velodrome haiVELO pool contract address
export const POOL_ADDRESS = "0x5535Cdc333FC8f08f6183e7064202C3917E9346C".toLowerCase();

// Contract deployment block (approximate)
const START_BLOCK = 141576327;

export const processor = new EvmBatchProcessor()
  .setGateway("https://v2.archive.subsquid.io/network/optimism-mainnet")
  .setRpcEndpoint({
    url: process.env.RPC_OPTIMISM_HTTP || "https://mainnet.optimism.io",
    rateLimit: 10,
  })
  .setFinalityConfirmation(75)
  .setBlockRange({ from: START_BLOCK })
  .addLog({
    address: [POOL_ADDRESS],
    topic0: [
      poolAbi.events.Swap.topic,
      poolAbi.events.Mint.topic,
      poolAbi.events.Burn.topic,
      poolAbi.events.Sync.topic,
      poolAbi.events.Fees.topic,
      poolAbi.events.Claim.topic,
      poolAbi.events.Transfer.topic,
      poolAbi.events.Approval.topic,
    ],
  })
  .setFields({
    log: {
      transactionHash: true,
      topics: true,
      data: true,
    },
    block: {
      timestamp: true,
    },
  });


