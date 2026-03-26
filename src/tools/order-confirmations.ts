import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListOrderConfirmationsSchema = CompanySlugSchema.merge(PaginationSchema);

const GetOrderConfirmationSchema = CompanySlugSchema.extend({
  confirmationId: z.number().int().describe("Order confirmation ID"),
});

export function registerOrderConfirmationTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_order_confirmations",
    {
      description: "List order confirmations for a company. Amounts are in cents.",
      inputSchema: ListOrderConfirmationsSchema.shape,
    },
    listHandler(client, ListOrderConfirmationsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/orderConfirmations`
    )
  );

  server.registerTool(
    "fiken_get_order_confirmation",
    {
      description: "Get a specific order confirmation by ID. Amounts are in cents.",
      inputSchema: GetOrderConfirmationSchema.shape,
    },
    getHandler(client, GetOrderConfirmationSchema, ({ companySlug, confirmationId }) =>
      `/companies/${companySlug}/orderConfirmations/${confirmationId}`
    )
  );

  server.registerTool(
    "fiken_get_order_confirmation_counter",
    {
      description: "Get the current order confirmation counter/number sequence for a company",
      inputSchema: CompanySlugSchema.shape,
    },
    getHandler(client, CompanySlugSchema, ({ companySlug }) =>
      `/companies/${companySlug}/orderConfirmations/counter`
    )
  );
}
