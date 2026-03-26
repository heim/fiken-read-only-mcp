import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FikenClient } from "../client.js";
import { CompanySlugSchema, PaginationSchema, LastModifiedSchema, CreatedDateSchema } from "../types.js";
import { getHandler, listHandler } from "../utils.js";

const ListContactsSchema = CompanySlugSchema.merge(PaginationSchema).merge(LastModifiedSchema).merge(CreatedDateSchema).extend({
  name: z.string().optional().describe("Filter by contact name"),
  email: z.string().optional().describe("Filter by email address"),
  organizationNumber: z.string().optional().describe("Filter by organization number"),
  customerNumber: z.number().int().optional().describe("Filter by customer number"),
  memberNumber: z.number().int().optional().describe("Filter by member number"),
  memberNumberString: z.string().optional().describe("Filter by member number string"),
  supplierNumber: z.number().int().optional().describe("Filter by supplier number"),
  customer: z.boolean().optional().describe("Filter to only customers"),
  supplier: z.boolean().optional().describe("Filter to only suppliers"),
  inactive: z.boolean().optional().describe("Include inactive contacts"),
  group: z.string().optional().describe("Filter by group name"),
  sortBy: z.string().optional().describe("Sort order"),
  phoneNumber: z.string().optional().describe("Filter by phone number"),
});

const GetContactSchema = CompanySlugSchema.extend({
  contactId: z.number().int().describe("Contact ID"),
});

const GetContactPersonSchema = CompanySlugSchema.extend({
  contactId: z.number().int().describe("Contact ID"),
  contactPersonId: z.number().int().describe("Contact person ID"),
});

const ListContactGroupsSchema = CompanySlugSchema.merge(PaginationSchema);

export function registerContactTools(server: McpServer, client: FikenClient): void {
  server.registerTool(
    "fiken_list_contacts",
    {
      description: "List contacts (customers and suppliers) for a company",
      inputSchema: ListContactsSchema.shape,
    },
    listHandler(client, ListContactsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/contacts`
    )
  );

  server.registerTool(
    "fiken_get_contact",
    {
      description: "Get a specific contact by ID",
      inputSchema: GetContactSchema.shape,
    },
    getHandler(client, GetContactSchema, ({ companySlug, contactId }) =>
      `/companies/${companySlug}/contacts/${contactId}`
    )
  );

  server.registerTool(
    "fiken_list_contact_persons",
    {
      description: "List contact persons for a specific contact",
      inputSchema: GetContactSchema.shape,
    },
    getHandler(client, GetContactSchema, ({ companySlug, contactId }) =>
      `/companies/${companySlug}/contacts/${contactId}/contactPerson`
    )
  );

  server.registerTool(
    "fiken_get_contact_person",
    {
      description: "Get a specific contact person by ID",
      inputSchema: GetContactPersonSchema.shape,
    },
    getHandler(client, GetContactPersonSchema, ({ companySlug, contactId, contactPersonId }) =>
      `/companies/${companySlug}/contacts/${contactId}/contactPerson/${contactPersonId}`
    )
  );

  server.registerTool(
    "fiken_list_contact_groups",
    {
      description: "List contact groups for a company",
      inputSchema: ListContactGroupsSchema.shape,
    },
    listHandler(client, ListContactGroupsSchema, ({ companySlug }) =>
      `/companies/${companySlug}/groups`
    )
  );
}
