import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListAccountsSchema = CompanySlugSchema.merge(PaginationSchema).extend({
  fromAccount: z.string().optional().describe("Filter accounts from this account number"),
  toAccount: z.string().optional().describe("Filter accounts to this account number"),
  range: z.string().optional().describe("Comma-separated account numbers or ranges (e.g. '1000-1500, 2000, 7000-7004')"),
});

const GetAccountSchema = CompanySlugSchema.extend({
  accountCode: z.string().describe("Account code (e.g. '1920' or '1500:10001')"),
});

const ListAccountBalancesSchema = CompanySlugSchema.merge(PaginationSchema).extend({
  fromAccount: z.string().optional().describe("Filter from this account number"),
  toAccount: z.string().optional().describe("Filter to this account number"),
  date: z.string().describe("Balance date (YYYY-MM-DD, required)"),
});

const GetAccountBalanceSchema = CompanySlugSchema.extend({
  accountCode: z.string().describe("Account code (e.g. '1920')"),
  date: z.string().describe("Balance date (YYYY-MM-DD, required)"),
});

export function registerAccountTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_accounts",
    {
      description: "List chart of accounts for a company. Account codes are strings (e.g. '1920').",
      inputSchema: ListAccountsSchema.shape,
    },
    listHandler(client, ListAccountsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/accounts`
    )
  );

  server.registerTool(
    "fiken_get_account",
    {
      description: "Get a specific account by account code for a company",
      inputSchema: GetAccountSchema.shape,
    },
    getHandler(client, GetAccountSchema, ({ companySlug, accountCode }) =>
      `/companies/${companySlug}/accounts/${accountCode}`
    )
  );

  server.registerTool(
    "fiken_list_account_balances",
    {
      description: "List account balances for a company. Amounts are in cents.",
      inputSchema: ListAccountBalancesSchema.shape,
    },
    listHandler(client, ListAccountBalancesSchema, ({ companySlug }) =>
      `/companies/${companySlug}/accountBalances`
    )
  );

  server.registerTool(
    "fiken_get_account_balance",
    {
      description: "Get balance for a specific account. Amounts are in cents.",
      inputSchema: GetAccountBalanceSchema.shape,
    },
    getHandler(
      client, GetAccountBalanceSchema,
      ({ companySlug, accountCode }) => `/companies/${companySlug}/accountBalances/${accountCode}`,
      ({ date }) => ({ date })
    )
  );
}
