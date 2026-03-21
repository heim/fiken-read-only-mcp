import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, stringFilter } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

export function registerProjectTools(server: McpServer, client: FikenClient): void {
  server.tool(
    "fiken_list_projects",
    "List projects for a company",
    {
      ...CompanySlugSchema.shape,
      ...PaginationSchema.shape,
      name: stringFilter("Filter by project name"),
      number: stringFilter("Filter by project number"),
      startDate: stringFilter("Filter by start date (YYYY-MM-DD)"),
      endDate: stringFilter("Filter by end date (YYYY-MM-DD)"),
      completed: z.boolean().optional().describe("Filter by completed status"),
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.merge(PaginationSchema).extend({
        name: stringFilter("Filter by project name"),
        number: stringFilter("Filter by project number"),
        startDate: stringFilter("Filter by start date (YYYY-MM-DD)"),
        endDate: stringFilter("Filter by end date (YYYY-MM-DD)"),
        completed: z.boolean().optional(),
      });
      const { companySlug, page, pageSize, ...filters } = schema.parse(args);
      const data = await client.getPaginated(
        `/companies/${companySlug}/projects`,
        { page, pageSize },
        filters
      );
      return toText(data);
    })
  );

  server.tool(
    "fiken_get_project",
    "Get a specific project by ID",
    {
      ...CompanySlugSchema.shape,
      projectId: z.number().int().describe("Project ID"),
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ projectId: z.number().int() });
      const { companySlug, projectId } = schema.parse(args);
      const data = await client.get(`/companies/${companySlug}/projects/${projectId}`);
      return toText(data);
    })
  );
}
