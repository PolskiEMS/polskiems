import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { companyEvents, producenci } from "@/db/schema";
import { sendMonthlyReportEmail } from "@/lib/mail";

export const runtime = "nodejs";

function getPeriodLabel() {
  const now = new Date();
  const month = now.toLocaleString("pl-PL", { month: "long" });
  const year = now.getFullYear();
  return `${month} ${year}`;
}

function createPdfBuffer(input: {
  companyName: string;
  periodLabel: string;
  views: number;
  websiteClicks: number;
  emailClicks: number;
}) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("PolskiEMS — raport miesięczny", { align: "left" });
    doc.moveDown(0.8);
    doc.fontSize(12).text(`Firma: ${input.companyName}`);
    doc.text(`Okres: ${input.periodLabel}`);

    doc.moveDown(1.2);
    doc.fontSize(14).text("Podsumowanie");
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Wyświetlenia profilu: ${input.views}`);
    doc.text(`Kliknięcia strony WWW: ${input.websiteClicks}`);
    doc.text(`Kliknięcia e-mail: ${input.emailClicks}`);

    doc.moveDown(1);
    doc.fontSize(11).fillColor("#666").text("Raport wygenerowany automatycznie przez PolskiEMS.");

    doc.end();
  });
}

export async function POST(req: NextRequest) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  const expectedToken = process.env.CRON_SECRET?.trim();

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceSql = since.toISOString().slice(0, 19).replace("T", " ");

  const paidCompanies = await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
      email: producenci.email,
      packageType: producenci.packageType,
    })
    .from(producenci)
    .where(
      and(
        eq(producenci.isActive, true),
        inArray(producenci.packageType, ["standard", "premium"])
      )
    );

  let sent = 0;

  for (const company of paidCompanies) {
    if (!company.email) continue;

    const statsRows = await db
      .select({
        views: sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'view'), 0)`,
        websiteClicks: sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'website_click'), 0)`,
        emailClicks: sql<number>`COALESCE(SUM(${companyEvents.eventType} = 'email_click'), 0)`,
      })
      .from(companyEvents)
      .where(
        and(
          eq(companyEvents.companyId, company.id),
          gte(companyEvents.createdAt, sinceSql)
        )
      );

    const stats = statsRows[0] || { views: 0, websiteClicks: 0, emailClicks: 0 };

    const pdfBuffer = await createPdfBuffer({
      companyName: company.nazwa,
      periodLabel: getPeriodLabel(),
      views: Number(stats.views ?? 0),
      websiteClicks: Number(stats.websiteClicks ?? 0),
      emailClicks: Number(stats.emailClicks ?? 0),
    });

    await sendMonthlyReportEmail({
      companyEmail: company.email,
      companyName: company.nazwa,
      periodLabel: getPeriodLabel(),
      pdfBase64: pdfBuffer.toString("base64"),
    });

    sent += 1;
  }

  return NextResponse.json({ ok: true, sent, total: paidCompanies.length });
}
