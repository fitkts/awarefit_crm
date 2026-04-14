{
  "mcpServers": {
    "prisma": {
      "command": "npx",
      "args": ["-y", "prisma-mcp"],
      "env": { "DATABASE_URL": "file:./dev.db" }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src", "./prisma"]
    }
  }
}

