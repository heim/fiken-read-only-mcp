import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListBankAccountsSchema = CompanySlugSchema.merge(PaginationSchema).extend({
  inactive: z.boolean().optional().describe("Return inactive bank accounts (true) or active (false)"),
});

const GetBankAccountSchema = CompanySlugSchema.extend({
  bankAccountId: z.number().int().describe("Bank account ID"),
});

const ListBankBalancesSchema = CompanySlugSchema.merge(PaginationSchema).extend({
  date: z.string().optional().describe("Balance date filter (YYYY-MM-DD)"),
});

export function registerBankTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_bank_accounts",
    {
      description: "List bank accounts for a company",
      inputSchema: ListBankAccountsSchema.shape,
    },
    listHandler(client, ListBankAccountsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/bankAccounts`
    )
  );

  server.registerTool(
    "fiken_get_bank_account",
    {
      description: "Get a specific bank account by ID",
      inputSchema: GetBankAccountSchema.shape,
    },
    getHandler(client, GetBankAccountSchema, ({ companySlug, bankAccountId }) =>
      `/companies/${companySlug}/bankAccounts/${bankAccountId}`
    )
  );

  server.registerTool(
    "fiken_list_bank_balances",
    {
      description: "List bank balances for all bank accounts of a company. Amounts are in cents.",
      inputSchema: ListBankBalancesSchema.shape,
    },
    listHandler(client, ListBankBalancesSchema, ({ companySlug }) =>
      `/companies/${companySlug}/bankBalances`
    )
  );
}
