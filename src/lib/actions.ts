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

export async function getDashboardStats(days = 30) {
  const db = getDb();

const since =
  days > 0 ? sql`NOW() - INTERVAL ${days} DAY` : null;

  const [activeCompaniesResult] = await db.execute(sql`
    SELECT COUNT(*) AS count
    FROM producenci
    WHERE isActive = 1
  `);

  const [pageViewsResult] = await db.execute(sql`
    SELECT COUNT(*) AS count
    FROM page_views
    WHERE page = 'home'
      AND page_views.created_at >= NOW() - INTERVAL ${days} DAY
  `);

  const [websiteClicksResult] = await db.execute(sql`
    SELECT COUNT(*) AS count
    FROM company_events
    WHERE event_type = 'website_click'
      AND company_events.created_at >= NOW() - INTERVAL ${days} DAY
  `);

  const [emailClicksResult] = await db.execute(sql`
    SELECT COUNT(*) AS count
    FROM company_events
    WHERE event_type = 'email_click'
      AND company_events.created_at >= NOW() - INTERVAL ${days} DAY
  `);

  const topCompanies = await db.execute(sql`
    SELECT
      producenci.id AS companyId,
      producenci.nazwa AS firma,
      COUNT(*) AS views
    FROM company_events
    JOIN producenci
      ON producenci.id = company_events.company_id
    WHERE company_events.event_type = 'view'
      AND company_events.created_at >= NOW() - INTERVAL ${days} DAY
    GROUP BY producenci.id, producenci.nazwa
    ORDER BY views DESC
    LIMIT 5
  `);

  const recentEvents = await db.execute(sql`
    SELECT
      company_events.id,
      producenci.nazwa AS firma,
      company_events.event_type AS eventType,
      company_events.created_at AS createdAt
    FROM company_events
    JOIN producenci
      ON producenci.id = company_events.company_id
    ORDER BY company_events.created_at DESC
    LIMIT 10
  `);

  return {
    activeCompanies: Number((activeCompaniesResult as any)?.count ?? 0),
    pageViews: Number((pageViewsResult as any)?.count ?? 0),
    websiteClicks: Number((websiteClicksResult as any)?.count ?? 0),
    emailClicks: Number((emailClicksResult as any)?.count ?? 0),
    topCompanies,
    recentEvents,
  };
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

export const getAllProducers = async () => {
  const db = getDb();
  return await db
    .select()
    .from(producenci)
    .where(sql`${producenci.isActive} = 1`)
    .orderBy(asc(producenci.id));
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