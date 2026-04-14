import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { companyEvents, inquiryRecipients, producenci } from "@/db/schema";
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
  packageType: "standard" | "premium";
  views: number;
  websiteClicks: number;
  inquiriesCount: number;
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
    doc.text(`Pakiet: ${input.packageType.toUpperCase()}`);

    doc.moveDown(1.2);
    const conversionRate = input.views > 0
      ? `${((input.inquiriesCount / input.views) * 100).toFixed(2)}%`
      : "0.00%";

    if (input.packageType === "premium") {
      doc.fontSize(14).text("📈 Zaawansowana analityka + raport miesięczny");
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Wyświetlenia i kliknięcia: ${input.views} / ${input.websiteClicks}`);
      doc.text(`Liczba zapytań i konwersja: ${input.inquiriesCount} / ${conversionRate}`);
      doc.moveDown(0.8);
      doc.fontSize(12).text("Rekomendacje optymalizacji profilu:");
      doc.moveDown(0.3);
      doc.fontSize(11).text("• Utrzymuj aktualne dane kontaktowe i ofertę.");
      doc.text("• Wyróżniaj konkretne realizacje oraz przewagi technologiczne.");
      doc.text("• Testuj różne opisy oferty, aby zwiększyć liczbę zapytań.");
    } else {
      doc.fontSize(14).text("📊 Miesięczny raport skuteczności profilu");
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Liczba wyświetleń: ${input.views}`);
      doc.text(`Liczba zapytań: ${input.inquiriesCount}`);
      doc.text(`Zainteresowanie ofertą: ${conversionRate}`);
    }

    doc.moveDown(0.5);
    doc.moveDown(0.7);
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
      })
      .from(companyEvents)
      .where(
        and(
          eq(companyEvents.companyId, company.id),
          gte(companyEvents.createdAt, sinceSql)
        )
      );

    const inquiriesRows = await db
      .select({
        inquiriesCount: sql<number>`COUNT(*)`,
      })
      .from(inquiryRecipients)
      .where(
        and(
          eq(inquiryRecipients.companyId, company.id),
          gte(inquiryRecipients.sentAt, sinceSql)
        )
      );

    const stats = statsRows[0] || { views: 0, websiteClicks: 0 };
    const inquiriesCount = Number(inquiriesRows[0]?.inquiriesCount ?? 0);

    const pdfBuffer = await createPdfBuffer({
      companyName: company.nazwa,
      periodLabel: getPeriodLabel(),
      packageType: company.packageType as "standard" | "premium",
      views: Number(stats.views ?? 0),
      websiteClicks: Number(stats.websiteClicks ?? 0),
      inquiriesCount,
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
