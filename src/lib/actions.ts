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
  packageOrders,
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

export async function deactivateExpiredPaidCompanies() {
  const db = getDb();

  await db
    .update(producenci)
    .set({
      isActive: false,
      packageType: "free",
      featured: false,
      monthlyInquiryLimit: 5,
      monthlyInquiryCount: 0,
      packageValidUntil: null,
    })
    .where(
      sql`${producenci.packageType} IN ('standard', 'premium')
          AND ${producenci.packageValidUntil} IS NOT NULL
          AND ${producenci.packageValidUntil} < NOW()
          AND ${producenci.isActive} = 1`
    );
}

export async function getPageViewsStats(days = 30) {
  const db = getDb();

  const rows = await db
    .select({
      page: pageViews.page,
      views: sql<number>`COUNT(*)`,
    })
    .from(pageViews)
    .where(
      sql`${pageViews.createdAt} >= NOW() - INTERVAL ${sql.raw(String(days))} DAY`
    )
    .groupBy(pageViews.page);

  const result = {
    home: 0,
    "all-producers": 0,
    search: 0,
  };

  const normalizePageKey = (pageRaw: string) => {
    const page = (pageRaw || "").trim().toLowerCase();

    if (page === "home" || page === "/") return "home";
    if (page === "search" || page === "/wyszukaj") return "search";
    if (
      page === "all-producers" ||
      page === "all-producer" ||
      page === "/wszyscy-producenci" ||
      page === "wszyscy-producenci"
    ) {
      return "all-producers";
    }

    return null;
  };
  
  for (const row of rows) {
    const normalizedPage = normalizePageKey(row.page);
    if (normalizedPage) {
      result[normalizedPage as keyof typeof result] += Number(row.views);
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

  await db.execute(sql`INSERT IGNORE INTO dzialania_ems (nazwa) VALUES ("Montaż SMT")`);

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
  await deactivateExpiredPaidCompanies();
  const db = getDb();
  return await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      opis: producenci.opis,
      wojewodztwoId: producenci.wojewodztwoId,
      adres: producenci.adres,
      telefon: producenci.telefon,
      email: producenci.email,
      www: producenci.www,
      featured: producenci.featured,
      isActive: producenci.isActive,
      createdAt: producenci.createdAt,
      packageType: producenci.packageType,
      monthlyInquiryLimit: producenci.monthlyInquiryLimit,
      monthlyInquiryCount: producenci.monthlyInquiryCount,
      wojewodztwo: wojewodztwa.nazwa,
    })
    .from(producenci)
    .leftJoin(wojewodztwa, eq(producenci.wojewodztwoId, wojewodztwa.id))
    .where(sql`${producenci.isActive} = 1`)
    .orderBy(
      desc(sql`CASE
        WHEN ${producenci.packageType} = 'premium' THEN 2
        WHEN ${producenci.packageType} = 'standard' THEN 1
        ELSE 0
      END`),
      desc(producenci.featured),
      asc(producenci.id)
    );
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
  await deactivateExpiredPaidCompanies();
  const db = getDb();

  return await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      opis: producenci.opis,
      wojewodztwoId: producenci.wojewodztwoId,
      adres: producenci.adres,
      telefon: producenci.telefon,
      email: producenci.email,
      www: producenci.www,
      featured: producenci.featured,
      isActive: producenci.isActive,
      createdAt: producenci.createdAt,
      packageType: producenci.packageType,
      monthlyInquiryLimit: producenci.monthlyInquiryLimit,
      monthlyInquiryCount: producenci.monthlyInquiryCount,
    })
    .from(producenci)
    .where(and(eq(producenci.isActive, true), eq(producenci.featured, true)))
    .orderBy(asc(producenci.id))
    .limit(limit);
}

export async function getFilteredProducers(filters: Filters) {
  await deactivateExpiredPaidCompanies();
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
      packageType: producenci.packageType,
      wojewodztwo: wojewodztwa.nazwa,
      adres: producenci.adres,
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
  query.orderBy(
    desc(sql`CASE
      WHEN ${producenci.packageType} = 'premium' THEN 2
      WHEN ${producenci.packageType} = 'standard' THEN 1
      ELSE 0
    END`),
    desc(producenci.featured),
    asc(producenci.id)
  );

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

  const allowedRanges = new Set([7, 30, 90, 365]);
  const safeDays = allowedRanges.has(days) ? days : 30;

  const currentSince = sql`NOW() - INTERVAL ${safeDays} DAY`;
  const previousStart = sql`NOW() - INTERVAL ${safeDays * 2} DAY`;

  const rows = await db
    .select({
      companyId: producenci.id,
      firma: producenci.nazwa,
      views: sql<number>`COALESCE(SUM(CASE WHEN ${companyEvents.createdAt} >= ${currentSince} AND ${companyEvents.eventType} = 'view' THEN 1 ELSE 0 END), 0)`,
      websiteClicks: sql<number>`COALESCE(SUM(CASE WHEN ${companyEvents.createdAt} >= ${currentSince} AND ${companyEvents.eventType} = 'website_click' THEN 1 ELSE 0 END), 0)`,
      emailClicks: sql<number>`COALESCE(SUM(CASE WHEN ${companyEvents.createdAt} >= ${currentSince} AND ${companyEvents.eventType} = 'email_click' THEN 1 ELSE 0 END), 0)`,
      phoneClicks: sql<number>`COALESCE(SUM(CASE WHEN ${companyEvents.createdAt} >= ${currentSince} AND ${companyEvents.eventType} = 'phone_click' THEN 1 ELSE 0 END), 0)`,
      previousViews: sql<number>`COALESCE(SUM(CASE WHEN ${companyEvents.createdAt} >= ${previousStart} AND ${companyEvents.createdAt} < ${currentSince} AND ${companyEvents.eventType} = 'view' THEN 1 ELSE 0 END), 0)`,
      previousWebsiteClicks: sql<number>`COALESCE(SUM(CASE WHEN ${companyEvents.createdAt} >= ${previousStart} AND ${companyEvents.createdAt} < ${currentSince} AND ${companyEvents.eventType} = 'website_click' THEN 1 ELSE 0 END), 0)`,
      previousEmailClicks: sql<number>`COALESCE(SUM(CASE WHEN ${companyEvents.createdAt} >= ${previousStart} AND ${companyEvents.createdAt} < ${currentSince} AND ${companyEvents.eventType} = 'email_click' THEN 1 ELSE 0 END), 0)`,
      previousPhoneClicks: sql<number>`COALESCE(SUM(CASE WHEN ${companyEvents.createdAt} >= ${previousStart} AND ${companyEvents.createdAt} < ${currentSince} AND ${companyEvents.eventType} = 'phone_click' THEN 1 ELSE 0 END), 0)`,
      profileCompleteness: sql<number>`ROUND((
        (CASE WHEN ${producenci.opis} IS NOT NULL AND TRIM(${producenci.opis}) != '' THEN 1 ELSE 0 END) +
        (CASE WHEN ${producenci.adres} IS NOT NULL AND TRIM(${producenci.adres}) != '' THEN 1 ELSE 0 END) +
        (CASE WHEN ${producenci.telefon} IS NOT NULL AND TRIM(${producenci.telefon}) != '' THEN 1 ELSE 0 END) +
        (CASE WHEN ${producenci.email} IS NOT NULL AND TRIM(${producenci.email}) != '' THEN 1 ELSE 0 END) +
        (CASE WHEN ${producenci.www} IS NOT NULL AND TRIM(${producenci.www}) != '' THEN 1 ELSE 0 END)
      ) * 20, 0)`,
    })
    .from(producenci)
    .leftJoin(companyEvents, sql`${companyEvents.companyId} = ${producenci.id} AND ${companyEvents.createdAt} >= ${previousStart}`)
    .where(sql`${producenci.isActive} = 1`)
    .groupBy(producenci.id, producenci.nazwa, producenci.opis, producenci.adres, producenci.telefon, producenci.email, producenci.www);

  const companies = rows.map((row) => {
    const views = Number(row.views ?? 0);
    const websiteClicks = Number(row.websiteClicks ?? 0);
    const emailClicks = Number(row.emailClicks ?? 0);
    const phoneClicks = Number(row.phoneClicks ?? 0);
    const totalClicks = websiteClicks + emailClicks + phoneClicks;
    const totalCtrPct = views > 0 ? Number(((totalClicks / views) * 100).toFixed(2)) : 0;

    const previousViews = Number(row.previousViews ?? 0);
    const previousWebsiteClicks = Number(row.previousWebsiteClicks ?? 0);
    const previousEmailClicks = Number(row.previousEmailClicks ?? 0);
    const previousPhoneClicks = Number(row.previousPhoneClicks ?? 0);
    const previousTotalClicks = previousWebsiteClicks + previousEmailClicks + previousPhoneClicks;
    const previousCtrPct = previousViews > 0 ? (previousTotalClicks / previousViews) * 100 : 0;

    const leadPotential = Number((views * 0.35 + totalClicks * 0.65).toFixed(0));

    return {
      companyId: row.companyId,
      firma: row.firma,
      views,
      websiteClicks,
      emailClicks,
      phoneClicks,
      totalClicks,
      totalCtrPct,
      previousViews,
      previousCtrPct: Number(previousCtrPct.toFixed(2)),
      leadPotential,
      profileCompleteness: Number(row.profileCompleteness ?? 0),
    };
  });

  const totals = companies.reduce(
    (acc, company) => {
      acc.views += company.views;
      acc.websiteClicks += company.websiteClicks;
      acc.emailClicks += company.emailClicks;
      acc.phoneClicks += company.phoneClicks;
      acc.leadPotential += company.leadPotential;
      return acc;
    },
    { views: 0, websiteClicks: 0, emailClicks: 0, phoneClicks: 0, leadPotential: 0 }
  );

  const totalClicks = totals.websiteClicks + totals.emailClicks + totals.phoneClicks;
  const averageCtrPct = totals.views > 0 ? Number(((totalClicks / totals.views) * 100).toFixed(2)) : 0;

  const previousTotals = companies.reduce(
    (acc, company) => {
      acc.views += company.previousViews;
      acc.weightedCtrSum += company.previousCtrPct * company.previousViews;
      return acc;
    },
    { views: 0, weightedCtrSum: 0 }
  );

  const previousCtrPct = previousTotals.views > 0 ? previousTotals.weightedCtrSum / previousTotals.views : 0;

  return {
    days: safeDays,
    companies,
    totals: {
      ...totals,
      averageCtrPct,
    },
    trend: {
      viewsChangePct:
        previousTotals.views > 0
          ? Number((((totals.views - previousTotals.views) / previousTotals.views) * 100).toFixed(2))
          : 0,
      ctrChangePct: Number((averageCtrPct - previousCtrPct).toFixed(2)),
    },
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
      packageType: producenci.packageType,
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
      producenci.packageType,
      producenci.www,
      producenci.email,
      producenci.telefon
    );

  return rows[0] ?? null;
}


export async function getAdminSubscriptions() {
  await deactivateExpiredPaidCompanies();
  const db = getDb();

  const companies = await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      email: producenci.email,
      telefon: producenci.telefon,
      packageType: producenci.packageType,
      featured: producenci.featured,
      monthlyInquiryLimit: producenci.monthlyInquiryLimit,
      packageValidUntil: producenci.packageValidUntil,
      isActive: producenci.isActive,
    })
    .from(producenci)
    .where(sql`${producenci.packageType} IN ('standard', 'premium') OR ${producenci.featured} = 1`)
    .orderBy(desc(sql`CASE WHEN ${producenci.packageType} = 'premium' THEN 2 WHEN ${producenci.packageType} = 'standard' THEN 1 ELSE 0 END`), asc(producenci.nazwa));

  const orders = await db
    .select({
      id: packageOrders.id,
      createdAt: packageOrders.createdAt,
      paidAt: packageOrders.paidAt,
      status: packageOrders.status,
      provider: packageOrders.provider,
      packageType: packageOrders.packageType,
      amountGross: packageOrders.amountGross,
      billingCycleMonths: packageOrders.billingCycleMonths,
      companyId: producenci.id,
      companyName: producenci.nazwa,
      buyerName: packageOrders.buyerName,
      buyerEmail: packageOrders.buyerEmail,
      buyerPhone: packageOrders.buyerPhone,
      buyerCompanyName: packageOrders.buyerCompanyName,
      buyerTaxId: packageOrders.buyerTaxId,
      buyerAddressLine1: packageOrders.buyerAddressLine1,
      buyerPostalCode: packageOrders.buyerPostalCode,
      buyerCity: packageOrders.buyerCity,
      buyerCountry: packageOrders.buyerCountry,
      accessValidUntil: packageOrders.accessValidUntil,
    })
    .from(packageOrders)
    .innerJoin(producenci, eq(packageOrders.companyId, producenci.id))
    .orderBy(desc(packageOrders.createdAt))
    .limit(200);

  return { companies, orders };
}

export async function updateCompanyPackageValidityAction(formData: FormData) {
  "use server";

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
    .set({
      packageValidUntil,
    })
    .where(eq(producenci.id, companyId));

  revalidatePath("/admin/subskrypcje");
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
    .orderBy(asc(producenci.isActive), asc(producenci.nazwa));
}

export async function getCompanyById(id: number) {
  const db = getDb();

  const rows = await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      opis: producenci.opis,
      wojewodztwoId: producenci.wojewodztwoId,
      adres: producenci.adres,
      telefon: producenci.telefon,
      email: producenci.email,
      www: producenci.www,
      featured: producenci.featured,
      isActive: producenci.isActive,
      createdAt: producenci.createdAt,
      packageType: producenci.packageType,
      monthlyInquiryLimit: producenci.monthlyInquiryLimit,
      monthlyInquiryCount: producenci.monthlyInquiryCount,
    })
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
  const adres = String(formData.get("adres") || "");

  const packageTypeRaw = String(formData.get("packageType") || "free");

  const packageConfig = getPackageConfig(packageTypeRaw);
  const featured = packageConfig.packageType !== "free";

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
    adres: adres.trim() || null,
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
  const adres = String(formData.get("adres") || "");
  
  const packageTypeRaw = String(formData.get("packageType") || "free");
  const resetInquiryCount = formData.get("resetInquiryCount") === "on";

  const packageConfig = getPackageConfig(packageTypeRaw);
  const featured = packageConfig.packageType !== "free";

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
      adres: adres.trim() || null,
      featured,
      isActive,
      packageType: packageConfig.packageType,
      monthlyInquiryLimit: packageConfig.monthlyInquiryLimit,
      ...(resetInquiryCount ? { monthlyInquiryCount: 0 } : {}),
    })
    .where(eq(producenci.id, id));

  redirect("/admin/firmy");
}


export async function deleteCompanyAction(formData: FormData) {
  "use server";

  const db = getDb();
  const id = Number(formData.get("id"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Nieprawidłowe ID firmy");
  }

  await db.delete(producenciEmsDzialania).where(eq(producenciEmsDzialania.companyId, id));
  await db.delete(producenciEmsProdukcja).where(eq(producenciEmsProdukcja.companyId, id));
  await db.delete(companyEvents).where(eq(companyEvents.companyId, id));
  await db.delete(inquiryRecipients).where(eq(inquiryRecipients.companyId, id));

  await db
    .update(packageOrders)
    .set({ companyId: null })
    .where(eq(packageOrders.companyId, id));

  await db.delete(producenci).where(eq(producenci.id, id));

  revalidatePath("/admin/firmy");
  redirect("/admin/firmy?deleted=1");
}

export async function approveCompanyAction(formData: FormData) {
  "use server";
  const db = getDb();

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("Nieprawidłowe ID firmy");
  }

  await db
    .update(producenci)
    .set({
      isActive: true,
    })
    .where(eq(producenci.id, id));

  revalidatePath("/admin/firmy");
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
        monthlyInquiryLimit: 5,
      };

    case "standard":
      return {
        packageType: "standard",
        monthlyInquiryLimit: 20,
      };

    case "premium":
      return {
        packageType: "premium",
        monthlyInquiryLimit: 999999,
      };

    default:
      return {
        packageType: "free",
        monthlyInquiryLimit: 5,
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
      packageType: producenci.packageType,
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

  const recipientStatus = "new";

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
    throw new Error("To zapytanie jest zablokowane");
  }

  if (
    row.packageType !== "premium" &&
    row.monthlyInquiryCount >= row.monthlyInquiryLimit
  ) {
    const packageLabel = row.packageType === "free" ? "Free" : "Standard";
    throw new Error(`Miesięczny limit leadów dla pakietu ${packageLabel} został osiągnięty`);
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

export async function resetMonthlyInquiryCounts() {
  const db = getDb();

  const result = await db
    .update(producenci)
    .set({ monthlyInquiryCount: 0 });

  return result;
}
