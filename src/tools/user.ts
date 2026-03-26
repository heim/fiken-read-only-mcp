import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { getHandler } from "../utils.js";

const GetUserSchema = z.object({});

export function registerUserTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_get_user",
    { description: "Get information about the currently authenticated Fiken user", inputSchema: GetUserSchema.shape },
    getHandler(client, GetUserSchema, () => "/user")
  );
}
