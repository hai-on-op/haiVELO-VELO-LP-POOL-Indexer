# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/lib ./lib

# Copy ABI for runtime
COPY --from=builder /app/abi ./abi

# Copy db migrations
COPY --from=builder /app/db ./db

# Copy GraphQL schema (required by squid-graphql-server)
COPY --from=builder /app/schema.graphql ./schema.graphql

# Default to running the indexer
CMD ["node", "lib/main.js"]
