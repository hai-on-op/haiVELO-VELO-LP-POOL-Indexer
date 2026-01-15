module.exports = {
  apps: [
    {
      name: "haivelo-indexer",
      script: "lib/main.js",
      cwd: "/opt/haivelo-pool-graph",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      // Load from .env file
      env_file: ".env",
    },
    {
      name: "haivelo-graphql",
      script: "node_modules/.bin/squid-graphql-server",
      cwd: "/opt/haivelo-pool-graph",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
      env_file: ".env",
    },
  ],
};
