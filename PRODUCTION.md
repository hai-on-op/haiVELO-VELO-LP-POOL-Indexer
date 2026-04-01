# Production Deployment Guide

This guide walks you through deploying the haiVELO Pool Indexer on a VPS with an existing PostgreSQL database.

---

## Prerequisites

- **VPS** running Ubuntu 20.04+ (or similar Linux distribution)
- **Node.js 20+** installed
- **PostgreSQL 14+** database (already running)
- **PM2** for process management
- **Git** for cloning the repository

---

## Step 1: Install Node.js (if not installed)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

---

## Step 2: Install PM2

```bash
sudo npm install -g pm2
```

---

## Step 3: Clone the Repository

```bash
cd /var/www
git clone https://github.com/hai-on-op/haiVELO-VELO-LP-POOL-Indexer.git
cd haiVELO-VELO-LP-POOL-Indexer
```

---

## Step 4: Install Dependencies

```bash
npm install
```

---

## Step 5: Create Environment Configuration

Create a `.env` file with your database credentials:

```bash
nano .env
```

Add the following content (replace with your actual values):

```bash
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=haivelo_pool
DB_USER=your_database_user
DB_PASS=your_database_password

# Enable SSL for database connection
DB_SSL=true

# Required if your database uses a self-signed SSL certificate
NODE_TLS_REJECT_UNAUTHORIZED=0

# RPC endpoint (optional, but recommended for production)
RPC_OPTIMISM_HTTP=https://mainnet.optimism.io

# GraphQL server port
GQL_PORT=4000
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

---

## Step 6: Create the Database

If you haven't created the database yet:

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create the database
CREATE DATABASE haivelo_pool;

# Create a user (if needed)
CREATE USER indexer_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE haivelo_pool TO indexer_user;

# Exit
\q
```

---

## Step 7: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `lib/` directory.

---

## Step 8: Apply Database Migrations

```bash
npm run migration:apply
```

This creates all the necessary tables in your database.

**Expected output:**
```
applying 1764442645422-Data
```

---

## Step 9: Start the Indexer with PM2

```bash
pm2 start ecosystem.config.js
```

**Expected output:**
```
[PM2] App [haivelo-indexer] launched (1 instances)
[PM2] App [haivelo-graphql] launched (1 instances)
```

---

## Step 10: Verify the Services

### Check PM2 status:
```bash
pm2 status
```

**Expected output:**
```
┌─────┬──────────────────┬─────────────┬──────┬───────────┬──────────┐
│ id  │ name             │ mode        │ ↺    │ status    │ cpu      │
├─────┼──────────────────┼─────────────┼──────┼───────────┼──────────┤
│ 0   │ haivelo-indexer  │ fork        │ 0    │ online    │ 0%       │
│ 1   │ haivelo-graphql  │ fork        │ 0    │ online    │ 0%       │
└─────┴──────────────────┴─────────────┴──────┴───────────┴──────────┘
```

### Check indexer logs:
```bash
pm2 logs haivelo-indexer
```

You should see output like:
```
Processed 100 blocks: 5 swaps, 2 mints, 1 burns, 8 syncs
```

### Check GraphQL server logs:
```bash
pm2 logs haivelo-graphql
```

---

## Step 11: Test the GraphQL API

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ swapEvents(limit: 3, orderBy: blockNumber_DESC) { id blockNumber timestamp } }"}'
```

**Expected response:**
```json
{
  "data": {
    "swapEvents": [
      { "id": "0x...", "blockNumber": 123456, "timestamp": "2024-..." },
      ...
    ]
  }
}
```

---

## Step 12: Enable Auto-Start on Boot

```bash
pm2 save
pm2 startup
```

Follow the instructions output by `pm2 startup` (usually involves running a command with `sudo`).

---

## Managing the Indexer

### View logs
```bash
pm2 logs                    # All logs
pm2 logs haivelo-indexer    # Indexer only
pm2 logs haivelo-graphql    # GraphQL only
```

### Restart services
```bash
pm2 restart all             # Restart both
pm2 restart haivelo-indexer # Restart indexer only
pm2 restart haivelo-graphql # Restart GraphQL only
```

### Stop services
```bash
pm2 stop all
```

### Delete services
```bash
pm2 delete all
```

### Monitor resources
```bash
pm2 monit
```

---

## Updating the Indexer

When you need to update to a new version:

```bash
cd /var/www/haiVELO-VELO-LP-POOL-Indexer

# Pull latest changes
git pull

# Rebuild
npm install
npm run build

# Apply any new migrations
npm run migration:apply

# Restart services
pm2 restart all
```

---

## Exposing the GraphQL API

### Option A: Direct access (not recommended for production)

If you want to access the API from outside the VPS, open port 4000:

```bash
sudo ufw allow 4000
```

Then access at: `http://your-vps-ip:4000/graphql`

### Option B: Nginx reverse proxy (recommended)

Install Nginx:
```bash
sudo apt install nginx
```

Create a configuration file:
```bash
sudo nano /etc/nginx/sites-available/haivelo-graphql
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your VPS IP

    location /graphql {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/haivelo-graphql /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Troubleshooting

### Issue: SSL certificate error
**Error:** `self-signed certificate in certificate chain`

**Solution:** Add to `.env`:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Issue: Database connection refused
**Error:** `ECONNREFUSED`

**Solution:** Check that:
1. PostgreSQL is running: `sudo systemctl status postgresql`
2. Database host/port are correct in `.env`
3. PostgreSQL is listening on the correct interface

### Issue: Indexer keeps restarting
**Solution:** Check logs for errors:
```bash
pm2 logs haivelo-indexer --lines 100
```

### Issue: No data appearing
**Solution:** The indexer starts from block 141,576,327. Initial sync may take time. Check progress in logs:
```bash
pm2 logs haivelo-indexer
```

### Issue: Out of memory
**Solution:** The `ecosystem.config.js` limits memory to 1GB for indexer and 512MB for GraphQL. Adjust if needed:
```javascript
max_memory_restart: "2G",
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS                                  │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │  haivelo-indexer │      │  haivelo-graphql │             │
│  │  (PM2 process)   │      │  (PM2 process)   │             │
│  │                  │      │                  │             │
│  │  Fetches events  │      │  Serves GraphQL  │             │
│  │  from Optimism   │      │  API on :4000    │             │
│  └────────┬─────────┘      └────────┬─────────┘             │
│           │                         │                        │
│           └──────────┬──────────────┘                        │
│                      │                                       │
│                      ▼                                       │
│           ┌──────────────────┐                              │
│           │   PostgreSQL     │                              │
│           │   Database       │                              │
│           └──────────────────┘                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ RPC calls
                      ▼
          ┌──────────────────────┐
          │  Optimism Network    │
          │  (via Subsquid       │
          │   archive + RPC)     │
          └──────────────────────┘
```

---

## GraphQL Playground

Once running, you can access the GraphQL playground at:

```
http://your-vps-ip:4000/graphql
```

### Example Queries

**Get recent swaps:**
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

**Get pool statistics:**
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

**Get mint events by address:**
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

---

## Support

For issues or questions, check:
1. PM2 logs: `pm2 logs`
2. PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*-main.log`
3. Project issues on GitHub

