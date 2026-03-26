import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, DateRangeSchema, LastModifiedSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListPurchasesSchema = CompanySlugSchema.merge(PaginationSchema).merge(DateRangeSchema).merge(LastModifiedSchema).extend({
  settled: z.boolean().optional().describe("Filter by settled status"),
  projectId: z.number().int().optional().describe("Filter by project ID"),
});

const GetPurchaseSchema = CompanySlugSchema.extend({
  purchaseId: z.number().int().describe("Purchase ID"),
});

const GetDraftSchema = CompanySlugSchema.extend({
  draftId: z.number().int().describe("Draft ID"),
});

const ListPurchaseDraftsSchema = CompanySlugSchema.merge(PaginationSchema);

export function registerPurchaseTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_purchases",
    {
      description: "List purchases for a company. Amounts are in cents.",
      inputSchema: ListPurchasesSchema.shape,
    },
    listHandler(client, ListPurchasesSchema, ({ companySlug }) =>
      `/companies/${companySlug}/purchases`
    )
  );

  server.registerTool(
    "fiken_get_purchase",
    {
      description: "Get a specific purchase by ID. Amounts are in cents.",
      inputSchema: GetPurchaseSchema.shape,
    },
    getHandler(client, GetPurchaseSchema, ({ companySlug, purchaseId }) =>
      `/companies/${companySlug}/purchases/${purchaseId}`
    )
  );

  server.registerTool(
    "fiken_list_purchase_attachments",
    {
      description: "List attachments for a specific purchase",
      inputSchema: GetPurchaseSchema.shape,
    },
    getHandler(client, GetPurchaseSchema, ({ companySlug, purchaseId }) =>
      `/companies/${companySlug}/purchases/${purchaseId}/attachments`
    )
  );

  server.registerTool(
    "fiken_list_purchase_drafts",
    {
      description: "List purchase drafts for a company",
      inputSchema: ListPurchaseDraftsSchema.shape,
    },
    listHandler(client, ListPurchaseDraftsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/purchases/drafts`
    )
  );

  server.registerTool(
    "fiken_get_purchase_draft",
    {
      description: "Get a specific purchase draft by ID",
      inputSchema: GetDraftSchema.shape,
    },
    getHandler(client, GetDraftSchema, ({ companySlug, draftId }) =>
      `/companies/${companySlug}/purchases/drafts/${draftId}`
    )
  );
}
