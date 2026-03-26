/**
 * API compliance tests — runs against the real Fiken API.
 *
 * Run with: FIKEN_API_TOKEN=$(op read "op://Employee/Fiken API key/credential") npx vitest run src/tests/api-compliance.test.ts
 *
 * Strategy for each param:
 * 1. Call endpoint WITHOUT the param → get baseline result count
 * 2. Call endpoint WITH the param set to a restrictive value → check if result count differs
 * 3. If count differs, the param is active. If identical, it's likely ignored.
 *
 * For params that can't be tested by count (e.g. sortBy), we check the response is 200.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FikenClient } from "../client.js";

const token = process.env.FIKEN_API_TOKEN;
const SKIP = !token;

let client: FikenClient;
let companySlug: string;

beforeAll(async () => {
  if (SKIP) return;
  client = new FikenClient(token!);
  const companies = await client.getPaginated<{ slug: string }>("/companies", { page: 0, pageSize: 1 });
  expect(companies.data.length).toBeGreaterThan(0);
  companySlug = companies.data[0].slug;
});

/** Helper: get result count for a paginated endpoint with given params */
async function countResults(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<number> {
  const result = await client.getPaginated(path, { page: 0, pageSize: 1 }, params);
  return result.pagination.resultCount;
}

/** Helper: check a GET returns 200 (doesn't throw) */
async function canGet(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<boolean> {
  try {
    await client.get(path, params);
    return true;
  } catch {
    return false;
  }
}

/** Helper: check if a param reduces results (i.e. the API actually filters by it) */
async function paramFilters(
  path: string,
  param: string,
  value: string | number | boolean
): Promise<{ baseline: number; filtered: number; active: boolean }> {
  const baseline = await countResults(path);
  const filtered = await countResults(path, { [param]: value });
  return { baseline, filtered, active: baseline !== filtered };
}

// ============================================================
// REMOVED PARAMS — do these actually work?
// ============================================================

describe.skipIf(SKIP)("Removed params — checking if API actually accepts them", () => {
  const results: Array<{ endpoint: string; param: string; baseline: number; filtered: number; verdict: string }> = [];

  afterAll(() => {
    if (results.length > 0) {
      console.log("\n=== REMOVED PARAMS VERDICT ===");
      console.table(results);
    }
  });

  it("invoices: 'kid' param", async () => {
    const path = `/companies/${companySlug}/invoices`;
    const r = await paramFilters(path, "kid", "000000000");
    results.push({ endpoint: "invoices", param: "kid", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("invoices: 'projectId' param", async () => {
    const path = `/companies/${companySlug}/invoices`;
    const r = await paramFilters(path, "projectId", 999999);
    results.push({ endpoint: "invoices", param: "projectId", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("sales: 'settled' param", async () => {
    const path = `/companies/${companySlug}/sales`;
    const r = await paramFilters(path, "settled", true);
    results.push({ endpoint: "sales", param: "settled", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("sales: 'projectId' param", async () => {
    const path = `/companies/${companySlug}/sales`;
    const r = await paramFilters(path, "projectId", 999999);
    results.push({ endpoint: "sales", param: "projectId", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("purchases: 'settled' param", async () => {
    const path = `/companies/${companySlug}/purchases`;
    const r = await paramFilters(path, "settled", true);
    results.push({ endpoint: "purchases", param: "settled", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("purchases: 'projectId' param", async () => {
    const path = `/companies/${companySlug}/purchases`;
    const r = await paramFilters(path, "projectId", 999999);
    results.push({ endpoint: "purchases", param: "projectId", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("projects: 'name' param", async () => {
    const path = `/companies/${companySlug}/projects`;
    const r = await paramFilters(path, "name", "zzz_nonexistent_project_zzz");
    results.push({ endpoint: "projects", param: "name", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("projects: 'number' param", async () => {
    const path = `/companies/${companySlug}/projects`;
    const r = await paramFilters(path, "number", "zzz_nonexistent_zzz");
    results.push({ endpoint: "projects", param: "number", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("inbox: 'description' param", async () => {
    const path = `/companies/${companySlug}/inbox`;
    const r = await paramFilters(path, "description", "zzz_nonexistent_zzz");
    results.push({ endpoint: "inbox", param: "description", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("invoices: 'dateGe' param (generic date range)", async () => {
    const path = `/companies/${companySlug}/invoices`;
    const r = await paramFilters(path, "dateGe", "2099-01-01");
    results.push({ endpoint: "invoices", param: "dateGe", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("sales: 'dateGe' param (date range variant)", async () => {
    const path = `/companies/${companySlug}/sales`;
    const r = await paramFilters(path, "dateGe", "2099-01-01");
    results.push({ endpoint: "sales", param: "dateGe", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("sales: 'lastModifiedGe' param (range variant)", async () => {
    const path = `/companies/${companySlug}/sales`;
    const r = await paramFilters(path, "lastModifiedGe", "2099-01-01");
    results.push({ endpoint: "sales", param: "lastModifiedGe", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });

  it("transactions: 'dateGe' param", async () => {
    const path = `/companies/${companySlug}/transactions`;
    const r = await paramFilters(path, "dateGe", "2099-01-01");
    results.push({ endpoint: "transactions", param: "dateGe", ...r, verdict: r.active ? "ACTIVE — should restore" : "ignored" });
  });
});

// ============================================================
// KEPT/ADDED PARAMS — verify these actually work
// ============================================================

describe.skipIf(SKIP)("Kept/added params — verifying they work", () => {
  const results: Array<{ endpoint: string; param: string; baseline: number; filtered: number; verdict: string }> = [];

  afterAll(() => {
    if (results.length > 0) {
      console.log("\n=== KEPT/ADDED PARAMS VERDICT ===");
      console.table(results);
    }
  });

  it("invoices: 'issueDateGe' filters results", async () => {
    const path = `/companies/${companySlug}/invoices`;
    const r = await paramFilters(path, "issueDateGe", "2099-01-01");
    results.push({ endpoint: "invoices", param: "issueDateGe", ...r, verdict: r.active ? "works" : "NOT FILTERING" });
  });

  it("invoices: 'settled' filters results", async () => {
    const path = `/companies/${companySlug}/invoices`;
    const r = await paramFilters(path, "settled", true);
    results.push({ endpoint: "invoices", param: "settled", ...r, verdict: r.active ? "works" : "NOT FILTERING" });
  });

  it("credit notes: 'issueDateGe' filters results", async () => {
    const path = `/companies/${companySlug}/creditNotes`;
    const r = await paramFilters(path, "issueDateGe", "2099-01-01");
    results.push({ endpoint: "creditNotes", param: "issueDateGe", ...r, verdict: r.active ? "works" : "NOT FILTERING" });
  });

  it("contacts: 'customer' filters results", async () => {
    const path = `/companies/${companySlug}/contacts`;
    const r = await paramFilters(path, "customer", true);
    results.push({ endpoint: "contacts", param: "customer", ...r, verdict: r.active ? "works" : "NOT FILTERING" });
  });

  it("journal entries: 'dateGe' filters results", async () => {
    const path = `/companies/${companySlug}/journalEntries`;
    const r = await paramFilters(path, "dateGe", "2099-01-01");
    results.push({ endpoint: "journalEntries", param: "dateGe", ...r, verdict: r.active ? "works" : "NOT FILTERING" });
  });

  it("time entries: 'timeUserId' filters results", async () => {
    const path = `/companies/${companySlug}/timeEntries`;
    const r = await paramFilters(path, "timeUserId", 999999);
    results.push({ endpoint: "timeEntries", param: "timeUserId", ...r, verdict: r.active ? "works" : "NOT FILTERING" });
  });

  it("accounts: 'fromAccount' (string) filters results", async () => {
    const path = `/companies/${companySlug}/accounts`;
    const r = await paramFilters(path, "fromAccount", "9000");
    results.push({ endpoint: "accounts", param: "fromAccount", ...r, verdict: r.active ? "works" : "NOT FILTERING" });
  });

  it("account balances: 'date' (required) works", async () => {
    const path = `/companies/${companySlug}/accountBalances`;
    const ok = await canGet(path + "?page=0&pageSize=1&date=2024-12-31");
    // Also try via getPaginated
    try {
      const result = await client.getPaginated(
        `/companies/${companySlug}/accountBalances`,
        { page: 0, pageSize: 1 },
        { date: "2024-12-31" }
      );
      results.push({ endpoint: "accountBalances", param: "date", baseline: -1, filtered: result.pagination.resultCount, verdict: "works" });
    } catch (e) {
      results.push({ endpoint: "accountBalances", param: "date", baseline: -1, filtered: -1, verdict: `ERROR: ${e}` });
    }
  });

  it("purchases: 'createdDateGe' filters results", async () => {
    const path = `/companies/${companySlug}/purchases`;
    const r = await paramFilters(path, "createdDateGe", "2099-01-01");
    results.push({ endpoint: "purchases", param: "createdDateGe", ...r, verdict: r.active ? "works" : "NOT FILTERING" });
  });

  it("products: 'active' filters results", async () => {
    const path = `/companies/${companySlug}/products`;
    const r = await paramFilters(path, "active", false);
    results.push({ endpoint: "products", param: "active", ...r, verdict: r.active ? "works" : "NOT FILTERING" });
  });
});

// ============================================================
// RENAMED PARAMS — verify old name doesn't work, new name does
// ============================================================

describe.skipIf(SKIP)("Renamed params — old vs new name", () => {
  it("time entries: 'userId' (old) vs 'timeUserId' (new)", async () => {
    const path = `/companies/${companySlug}/timeEntries`;
    const oldName = await paramFilters(path, "userId", 999999);
    const newName = await paramFilters(path, "timeUserId", 999999);

    console.log("\n=== RENAMED PARAM: userId vs timeUserId ===");
    console.log(`  userId:     baseline=${oldName.baseline} filtered=${oldName.filtered} active=${oldName.active}`);
    console.log(`  timeUserId: baseline=${newName.baseline} filtered=${newName.filtered} active=${newName.active}`);
  });
});
