import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListAccountsSchema = CompanySlugSchema.merge(PaginationSchema).extend({
  fromAccount: z.number().optional().describe("Filter accounts from this account number"),
  toAccount: z.number().optional().describe("Filter accounts to this account number"),
  year: z.number().int().optional().describe("Fiscal year"),
});

const GetAccountSchema = CompanySlugSchema.extend({
  accountCode: z.string().describe("Account code (e.g. '1920' or '1500:10001')"),
  year: z.number().int().optional().describe("Fiscal year"),
});

const ListAccountBalancesSchema = CompanySlugSchema.merge(PaginationSchema).extend({
  fromAccount: z.number().optional().describe("Filter from this account number"),
  toAccount: z.number().optional().describe("Filter to this account number"),
  year: z.number().int().optional().describe("Fiscal year"),
});

const GetAccountBalanceSchema = CompanySlugSchema.extend({
  accountCode: z.string().describe("Account code (e.g. '1920')"),
  year: z.number().int().optional().describe("Fiscal year"),
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
    getHandler(
      client, GetAccountSchema,
      ({ companySlug, accountCode }) => `/companies/${companySlug}/accounts/${accountCode}`,
      ({ year }) => ({ year })
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
      ({ year }) => ({ year })
    )
  );
}
