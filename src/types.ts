import { z } from "zod";

/**
 * Matches URL-safe slug: lowercase alphanumeric and hyphens only.
 * Prevents path traversal (e.g. "../../admin") in URL interpolation.
 */
const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export const CompanySlugSchema = z.object({
  companySlug: z
    .string()
    .regex(SLUG_PATTERN, "Invalid company slug format")
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

/** Matches YYYY-MM-DD date format */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const dateString = () => z.string().regex(DATE_PATTERN, "Date must be in YYYY-MM-DD format");

export const DateRangeSchema = z.object({
  date: dateString().optional().describe("Exact date filter (YYYY-MM-DD)"),
  dateLe: dateString().optional().describe("Date less than or equal (YYYY-MM-DD)"),
  dateLt: dateString().optional().describe("Date less than (YYYY-MM-DD)"),
  dateGe: dateString().optional().describe("Date greater than or equal (YYYY-MM-DD)"),
  dateGt: dateString().optional().describe("Date greater than (YYYY-MM-DD)"),
});

export const LastModifiedSchema = z.object({
  lastModified: dateString().optional().describe("Exact lastModified filter (YYYY-MM-DD)"),
  lastModifiedLe: dateString().optional().describe("lastModified less than or equal (YYYY-MM-DD)"),
  lastModifiedLt: dateString().optional().describe("lastModified less than (YYYY-MM-DD)"),
  lastModifiedGe: dateString().optional().describe("lastModified greater than or equal (YYYY-MM-DD)"),
  lastModifiedGt: dateString().optional().describe("lastModified greater than (YYYY-MM-DD)"),
});
