import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, DateRangeSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListJournalEntriesSchema = CompanySlugSchema.merge(PaginationSchema).merge(DateRangeSchema);

const GetJournalEntrySchema = CompanySlugSchema.extend({
  journalEntryId: z.number().int().describe("Journal entry ID"),
});

export function registerJournalEntryTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_journal_entries",
    {
      description: "List journal entries for a company. Amounts are in cents.",
      inputSchema: ListJournalEntriesSchema.shape,
    },
    listHandler(client, ListJournalEntriesSchema, ({ companySlug }) =>
      `/companies/${companySlug}/journalEntries`
    )
  );

  server.registerTool(
    "fiken_get_journal_entry",
    {
      description: "Get a specific journal entry by ID. Amounts are in cents.",
      inputSchema: GetJournalEntrySchema.shape,
    },
    getHandler(client, GetJournalEntrySchema, ({ companySlug, journalEntryId }) =>
      `/companies/${companySlug}/journalEntries/${journalEntryId}`
    )
  );

  server.registerTool(
    "fiken_list_journal_entry_attachments",
    {
      description: "List attachments for a specific journal entry",
      inputSchema: GetJournalEntrySchema.shape,
    },
    getHandler(client, GetJournalEntrySchema, ({ companySlug, journalEntryId }) =>
      `/companies/${companySlug}/journalEntries/${journalEntryId}/attachments`
    )
  );
}
