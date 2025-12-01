import "dotenv/config";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import { processor, POOL_ADDRESS } from "./processor";
import * as poolAbi from "./abi/pool";
import {
  Pool,
  SwapEvent,
  MintEvent,
  BurnEvent,
  SyncEvent,
  FeesEvent,
  ClaimEvent,
  TransferEvent,
  ApprovalEvent,
} from "./model";

processor.run(new TypeormDatabase({ supportHotBlocks: true }), async (ctx) => {
  // Batch arrays for bulk inserts
  const swapEvents: SwapEvent[] = [];
  const mintEvents: MintEvent[] = [];
  const burnEvents: BurnEvent[] = [];
  const syncEvents: SyncEvent[] = [];
  const feesEvents: FeesEvent[] = [];
  const claimEvents: ClaimEvent[] = [];
  const transferEvents: TransferEvent[] = [];
  const approvalEvents: ApprovalEvent[] = [];

  // Pool stats counters
  let swapCount = 0n;
  let mintCount = 0n;
  let burnCount = 0n;
  let claimCount = 0n;
  let feesCount = 0n;
  let lastReserve0 = 0n;
  let lastReserve1 = 0n;
  let lastTimestamp = new Date();

  for (const block of ctx.blocks) {
    const timestamp = new Date(block.header.timestamp);

    for (const log of block.logs) {
      if (log.address !== POOL_ADDRESS) continue;

      const eventId = `${log.transactionHash}-${log.logIndex}`;

      // Handle Swap event
      if (log.topics[0] === poolAbi.events.Swap.topic) {
        const decoded = poolAbi.events.Swap.decode(log);
        swapEvents.push(
          new SwapEvent({
            id: eventId,
            txHash: log.transactionHash,
            blockNumber: block.header.height,
            logIndex: log.logIndex,
            timestamp,
            sender: decoded.sender.toLowerCase(),
            to: decoded.to.toLowerCase(),
            amount0In: decoded.amount0In,
            amount1In: decoded.amount1In,
            amount0Out: decoded.amount0Out,
            amount1Out: decoded.amount1Out,
          })
        );
        swapCount++;
      }

      // Handle Mint event
      else if (log.topics[0] === poolAbi.events.Mint.topic) {
        const decoded = poolAbi.events.Mint.decode(log);
        mintEvents.push(
          new MintEvent({
            id: eventId,
            txHash: log.transactionHash,
            blockNumber: block.header.height,
            logIndex: log.logIndex,
            timestamp,
            sender: decoded.sender.toLowerCase(),
            amount0: decoded.amount0,
            amount1: decoded.amount1,
          })
        );
        mintCount++;
      }

      // Handle Burn event
      else if (log.topics[0] === poolAbi.events.Burn.topic) {
        const decoded = poolAbi.events.Burn.decode(log);
        burnEvents.push(
          new BurnEvent({
            id: eventId,
            txHash: log.transactionHash,
            blockNumber: block.header.height,
            logIndex: log.logIndex,
            timestamp,
            sender: decoded.sender.toLowerCase(),
            to: decoded.to.toLowerCase(),
            amount0: decoded.amount0,
            amount1: decoded.amount1,
          })
        );
        burnCount++;
      }

      // Handle Sync event
      else if (log.topics[0] === poolAbi.events.Sync.topic) {
        const decoded = poolAbi.events.Sync.decode(log);
        syncEvents.push(
          new SyncEvent({
            id: eventId,
            txHash: log.transactionHash,
            blockNumber: block.header.height,
            logIndex: log.logIndex,
            timestamp,
            reserve0: decoded.reserve0,
            reserve1: decoded.reserve1,
          })
        );
        lastReserve0 = decoded.reserve0;
        lastReserve1 = decoded.reserve1;
      }

      // Handle Fees event
      else if (log.topics[0] === poolAbi.events.Fees.topic) {
        const decoded = poolAbi.events.Fees.decode(log);
        feesEvents.push(
          new FeesEvent({
            id: eventId,
            txHash: log.transactionHash,
            blockNumber: block.header.height,
            logIndex: log.logIndex,
            timestamp,
            sender: decoded.sender.toLowerCase(),
            amount0: decoded.amount0,
            amount1: decoded.amount1,
          })
        );
        feesCount++;
      }

      // Handle Claim event
      else if (log.topics[0] === poolAbi.events.Claim.topic) {
        const decoded = poolAbi.events.Claim.decode(log);
        claimEvents.push(
          new ClaimEvent({
            id: eventId,
            txHash: log.transactionHash,
            blockNumber: block.header.height,
            logIndex: log.logIndex,
            timestamp,
            sender: decoded.sender.toLowerCase(),
            recipient: decoded.recipient.toLowerCase(),
            amount0: decoded.amount0,
            amount1: decoded.amount1,
          })
        );
        claimCount++;
      }

      // Handle Transfer event
      else if (log.topics[0] === poolAbi.events.Transfer.topic) {
        const decoded = poolAbi.events.Transfer.decode(log);
        transferEvents.push(
          new TransferEvent({
            id: eventId,
            txHash: log.transactionHash,
            blockNumber: block.header.height,
            logIndex: log.logIndex,
            timestamp,
            from: decoded.from.toLowerCase(),
            to: decoded.to.toLowerCase(),
            amount: decoded.amount,
          })
        );
      }

      // Handle Approval event
      else if (log.topics[0] === poolAbi.events.Approval.topic) {
        const decoded = poolAbi.events.Approval.decode(log);
        approvalEvents.push(
          new ApprovalEvent({
            id: eventId,
            txHash: log.transactionHash,
            blockNumber: block.header.height,
            logIndex: log.logIndex,
            timestamp,
            owner: decoded.owner.toLowerCase(),
            spender: decoded.spender.toLowerCase(),
            amount: decoded.amount,
          })
        );
      }

      lastTimestamp = timestamp;
    }
  }

  // Bulk insert all events
  await ctx.store.insert(swapEvents);
  await ctx.store.insert(mintEvents);
  await ctx.store.insert(burnEvents);
  await ctx.store.insert(syncEvents);
  await ctx.store.insert(feesEvents);
  await ctx.store.insert(claimEvents);
  await ctx.store.insert(transferEvents);
  await ctx.store.insert(approvalEvents);

  // Update pool aggregate entity
  if (
    swapCount > 0 ||
    mintCount > 0 ||
    burnCount > 0 ||
    claimCount > 0 ||
    feesCount > 0 ||
    lastReserve0 > 0
  ) {
    let pool = await ctx.store.get(Pool, POOL_ADDRESS);

    if (!pool) {
      pool = new Pool({
        id: POOL_ADDRESS,
        address: POOL_ADDRESS,
        token0: "", // Will be populated if needed
        token1: "",
        reserve0: 0n,
        reserve1: 0n,
        totalSupply: 0n,
        totalSwapCount: 0n,
        totalMintCount: 0n,
        totalBurnCount: 0n,
        totalClaimCount: 0n,
        totalFeesCount: 0n,
        createdAt: lastTimestamp,
        updatedAt: lastTimestamp,
      });
    }

    pool.totalSwapCount += swapCount;
    pool.totalMintCount += mintCount;
    pool.totalBurnCount += burnCount;
    pool.totalClaimCount += claimCount;
    pool.totalFeesCount += feesCount;

    if (lastReserve0 > 0) {
      pool.reserve0 = lastReserve0;
      pool.reserve1 = lastReserve1;
    }

    pool.updatedAt = lastTimestamp;

    await ctx.store.upsert(pool);
  }

  ctx.log.info(
    `Processed ${ctx.blocks.length} blocks: ${swapEvents.length} swaps, ${mintEvents.length} mints, ${burnEvents.length} burns, ${syncEvents.length} syncs`
  );
});


