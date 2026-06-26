# mcp-nypl

NYPL Digital Collections MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1102+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search the NYPL Digital Collections collection by keyword. Returns matching items with ids (pass an id to item), titles, creators/sources, dates and links. |
| `item` | Fetch full details for one NYPL Digital Collections item by id — an NYPL item uuid (from search). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "nypl": {
      "url": "https://gateway.pipeworx.io/nypl/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1102+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Nypl data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
