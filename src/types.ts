import { z } from "zod";

export const CompanySlugSchema = z.object({
  companySlug: z
    .string()
    .describe(
      "Company slug identifier. Use fiken_list_companies to discover available slugs."
    ),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(0).default(0).optional().describe("Page number, starting at 0"),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .optional()
    .describe("Number of results per page (max 100)"),
});

export const DateRangeSchema = z.object({
  date: z.string().optional().describe("Exact date filter (YYYY-MM-DD)"),
  dateLe: z.string().optional().describe("Date less than or equal (YYYY-MM-DD)"),
  dateLt: z.string().optional().describe("Date less than (YYYY-MM-DD)"),
  dateGe: z.string().optional().describe("Date greater than or equal (YYYY-MM-DD)"),
  dateGt: z.string().optional().describe("Date greater than (YYYY-MM-DD)"),
});

export const LastModifiedSchema = z.object({
  lastModified: z.string().optional().describe("Exact lastModified filter (YYYY-MM-DD)"),
  lastModifiedLe: z.string().optional().describe("lastModified less than or equal (YYYY-MM-DD)"),
  lastModifiedLt: z.string().optional().describe("lastModified less than (YYYY-MM-DD)"),
  lastModifiedGe: z.string().optional().describe("lastModified greater than or equal (YYYY-MM-DD)"),
  lastModifiedGt: z.string().optional().describe("lastModified greater than (YYYY-MM-DD)"),
});

export const CreatedDateSchema = z.object({
  createdDate: z.string().optional().describe("Exact creation date filter (YYYY-MM-DD)"),
  createdDateLe: z.string().optional().describe("Creation date less than or equal (YYYY-MM-DD)"),
  createdDateLt: z.string().optional().describe("Creation date less than (YYYY-MM-DD)"),
  createdDateGe: z.string().optional().describe("Creation date greater than or equal (YYYY-MM-DD)"),
  createdDateGt: z.string().optional().describe("Creation date greater than (YYYY-MM-DD)"),
});

export const IssueDateSchema = z.object({
  issueDate: z.string().optional().describe("Exact issue date filter (YYYY-MM-DD)"),
  issueDateLe: z.string().optional().describe("Issue date less than or equal (YYYY-MM-DD)"),
  issueDateLt: z.string().optional().describe("Issue date less than (YYYY-MM-DD)"),
  issueDateGe: z.string().optional().describe("Issue date greater than or equal (YYYY-MM-DD)"),
  issueDateGt: z.string().optional().describe("Issue date greater than (YYYY-MM-DD)"),
});

export const DueDateSchema = z.object({
  dueDate: z.string().optional().describe("Exact due date filter (YYYY-MM-DD)"),
  dueDateLe: z.string().optional().describe("Due date less than or equal (YYYY-MM-DD)"),
  dueDateLt: z.string().optional().describe("Due date less than (YYYY-MM-DD)"),
  dueDateGe: z.string().optional().describe("Due date greater than or equal (YYYY-MM-DD)"),
  dueDateGt: z.string().optional().describe("Due date greater than (YYYY-MM-DD)"),
});
