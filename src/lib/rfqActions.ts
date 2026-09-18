"use server";

import { redirect } from "next/navigation";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  capabilities,
  certifications,
  industries,
  inquiries,
  inquiryRecipients,
  producenci,
  producenciEmsProdukcja,
  producerCapabilities,
  producerCertifications,
  producerIndustries,
  producerServices,
  produkcja,
  services,
  wojewodztwa,
} from "@/db/schema";
import { getDb } from "@/lib/db";

type MatchingMode = "selected_company" | "auto_match";

type MatchCriteria = {
  serviceSlugs: string[];
  capabilitySlugs: string[];
  industrySlugs: string[];
  certificationCodes: string[];
  productionScaleIds: number[];
  preferredRegionIds: number[];
};

function normalizeInquirySource(value: FormDataEntryValue | null) {
  const source = String(value ?? "global_form");
  if (["company_card", "company_profile", "global_form"].includes(source)) {
    return source as "company_card" | "company_profile" | "global_form";
  }
  return "global_form";
}

function normalizeMatchingMode(value: FormDataEntryValue | null): MatchingMode {
  return String(value ?? "") === "selected_company" ? "selected_company" : "auto_match";
}

function getInquiryRedirect(companyId: number, params: Record<string, string>) {
  const search = new URLSearchParams(params);
  if (companyId > 0) search.set("companyId", String(companyId));
  return `/zapytania-ofertowe?${search.toString()}`;
}

function currentDateTime() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function uniqueStrings(values: FormDataEntryValue[]) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function uniqueNumbers(values: FormDataEntryValue[]) {
  return [...new Set(
    values
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
  )];
}

async function validateCriteria(criteria: MatchCriteria) {
  const db = getDb();

  const [
    serviceRows,
    capabilityRows,
    industryRows,
    certificationRows,
    productionRows,
    regionRows,
  ] = await Promise.all([
    criteria.serviceSlugs.length
      ? db.select({ slug: services.slug, name: services.name }).from(services)
          .where(and(eq(services.isActive, true), inArray(services.slug, criteria.serviceSlugs)))
      : Promise.resolve([]),
    criteria.capabilitySlugs.length
      ? db.select({ slug: capabilities.slug }).from(capabilities)
          .where(and(eq(capabilities.isActive, true), inArray(capabilities.slug, criteria.capabilitySlugs)))
      : Promise.resolve([]),
    criteria.industrySlugs.length
      ? db.select({ slug: industries.slug }).from(industries)
          .where(and(eq(industries.isActive, true), inArray(industries.slug, criteria.industrySlugs)))
      : Promise.resolve([]),
    criteria.certificationCodes.length
      ? db.select({ code: certifications.code }).from(certifications)
          .where(and(eq(certifications.isActive, true), inArray(certifications.code, criteria.certificationCodes)))
      : Promise.resolve([]),
    criteria.productionScaleIds.length
      ? db.select({ id: produkcja.id }).from(produkcja)
          .where(inArray(produkcja.id, criteria.productionScaleIds))
      : Promise.resolve([]),
    criteria.preferredRegionIds.length
      ? db.select({ id: wojewodztwa.id }).from(wojewodztwa)
          .where(inArray(wojewodztwa.id, criteria.preferredRegionIds))
      : Promise.resolve([]),
  ]);

  return {
    criteria: {
      serviceSlugs: serviceRows.map((row) => row.slug),
      capabilitySlugs: capabilityRows.map((row) => row.slug),
      industrySlugs: industryRows.map((row) => row.slug),
      certificationCodes: certificationRows.map((row) => row.code),
      productionScaleIds: productionRows.map((row) => row.id),
      preferredRegionIds: regionRows.map((row) => row.id),
    },
    serviceNames: serviceRows.map((row) => row.name),
  };
}

async function getMatchedInquiryCompanies(criteria: MatchCriteria) {
  const db = getDb();

  const candidates = await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      email: producenci.email,
      packageType: producenci.packageType,
      featured: producenci.featured,
      wojewodztwoId: producenci.wojewodztwoId,
    })
    .from(producenci)
    .where(and(
      eq(producenci.isActive, true),
      sql`${producenci.email} IS NOT NULL`,
      sql`TRIM(${producenci.email}) <> ''`
    ));

  if (candidates.length === 0) return [];

  const companyIds = candidates.map((company) => company.id);
  const score = new Map<number, number>();
  const serviceMatches = new Map<number, number>();

  candidates.forEach((company) => score.set(company.id, 0));

  const addWeightedMatches = (
    rows: Array<{ companyId: number }>,
    maxPoints: number,
    requestedCount: number,
    trackServices = false
  ) => {
    if (requestedCount === 0) return;
    const perMatch = maxPoints / requestedCount;
    rows.forEach((row) => {
      score.set(row.companyId, (score.get(row.companyId) ?? 0) + perMatch);
      if (trackServices) {
        serviceMatches.set(row.companyId, (serviceMatches.get(row.companyId) ?? 0) + 1);
      }
    });
  };

  const [
    serviceRows,
    capabilityRows,
    industryRows,
    certificationRows,
    productionRows,
  ] = await Promise.all([
    criteria.serviceSlugs.length
      ? db.select({ companyId: producerServices.companyId })
          .from(producerServices)
          .innerJoin(services, eq(services.id, producerServices.serviceId))
          .where(and(inArray(producerServices.companyId, companyIds), inArray(services.slug, criteria.serviceSlugs)))
      : Promise.resolve([]),
    criteria.capabilitySlugs.length
      ? db.select({ companyId: producerCapabilities.companyId })
          .from(producerCapabilities)
          .innerJoin(capabilities, eq(capabilities.id, producerCapabilities.capabilityId))
          .where(and(inArray(producerCapabilities.companyId, companyIds), inArray(capabilities.slug, criteria.capabilitySlugs)))
      : Promise.resolve([]),
    criteria.industrySlugs.length
      ? db.select({ companyId: producerIndustries.companyId })
          .from(producerIndustries)
          .innerJoin(industries, eq(industries.id, producerIndustries.industryId))
          .where(and(inArray(producerIndustries.companyId, companyIds), inArray(industries.slug, criteria.industrySlugs)))
      : Promise.resolve([]),
    criteria.certificationCodes.length
      ? db.select({ companyId: producerCertifications.companyId })
          .from(producerCertifications)
          .innerJoin(certifications, eq(certifications.id, producerCertifications.certificationId))
          .where(and(inArray(producerCertifications.companyId, companyIds), inArray(certifications.code, criteria.certificationCodes)))
      : Promise.resolve([]),
    criteria.productionScaleIds.length
      ? db.select({ companyId: producenciEmsProdukcja.companyId })
          .from(producenciEmsProdukcja)
          .where(and(
            inArray(producenciEmsProdukcja.companyId, companyIds),
            inArray(producenciEmsProdukcja.produkcjaId, criteria.productionScaleIds)
          ))
      : Promise.resolve([]),
  ]);

  addWeightedMatches(serviceRows, 40, criteria.serviceSlugs.length, true);
  addWeightedMatches(capabilityRows, 20, criteria.capabilitySlugs.length);
  addWeightedMatches(industryRows, 15, criteria.industrySlugs.length);
  addWeightedMatches(certificationRows, 15, criteria.certificationCodes.length);
  addWeightedMatches(productionRows, 5, criteria.productionScaleIds.length);

  if (criteria.preferredRegionIds.length > 0) {
    candidates.forEach((company) => {
      if (company.wojewodztwoId && criteria.preferredRegionIds.includes(company.wojewodztwoId)) {
        score.set(company.id, (score.get(company.id) ?? 0) + 5);
      }
    });
  }

  const packageRank = (packageType: string) => {
    if (packageType === "premium") return 2;
    if (packageType === "standard") return 1;
    return 0;
  };

  const ranked = [...candidates].sort((a, b) => {
    const scoreDiff = (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    const packageDiff = packageRank(b.packageType) - packageRank(a.packageType);
    if (packageDiff !== 0) return packageDiff;
    if (Boolean(b.featured) !== Boolean(a.featured)) return b.featured ? 1 : -1;
    return a.nazwa.localeCompare(b.nazwa, "pl");
  });

  const withServiceMatch = ranked.filter((company) => (serviceMatches.get(company.id) ?? 0) > 0);
  const selected = [...withServiceMatch];

  ranked.forEach((company) => {
    if (selected.length < 5 && !selected.some((item) => item.id === company.id)) {
      selected.push(company);
    }
  });

  return selected.slice(0, 5);
}

export async function sendInquiryAction(formData: FormData) {
  const db = getDb();

  const source = normalizeInquirySource(formData.get("source"));
  const matchingMode = normalizeMatchingMode(formData.get("matchingMode"));
  const companyId = Number(formData.get("companyId") ?? 0);

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerCompany = String(formData.get("customerCompany") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const hasDocumentation = formData.get("hasDocumentation") === "yes";
  const rodoConsent = formData.get("rodoConsent") === "on";

  const rawCriteria: MatchCriteria = {
    serviceSlugs: uniqueStrings(formData.getAll("serviceSlugs")),
    capabilitySlugs: uniqueStrings(formData.getAll("capabilitySlugs")),
    industrySlugs: uniqueStrings(formData.getAll("industrySlugs")),
    certificationCodes: uniqueStrings(formData.getAll("certificationCodes")),
    productionScaleIds: uniqueNumbers(formData.getAll("productionScaleIds")),
    preferredRegionIds: uniqueNumbers(formData.getAll("preferredRegionIds")),
  };

  const { criteria, serviceNames } = await validateCriteria(rawCriteria);

  if (
    !customerName ||
    !customerEmail ||
    criteria.serviceSlugs.length === 0 ||
    !quantity ||
    !deadline ||
    !message ||
    !rodoConsent ||
    (matchingMode === "selected_company" && (!Number.isInteger(companyId) || companyId <= 0))
  ) {
    redirect(getInquiryRedirect(Number.isInteger(companyId) ? companyId : 0, { error: "missing" }));
  }

  const documentationFile = formData.get("documentationFile");
  let attachmentName: string | null = null;
  let attachmentType: string | null = null;
  let attachmentContent: string | null = null;

  if (documentationFile instanceof File && documentationFile.size > 0) {
    if (documentationFile.size > 5 * 1024 * 1024) {
      redirect(getInquiryRedirect(Number.isInteger(companyId) ? companyId : 0, { error: "file" }));
    }
    attachmentName = documentationFile.name;
    attachmentType = documentationFile.type || "application/octet-stream";
    attachmentContent = Buffer.from(await documentationFile.arrayBuffer()).toString("base64");
  }

  let recipientCompanies: Array<{
    id: number;
    nazwa: string;
    email: string | null;
  }> = [];

  if (matchingMode === "selected_company") {
    const rows = await db
      .select({
        id: producenci.id,
        nazwa: producenci.nazwa,
        email: producenci.email,
      })
      .from(producenci)
      .where(and(
        eq(producenci.id, companyId),
        eq(producenci.isActive, true),
        sql`${producenci.email} IS NOT NULL`,
        sql`TRIM(${producenci.email}) <> ''`
      ));

    recipientCompanies = rows;
  } else {
    recipientCompanies = await getMatchedInquiryCompanies(criteria);
  }

  const validRecipients = recipientCompanies.filter((company) => Boolean(company.email));

  if (validRecipients.length === 0) {
    redirect(getInquiryRedirect(0, { error: "company" }));
  }

  const now = currentDateTime();
  const [createdInquiry] = await db
    .insert(inquiries)
    .values({
      customerName,
      customerCompany: customerCompany || null,
      customerEmail,
      customerPhone: customerPhone || null,
      serviceType: serviceNames.join(", "),
      matchingMode,
      preferredCompanyId: matchingMode === "selected_company" ? companyId : null,
      serviceSlugs: criteria.serviceSlugs,
      capabilitySlugs: criteria.capabilitySlugs,
      industrySlugs: criteria.industrySlugs,
      certificationCodes: criteria.certificationCodes,
      productionScaleIds: criteria.productionScaleIds,
      preferredRegionIds: criteria.preferredRegionIds,
      quantity,
      deadline,
      hasDocumentation,
      attachmentName,
      attachmentType,
      attachmentContent,
      message,
      source,
      updatedAt: now,
    })
    .returning({ id: inquiries.id });

  await db.insert(inquiryRecipients).values(
    validRecipients.map((company) => ({
      inquiryId: createdInquiry.id,
      companyId: company.id,
      companyEmail: company.email as string,
      status: "pending_review" as const,
      updatedAt: now,
    }))
  );

  const successParams = new URLSearchParams({ success: "1" });
  if (matchingMode === "selected_company" && companyId > 0) {
    successParams.set("companyId", String(companyId));
  }

  redirect(`/zapytania-ofertowe?${successParams.toString()}`);
}
