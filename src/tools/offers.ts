import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

export function registerOfferTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_offers",
    {
      description: "List offers/quotes for a company. Amounts are in cents.",
      inputSchema: {
        ...CompanySlugSchema.shape,
        ...PaginationSchema.shape,
      },
    },
    wrapToolError(async (args) => {
      const { companySlug, page, pageSize } = CompanySlugSchema.merge(PaginationSchema).parse(args);
      const data = await client.getPaginated(
        `/companies/${companySlug}/offers`,
        { page, pageSize }
      );
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_get_offer",
    {
      description: "Get a specific offer/quote by ID. Amounts are in cents.",
      inputSchema: {
        ...CompanySlugSchema.shape,
        offerId: z.number().int().describe("Offer ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ offerId: z.number().int() });
      const { companySlug, offerId } = schema.parse(args);
      const data = await client.get(`/companies/${companySlug}/offers/${offerId}`);
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_get_offer_counter",
    {
      description: "Get the current offer counter/number sequence for a company",
      inputSchema: {
        ...CompanySlugSchema.shape,
      },
    },
    wrapToolError(async (args) => {
      const { companySlug } = CompanySlugSchema.parse(args);
      const data = await client.get(`/companies/${companySlug}/offers/counter`);
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_list_offer_drafts",
    {
      description: "List offer drafts for a company",
      inputSchema: {
        ...CompanySlugSchema.shape,
        ...PaginationSchema.shape,
      },
    },
    wrapToolError(async (args) => {
      const { companySlug, page, pageSize } = CompanySlugSchema.merge(PaginationSchema).parse(args);
      const data = await client.getPaginated(
        `/companies/${companySlug}/offers/drafts`,
        { page, pageSize }
      );
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_get_offer_draft",
    {
      description: "Get a specific offer draft by ID",
      inputSchema: {
        ...CompanySlugSchema.shape,
        draftId: z.number().int().describe("Draft ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ draftId: z.number().int() });
      const { companySlug, draftId } = schema.parse(args);
      const data = await client.get(`/companies/${companySlug}/offers/drafts/${draftId}`);
      return toText(data);
    })
  );
}
