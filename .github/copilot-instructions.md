# Copilot Instructions

This is a read-only MCP server for the Fiken accounting API. See CLAUDE.md for architecture and conventions.

When reviewing code in this repository:
- Verify all tools only make HTTP GET requests (read-only guarantee)
- Check that new tools use `wrapToolError` and `toText` from `utils.ts`
- Ensure tool names are prefixed with `fiken_`
- Confirm new tools are registered in `server.ts` via a `registerXxxTools` call
- Flag any direct `process.env` reads outside of `index.ts`
