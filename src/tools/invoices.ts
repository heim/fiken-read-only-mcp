import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, DateRangeSchema, LastModifiedSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListInvoicesSchema = CompanySlugSchema.merge(PaginationSchema).merge(DateRangeSchema).merge(LastModifiedSchema).extend({
  invoiceNumber: z.string().optional().describe("Filter by invoice number"),
  kid: z.string().optional().describe("Filter by KID/payment reference"),
  customerId: z.number().int().optional().describe("Filter by customer contact ID"),
  settled: z.boolean().optional().describe("Filter by settled status"),
  orderReference: z.string().optional().describe("Filter by order reference"),
  projectId: z.number().int().optional().describe("Filter by project ID"),
});

const GetInvoiceSchema = CompanySlugSchema.extend({
  invoiceId: z.number().int().describe("Invoice ID"),
});

const GetDraftSchema = CompanySlugSchema.extend({
  draftId: z.number().int().describe("Draft ID"),
});

const ListInvoiceDraftsSchema = CompanySlugSchema.merge(PaginationSchema);

export function registerInvoiceTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_invoices",
    {
      description: "List invoices for a company. Amounts are in cents.",
      inputSchema: ListInvoicesSchema.shape,
    },
    listHandler(client, ListInvoicesSchema, ({ companySlug }) =>
      `/companies/${companySlug}/invoices`
    )
  );

  server.registerTool(
    "fiken_get_invoice",
    {
      description: "Get a specific invoice by ID. Amounts are in cents.",
      inputSchema: GetInvoiceSchema.shape,
    },
    getHandler(client, GetInvoiceSchema, ({ companySlug, invoiceId }) =>
      `/companies/${companySlug}/invoices/${invoiceId}`
    )
  );

  server.registerTool(
    "fiken_list_invoice_attachments",
    {
      description: "List attachments for a specific invoice",
      inputSchema: GetInvoiceSchema.shape,
    },
    getHandler(client, GetInvoiceSchema, ({ companySlug, invoiceId }) =>
      `/companies/${companySlug}/invoices/${invoiceId}/attachments`
    )
  );

  server.registerTool(
    "fiken_get_invoice_counter",
    {
      description: "Get the current invoice counter/number sequence for a company",
      inputSchema: CompanySlugSchema.shape,
    },
    getHandler(client, CompanySlugSchema, ({ companySlug }) =>
      `/companies/${companySlug}/invoices/counter`
    )
  );

  server.registerTool(
    "fiken_list_invoice_drafts",
    {
      description: "List invoice drafts for a company",
      inputSchema: ListInvoiceDraftsSchema.shape,
    },
    listHandler(client, ListInvoiceDraftsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/invoices/drafts`
    )
  );

  server.registerTool(
    "fiken_get_invoice_draft",
    {
      description: "Get a specific invoice draft by ID",
      inputSchema: GetDraftSchema.shape,
    },
    getHandler(client, GetDraftSchema, ({ companySlug, draftId }) =>
      `/companies/${companySlug}/invoices/drafts/${draftId}`
    )
  );

  server.registerTool(
    "fiken_list_invoice_draft_attachments",
    {
      description: "List attachments for a specific invoice draft",
      inputSchema: GetDraftSchema.shape,
    },
    getHandler(client, GetDraftSchema, ({ companySlug, draftId }) =>
      `/companies/${companySlug}/invoices/drafts/${draftId}/attachments`
    )
  );
}
