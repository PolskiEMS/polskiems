import {
  dzialaniaEms,
  producenci,
  producenciEmsDzialania,
  producenciEmsProdukcja,
  produkcja,
  statystyki,
  wojewodztwa,
} from "@/db/schema";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

export const getAllProducers = async () => {
const db = getDb();
  return await db
    .select()
    .from(producenci)
    .where(eq(producenci.isActive, true))
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

  // Match ALL selected requirements
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
    if (matchingRequirementsIds.length === 0) return []; // nothing matches
  }

  // Match ALL selected production scales
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
    if (matchingScalesIds.length === 0) return []; // nothing matches
  }

  // Main producer query
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

  // Build filter logic
  const whereConditions = [eq(producenci.isActive, true)]; // Add isActive filter by default

  // ✅ Region filter: match ANY
  if (regions.length > 0) {
    whereConditions.push(inArray(wojewodztwa.nazwa, regions));
  }

  // ✅ Requirements: match ALL
  if (requirements.length > 0) {
    whereConditions.push(inArray(producenci.id, matchingRequirementsIds));
  }

  // ✅ Scales: match ALL
  if (scales.length > 0) {
    whereConditions.push(inArray(producenci.id, matchingScalesIds));
  }

  query.where(and(...whereConditions));

  return await query;
}
