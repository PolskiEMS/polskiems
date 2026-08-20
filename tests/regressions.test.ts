import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { companyNameToSlug } from "../src/lib/companySlug.ts";
const actions = await readFile("src/lib/actions.ts", "utf8");
function body(name: string) { const functionStart = actions.indexOf(`function ${name}`); const start = functionStart >= 0 ? functionStart : actions.indexOf(`const ${name}`); const next = actions.indexOf("\nexport ", start + 1); return actions.slice(start, next < 0 ? undefined : next); }
test("render-time getters are pure reads", () => { for (const name of ["getFeaturedProducers", "getAllProducers", "getFilteredProducers", "getAllDzialaniaEms"]) assert.doesNotMatch(body(name), /deactivateExpiredPaidCompanies|\.insert\(|\.update\(|\.delete\(/, name); });
test("sitemap excludes known missing route", async () => assert.doesNotMatch(await readFile("src/app/sitemap.ts", "utf8"), /produkcja-elektroniki-polska/));
test("component supplier is available as an EMS activity", async () => {
  const services = await readFile("src/lib/services.ts", "utf8");
  const migration = await readFile("drizzle/0002_add_component_supplier_service.sql", "utf8");

  assert.match(services, /"Dostarcza komponenty"/);
  assert.match(migration, /VALUES \('Dostarcza komponenty'\)/);
  assert.match(migration, /ON CONFLICT \("nazwa"\) DO NOTHING/);
});
test("company names produce readable profile slugs", () => {
  assert.equal(companyNameToSlug("Żółta Płytka EMS Sp. z o.o."), "zolta-plytka-ems-sp-z-o-o");
});
