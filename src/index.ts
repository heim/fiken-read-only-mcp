import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { logger } from "./logger.js";

const token = process.env.FIKEN_API_TOKEN;
if (!token) {
  logger.error("startup_failed", { reason: "FIKEN_API_TOKEN environment variable is required" });
  process.exit(1);
}

const server = createServer(token);
const transport = new StdioServerTransport();

logger.info("server_starting", { version: "1.0.0" });
await server.connect(transport);
logger.info("server_connected");
