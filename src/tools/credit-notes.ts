import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListCreditNotesSchema = CompanySlugSchema.merge(PaginationSchema).extend({
  issueDate: z.string().optional().describe("Filter by issue date (YYYY-MM-DD)"),
  issueDateLe: z.string().optional().describe("Issue date less than or equal (YYYY-MM-DD)"),
  issueDateLt: z.string().optional().describe("Issue date less than (YYYY-MM-DD)"),
  issueDateGe: z.string().optional().describe("Issue date greater than or equal (YYYY-MM-DD)"),
  issueDateGt: z.string().optional().describe("Issue date greater than (YYYY-MM-DD)"),
  customerId: z.number().int().optional().describe("Filter by customer contact ID"),
  settled: z.boolean().optional().describe("Filter by settled status"),
});

const GetCreditNoteSchema = CompanySlugSchema.extend({
  creditNoteId: z.number().int().describe("Credit note ID"),
});

const GetDraftSchema = CompanySlugSchema.extend({
  draftId: z.number().int().describe("Draft ID"),
});

const ListCreditNoteDraftsSchema = CompanySlugSchema.merge(PaginationSchema);

export function registerCreditNoteTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_credit_notes",
    {
      description: "List credit notes for a company. Amounts are in cents.",
      inputSchema: ListCreditNotesSchema.shape,
    },
    listHandler(client, ListCreditNotesSchema, ({ companySlug }) =>
      `/companies/${companySlug}/creditNotes`
    )
  );

  server.registerTool(
    "fiken_get_credit_note",
    {
      description: "Get a specific credit note by ID. Amounts are in cents.",
      inputSchema: GetCreditNoteSchema.shape,
    },
    getHandler(client, GetCreditNoteSchema, ({ companySlug, creditNoteId }) =>
      `/companies/${companySlug}/creditNotes/${creditNoteId}`
    )
  );

  server.registerTool(
    "fiken_get_credit_note_counter",
    {
      description: "Get the current credit note counter/number sequence for a company",
      inputSchema: CompanySlugSchema.shape,
    },
    getHandler(client, CompanySlugSchema, ({ companySlug }) =>
      `/companies/${companySlug}/creditNotes/counter`
    )
  );

  server.registerTool(
    "fiken_list_credit_note_drafts",
    {
      description: "List credit note drafts for a company",
      inputSchema: ListCreditNoteDraftsSchema.shape,
    },
    listHandler(client, ListCreditNoteDraftsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/creditNotes/drafts`
    )
  );

  server.registerTool(
    "fiken_get_credit_note_draft",
    {
      description: "Get a specific credit note draft by ID",
      inputSchema: GetDraftSchema.shape,
    },
    getHandler(client, GetDraftSchema, ({ companySlug, draftId }) =>
      `/companies/${companySlug}/creditNotes/drafts/${draftId}`
    )
  );
}
