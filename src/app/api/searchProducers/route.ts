import { NextRequest, NextResponse } from "next/server";
import { getFilteredProducers } from "@/lib/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedKeys = new Set(["regions", "requirements", "scales", "searchQuery", "query", "sort"]);
const allowedSorts = new Set(["default", "name-asc", "name-desc", "newest", "oldest"]);

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Nieprawidłowe dane wyszukiwania" }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
      return NextResponse.json({ error: "Nieprawidłowe dane wyszukiwania" }, { status: 400 });
    }
    for (const key of ["regions", "requirements", "scales"] as const) {
      if (input[key] !== undefined && (!Array.isArray(input[key]) || input[key].length > 50 || input[key].some((item) => typeof item !== "string" || item.length > 100))) {
        return NextResponse.json({ error: "Nieprawidłowe filtry wyszukiwania" }, { status: 400 });
      }
    }
    for (const key of ["searchQuery", "query"] as const) {
      if (input[key] !== undefined && (typeof input[key] !== "string" || input[key].length > 200)) {
        return NextResponse.json({ error: "Nieprawidłowy tekst wyszukiwania" }, { status: 400 });
      }
    }
    if (input.sort !== undefined && (typeof input.sort !== "string" || !allowedSorts.has(input.sort))) {
      return NextResponse.json({ error: "Nieprawidłowe sortowanie" }, { status: 400 });
    }

    const regions = Array.isArray(input.regions) ? input.regions : [];
    const requirements = Array.isArray(input.requirements) ? input.requirements : [];
    const scales = Array.isArray(input.scales) ? input.scales : [];
    const searchQuery = typeof input.searchQuery === "string"
      ? input.searchQuery.trim()
      : typeof input.query === "string"
        ? input.query.trim()
        : "";

    const hasSearchCriteria =
      regions.length > 0 ||
      requirements.length > 0 ||
      scales.length > 0 ||
      searchQuery.length > 0;

    if (!hasSearchCriteria) {
      return NextResponse.json([]);
    }

    return NextResponse.json(await getFilteredProducers(input));
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Nieprawidłowy JSON" }, { status: 400 });
    console.error("Producer search failed");
    return NextResponse.json({ error: "Wyszukiwanie jest chwilowo niedostępne" }, { status: 503 });
  }
}
