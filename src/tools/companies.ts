import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

export function registerCompanyTools(server: McpServer, client: FikenClient): void {
  server.tool(
    "fiken_list_companies",
    "List all companies the authenticated user has access to. Use the returned slugs with other tools.",
    PaginationSchema.shape,
    wrapToolError(async (args) => {
      const { page, pageSize } = PaginationSchema.parse(args);
      const data = await client.getPaginated("/companies", { page, pageSize });
      return toText(data);
    })
  );

  server.tool(
    "fiken_get_company",
    "Get details for a specific company by slug",
    CompanySlugSchema.shape,
    wrapToolError(async (args) => {
      const { companySlug } = CompanySlugSchema.parse(args);
      const data = await client.get(`/companies/${companySlug}`);
      return toText(data);
    })
  );
}
