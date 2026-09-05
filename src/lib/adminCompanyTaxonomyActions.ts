"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  capabilities,
  certifications,
  companyEvents,
  dzialaniaEms,
  industries,
  inquiries,
  inquiryRecipients,
  packageOrders,
  producerCapabilities,
  producerCertifications,
  producerIndustries,
  producerServices,
  producenci,
  producenciEmsDzialania,
  producenciEmsProdukcja,
  produkcja,
  services,
  wojewodztwa,
} from "@/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { companyProfileSlug } from "@/lib/companySlug";
import { COMPANY_TYPE_LABELS, type CompanyType } from "@/lib/supplierTaxonomy";

const companyTypeValues = new Set<string>(Object.keys(COMPANY_TYPE_LABELS));

function normalizeCompanyType(value: FormDataEntryValue | string | null): CompanyType {
  const type = String(value ?? "unclassified").trim();
  return (companyTypeValues.has(type) ? type : "unclassified") as CompanyType;
}

function parseIdList(formData: FormData, fieldName: string) {
  return Array.from(
    new Set(
      formData
        .getAll(fieldName)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
    )
  );
}

function getPackageConfig(packageType: string) {
  switch (packageType) {
    case "standard":
      return { packageType: "standard", monthlyInquiryLimit: 20 };
    case "premium":
      return { packageType: "premium", monthlyInquiryLimit: 999999 };
    case "free":
    default:
      return { packageType: "free", monthlyInquiryLimit: 5 };
  }
}

function revalidateCompanyPaths(companyId: number, companyName?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/firmy");
  revalidatePath(`/admin/firmy/${companyId}`);
  revalidatePath("/");
  revalidatePath("/wszyscy-producenci");
  revalidatePath("/wyszukaj");
  revalidatePath("/producenci");

  if (companyName) {
    revalidatePath(`/producenci/${companyProfileSlug(companyName, companyId)}`);
  }
}

export async function getSupplierTaxonomyOptions() {
  await requireAdminSession();
  const db = getDb();

  const serviceRows = await db
    .select({ id: services.id, slug: services.slug, name: services.name })
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(sql`COALESCE(${services.sortOrder}, 999999)`, asc(services.name));

  const capabilityRows = await db
    .select({ id: capabilities.id, slug: capabilities.slug, name: capabilities.name })
    .from(capabilities)
    .where(eq(capabilities.isActive, true))
    .orderBy(sql`COALESCE(${capabilities.sortOrder}, 999999)`, asc(capabilities.name));

  const industryRows = await db
    .select({ id: industries.id, slug: industries.slug, name: industries.name })
    .from(industries)
    .where(eq(industries.isActive, true))
    .orderBy(sql`COALESCE(${industries.sortOrder}, 999999)`, asc(industries.name));

  const certificationRows = await db
    .select({ id: certifications.id, code: certifications.code, name: certifications.name })
    .from(certifications)
    .where(eq(certifications.isActive, true))
    .orderBy(sql`COALESCE(${certifications.sortOrder}, 999999)`, asc(certifications.code));

  return {
    services: serviceRows,
    capabilities: capabilityRows,
    industries: industryRows,
    certifications: certificationRows,
  };
}

export async function getCompanyTaxonomyRelations(companyId: number) {
  await requireAdminSession();
  const db = getDb();

  const companyRows = await db
    .select({ companyType: producenci.companyType })
    .from(producenci)
    .where(eq(producenci.id, companyId))
    .limit(1);

  const serviceRows = await db
    .select({ serviceId: producerServices.serviceId })
    .from(producerServices)
    .where(eq(producerServices.companyId, companyId));

  const capabilityRows = await db
    .select({ capabilityId: producerCapabilities.capabilityId })
    .from(producerCapabilities)
    .where(eq(producerCapabilities.companyId, companyId));

  const industryRows = await db
    .select({ industryId: producerIndustries.industryId })
    .from(producerIndustries)
    .where(eq(producerIndustries.companyId, companyId));

  const certificationRows = await db
    .select({ certificationId: producerCertifications.certificationId })
    .from(producerCertifications)
    .where(eq(producerCertifications.companyId, companyId));

  return {
    companyType: normalizeCompanyType(companyRows[0]?.companyType ?? "unclassified"),
    serviceIds: serviceRows.map((row) => row.serviceId),
    capabilityIds: capabilityRows.map((row) => row.capabilityId),
    industryIds: industryRows.map((row) => row.industryId),
    certificationIds: certificationRows.map((row) => row.certificationId),
  };
}

export async function getAdminCompaniesWithTaxonomy() {
  await requireAdminSession();
  const db = getDb();

  return await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      email: producenci.email,
      www: producenci.www,
      wojewodztwo: wojewodztwa.nazwa,
      companyType: producenci.companyType,
      isActive: producenci.isActive,
      featured: producenci.featured,
      packageType: producenci.packageType,
      monthlyInquiryLimit: producenci.monthlyInquiryLimit,
      monthlyInquiryCount: producenci.monthlyInquiryCount,
    })
    .from(producenci)
    .leftJoin(wojewodztwa, eq(producenci.wojewodztwoId, wojewodztwa.id))
    .orderBy(asc(producenci.isActive), asc(producenci.nazwa));
}

export async function createCompanyWithTaxonomyAction(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const nazwa = String(formData.get("nazwa") || "").trim();
  const opis = String(formData.get("opis") || "").trim();
  const telefon = String(formData.get("telefon") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const www = String(formData.get("www") || "").trim();
  const adres = String(formData.get("adres") || "").trim();
  const wojewodztwoIdRaw = formData.get("wojewodztwoId");
  const wojewodztwoId = wojewodztwoIdRaw ? Number(wojewodztwoIdRaw) : null;
  const packageConfig = getPackageConfig(String(formData.get("packageType") || "free"));
  const companyType = normalizeCompanyType(formData.get("companyType"));
  const isActive = formData.get("isActive") === "on";
  const featured = formData.get("featured") === "on" || packageConfig.packageType !== "free";

  const dzialaniaIds = parseIdList(formData, "dzialaniaIds");
  const produkcjaIds = parseIdList(formData, "produkcjaIds");
  const serviceIds = parseIdList(formData, "serviceIds");
  const capabilityIds = parseIdList(formData, "capabilityIds");
  const industryIds = parseIdList(formData, "industryIds");
  const certificationIds = parseIdList(formData, "certificationIds");

  if (!nazwa) {
    throw new Error("Nazwa firmy jest wymagana");
  }

  let companyId = 0;

  await db.transaction(async (tx) => {
    const [createdCompany] = await tx
      .insert(producenci)
      .values({
        nazwa,
        opis: opis || null,
        telefon: telefon || null,
        email: email || null,
        www: www || null,
        wojewodztwoId,
        adres: adres || null,
        companyType,
        featured,
        isActive,
        packageType: packageConfig.packageType,
        monthlyInquiryLimit: packageConfig.monthlyInquiryLimit,
        monthlyInquiryCount: 0,
      })
      .returning({ id: producenci.id });

    companyId = createdCompany.id;

    if (dzialaniaIds.length > 0) {
      await tx.insert(producenciEmsDzialania).values(
        dzialaniaIds.map((dzialanieId) => ({ companyId, dzialanieId }))
      );
    }

    if (produkcjaIds.length > 0) {
      await tx.insert(producenciEmsProdukcja).values(
        produkcjaIds.map((produkcjaId) => ({ companyId, produkcjaId }))
      );
    }

    if (serviceIds.length > 0) {
      await tx.insert(producerServices).values(
        serviceIds.map((serviceId) => ({ companyId, serviceId, source: "admin" }))
      );
    }

    if (capabilityIds.length > 0) {
      await tx.insert(producerCapabilities).values(
        capabilityIds.map((capabilityId) => ({ companyId, capabilityId, source: "admin" }))
      );
    }

    if (industryIds.length > 0) {
      await tx.insert(producerIndustries).values(
        industryIds.map((industryId) => ({ companyId, industryId, source: "admin" }))
      );
    }

    if (certificationIds.length > 0) {
      await tx.insert(producerCertifications).values(
        certificationIds.map((certificationId) => ({ companyId, certificationId, status: "admin" }))
      );
    }
  });

  revalidateCompanyPaths(companyId, nazwa);
  redirect(`/admin/firmy/${companyId}`);
}

export async function updateCompanyTaxonomyAction(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const companyId = Number(formData.get("id"));
  const companyName = String(formData.get("companyName") || "").trim();
  const companyType = normalizeCompanyType(formData.get("companyType"));
  const serviceIds = parseIdList(formData, "serviceIds");
  const capabilityIds = parseIdList(formData, "capabilityIds");
  const industryIds = parseIdList(formData, "industryIds");
  const certificationIds = parseIdList(formData, "certificationIds");

  if (!Number.isFinite(companyId) || companyId <= 0) {
    throw new Error("Nieprawidłowe ID firmy");
  }

  await db.transaction(async (tx) => {
    await tx.delete(producerServices).where(eq(producerServices.companyId, companyId));
    await tx.delete(producerCapabilities).where(eq(producerCapabilities.companyId, companyId));
    await tx.delete(producerIndustries).where(eq(producerIndustries.companyId, companyId));
    await tx.delete(producerCertifications).where(eq(producerCertifications.companyId, companyId));

    if (serviceIds.length > 0) {
      await tx.insert(producerServices).values(
        serviceIds.map((serviceId) => ({ companyId, serviceId, source: "admin" }))
      );
    }

    if (capabilityIds.length > 0) {
      await tx.insert(producerCapabilities).values(
        capabilityIds.map((capabilityId) => ({ companyId, capabilityId, source: "admin" }))
      );
    }

    if (industryIds.length > 0) {
      await tx.insert(producerIndustries).values(
        industryIds.map((industryId) => ({ companyId, industryId, source: "admin" }))
      );
    }

    if (certificationIds.length > 0) {
      await tx.insert(producerCertifications).values(
        certificationIds.map((certificationId) => ({ companyId, certificationId, status: "admin" }))
      );
    }

    await tx
      .update(producenci)
      .set({ companyType })
      .where(eq(producenci.id, companyId));
  });

  revalidateCompanyPaths(companyId, companyName);
  redirect(`/admin/firmy/${companyId}`);
}

export async function deleteCompanyWithTaxonomyAction(formData: FormData) {
  await requireAdminSession();
  const db = getDb();
  const id = Number(formData.get("id"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Nieprawidłowe ID firmy");
  }

  await db.transaction(async (tx) => {
    await tx.delete(producerServices).where(eq(producerServices.companyId, id));
    await tx.delete(producerCapabilities).where(eq(producerCapabilities.companyId, id));
    await tx.delete(producerIndustries).where(eq(producerIndustries.companyId, id));
    await tx.delete(producerCertifications).where(eq(producerCertifications.companyId, id));
    await tx.delete(producenciEmsDzialania).where(eq(producenciEmsDzialania.companyId, id));
    await tx.delete(producenciEmsProdukcja).where(eq(producenciEmsProdukcja.companyId, id));
    await tx.delete(companyEvents).where(eq(companyEvents.companyId, id));
    await tx.delete(inquiryRecipients).where(eq(inquiryRecipients.companyId, id));
    await tx.update(packageOrders).set({ companyId: null }).where(eq(packageOrders.companyId, id));
    await tx.delete(producenci).where(eq(producenci.id, id));
  });

  revalidatePath("/admin");
  revalidatePath("/admin/firmy");
  revalidatePath("/");
  revalidatePath("/wszyscy-producenci");
  revalidatePath("/producenci");
  redirect("/admin/firmy?deleted=1");
}

export async function getTaxonomyHealthSummary() {
  await requireAdminSession();
  const db = getDb();

  const [companiesCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(producenci);

  const [typedCompanies] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(producenci)
    .where(and(sql`${producenci.companyType} IS NOT NULL`, sql`${producenci.companyType} <> 'unclassified'`));

  const [servicesCount] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${producerServices.companyId})` })
    .from(producerServices);

  const [industriesCount] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${producerIndustries.companyId})` })
    .from(producerIndustries);

  const total = Number(companiesCount?.count ?? 0);

  return {
    totalCompanies: total,
    typedCompanies: Number(typedCompanies?.count ?? 0),
    companiesWithServices: Number(servicesCount?.count ?? 0),
    companiesWithIndustries: Number(industriesCount?.count ?? 0),
  };
}
