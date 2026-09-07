import {
  capabilities,
  certifications,
  industries,
  producerCapabilities,
  producerCertifications,
  producerIndustries,
  producerServices,
  producenci,
  producenciEmsDzialania,
  producenciEmsProdukcja,
  produkcja,
  services,
  dzialaniaEms,
  wojewodztwa,
} from "@/db/schema";
import { and, asc, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { COMPANY_TYPE_LABELS, type CompanyType } from "@/lib/supplierTaxonomy";

type ProducerSort = "default" | "name-asc" | "name-desc" | "newest" | "oldest";

export type PublicSupplierSearchFilters = {
  regions?: string[];
  requirements?: string[];
  scales?: string[];
  companyTypes?: string[];
  serviceSlugs?: string[];
  capabilitySlugs?: string[];
  industrySlugs?: string[];
  certificationCodes?: string[];
  searchQuery?: string;
  query?: string;
  sort?: ProducerSort | string;
};

export type PublicSupplierSearchOptions = {
  regions: Array<{ id: number; nazwa: string }>;
  services: Array<{ id: number; slug: string; name: string }>;
  capabilities: Array<{ id: number; slug: string; name: string }>;
  industries: Array<{ id: number; slug: string; name: string }>;
  certifications: Array<{ id: number; code: string; name: string }>;
  productionScales: Array<{ id: number; zakres: string }>;
  companyTypes: Array<{ value: string; label: string }>;
};

const producerSortOptions = new Set<ProducerSort>([
  "default",
  "name-asc",
  "name-desc",
  "newest",
  "oldest",
]);

function uniqueClean(values: string[] | undefined, maxLength = 160) {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0 && value.length <= maxLength)
    )
  );
}

function normalizeCompanyTypes(values: string[] | undefined) {
  const allowed = new Set(Object.keys(COMPANY_TYPE_LABELS));
  return uniqueClean(values, 80).filter((value) => allowed.has(value));
}

export async function getPublicSupplierSearchOptions(): Promise<PublicSupplierSearchOptions> {
  const db = getDb();

  const [regionRows, serviceRows, capabilityRows, industryRows, certificationRows, productionRows] = await Promise.all([
    db
      .select({ id: wojewodztwa.id, nazwa: wojewodztwa.nazwa })
      .from(wojewodztwa)
      .orderBy(asc(wojewodztwa.nazwa)),
    db
      .select({ id: services.id, slug: services.slug, name: services.name })
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(sql`COALESCE(${services.sortOrder}, 999999)`, asc(services.name)),
    db
      .select({ id: capabilities.id, slug: capabilities.slug, name: capabilities.name })
      .from(capabilities)
      .where(eq(capabilities.isActive, true))
      .orderBy(sql`COALESCE(${capabilities.sortOrder}, 999999)`, asc(capabilities.name)),
    db
      .select({ id: industries.id, slug: industries.slug, name: industries.name })
      .from(industries)
      .where(eq(industries.isActive, true))
      .orderBy(sql`COALESCE(${industries.sortOrder}, 999999)`, asc(industries.name)),
    db
      .select({ id: certifications.id, code: certifications.code, name: certifications.name })
      .from(certifications)
      .where(eq(certifications.isActive, true))
      .orderBy(sql`COALESCE(${certifications.sortOrder}, 999999)`, asc(certifications.code)),
    db
      .select({ id: produkcja.id, zakres: produkcja.zakres })
      .from(produkcja)
      .orderBy(sql`COALESCE(${produkcja.sortOrder}, 999999)`, asc(produkcja.zakres)),
  ]);

  return {
    regions: regionRows,
    services: serviceRows,
    capabilities: capabilityRows,
    industries: industryRows,
    certifications: certificationRows,
    productionScales: productionRows,
    companyTypes: Object.entries(COMPANY_TYPE_LABELS)
      .filter(([value]) => value !== "unclassified")
      .map(([value, label]) => ({ value, label })),
  };
}

async function matchByServices(slugs: string[]) {
  if (slugs.length === 0) return null;
  const db = getDb();

  const rows = await db
    .select({ companyId: producerServices.companyId })
    .from(producerServices)
    .innerJoin(services, eq(producerServices.serviceId, services.id))
    .where(inArray(services.slug, slugs))
    .groupBy(producerServices.companyId)
    .having(sql`COUNT(DISTINCT ${services.slug}) = ${slugs.length}`);

  return rows.map((row) => row.companyId);
}

async function matchByCapabilities(slugs: string[]) {
  if (slugs.length === 0) return null;
  const db = getDb();

  const rows = await db
    .select({ companyId: producerCapabilities.companyId })
    .from(producerCapabilities)
    .innerJoin(capabilities, eq(producerCapabilities.capabilityId, capabilities.id))
    .where(inArray(capabilities.slug, slugs))
    .groupBy(producerCapabilities.companyId)
    .having(sql`COUNT(DISTINCT ${capabilities.slug}) = ${slugs.length}`);

  return rows.map((row) => row.companyId);
}

async function matchByIndustries(slugs: string[]) {
  if (slugs.length === 0) return null;
  const db = getDb();

  const rows = await db
    .select({ companyId: producerIndustries.companyId })
    .from(producerIndustries)
    .innerJoin(industries, eq(producerIndustries.industryId, industries.id))
    .where(inArray(industries.slug, slugs))
    .groupBy(producerIndustries.companyId)
    .having(sql`COUNT(DISTINCT ${industries.slug}) = ${slugs.length}`);

  return rows.map((row) => row.companyId);
}

async function matchByCertifications(codes: string[]) {
  if (codes.length === 0) return null;
  const db = getDb();

  const rows = await db
    .select({ companyId: producerCertifications.companyId })
    .from(producerCertifications)
    .innerJoin(certifications, eq(producerCertifications.certificationId, certifications.id))
    .where(inArray(certifications.code, codes))
    .groupBy(producerCertifications.companyId)
    .having(sql`COUNT(DISTINCT ${certifications.code}) = ${codes.length}`);

  return rows.map((row) => row.companyId);
}

async function matchByLegacyRequirements(requirements: string[]) {
  if (requirements.length === 0) return null;
  const db = getDb();

  const rows = await db
    .select({ companyId: producenciEmsDzialania.companyId })
    .from(producenciEmsDzialania)
    .innerJoin(dzialaniaEms, eq(producenciEmsDzialania.dzialanieId, dzialaniaEms.id))
    .where(inArray(dzialaniaEms.nazwa, requirements))
    .groupBy(producenciEmsDzialania.companyId)
    .having(sql`COUNT(DISTINCT ${dzialaniaEms.nazwa}) = ${requirements.length}`);

  return rows.map((row) => row.companyId);
}

async function matchByScales(scales: string[]) {
  if (scales.length === 0) return null;
  const db = getDb();

  const rows = await db
    .select({ companyId: producenciEmsProdukcja.companyId })
    .from(producenciEmsProdukcja)
    .innerJoin(produkcja, eq(producenciEmsProdukcja.produkcjaId, produkcja.id))
    .where(inArray(produkcja.zakres, scales))
    .groupBy(producenciEmsProdukcja.companyId)
    .having(sql`COUNT(DISTINCT ${produkcja.zakres}) = ${scales.length}`);

  return rows.map((row) => row.companyId);
}

export async function getFilteredSuppliers(filters: PublicSupplierSearchFilters) {
  const db = getDb();
  const regions = uniqueClean(filters.regions, 100);
  const requirements = uniqueClean(filters.requirements, 120);
  const scales = uniqueClean(filters.scales, 120);
  const companyTypes = normalizeCompanyTypes(filters.companyTypes);
  const serviceSlugs = uniqueClean(filters.serviceSlugs, 100);
  const capabilitySlugs = uniqueClean(filters.capabilitySlugs, 100);
  const industrySlugs = uniqueClean(filters.industrySlugs, 100);
  const certificationCodes = uniqueClean(filters.certificationCodes, 100);
  const searchQuery = (filters.searchQuery ?? filters.query ?? "").trim().slice(0, 200);
  const sort = producerSortOptions.has(filters.sort as ProducerSort)
    ? (filters.sort as ProducerSort)
    : "default";

  const [serviceCompanyIds, capabilityCompanyIds, industryCompanyIds, certificationCompanyIds, scaleCompanyIds, legacyCompanyIds] =
    await Promise.all([
      matchByServices(serviceSlugs),
      matchByCapabilities(capabilitySlugs),
      matchByIndustries(industrySlugs),
      matchByCertifications(certificationCodes),
      matchByScales(scales),
      matchByLegacyRequirements(requirements),
    ]);

  const exactMatchGroups = [
    serviceCompanyIds,
    capabilityCompanyIds,
    industryCompanyIds,
    certificationCompanyIds,
    scaleCompanyIds,
    legacyCompanyIds,
  ];

  if (exactMatchGroups.some((group) => group !== null && group.length === 0)) {
    return [];
  }

  const whereConditions: SQL[] = [eq(producenci.isActive, true)];

  if (regions.length > 0) whereConditions.push(inArray(wojewodztwa.nazwa, regions));
  if (companyTypes.length > 0) whereConditions.push(inArray(producenci.companyType, companyTypes));

  for (const companyIds of exactMatchGroups) {
    if (companyIds && companyIds.length > 0) {
      whereConditions.push(inArray(producenci.id, companyIds));
    }
  }

  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    const searchCondition = or(
      sql`${producenci.nazwa} ILIKE ${searchPattern}`,
      sql`${producenci.opis} ILIKE ${searchPattern}`,
      sql`${wojewodztwa.nazwa} ILIKE ${searchPattern}`,
      sql`EXISTS (
        SELECT 1
        FROM ${producerServices}
        JOIN ${services} ON ${producerServices.serviceId} = ${services.id}
        WHERE ${producerServices.companyId} = ${producenci.id}
          AND ${services.name} ILIKE ${searchPattern}
      )`,
      sql`EXISTS (
        SELECT 1
        FROM ${producerCapabilities}
        JOIN ${capabilities} ON ${producerCapabilities.capabilityId} = ${capabilities.id}
        WHERE ${producerCapabilities.companyId} = ${producenci.id}
          AND ${capabilities.name} ILIKE ${searchPattern}
      )`,
      sql`EXISTS (
        SELECT 1
        FROM ${producerIndustries}
        JOIN ${industries} ON ${producerIndustries.industryId} = ${industries.id}
        WHERE ${producerIndustries.companyId} = ${producenci.id}
          AND ${industries.name} ILIKE ${searchPattern}
      )`,
      sql`EXISTS (
        SELECT 1
        FROM ${producerCertifications}
        JOIN ${certifications} ON ${producerCertifications.certificationId} = ${certifications.id}
        WHERE ${producerCertifications.companyId} = ${producenci.id}
          AND (${certifications.name} ILIKE ${searchPattern} OR ${certifications.code} ILIKE ${searchPattern})
      )`
    );

    if (searchCondition) whereConditions.push(searchCondition);
  }

  const baseQuery = db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      opis: producenci.opis,
      telefon: producenci.telefon,
      email: producenci.email,
      www: producenci.www,
      isActive: producenci.isActive,
      featured: producenci.featured,
      packageType: producenci.packageType,
      companyType: producenci.companyType,
      wojewodztwo: wojewodztwa.nazwa,
      adres: producenci.adres,
    })
    .from(producenci)
    .leftJoin(wojewodztwa, eq(producenci.wojewodztwoId, wojewodztwa.id))
    .where(and(...whereConditions));

  switch (sort) {
    case "name-asc":
      return await baseQuery.orderBy(asc(producenci.nazwa), asc(producenci.id));
    case "name-desc":
      return await baseQuery.orderBy(desc(producenci.nazwa), asc(producenci.id));
    case "newest":
      return await baseQuery.orderBy(desc(producenci.createdAt), desc(producenci.id));
    case "oldest":
      return await baseQuery.orderBy(asc(producenci.createdAt), asc(producenci.id));
    default:
      return await baseQuery.orderBy(
        desc(sql`CASE
          WHEN ${producenci.packageType} = 'premium' THEN 2
          WHEN ${producenci.packageType} = 'standard' THEN 1
          ELSE 0
        END`),
        desc(producenci.featured),
        asc(producenci.id)
      );
  }
}

export async function getPublicCompanyTaxonomy(companyId: number) {
  const db = getDb();

  const [companyRows, serviceRows, capabilityRows, industryRows, certificationRows] = await Promise.all([
    db
      .select({ companyType: producenci.companyType })
      .from(producenci)
      .where(eq(producenci.id, companyId))
      .limit(1),
    db
      .select({ id: services.id, slug: services.slug, name: services.name })
      .from(producerServices)
      .innerJoin(services, eq(producerServices.serviceId, services.id))
      .where(eq(producerServices.companyId, companyId))
      .orderBy(sql`COALESCE(${services.sortOrder}, 999999)`, asc(services.name)),
    db
      .select({ id: capabilities.id, slug: capabilities.slug, name: capabilities.name })
      .from(producerCapabilities)
      .innerJoin(capabilities, eq(producerCapabilities.capabilityId, capabilities.id))
      .where(eq(producerCapabilities.companyId, companyId))
      .orderBy(sql`COALESCE(${capabilities.sortOrder}, 999999)`, asc(capabilities.name)),
    db
      .select({ id: industries.id, slug: industries.slug, name: industries.name })
      .from(producerIndustries)
      .innerJoin(industries, eq(producerIndustries.industryId, industries.id))
      .where(eq(producerIndustries.companyId, companyId))
      .orderBy(sql`COALESCE(${industries.sortOrder}, 999999)`, asc(industries.name)),
    db
      .select({ id: certifications.id, code: certifications.code, name: certifications.name })
      .from(producerCertifications)
      .innerJoin(certifications, eq(producerCertifications.certificationId, certifications.id))
      .where(eq(producerCertifications.companyId, companyId))
      .orderBy(sql`COALESCE(${certifications.sortOrder}, 999999)`, asc(certifications.code)),
  ]);

  const companyType = (companyRows[0]?.companyType ?? "unclassified") as CompanyType;

  return {
    companyType,
    companyTypeLabel: COMPANY_TYPE_LABELS[companyType] ?? COMPANY_TYPE_LABELS.unclassified,
    services: serviceRows,
    capabilities: capabilityRows,
    industries: industryRows,
    certifications: certificationRows,
  };
}
