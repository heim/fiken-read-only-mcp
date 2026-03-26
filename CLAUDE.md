# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Compile TypeScript (tsc) → build/
npm run dev          # Run directly with tsx (no build step)
npm test             # Run all tests (vitest run)
npm run test:watch   # Run tests in watch mode
npx vitest run src/tests/utils.test.ts  # Run a single test file
```

The server requires `FIKEN_API_TOKEN` env var at runtime:
```bash
FIKEN_API_TOKEN=xxx npm run dev
```

API compliance tests run against the live Fiken API (skipped when no token is set):
```bash
FIKEN_API_TOKEN=xxx npx vitest run src/tests/api-compliance.test.ts
```

## Architecture

This is a read-only MCP (Model Context Protocol) server that wraps the Fiken v2 accounting API. It exposes 61 GET-only tools over stdio transport. Tool parameters are aligned with the [Fiken OpenAPI spec](https://api.fiken.no/api/v2/docs/swagger.yaml) and verified against the live API.

### Core flow

`src/index.ts` (entrypoint) → `src/server.ts` (creates McpServer + FikenClient, registers all tools) → `src/tools/*.ts` (tool definitions)

### Key components

- **`src/client.ts`** — `FikenClient` handles all HTTP communication with the Fiken API. Has a serial request queue (`enqueue`) that ensures only one request runs at a time (Fiken's 1-concurrent-request-per-user limit). Exposes `get()` and `getPaginated()` (reads pagination from Fiken response headers).
- **`src/types.ts`** — Shared Zod schemas for common parameter patterns:
  - `CompanySlugSchema`, `PaginationSchema` — used by nearly all tools
  - `DateRangeSchema` (date/dateLe/Lt/Ge/Gt), `LastModifiedSchema`, `CreatedDateSchema` — date filtering
  - `IssueDateSchema`, `DueDateSchema` — invoice/credit note specific
- **`src/utils.ts`** — `wrapToolError` (catches errors and returns `isError: true` tool results), `toText` (JSON-serializes data into MCP text content), and two handler factories:
  - `getHandler(client, schema, pathFn, paramsFn?)` — for single-item GET tools (35 tools)
  - `listHandler(client, schema, pathFn)` — for paginated list tools (26 tools)
- **`src/tools/*.ts`** — Each file exports a `register*Tools(server, client)` function. Each tool defines its Zod schema once, then passes `Schema.shape` as `inputSchema` to `server.registerTool()` and the schema itself to `getHandler`/`listHandler` for parsing.

### Adding a new tool

1. Check the [Fiken OpenAPI spec](https://api.fiken.no/api/v2/docs/swagger.yaml) for the endpoint's exact query parameters.
2. Define a Zod schema for the tool's parameters (spread shared schemas + tool-specific fields).
3. Register with `server.registerTool(name, { description, inputSchema: Schema.shape }, getHandler(...))` or `listHandler(...)`.
4. Use `getHandler` for single-item GETs, `listHandler` for paginated lists.
5. If it's a new domain, create a new file, export a `register*Tools` function, re-export from `src/tools/index.ts`, and call it in `src/server.ts`.

### Testing

- **Unit tests** (`src/tests/tools.test.ts`, `utils.test.ts`, `client.test.ts`) use vitest with a `MockMcpServer` (in `src/tests/helpers.ts`) that captures tool registrations and lets you call tools directly. `createMockClient()` creates a mock `FikenClient` with spy methods. Tests verify correct API paths and parameter passing — they don't hit the real API.
- **API compliance tests** (`src/tests/api-compliance.test.ts`) run against the live Fiken API to verify parameter correctness. They compare baseline vs filtered result counts to confirm params are actually accepted by the API. Skipped automatically when `FIKEN_API_TOKEN` is not set.
