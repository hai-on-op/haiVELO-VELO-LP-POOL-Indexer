module.exports = {
  apps: [
    {
      name: "haivelo-indexer",
      script: "lib/main.js",
      cwd: "/var/www/haiVELO-VELO-LP-POOL-Indexer",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        // Accept self-signed SSL certificates (if your DB uses one)
        NODE_TLS_REJECT_UNAUTHORIZED: "0",
      },
      // Load from .env file
      env_file: ".env",
    },
    {
      name: "haivelo-graphql",
      script: "node_modules/.bin/squid-graphql-server",
      cwd: "/var/www/haiVELO-VELO-LP-POOL-Indexer",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        NODE_TLS_REJECT_UNAUTHORIZED: "0",
      },
      env_file: ".env",
    },
  ],
};
