import {redirect} from "next/navigation";
import {sendInquiryEmail} from "@/lib/mail";
import {revalidatePath} from "next/cache";
import {
  dzialaniaEms,
  producenci,
  producenciEmsDzialania,
  producenciEmsProdukcja,
  produkcja,
  statystyki,
  wojewodztwa,
  companyEvents,
  pageViews,
} from "@/db/schema";
import { and, asc, eq, inArray, sql, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { inquiries, inquiryRecipients } from "@/db/schema";
import error from "next/error";

export async function getDashboardStats(days = 30) {
  const db = getDb();

  const activeCompaniesRows = await db.select({
    count: sql<number>`COUNT(*)`,
  })
  .from(producenci)
  .where(sql`${producenci.isActive} = 1`);

  const pageViewsRows = await db.select({
    count: sql<number>`COUNT(*)`,
  })
  .from(pageViews)
  .where(sql`${pageViews.page} = 'home' AND ${pageViews.createdAt} >= NOW() - INTERVAL ${days} DAY`);

  const websiteClicksRows = await db.select({
    count: sql<number>`COUNT(*)`,
  })
  .from(companyEvents)
  .where(sql`${companyEvents.eventType} = 'website_click' AND ${companyEvents.createdAt} >= NOW() - INTERVAL ${days} DAY`);

  const emailClicksRows = await db.select({
    count: sql<number>`COUNT(*)`,
  })
  .from(companyEvents)
  .where(sql`${companyEvents.eventType} = 'email_click' AND ${companyEvents.createdAt} >= NOW() - INTERVAL ${days} DAY`);

  const topCompanies = await db
    .select({
      companyId: producenci.id,
      firma: producenci.nazwa,
      views: sql<number>`COUNT(*)`,
    })
    .from(companyEvents)
    .innerJoin(producenci, eq(producenci.id, companyEvents.companyId))
    .where(sql`${companyEvents.eventType} = 'view' AND ${companyEvents.createdAt} >= NOW() - INTERVAL ${days} DAY`)
    .groupBy(producenci.id, producenci.nazwa)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(5);

  const recentEvents = await db
    .select({
      id: companyEvents.id,
      firma: producenci.nazwa,
      eventType: companyEvents.eventType,
      createdAt: companyEvents.createdAt,
    })
    .from(companyEvents)
    .innerJoin(producenci, eq(producenci.id, companyEvents.companyId))
    .orderBy(desc(companyEvents.createdAt))
    .limit(10);

  return {
    activeCompanies: Number(activeCompaniesRows[0]?.count ?? 0),
    pageViews: Number(pageViewsRows[0]?.count ?? 0),
    websiteClicks: Number(websiteClicksRows[0]?.count ?? 0),
    emailClicks: Number(emailClicksRows[0]?.count ?? 0),
    topCompanies,
    recentEvents,
  };
}

export async function getPageViewsStats(days = 30) {
  const db = getDb();

  const rows = await db.execute(sql`
    SELECT page, COUNT(*) AS views
    FROM page_views
    WHERE created_at >= NOW() - INTERVAL ${sql.raw(String(days))} DAY
    GROUP BY page
  `);

  const result = {
    home: 0,
    "all-producers": 0,
    search: 0,
  };

  const data = rows as unknown as Array<{ page: string; views: number }>;
  
  for (const row of data) {
    if (row.page in result) {
      result[row.page as keyof typeof result] = Number(row.views);
    }
  }

  return result;
}

export async function getCompanyStats(days = 30) {
  const db = getDb();

  const since =
    days > 0 ? sql`NOW() - INTERVAL ${days} DAY` : null;

  const viewsExpr =
    sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'view'), 0)`.as("views");

  const websiteClicksExpr =
    sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'website_click'), 0)`.as("website_clicks");

  const emailClicksExpr =
    sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'email_click'), 0)`.as("email_clicks");

  const websiteCtrExpr = sql<number>`
    COALESCE(
      ROUND(
        100 * COALESCE(SUM(${companyEvents.eventType} = 'website_click'), 0)
        / NULLIF(COALESCE(SUM(${companyEvents.eventType} = 'view'), 0), 0),
        2
      ),
      0
    )
  `.as("website_ctr_pct");

  const emailCtrExpr = sql<number>`
    COALESCE(
      ROUND(
        100 * COALESCE(SUM(${companyEvents.eventType} = 'email_click'), 0)
        / NULLIF(COALESCE(SUM(${companyEvents.eventType} = 'view'), 0), 0),
        2
      ),
      0
    )
  `.as("email_ctr_pct");

  return await db
    .select({
      companyId: producenci.id,
      firma: producenci.nazwa,
      views: viewsExpr,
      websiteClicks: websiteClicksExpr,
      emailClicks: emailClicksExpr,
      websiteCtrPct: websiteCtrExpr,
      emailCtrPct: emailCtrExpr,
    })
    .from(producenci)
    .leftJoin(
      companyEvents,
      since
        ? sql`${companyEvents.companyId} = ${producenci.id} AND ${companyEvents.createdAt} >= ${since}`
        : sql`${companyEvents.companyId} = ${producenci.id}`
    )
    .where(sql`${producenci.isActive} = 1`)
    .groupBy(producenci.id, producenci.nazwa)
    .orderBy(desc(viewsExpr));
}

export async function getAllDzialaniaEms() {
  const db = getDb();

  return await db
    .select({
      id: dzialaniaEms.id,
      nazwa: dzialaniaEms.nazwa,
    })
    .from(dzialaniaEms)
    .orderBy(asc(dzialaniaEms.nazwa));
}

export async function getAllProdukcjaScales() {
  const db = getDb();

  return await db
    .select({
      id: produkcja.id,
      zakres: produkcja.zakres,
    })
    .from(produkcja)
    .orderBy(asc(produkcja.zakres));
}

export async function getCompanyRelations(companyId: number) {
  const db = getDb();

  const dzialania = await db
    .select({
      dzialanieId: producenciEmsDzialania.dzialanieId,
    })
    .from(producenciEmsDzialania)
    .where(eq(producenciEmsDzialania.companyId, companyId));

  const produkcjaRows = await db
    .select({
      produkcjaId: producenciEmsProdukcja.produkcjaId,
    })
    .from(producenciEmsProdukcja)
    .where(eq(producenciEmsProdukcja.companyId, companyId));

  return {
    dzialaniaIds: dzialania.map((x) => x.dzialanieId),
    produkcjaIds: produkcjaRows.map((x) => x.produkcjaId),
  };
}

export const getAllProducers = async () => {
  const db = getDb();
  return await db
    .select()
    .from(producenci)
    .where(sql`${producenci.isActive} = 1`)
    .orderBy(desc(producenci.featured), asc(producenci.id));
};

export const saveStatistics = async (data: string) => {
  const db = getDb();
  return await db.insert(statystyki).values({ wynik: data });
};

type Filters = {
  regions?: string[];
  requirements?: string[];
  scales?: string[];
};

export async function getFeaturedProducers(limit = 6) {
  const db = getDb();

  return await db
    .select()
    .from(producenci)
    .where(and(eq(producenci.isActive, true), eq(producenci.featured, true)))
    .orderBy(asc(producenci.id))
    .limit(limit);
}

export async function getFilteredProducers(filters: Filters) {
  const db = getDb();
  const { regions = [], requirements = [], scales = [] } = filters;

  let matchingRequirementsIds: number[] = [];
  if (requirements.length > 0) {
    const reqResult = await db
      .select({ companyId: producenciEmsDzialania.companyId })
      .from(producenciEmsDzialania)
      .leftJoin(dzialaniaEms, eq(producenciEmsDzialania.dzialanieId, dzialaniaEms.id))
      .where(inArray(dzialaniaEms.nazwa, requirements))
      .groupBy(producenciEmsDzialania.companyId)
      .having(
        sql`count(distinct ${dzialaniaEms.nazwa}) = ${requirements.length}`
      );

    matchingRequirementsIds = reqResult.map((r) => r.companyId);
    if (matchingRequirementsIds.length === 0) return [];
  }

  let matchingScalesIds: number[] = [];
  if (scales.length > 0) {
    const scaleResult = await db
      .select({ companyId: producenciEmsProdukcja.companyId })
      .from(producenciEmsProdukcja)
      .leftJoin(produkcja, eq(producenciEmsProdukcja.produkcjaId, produkcja.id))
      .where(inArray(produkcja.zakres, scales))
      .groupBy(producenciEmsProdukcja.companyId)
      .having(
        sql`count(distinct ${produkcja.zakres}) = ${scales.length}`
      );

    matchingScalesIds = scaleResult.map((r) => r.companyId);
    if (matchingScalesIds.length === 0) return [];
  }

  const query = db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      opis: producenci.opis,
      telefon: producenci.telefon,
      email: producenci.email,
      www: producenci.www,
      isActive: producenci.isActive,
      featured: producenci.featured,
      wojewodztwo: wojewodztwa.nazwa,
    })
    .from(producenci)
    .leftJoin(wojewodztwa, eq(producenci.wojewodztwoId, wojewodztwa.id));

  const whereConditions = [sql`${producenci.isActive} = 1`];

  if (regions.length > 0) {
    whereConditions.push(inArray(wojewodztwa.nazwa, regions));
  }

  if (requirements.length > 0) {
    whereConditions.push(inArray(producenci.id, matchingRequirementsIds));
  }

  if (scales.length > 0) {
    whereConditions.push(inArray(producenci.id, matchingScalesIds));
  }

  query.where(and(...whereConditions));
  query.orderBy(desc(producenci.featured), asc(producenci.id));

  return await query;
}

const ALLOWED_EVENTS = new Set([
  "view",
  "phone_click",
  "email_click",
  "website_click",
  "doc_download",
]);

type CompanyEventPayload = {
  company_id: number | string;
  event_type: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
};

export const saveCompanyEvent = async (payload: CompanyEventPayload) => {
  const db = getDb();

  const companyId = Number(payload.company_id);
  const eventType = payload.event_type;

  if (!Number.isFinite(companyId) || companyId <= 0) {
    return { ok: false, error: "Invalid company_id" as const };
  }

  if (!ALLOWED_EVENTS.has(eventType)) {
    return { ok: false, error: "Invalid event_type" as const };
  }

  const referrer = (payload.referrer ?? null)?.toString().slice(0, 255) ?? null;
  const utmSource = (payload.utm_source ?? null)?.toString().slice(0, 100) ?? null;
  const utmCampaign = (payload.utm_campaign ?? null)?.toString().slice(0, 100) ?? null;

  await db.insert(companyEvents).values({
    companyId,
    eventType: eventType as any,
    referrer,
    utmSource,
    utmCampaign,
  });

  return { ok: true as const };
};

export async function getCompanyRanking(days = 30) {
  const db = getDb();

  const since =
    days > 0 ? sql`NOW() - INTERVAL ${days} DAY` : null;

  const viewsExpr =
    sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'view'), 0)`.as("views");

  const websiteClicksExpr =
    sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'website_click'), 0)`.as("website_clicks");

  const emailClicksExpr =
    sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'email_click'), 0)`.as("email_clicks");

  const websiteCtrExpr = sql<number>`
    COALESCE(
      ROUND(
        100 * COALESCE(SUM(${companyEvents.eventType} = 'website_click'), 0)
        / NULLIF(COALESCE(SUM(${companyEvents.eventType} = 'view'), 0), 0),
        2
      ),
      0
    )
  `.as("website_ctr_pct");

  const rows = await db
    .select({
      companyId: producenci.id,
      firma: producenci.nazwa,
      views: viewsExpr,
      websiteClicks: websiteClicksExpr,
      emailClicks: emailClicksExpr,
      websiteCtrPct: websiteCtrExpr,
    })
    .from(producenci)
    .leftJoin(
      companyEvents,
      since
        ? sql`${companyEvents.companyId} = ${producenci.id} AND ${companyEvents.createdAt} >= ${since}`
        : sql`${companyEvents.companyId} = ${producenci.id}`
    )
    .where(sql`${producenci.isActive} = 1`)
    .groupBy(producenci.id, producenci.nazwa);

  const normalized = rows.map((row) => ({
    ...row,
    views: Number(row.views ?? 0),
    websiteClicks: Number(row.websiteClicks ?? 0),
    emailClicks: Number(row.emailClicks ?? 0),
    websiteCtrPct: Number(row.websiteCtrPct ?? 0),
  }));

  return {
    topViews: [...normalized]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),

    topWebsiteClicks: [...normalized]
      .sort((a, b) => b.websiteClicks - a.websiteClicks)
      .slice(0, 10),

    topWebsiteCtr: [...normalized]
      .filter((row) => row.views > 0)
      .sort((a, b) => b.websiteCtrPct - a.websiteCtrPct)
      .slice(0, 10),
  };
}

export async function getChartsData(days = 30) {
  const db = getDb();

  const since =
    days > 0 ? sql`NOW() - INTERVAL ${days} DAY` : null;

  const viewsExpr =
    sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'view'), 0)`.as("views");

  const websiteClicksExpr =
    sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'website_click'), 0)`.as("website_clicks");

  const emailClicksExpr =
    sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'email_click'), 0)`.as("email_clicks");

  const rows = await db
    .select({
      companyId: producenci.id,
      firma: producenci.nazwa,
      views: viewsExpr,
      websiteClicks: websiteClicksExpr,
      emailClicks: emailClicksExpr,
    })
    .from(producenci)
    .leftJoin(
      companyEvents,
      since
        ? sql`${companyEvents.companyId} = ${producenci.id} AND ${companyEvents.createdAt} >= ${since}`
        : sql`${companyEvents.companyId} = ${producenci.id}`
    )
    .where(sql`${producenci.isActive} = 1`)
    .groupBy(producenci.id, producenci.nazwa);

  const normalized = rows.map((row) => ({
    companyId: row.companyId,
    firma: row.firma,
    views: Number(row.views ?? 0),
    websiteClicks: Number(row.websiteClicks ?? 0),
    emailClicks: Number(row.emailClicks ?? 0),
  }));

  return {
    viewsChart: [...normalized].sort((a, b) => b.views - a.views).slice(0, 10),
    websiteClicksChart: [...normalized].sort((a, b) => b.websiteClicks - a.websiteClicks).slice(0, 10),
    emailClicksChart: [...normalized].sort((a, b) => b.emailClicks - a.emailClicks).slice(0, 10),
  };
}

export async function getReportCompanies() {
  const db = getDb();

  return await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
    })
    .from(producenci)
    .where(sql`${producenci.isActive} = 1`)
    .orderBy(asc(producenci.nazwa));
}

export async function getCompanyReport(companyId: number, days = 30) {
  const db = getDb();

  const since =
    days > 0 ? sql`NOW() - INTERVAL ${days} DAY` : null;

  const rows = await db
    .select({
      companyId: producenci.id,
      firma: producenci.nazwa,
      www: producenci.www,
      email: producenci.email,
      telefon: producenci.telefon,
      views: sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'view'), 0)`,
      websiteClicks: sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'website_click'), 0)`,
      emailClicks: sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'email_click'), 0)`,
      websiteCtrPct: sql<number>`
        COALESCE(
          ROUND(
            100 * COALESCE(SUM(${companyEvents.eventType} = 'website_click'), 0)
            / NULLIF(COALESCE(SUM(${companyEvents.eventType} = 'view'), 0), 0),
            2
          ),
          0
        )
      `,
      emailCtrPct: sql<number>`
        COALESCE(
          ROUND(
            100 * COALESCE(SUM(${companyEvents.eventType} = 'email_click'), 0)
            / NULLIF(COALESCE(SUM(${companyEvents.eventType} = 'view'), 0), 0),
            2
          ),
          0
        )
      `,
    })
    .from(producenci)
    .leftJoin(
      companyEvents,
      since
        ? sql`${companyEvents.companyId} = ${producenci.id} AND ${companyEvents.createdAt} >= ${since}`
        : sql`${companyEvents.companyId} = ${producenci.id}`
    )
    .where(sql`${producenci.id} = ${companyId}`)
    .groupBy(
      producenci.id,
      producenci.nazwa,
      producenci.www,
      producenci.email,
      producenci.telefon
    );

  return rows[0] ?? null;
}

export async function getAdminCompanies() {
  const db = getDb();

  return await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      email: producenci.email,
      www: producenci.www,
      isActive: producenci.isActive,
      featured: producenci.featured,
      packageType: producenci.packageType,
      monthlyInquiryLimit: producenci.monthlyInquiryLimit,
      monthlyInquiryCount: producenci.monthlyInquiryCount,
    })
    .from(producenci)
    .orderBy(asc(producenci.nazwa));
}

export async function getCompanyById(id: number) {
  const db = getDb();

  const rows = await db
    .select()
    .from(producenci)
    .where(eq(producenci.id, id));

  return rows[0] ?? null;
}

export async function createCompany(data: {
  nazwa: string
  opis?: string
  telefon?: string
  email?: string
  www?: string
}) {
  const db = getDb();

  await db.insert(producenci).values({
    nazwa: data.nazwa,
    opis: data.opis ?? null,
    telefon: data.telefon ?? null,
    email: data.email ?? null,
    www: data.www ?? null,
    isActive: false
  });
}

export async function updateCompany(
  id: number,
  data: {
    nazwa: string
    opis?: string
    telefon?: string
    email?: string
    www?: string
    isActive?: boolean
  }
) {
  const db = getDb();

  await db
    .update(producenci)
    .set({
      nazwa: data.nazwa,
      opis: data.opis ?? null,
      telefon: data.telefon ?? null,
      email: data.email ?? null,
      www: data.www ?? null,
      isActive: data.isActive ?? false
    })
    .where(eq(producenci.id, id));
}

export async function createCompanyAction(formData: FormData) {
  "use server";

  const db = getDb();

  const nazwa = String(formData.get("nazwa") || "");
  const opis = String(formData.get("opis") || "");
  const telefon = String(formData.get("telefon") || "");
  const email = String(formData.get("email") || "");
  const www = String(formData.get("www") || "");
  const wojewodztwoIdRaw = formData.get("wojewodztwoId");
  const wojewodztwoId = wojewodztwoIdRaw ? Number(wojewodztwoIdRaw) : null;

  const packageTypeRaw = String(formData.get("packageType") || "free");
  const featuredRaw = formData.get("featured") === "on";

  const packageConfig = getPackageConfig(packageTypeRaw);
  const featured =
    packageConfig.packageType !== "free" ? featuredRaw : false;

  const dzialaniaIds = formData
    .getAll("dzialaniaIds")
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  const produkcjaIds = formData
    .getAll("produkcjaIds")
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  if (!nazwa.trim()) {
    throw new Error("Nazwa firmy jest wymagana");
  }

  const result = await db.insert(producenci).values({
    nazwa: nazwa.trim(),
    opis: opis.trim() || null,
    telefon: telefon.trim() || null,
    email: email.trim() || null,
    www: www.trim() || null,
    wojewodztwoId,
    featured,
    isActive: true,
    packageType: packageConfig.packageType,
    monthlyInquiryLimit: packageConfig.monthlyInquiryLimit,
    monthlyInquiryCount: 0,
  });

  const companyId = Number((result as any).insertId);

  if (dzialaniaIds.length > 0) {
    await db.insert(producenciEmsDzialania).values(
      dzialaniaIds.map((dzialanieId) => ({
        companyId,
        dzialanieId,
      }))
    );
  }

  if (produkcjaIds.length > 0) {
    await db.insert(producenciEmsProdukcja).values(
      produkcjaIds.map((produkcjaId) => ({
        companyId,
        produkcjaId,
      }))
    );
  }

  redirect("/admin/firmy?success=1");
}

export async function updateCompanyAction(formData: FormData) {
  "use server";
  const db = getDb();

  const id = Number(formData.get("id"));
  const nazwa = String(formData.get("nazwa") || "");
  const opis = String(formData.get("opis") || "");
  const telefon = String(formData.get("telefon") || "");
  const email = String(formData.get("email") || "");
  const www = String(formData.get("www") || "");
  const isActive = formData.get("isActive") === "on";
  const wojewodztwoIdRaw = formData.get("wojewodztwoId");
  const wojewodztwoId = wojewodztwoIdRaw ? Number(wojewodztwoIdRaw) : null;
  
  const packageTypeRaw = String(formData.get("packageType") || "free");
  const featuredRaw = formData.get("featured") === "on";
  const resetInquiryCount = formData.get("resetInquiryCount") === "on";

  const packageConfig = getPackageConfig(packageTypeRaw);
  const featured =
    packageConfig.packageType !== "free" ? featuredRaw : false;

  const dzialaniaId = formData
  .getAll("dzialaniaId")
  .map((v) => Number(v))
  .filter((v) => Number.isFinite(v));

  const produkcjaId = formData
  .getAll("produkcjaId")
  .map((v) => Number(v))
  .filter((v) => Number.isFinite(v));

  await db
    .delete(producenciEmsDzialania).where(
    eq(producenciEmsDzialania.companyId, id)
  );

  await db    
    .delete(producenciEmsProdukcja).where(
    eq(producenciEmsProdukcja.companyId, id)
  );

  if (!id || !nazwa.trim()) {
    throw new Error("Brak danych firmy");
  }

  if (dzialaniaId.length > 0) {
    await db.insert(producenciEmsDzialania).values(
      dzialaniaId.map((dzialanieId) => ({
        companyId: id,
        dzialanieId,
    }))
  );
}

  if (produkcjaId.length > 0) {
    await db.insert(producenciEmsProdukcja).values(
      produkcjaId.map((produkcjaId) => ({
        companyId: id,
        produkcjaId,
    }))
  );
}

  await db
    .update(producenci)
    .set({
      nazwa: nazwa.trim(),
      opis: opis.trim() || null,
      telefon: telefon.trim() || null,
      email: email.trim() || null,
      www: www.trim() || null,
      wojewodztwoId,
      featured,
      isActive,
      packageType: packageConfig.packageType,
      monthlyInquiryLimit: packageConfig.monthlyInquiryLimit,
      ...(resetInquiryCount ? { monthlyInquiryCount: 0 } : {}),
    })
    .where(eq(producenci.id, id));

  redirect("/admin/firmy");
}

export async function getAllRegion() {
  const db = getDb();

  return await db
    .select({
      id: wojewodztwa.id,
      nazwa: wojewodztwa.nazwa,
    })
    .from(wojewodztwa)
    .orderBy(asc(wojewodztwa.nazwa));
}

function getPackageConfig(packageType: string) {
  switch (packageType) {
    case "free":
      return {
        packageType: "free",
        monthlyInquiryLimit: 0,
      };

    case "standard":
      return {
        packageType: "standard",
        monthlyInquiryLimit: 10,
      };

    case "premium":
      return {
        packageType: "premium",
        monthlyInquiryLimit: 999999,
      };

    default:
      return {
        packageType: "free",
        monthlyInquiryLimit: 0,
      };
  }
}

export async function getAdminInquiries() {
  const db = getDb();

  return await db
    .select({
      inquiryId: inquiries.id,
      customerName: inquiries.customerName,
      customerCompany: inquiries.customerCompany,
      customerEmail: inquiries.customerEmail,
      customerPhone: inquiries.customerPhone,
      serviceType: inquiries.serviceType,
      quantity: inquiries.quantity,
      deadline: inquiries.deadline,
      message: inquiries.message,
      createdAt: inquiries.createdAt,

      recipientId: inquiryRecipients.id,
      companyId: producenci.id,
      companyName: producenci.nazwa,
      companyEmail: inquiryRecipients.companyEmail,
      status: inquiryRecipients.status,
      sentAt: inquiryRecipients.sentAt,
    })
    .from(inquiries)
    .leftJoin(
      inquiryRecipients,
      eq(inquiryRecipients.inquiryId, inquiries.id)
    )
    .leftJoin(
      producenci,
      eq(producenci.id, inquiryRecipients.companyId)
    )
    .orderBy(desc(inquiries.id), desc(inquiryRecipients.id));
}

export async function sendInquiryAction(formData: FormData) {
  "use server";

  const db = getDb();

  const companyId = Number(formData.get("companyId"));
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerCompany = String(formData.get("customerCompany") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const selectedServices = formData
    .getAll("serviceTypes")
    .map((service) => String(service).trim())
    .filter((service) => service.length > 0);
  const legacyServiceType = String(formData.get("serviceType") ?? "").trim();
  const normalizedServices = selectedServices.length > 0
    ? selectedServices
    : legacyServiceType
      ? [legacyServiceType]
      : [];
  const serviceType = normalizedServices.join(", ");
  const quantity = String(formData.get("quantity") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!companyId || !customerName || !customerEmail || normalizedServices.length === 0 || !message) {
    redirect("/zapytania-ofertowe");
  }

  const companyRows = await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      email: producenci.email,
      packageType: producenci.packageType,
      isActive: producenci.isActive,
    })
    .from(producenci)
    .where(eq(producenci.id, companyId));

  const company = companyRows[0];

  if (!company || !company.email) {
    redirect("/zapytania-ofertowe");
  }

  const inquiryResult = await db.insert(inquiries).values({
    customerName,
    customerCompany: customerCompany || null,
    customerEmail,
    customerPhone: customerPhone || null,
    serviceType,
    quantity: quantity || null,
    deadline: deadline || null,
    message,
  });

  const inquiryId = Number((inquiryResult as any).insertId);

  const recipientStatus = company.packageType === "free" ? "blocked" : "new";

  await db.insert(inquiryRecipients).values({
    inquiryId,
    companyId: company.id,
    companyEmail: company.email,
    status: recipientStatus,
  });

  redirect(`/zapytania-ofertowe?companyId=${companyId}&success=1`);
  }

export async function sendInquiryToCompanyAction(formData: FormData) {
  "use server";

  const recipientId = Number(formData.get("recipientId"));
  const db = getDb();

  if (!Number.isFinite(recipientId) || recipientId <= 0) {
    throw new Error("Nieprawidłowy recipientId");
  }

  const rows = await db
    .select({
      recipientId: inquiryRecipients.id,
      status: inquiryRecipients.status,
      companyEmail: inquiryRecipients.companyEmail,
      companyName: producenci.nazwa,
      companyId: producenci.id,
      sentAt: inquiryRecipients.sentAt,

      inquiryId: inquiries.id,
      customerName: inquiries.customerName,
      customerEmail: inquiries.customerEmail,
      customerPhone: inquiries.customerPhone,
      serviceType: inquiries.serviceType,
      quantity: inquiries.quantity,
      deadline: inquiries.deadline,
      message: inquiries.message,

      packageType: producenci.packageType,
      monthlyInquiryLimit: producenci.monthlyInquiryLimit,
      monthlyInquiryCount: producenci.monthlyInquiryCount,
    })
    .from(inquiryRecipients)
    .innerJoin(inquiries, eq(inquiries.id, inquiryRecipients.inquiryId))
    .innerJoin(producenci, eq(producenci.id, inquiryRecipients.companyId))
    .where(eq(inquiryRecipients.id, recipientId));

  const row = rows[0];

  if (!row) {
    throw new Error("Nie znaleziono odbiorcy zapytania");
  }

  if (row.status === "sent") {
    revalidatePath("/admin/zapytania");
    return;
  }

  if (row.status === "blocked") {
    throw new Error("To zapytanie jest zablokowane dla pakietu Free");
  }

  if (row.packageType === "free") {
    throw new Error("Pakiet Free nie może otrzymywać leadów");
  }

  if (
    row.packageType === "standard" &&
    row.monthlyInquiryCount >= row.monthlyInquiryLimit
  ) {
    throw new Error("Miesięczny limit leadów dla pakietu Standard został osiągnięty");
  }

  const sentAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    await sendInquiryEmail({
      companyEmail: row.companyEmail,
      companyName: row.companyName,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      serviceType: row.serviceType,
      quantity: row.quantity,
      deadline: row.deadline,
      message: row.message,
    });

    await db
      .update(inquiryRecipients)
      .set({
        status: "sent",
        sentAt,
      })
      .where(eq(inquiryRecipients.id, recipientId));

    await db
      .update(producenci)
      .set({
        monthlyInquiryCount: row.monthlyInquiryCount + 1,
      })
      .where(eq(producenci.id, row.companyId));
  } catch (error) {
    await db
      .update(inquiryRecipients)
      .set({
        status: "error",
        sentAt: null,
      })
      .where(eq(inquiryRecipients.id, recipientId));

    throw error;
  }

  revalidatePath("/admin/zapytania");
}
