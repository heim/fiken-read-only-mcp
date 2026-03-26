import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { PaginationSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

export function registerCompanyTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_companies",
    {
      description: "List all companies the authenticated user has access to. Use the returned slugs with other tools.",
      inputSchema: PaginationSchema.shape,
    },
    wrapToolError(async (args) => {
      const { page, pageSize } = PaginationSchema.parse(args);
      const data = await client.getPaginated("/companies", { page, pageSize });
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_get_company",
    {
      description: "Get details for a specific company by slug",
      inputSchema: {
        companySlug: z.string().describe("Company slug. Use fiken_list_companies to discover slugs."),
      },
    },
    wrapToolError(async (args) => {
      const { companySlug } = z.object({ companySlug: z.string() }).parse(args);
      const data = await client.get(`/companies/${companySlug}`);
      return toText(data);
    })
  );
}
