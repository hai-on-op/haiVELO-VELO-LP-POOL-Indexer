import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    Approval: event("0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925", "Approval(address,address,uint256)", {"owner": indexed(p.address), "spender": indexed(p.address), "amount": p.uint256}),
    Burn: event("0x5d624aa9c148153ab3446c1b154f660ee7701e549fe9b62dab7171b1c80e6fa2", "Burn(address,address,uint256,uint256)", {"sender": indexed(p.address), "to": indexed(p.address), "amount0": p.uint256, "amount1": p.uint256}),
    Claim: event("0x865ca08d59f5cb456e85cd2f7ef63664ea4f73327414e9d8152c4158b0e94645", "Claim(address,address,uint256,uint256)", {"sender": indexed(p.address), "recipient": indexed(p.address), "amount0": p.uint256, "amount1": p.uint256}),
    Fees: event("0x112c256902bf554b6ed882d2936687aaeb4225e8cd5b51303c90ca6cf43a8602", "Fees(address,uint256,uint256)", {"sender": indexed(p.address), "amount0": p.uint256, "amount1": p.uint256}),
    Mint: event("0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f", "Mint(address,uint256,uint256)", {"sender": indexed(p.address), "amount0": p.uint256, "amount1": p.uint256}),
    Swap: event("0xb3e2773606abfd36b5bd91394b3a54d1398336c65005baf7bf7a05efeffaf75b", "Swap(address,address,uint256,uint256,uint256,uint256)", {"sender": indexed(p.address), "to": indexed(p.address), "amount0In": p.uint256, "amount1In": p.uint256, "amount0Out": p.uint256, "amount1Out": p.uint256}),
    Sync: event("0xcf2aa50876cdfbb541206f89af0ee78d44a2abf8d328e37fa4917f982149848a", "Sync(uint256,uint256)", {"reserve0": p.uint256, "reserve1": p.uint256}),
    Transfer: event("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "Transfer(address,address,uint256)", {"from": indexed(p.address), "to": indexed(p.address), "amount": p.uint256}),
}

export class Contract extends ContractBase {
}

/// Event types
export type ApprovalEventArgs = EParams<typeof events.Approval>
export type BurnEventArgs = EParams<typeof events.Burn>
export type ClaimEventArgs = EParams<typeof events.Claim>
export type FeesEventArgs = EParams<typeof events.Fees>
export type MintEventArgs = EParams<typeof events.Mint>
export type SwapEventArgs = EParams<typeof events.Swap>
export type SyncEventArgs = EParams<typeof events.Sync>
export type TransferEventArgs = EParams<typeof events.Transfer>
