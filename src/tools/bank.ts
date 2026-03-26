import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema } from "../types.js";
import { wrapToolError, toText } from "../utils.js";

export function registerBankTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_bank_accounts",
    {
      description: "List bank accounts for a company",
      inputSchema: {
        ...CompanySlugSchema.shape,
        ...PaginationSchema.shape,
      },
    },
    wrapToolError(async (args) => {
      const { companySlug, page, pageSize } = CompanySlugSchema.merge(PaginationSchema).parse(args);
      const data = await client.getPaginated(
        `/companies/${companySlug}/bankAccounts`,
        { page, pageSize }
      );
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_get_bank_account",
    {
      description: "Get a specific bank account by ID",
      inputSchema: {
        ...CompanySlugSchema.shape,
        bankAccountId: z.number().int().describe("Bank account ID"),
      },
    },
    wrapToolError(async (args) => {
      const schema = CompanySlugSchema.extend({ bankAccountId: z.number().int() });
      const { companySlug, bankAccountId } = schema.parse(args);
      const data = await client.get(`/companies/${companySlug}/bankAccounts/${bankAccountId}`);
      return toText(data);
    })
  );

  server.registerTool(
    "fiken_list_bank_balances",
    {
      description: "List bank balances for all bank accounts of a company. Amounts are in cents.",
      inputSchema: {
        ...CompanySlugSchema.shape,
      },
    },
    wrapToolError(async (args) => {
      const { companySlug } = CompanySlugSchema.parse(args);
      const data = await client.get(`/companies/${companySlug}/bankBalances`);
      return toText(data);
    })
  );
}
