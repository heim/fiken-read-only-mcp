# fiken-mcp — Claude Code Instructions

## Project overview

Read-only MCP server for the Fiken accounting API. Exposes all Fiken v2 GET endpoints as MCP tools.

## Stack

- TypeScript, ESM (`"type": "module"`)
- `@modelcontextprotocol/sdk` for MCP
- `zod` for schema validation
- `vitest` for tests
- Output compiled to `build/`

## Architecture

```
src/
  index.ts       # Bootstrap: validate env vars, wire transport, connect
  server.ts      # createServer(): instantiate McpServer, register all tools
  client.ts      # FikenClient: HTTP request queue, get(), getPaginated()
  types.ts       # Shared TypeScript types
  utils.ts       # Shared helpers
  tools/         # One file per Fiken resource domain
    index.ts     # Re-exports all register*Tools functions
    invoices.ts  # registerInvoiceTools(server, client)
    ...
  tests/         # Vitest test files
```

## Conventions

### Tool registration
Tools are registered via `registerXxxTools(server, client)` functions in `src/tools/`.
Each tool file exports one register function. All register functions are called in `server.ts`.

### Tool naming
All tools are prefixed with `fiken_`, e.g. `fiken_list_invoices`, `fiken_get_invoice`.

### Error handling
API errors throw `FikenApiError`. Tool handlers let errors propagate — the MCP framework catches them.

### Env var validation
Validate required env vars at startup in `index.ts` and call `process.exit(1)` with a clear message if missing. Do not validate lazily at tool-call time.

### Startup log
After `server.connect(transport)`, write a startup message to stderr:
```ts
process.stderr.write("Fiken MCP server running on stdio\n");
```

### Module imports
Always use `.js` extensions in imports (NodeNext resolution), e.g. `import { X } from "./server.js"`.

### Amounts
Fiken amounts are in øre (integer cents). Document this in tool descriptions where relevant.

## Build & dev

```bash
npm run build      # tsc
npm run dev        # tsx (no build step)
npm test           # vitest run
npm run test:watch # vitest watch
```

## Standards

- Module system: ESM, `NodeNext`, output to `build/`
- `index.ts` has `#!/usr/bin/env node` shebang
- Env vars validated at startup, fail-fast with `process.exit(1)`
- Startup message written to `process.stderr` after connect
- `bin` field in `package.json` pointing to `build/index.js`
- `server.ts` handles all tool registration (not inline in `index.ts`)
- `client.ts` wraps all HTTP logic
- Tests via vitest — run with `npm test`
- README documents env vars, Claude Desktop config, and available tools
