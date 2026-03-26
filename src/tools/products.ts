import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, LastModifiedSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListProductsSchema = CompanySlugSchema.merge(PaginationSchema).merge(LastModifiedSchema).extend({
  name: z.string().optional().describe("Filter by product name"),
  productNumber: z.string().optional().describe("Filter by product number"),
  active: z.boolean().optional().describe("Filter by active status"),
});

const GetProductSchema = CompanySlugSchema.extend({
  productId: z.number().int().describe("Product ID"),
});

export function registerProductTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_products",
    {
      description: "List products for a company. Amounts are in cents.",
      inputSchema: ListProductsSchema.shape,
    },
    listHandler(client, ListProductsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/products`
    )
  );

  server.registerTool(
    "fiken_get_product",
    {
      description: "Get a specific product by ID. Amounts are in cents.",
      inputSchema: GetProductSchema.shape,
    },
    getHandler(client, GetProductSchema, ({ companySlug, productId }) =>
      `/companies/${companySlug}/products/${productId}`
    )
  );
}
