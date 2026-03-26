import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListOffersSchema = CompanySlugSchema.merge(PaginationSchema);

const GetOfferSchema = CompanySlugSchema.extend({
  offerId: z.number().int().describe("Offer ID"),
});

const GetDraftSchema = CompanySlugSchema.extend({
  draftId: z.number().int().describe("Draft ID"),
});

export function registerOfferTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_offers",
    {
      description: "List offers/quotes for a company. Amounts are in cents.",
      inputSchema: ListOffersSchema.shape,
    },
    listHandler(client, ListOffersSchema, ({ companySlug }) =>
      `/companies/${companySlug}/offers`
    )
  );

  server.registerTool(
    "fiken_get_offer",
    {
      description: "Get a specific offer/quote by ID. Amounts are in cents.",
      inputSchema: GetOfferSchema.shape,
    },
    getHandler(client, GetOfferSchema, ({ companySlug, offerId }) =>
      `/companies/${companySlug}/offers/${offerId}`
    )
  );

  server.registerTool(
    "fiken_get_offer_counter",
    {
      description: "Get the current offer counter/number sequence for a company",
      inputSchema: CompanySlugSchema.shape,
    },
    getHandler(client, CompanySlugSchema, ({ companySlug }) =>
      `/companies/${companySlug}/offers/counter`
    )
  );

  server.registerTool(
    "fiken_list_offer_drafts",
    {
      description: "List offer drafts for a company",
      inputSchema: ListOffersSchema.shape,
    },
    listHandler(client, ListOffersSchema, ({ companySlug }) =>
      `/companies/${companySlug}/offers/drafts`
    )
  );

  server.registerTool(
    "fiken_get_offer_draft",
    {
      description: "Get a specific offer draft by ID",
      inputSchema: GetDraftSchema.shape,
    },
    getHandler(client, GetDraftSchema, ({ companySlug, draftId }) =>
      `/companies/${companySlug}/offers/drafts/${draftId}`
    )
  );
}
