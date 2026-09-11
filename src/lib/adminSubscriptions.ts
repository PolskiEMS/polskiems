"use server";

import { revalidatePath } from "next/cache";
import { desc, asc, eq, sql } from "drizzle-orm";
import {
  dzialaniaEms,
  packageOrders,
  producenci,
  producenciEmsDzialania,
  producenciEmsProdukcja,
  produkcja,
  wojewodztwa,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

export async function getAdminSubscriptions() {
  await requireAdminSession();
  const db = getDb();

  const companies = await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      email: producenci.email,
      telefon: producenci.telefon,
      adres: producenci.adres,
      wojewodztwo: wojewodztwa.nazwa,
      packageType: producenci.packageType,
      featured: producenci.featured,
      monthlyInquiryLimit: producenci.monthlyInquiryLimit,
      monthlyInquiryCount: producenci.monthlyInquiryCount,
      packageValidUntil: producenci.packageValidUntil,
      isActive: producenci.isActive,
      dzialania: sql<string>`(
        SELECT COALESCE(string_agg(DISTINCT ${dzialaniaEms.nazwa}, ', ' ORDER BY ${dzialaniaEms.nazwa}), '')
        FROM ${producenciEmsDzialania}
        LEFT JOIN ${dzialaniaEms} ON ${producenciEmsDzialania.dzialanieId} = ${dzialaniaEms.id}
        WHERE ${producenciEmsDzialania.companyId} = ${producenci.id}
      )`,
      produkcja: sql<string>`(
        SELECT COALESCE(string_agg(DISTINCT ${produkcja.zakres}, ', ' ORDER BY ${produkcja.zakres}), '')
        FROM ${producenciEmsProdukcja}
        LEFT JOIN ${produkcja} ON ${producenciEmsProdukcja.produkcjaId} = ${produkcja.id}
        WHERE ${producenciEmsProdukcja.companyId} = ${producenci.id}
      )`,
    })
    .from(producenci)
    .leftJoin(wojewodztwa, eq(producenci.wojewodztwoId, wojewodztwa.id))
    .where(sql`${producenci.packageType} IN ('standard', 'premium')`)
    .orderBy(
      desc(sql`CASE WHEN ${producenci.packageType} = 'premium' THEN 2 WHEN ${producenci.packageType} = 'standard' THEN 1 ELSE 0 END`),
      desc(producenci.featured),
      asc(producenci.nazwa)
    );

  const bankTransferOrders = await db
    .select({
      id: packageOrders.id,
      createdAt: packageOrders.createdAt,
      status: packageOrders.paymentStatus,
      packageType: packageOrders.packageType,
      amountGross: packageOrders.amountGross,
      billingCycleMonths: packageOrders.billingCycleMonths,
      companyId: packageOrders.companyId,
      companyName: sql<string>`COALESCE(${producenci.nazwa}, ${packageOrders.companyName})`,
      buyerName: packageOrders.buyerName,
      buyerEmail: packageOrders.buyerEmail,
      buyerPhone: packageOrders.buyerPhone,
      buyerCompanyName: packageOrders.buyerCompanyName,
      buyerTaxId: packageOrders.buyerTaxId,
      buyerAddressLine1: packageOrders.buyerAddressLine1,
      buyerPostalCode: packageOrders.buyerPostalCode,
      buyerCity: packageOrders.buyerCity,
      buyerCountry: packageOrders.buyerCountry,
    })
    .from(packageOrders)
    .leftJoin(producenci, eq(packageOrders.companyId, producenci.id))
    .where(sql`${packageOrders.provider} = 'przelewy24' AND ${packageOrders.paymentStatus} = 'pending_payment'`)
    .orderBy(desc(packageOrders.createdAt))
    .limit(100);

  return { companies, bankTransferOrders };
}

export async function updateCompanyPackageValidityAction(formData: FormData) {
  await requireAdminSession();

  const db = getDb();
  const companyId = Number(formData.get("companyId"));
  const packageValidUntilRaw = String(formData.get("packageValidUntil") || "").trim();

  if (!Number.isFinite(companyId) || companyId <= 0) {
    throw new Error("Nieprawidłowy identyfikator firmy");
  }

  const packageValidUntil = packageValidUntilRaw
    ? `${packageValidUntilRaw} 23:59:59`
    : null;

  await db
    .update(producenci)
    .set({ packageValidUntil })
    .where(eq(producenci.id, companyId));

  revalidatePath("/admin/subskrypcje");
}
