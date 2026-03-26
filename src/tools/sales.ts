import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, DateRangeSchema, LastModifiedSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListSalesSchema = CompanySlugSchema.merge(PaginationSchema).merge(DateRangeSchema).merge(LastModifiedSchema).extend({
  saleNumber: z.string().optional().describe("Filter by sale number"),
  createdDate: z.string().optional().describe("Filter by creation date (YYYY-MM-DD)"),
  contactId: z.number().int().optional().describe("Filter by contact ID"),
  sortBy: z.string().optional().describe("Sort order"),
});

const GetSaleSchema = CompanySlugSchema.extend({
  saleId: z.number().int().describe("Sale ID"),
});

const GetDraftSchema = CompanySlugSchema.extend({
  draftId: z.number().int().describe("Draft ID"),
});

const ListSaleDraftsSchema = CompanySlugSchema.merge(PaginationSchema);

export function registerSaleTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_sales",
    {
      description: "List sales for a company. Amounts are in cents.",
      inputSchema: ListSalesSchema.shape,
    },
    listHandler(client, ListSalesSchema, ({ companySlug }) =>
      `/companies/${companySlug}/sales`
    )
  );

  server.registerTool(
    "fiken_get_sale",
    {
      description: "Get a specific sale by ID. Amounts are in cents.",
      inputSchema: GetSaleSchema.shape,
    },
    getHandler(client, GetSaleSchema, ({ companySlug, saleId }) =>
      `/companies/${companySlug}/sales/${saleId}`
    )
  );

  server.registerTool(
    "fiken_list_sale_attachments",
    {
      description: "List attachments for a specific sale",
      inputSchema: GetSaleSchema.shape,
    },
    getHandler(client, GetSaleSchema, ({ companySlug, saleId }) =>
      `/companies/${companySlug}/sales/${saleId}/attachments`
    )
  );

  server.registerTool(
    "fiken_list_sale_drafts",
    {
      description: "List sale drafts for a company",
      inputSchema: ListSaleDraftsSchema.shape,
    },
    listHandler(client, ListSaleDraftsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/sales/drafts`
    )
  );

  server.registerTool(
    "fiken_get_sale_draft",
    {
      description: "Get a specific sale draft by ID",
      inputSchema: GetDraftSchema.shape,
    },
    getHandler(client, GetDraftSchema, ({ companySlug, draftId }) =>
      `/companies/${companySlug}/sales/drafts/${draftId}`
    )
  );

  server.registerTool(
    "fiken_list_sale_draft_attachments",
    {
      description: "List attachments for a specific sale draft",
      inputSchema: GetDraftSchema.shape,
    },
    getHandler(client, GetDraftSchema, ({ companySlug, draftId }) =>
      `/companies/${companySlug}/sales/drafts/${draftId}/attachments`
    )
  );
}
