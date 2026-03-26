import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListProjectsSchema = CompanySlugSchema.merge(PaginationSchema).extend({
  completed: z.boolean().optional().describe("Filter by completed status"),
  name: z.string().optional().describe("Filter by project name"),
  number: z.string().optional().describe("Filter by project number"),
});

const GetProjectSchema = CompanySlugSchema.extend({
  projectId: z.number().int().describe("Project ID"),
});

export function registerProjectTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_projects",
    {
      description: "List projects for a company",
      inputSchema: ListProjectsSchema.shape,
    },
    listHandler(client, ListProjectsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/projects`
    )
  );

  server.registerTool(
    "fiken_get_project",
    {
      description: "Get a specific project by ID",
      inputSchema: GetProjectSchema.shape,
    },
    getHandler(client, GetProjectSchema, ({ companySlug, projectId }) =>
      `/companies/${companySlug}/projects/${projectId}`
    )
  );
}
