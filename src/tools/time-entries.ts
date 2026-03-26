import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, DateRangeSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListTimeEntriesSchema = CompanySlugSchema.merge(PaginationSchema).merge(DateRangeSchema).extend({
  projectId: z.number().int().optional().describe("Filter by project ID"),
  userId: z.number().int().optional().describe("Filter by user ID"),
  activityId: z.number().int().optional().describe("Filter by activity ID"),
});

const GetTimeEntrySchema = CompanySlugSchema.extend({
  timeEntryId: z.number().int().describe("Time entry ID"),
});

const ListActivitiesSchema = CompanySlugSchema.merge(PaginationSchema);
const ListTimeUsersSchema = CompanySlugSchema.merge(PaginationSchema);

export function registerTimeEntryTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_time_entries",
    {
      description: "List time entries for a company",
      inputSchema: ListTimeEntriesSchema.shape,
    },
    listHandler(client, ListTimeEntriesSchema, ({ companySlug }) =>
      `/companies/${companySlug}/timeEntries`
    )
  );

  server.registerTool(
    "fiken_get_time_entry",
    {
      description: "Get a specific time entry by ID",
      inputSchema: GetTimeEntrySchema.shape,
    },
    getHandler(client, GetTimeEntrySchema, ({ companySlug, timeEntryId }) =>
      `/companies/${companySlug}/timeEntries/${timeEntryId}`
    )
  );

  server.registerTool(
    "fiken_list_activities",
    {
      description: "List activities for a company (used with time entries)",
      inputSchema: ListActivitiesSchema.shape,
    },
    listHandler(client, ListActivitiesSchema, ({ companySlug }) =>
      `/companies/${companySlug}/activities`
    )
  );

  server.registerTool(
    "fiken_list_time_users",
    {
      description: "List users who can log time for a company",
      inputSchema: ListTimeUsersSchema.shape,
    },
    listHandler(client, ListTimeUsersSchema, ({ companySlug }) =>
      `/companies/${companySlug}/timeUsers`
    )
  );
}
