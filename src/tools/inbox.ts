import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, CreatedDateSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListInboxSchema = CompanySlugSchema.merge(PaginationSchema).merge(CreatedDateSchema).extend({
  name: z.string().optional().describe("Filter by document name"),
  status: z.string().optional().describe("Filter by document status"),
  sortBy: z.string().optional().describe("Sort order (e.g. 'createdDate desc', 'name asc')"),
});

const GetInboxDocumentSchema = CompanySlugSchema.extend({
  inboxDocumentId: z.number().int().describe("Inbox document ID"),
});

export function registerInboxTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_inbox",
    {
      description: "List inbox documents for a company",
      inputSchema: ListInboxSchema.shape,
    },
    listHandler(client, ListInboxSchema, ({ companySlug }) =>
      `/companies/${companySlug}/inbox`
    )
  );

  server.registerTool(
    "fiken_get_inbox_document",
    {
      description: "Get a specific inbox document by ID",
      inputSchema: GetInboxDocumentSchema.shape,
    },
    getHandler(client, GetInboxDocumentSchema, ({ companySlug, inboxDocumentId }) =>
      `/companies/${companySlug}/inbox/${inboxDocumentId}`
    )
  );
}
