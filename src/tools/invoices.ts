import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, DateRangeSchema, LastModifiedSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

export function registerInvoiceTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_invoices",
    {
      description: "List invoices for a company. Amounts are in cents.",
      inputSchema: {
        ...CompanySlugSchema.shape,
        ...PaginationSchema.shape,
        ...DateRangeSchema.shape,
        ...LastModifiedSchema.shape,
        invoiceNumber: z.string().optional().describe("Filter by invoice number"),
        kid: z.string().optional().describe("Filter by KID/payment reference"),
        customerId: z.number().int().optional().describe("Filter by customer contact ID"),
        settled: z.boolean().optional().describe("Filter by settled status"),
        orderReference: z.string().optional().describe("Filter by order reference"),
        projectId: z.number().int().optional().describe("Filter by project ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.merge(PaginationSchema).merge(DateRangeSchema).merge(LastModifiedSchema).extend({
        invoiceNumber: z.string().optional(),
        kid: z.string().optional(),
        customerId: z.number().int().optional(),
        settled: z.boolean().optional(),
        orderReference: z.string().optional(),
        projectId: z.number().int().optional(),
      });
      const { companySlug, page, pageSize, ...filters } = schema.parse(args);
      const data = await client.getPaginated(
        `/companies/${companySlug}/invoices`,
        { page, pageSize },
        filters
      );
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_get_invoice",
    {
      description: "Get a specific invoice by ID. Amounts are in cents.",
      inputSchema: {
        ...CompanySlugSchema.shape,
        invoiceId: z.number().int().describe("Invoice ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ invoiceId: z.number().int() });
      const { companySlug, invoiceId } = schema.parse(args);
      const data = await client.get(`/companies/${companySlug}/invoices/${invoiceId}`);
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_list_invoice_attachments",
    {
      description: "List attachments for a specific invoice",
      inputSchema: {
        ...CompanySlugSchema.shape,
        invoiceId: z.number().int().describe("Invoice ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ invoiceId: z.number().int() });
      const { companySlug, invoiceId } = schema.parse(args);
      const data = await client.get(`/companies/${companySlug}/invoices/${invoiceId}/attachments`);
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_get_invoice_counter",
    {
      description: "Get the current invoice counter/number sequence for a company",
      inputSchema: {
        ...CompanySlugSchema.shape,
      },
    },
    wrapToolError(async (args) => {
      const { companySlug } = CompanySlugSchema.parse(args);
      const data = await client.get(`/companies/${companySlug}/invoices/counter`);
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_list_invoice_drafts",
    {
      description: "List invoice drafts for a company",
      inputSchema: {
        ...CompanySlugSchema.shape,
        ...PaginationSchema.shape,
      },
    },
    wrapToolError(async (args) => {
      const { companySlug, page, pageSize } = CompanySlugSchema.merge(PaginationSchema).parse(args);
      const data = await client.getPaginated(
        `/companies/${companySlug}/invoices/drafts`,
        { page, pageSize }
      );
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_get_invoice_draft",
    {
      description: "Get a specific invoice draft by ID",
      inputSchema: {
        ...CompanySlugSchema.shape,
        draftId: z.number().int().describe("Draft ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ draftId: z.number().int() });
      const { companySlug, draftId } = schema.parse(args);
      const data = await client.get(`/companies/${companySlug}/invoices/drafts/${draftId}`);
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_list_invoice_draft_attachments",
    {
      description: "List attachments for a specific invoice draft",
      inputSchema: {
        ...CompanySlugSchema.shape,
        draftId: z.number().int().describe("Draft ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ draftId: z.number().int() });
      const { companySlug, draftId } = schema.parse(args);
      const data = await client.get(
        `/companies/${companySlug}/invoices/drafts/${draftId}/attachments`
      );
      return toText(data);
    })
  );
}
