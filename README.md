# haiVELO Pool Graph

A sqd.ai (Subsquid) indexer for the Velodrome haiVELO pool on Optimism.

**Contract**: `0x5535Cdc333FC8f08f6183e7064202C3917E9346C`

## Events Indexed

All events from the Velodrome pool are indexed:

- **SwapEvent** - Token swaps
- **MintEvent** - Liquidity additions
- **BurnEvent** - Liquidity removals
- **SyncEvent** - Reserve updates
- **FeesEvent** - Fee collections
- **ClaimEvent** - Fee claims by LPs
- **TransferEvent** - LP token transfers
- **ApprovalEvent** - LP token approvals

## Quick Start

### Prerequisites

- Node.js 20+
- Docker

### Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL database
npm run up

# Generate types from schema and ABI
npm run codegen
npm run typegen

# Build
npm run build

# Run migrations
DB_HOST=localhost DB_PORT=23798 DB_NAME=squid DB_USER=postgres DB_PASS=postgres npx squid-typeorm-migration generate
DB_HOST=localhost DB_PORT=23798 DB_NAME=squid DB_USER=postgres DB_PASS=postgres npx squid-typeorm-migration apply
```

### Running

```bash
# Start the indexer
DB_HOST=localhost DB_PORT=23798 DB_NAME=squid DB_USER=postgres DB_PASS=postgres npm run process

# In a separate terminal, start the GraphQL server
DB_HOST=localhost DB_PORT=23798 DB_NAME=squid DB_USER=postgres DB_PASS=postgres npm run serve
```

The GraphQL playground will be available at: http://localhost:4000/graphql

### Stop

```bash
# Stop the database
npm run down
```

## Example Queries

### Get Recent Swaps

```graphql
{
  swapEvents(limit: 10, orderBy: blockNumber_DESC) {
    id
    txHash
    blockNumber
    timestamp
    sender
    to
    amount0In
    amount1In
    amount0Out
    amount1Out
  }
}
```

### Get Mint Events by Address

```graphql
{
  mintEvents(where: { sender_eq: "0x..." }, orderBy: timestamp_DESC) {
    id
    txHash
    timestamp
    amount0
    amount1
  }
}
```

### Get Pool Stats

```graphql
{
  pools {
    id
    address
    reserve0
    reserve1
    totalSwapCount
    totalMintCount
    totalBurnCount
  }
}
```

### Get All Events for a Transaction

```graphql
{
  swapEvents(where: { txHash_eq: "0x..." }) { id amount0In amount1Out }
  syncEvents(where: { txHash_eq: "0x..." }) { id reserve0 reserve1 }
  transferEvents(where: { txHash_eq: "0x..." }) { id from to amount }
}
```

### Filter by Time Range

```graphql
{
  swapEvents(
    where: {
      timestamp_gte: "2024-01-01T00:00:00Z"
      timestamp_lte: "2024-01-31T23:59:59Z"
    }
    orderBy: timestamp_ASC
  ) {
    id
    timestamp
    amount0In
    amount1Out
  }
}
```

## Project Structure

```
├── abi/
│   └── pool.json           # Velodrome pool ABI
├── db/
│   └── migrations/         # Database migrations
├── src/
│   ├── abi/
│   │   └── pool.ts         # Generated ABI types
│   ├── model/
│   │   └── generated/      # Generated entity models
│   ├── main.ts             # Main processor entry point
│   └── processor.ts        # EVM processor configuration
├── schema.graphql          # GraphQL schema
├── docker-compose.yml      # PostgreSQL container
├── package.json
└── tsconfig.json
```

## Configuration

The indexer starts from block 120,000,000. To change this, edit `src/processor.ts`:

```typescript
const START_BLOCK = 120_000_000;
```

## License

MIT


