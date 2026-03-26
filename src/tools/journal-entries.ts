import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, DateRangeSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

export function registerJournalEntryTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_journal_entries",
    {
      description: "List journal entries for a company. Amounts are in cents.",
      inputSchema: {
        ...CompanySlugSchema.shape,
        ...PaginationSchema.shape,
        ...DateRangeSchema.shape,
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.merge(PaginationSchema).merge(DateRangeSchema);
      const { companySlug, page, pageSize, ...filters } = schema.parse(args);
      const data = await client.getPaginated(
        `/companies/${companySlug}/journalEntries`,
        { page, pageSize },
        filters
      );
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_get_journal_entry",
    {
      description: "Get a specific journal entry by ID. Amounts are in cents.",
      inputSchema: {
        ...CompanySlugSchema.shape,
        journalEntryId: z.number().int().describe("Journal entry ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ journalEntryId: z.number().int() });
      const { companySlug, journalEntryId } = schema.parse(args);
      const data = await client.get(`/companies/${companySlug}/journalEntries/${journalEntryId}`);
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_list_journal_entry_attachments",
    {
      description: "List attachments for a specific journal entry",
      inputSchema: {
        ...CompanySlugSchema.shape,
        journalEntryId: z.number().int().describe("Journal entry ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ journalEntryId: z.number().int() });
      const { companySlug, journalEntryId } = schema.parse(args);
      const data = await client.get(
        `/companies/${companySlug}/journalEntries/${journalEntryId}/attachments`
      );
      return toText(data);
    })
  );
}
