import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, LastModifiedSchema, CreatedDateSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListTransactionsSchema = CompanySlugSchema.merge(PaginationSchema)
  .merge(LastModifiedSchema)
  .merge(CreatedDateSchema);

const GetTransactionSchema = CompanySlugSchema.extend({
  transactionId: z.number().int().describe("Transaction ID"),
});

export function registerTransactionTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_transactions",
    {
      description: "List transactions for a company. Amounts are in cents.",
      inputSchema: ListTransactionsSchema.shape,
    },
    listHandler(client, ListTransactionsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/transactions`
    )
  );

  server.registerTool(
    "fiken_get_transaction",
    {
      description: "Get a specific transaction by ID. Amounts are in cents.",
      inputSchema: GetTransactionSchema.shape,
    },
    getHandler(client, GetTransactionSchema, ({ companySlug, transactionId }) =>
      `/companies/${companySlug}/transactions/${transactionId}`
    )
  );
}
