"use server";

import { asc, eq, sql } from "drizzle-orm";
import {
  certifications,
  capabilities,
  industries,
  producerCapabilities,
  producerCertifications,
  producerIndustries,
  producerServices,
  producenci,
  producenciEmsProdukcja,
  services,
  wojewodztwa,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { COMPANY_TYPE_LABELS, type CompanyType } from "@/lib/supplierTaxonomy";

const companyTypeValues = new Set<string>(Object.keys(COMPANY_TYPE_LABELS));
const REQUIRED_SECTIONS_COUNT = 6;

function normalizeCompanyType(value: string | null): CompanyType {
  const normalized = String(value ?? "unclassified").trim();
  return (companyTypeValues.has(normalized) ? normalized : "unclassified") as CompanyType;
}

function getMissingSections(input: {
  companyType: CompanyType;
  servicesCount: number;
  capabilitiesCount: number;
  industriesCount: number;
  certificationsCount: number;
  productionScalesCount: number;
}) {
  const missing: string[] = [];

  if (input.companyType === "unclassified") missing.push("Typ firmy");
  if (input.servicesCount === 0) missing.push("Usługi");
  if (input.capabilitiesCount === 0) missing.push("Możliwości");
  if (input.industriesCount === 0) missing.push("Branże");
  if (input.certificationsCount === 0) missing.push("Certyfikaty");
  if (input.productionScalesCount === 0) missing.push("Skala produkcji");

  return missing;
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

export async function getTaxonomyCleanupDashboard() {
  await requireAdminSession();
  const db = getDb();

  const rows = await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      packageType: producenci.packageType,
      companyType: producenci.companyType,
      wojewodztwo: wojewodztwa.nazwa,
      servicesCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${producerServices}
        WHERE ${producerServices.companyId} = ${producenci.id}
      )`,
      capabilitiesCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${producerCapabilities}
        WHERE ${producerCapabilities.companyId} = ${producenci.id}
      )`,
      industriesCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${producerIndustries}
        WHERE ${producerIndustries.companyId} = ${producenci.id}
      )`,
      certificationsCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${producerCertifications}
        WHERE ${producerCertifications.companyId} = ${producenci.id}
      )`,
      productionScalesCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${producenciEmsProdukcja}
        WHERE ${producenciEmsProdukcja.companyId} = ${producenci.id}
      )`,
    })
    .from(producenci)
    .leftJoin(wojewodztwa, eq(producenci.wojewodztwoId, wojewodztwa.id))
    .where(eq(producenci.isActive, true))
    .orderBy(asc(producenci.nazwa));

  const companies = rows.map((row) => {
    const companyType = normalizeCompanyType(row.companyType);
    const servicesCount = toNumber(row.servicesCount);
    const capabilitiesCount = toNumber(row.capabilitiesCount);
    const industriesCount = toNumber(row.industriesCount);
    const certificationsCount = toNumber(row.certificationsCount);
    const productionScalesCount = toNumber(row.productionScalesCount);
    const missingSections = getMissingSections({
      companyType,
      servicesCount,
      capabilitiesCount,
      industriesCount,
      certificationsCount,
      productionScalesCount,
    });
    const completedSections = REQUIRED_SECTIONS_COUNT - missingSections.length;

    return {
      id: row.id,
      nazwa: row.nazwa,
      packageType: row.packageType ?? "free",
      companyType,
      companyTypeLabel: COMPANY_TYPE_LABELS[companyType],
      wojewodztwo: row.wojewodztwo ?? "Brak województwa",
      servicesCount,
      capabilitiesCount,
      industriesCount,
      certificationsCount,
      productionScalesCount,
      missingSections,
      completedSections,
      completionScore: Math.round((completedSections / REQUIRED_SECTIONS_COUNT) * 100),
      editHref: `/admin/firmy/${row.id}`,
    };
  });

  const sortedCompanies = companies.sort((a, b) => {
    const packagePriority = (value: string) => {
      if (value === "premium") return 0;
      if (value === "standard") return 1;
      return 2;
    };

    return (
      a.completionScore - b.completionScore ||
      packagePriority(a.packageType) - packagePriority(b.packageType) ||
      a.nazwa.localeCompare(b.nazwa, "pl")
    );
  });

  return {
    summary: {
      totalCompanies: companies.length,
      typedCompanies: companies.filter((company) => company.companyType !== "unclassified").length,
      companiesWithServices: companies.filter((company) => company.servicesCount > 0).length,
      companiesWithCapabilities: companies.filter((company) => company.capabilitiesCount > 0).length,
      companiesWithIndustries: companies.filter((company) => company.industriesCount > 0).length,
      companiesWithCertifications: companies.filter((company) => company.certificationsCount > 0).length,
      companiesWithProductionScale: companies.filter((company) => company.productionScalesCount > 0).length,
      completeCompanies: companies.filter((company) => company.missingSections.length === 0).length,
    },
    companies: sortedCompanies,
    priorityCompanies: sortedCompanies.filter((company) => company.missingSections.length > 0).slice(0, 20),
  };
}

export async function getTaxonomyDictionarySummary() {
  await requireAdminSession();
  const db = getDb();

  const [serviceRows, capabilityRows, industryRows, certificationRows] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(services).where(eq(services.isActive, true)),
    db.select({ count: sql<number>`COUNT(*)` }).from(capabilities).where(eq(capabilities.isActive, true)),
    db.select({ count: sql<number>`COUNT(*)` }).from(industries).where(eq(industries.isActive, true)),
    db.select({ count: sql<number>`COUNT(*)` }).from(certifications).where(eq(certifications.isActive, true)),
  ]);

  return {
    services: toNumber(serviceRows[0]?.count),
    capabilities: toNumber(capabilityRows[0]?.count),
    industries: toNumber(industryRows[0]?.count),
    certifications: toNumber(certificationRows[0]?.count),
  };
}
