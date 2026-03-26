import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { PaginationSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListCompaniesSchema = PaginationSchema.extend({
  sortBy: z.string().optional().describe("Sort order (e.g. 'name asc', 'createdDate desc')"),
});

const GetCompanySchema = z.object({
  companySlug: z.string().describe("Company slug. Use fiken_list_companies to discover slugs."),
});

export function registerCompanyTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_companies",
    {
      description: "List all companies the authenticated user has access to. Use the returned slugs with other tools.",
      inputSchema: ListCompaniesSchema.shape,
    },
    listHandler(client, ListCompaniesSchema, () => "/companies")
  );

  server.registerTool(
    "fiken_get_company",
    {
      description: "Get details for a specific company by slug",
      inputSchema: GetCompanySchema.shape,
    },
    getHandler(client, GetCompanySchema, ({ companySlug }) => `/companies/${companySlug}`)
  );
}
