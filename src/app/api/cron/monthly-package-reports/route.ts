import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import path from "path";
import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { companyEvents, inquiryRecipients, producenci } from "@/db/schema";
import { sendMonthlyReportEmail } from "@/lib/mail";

export const runtime = "nodejs";

function previousMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endExclusive = new Date(now.getFullYear(), now.getMonth(), 1);
  const endLabel = new Date(endExclusive.getTime() - 24 * 60 * 60 * 1000);

  return {
    startSql: start.toISOString().slice(0, 19).replace("T", " "),
    endExclusiveSql: endExclusive.toISOString().slice(0, 19).replace("T", " "),
    label: `${start.toLocaleDateString("pl-PL")} – ${endLabel.toLocaleDateString("pl-PL")}`,
  };
}

function createPdfBuffer(input: {
  companyName: string;
  periodLabel: string;
  packageType: "standard" | "premium";
  views: number;
  websiteClicks: number;
  emailClicks: number;
  inquiriesCount: number;
}) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    const fontRegular = path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf");
    const fontBold = path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf");
    const logoPath = path.join(process.cwd(), "public/images/logo.png");

    doc.registerFont("Roboto", fontRegular);
    doc.registerFont("Roboto-Bold", fontBold);
    doc.font("Roboto");

    doc.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const totalClicks = input.websiteClicks + input.emailClicks;
    const ctr = input.views > 0 ? (totalClicks / input.views) * 100 : 0;
    const rfqRate = input.views > 0 ? (input.inquiriesCount / input.views) * 100 : 0;
    const isPremium = input.packageType === "premium";
    const accent = isPremium ? "#6d28d9" : "#2563eb";
    const softBg = isPremium ? "#f5f3ff" : "#eff6ff";

    doc.roundedRect(40, 32, doc.page.width - 80, 112, 18).fill(softBg);
    doc.image(logoPath, 58, 48, { fit: [72, 72] });

    doc
      .fillColor(accent)
      .font("Roboto-Bold")
      .fontSize(21)
      .text("Miesięczny raport PolskiEMS", 150, 52, { width: 330 });

    doc
      .fillColor("#111827")
      .font("Roboto-Bold")
      .fontSize(14)
      .text(input.companyName, 150, 82, { width: 330 });

    doc
      .fillColor("#6b7280")
      .font("Roboto")
      .fontSize(9.5)
      .text(`Zakres: ${input.periodLabel} | Pakiet: ${input.packageType.toUpperCase()}`, 150, 106, { width: 360 });

    const cards = isPremium
      ? [
          ["Wyświetlenia", input.views],
          ["Klik WWW", input.websiteClicks],
          ["Klik e-mail", input.emailClicks],
          ["RFQ", input.inquiriesCount],
          ["Łączny CTR", `${ctr.toFixed(2)}%`],
          ["RFQ / widok", `${rfqRate.toFixed(2)}%`],
        ]
      : [
          ["Wyświetlenia", input.views],
          ["Klik WWW", input.websiteClicks],
          ["Klik e-mail", input.emailClicks],
          ["RFQ", input.inquiriesCount],
          ["Łączny CTR", `${ctr.toFixed(2)}%`],
        ];

    const y = 174;
    const gap = 8;
    const cardWidth = isPremium ? 74 : 91;
    const cardHeight = 64;

    cards.forEach(([label, value], index) => {
      const x = 50 + index * (cardWidth + gap);
      doc.roundedRect(x, y, cardWidth, cardHeight, 10).fillAndStroke("#ffffff", isPremium ? "#ddd6fe" : "#dbeafe");
      doc.fillColor("#6b7280").font("Roboto").fontSize(8).text(String(label), x + 4, y + 10, {
        width: cardWidth - 8,
        align: "center",
      });
      doc.fillColor("#111827").font("Roboto-Bold").fontSize(15).text(String(value), x + 4, y + 31, {
        width: cardWidth - 8,
        align: "center",
      });
    });

    let cursorY = 270;
    doc.fillColor(accent).font("Roboto-Bold").fontSize(13).text(
      isPremium ? "Analiza Premium" : "Podsumowanie Standard",
      50,
      cursorY
    );
    cursorY += 26;

    if (isPremium) {
      const leadPotential = input.inquiriesCount >= 3 || rfqRate >= 3
        ? "wysoki"
        : input.inquiriesCount > 0 || ctr > 0
          ? "średni"
          : "niski";

      doc.fillColor("#4b5563").font("Roboto").fontSize(10).text(
        `Profil wygenerował ${input.inquiriesCount} przekazanych zapytań RFQ. Potencjał leadowy w analizowanym okresie oceniono jako ${leadPotential}. Łączny CTR wyniósł ${ctr.toFixed(2)}%.`,
        50,
        cursorY,
        { width: 495, lineGap: 3 }
      );
      cursorY += 58;

      doc.fillColor(accent).font("Roboto-Bold").fontSize(12).text("Rekomendacje", 50, cursorY);
      cursorY += 22;

      const recommendations = [
        input.views === 0
          ? "Zwiększ kompletność profilu i zakres danych używanych w wyszukiwarce."
          : "Utrzymuj aktualne usługi, technologie, branże i certyfikaty.",
        ctr < 4
          ? "Wzmocnij opis oferty i dane kontaktowe, aby zwiększyć liczbę przejść do kontaktu."
          : "CTR jest aktywny — testuj dalsze doprecyzowanie specjalizacji profilu.",
        input.inquiriesCount === 0
          ? "Sprawdź zgodność profilu z kryteriami RFQ i uzupełnij brakujące kompetencje."
          : "Analizuj otrzymane RFQ i utrzymuj aktualne dane wpływające na dopasowanie.",
      ];

      recommendations.forEach((item) => {
        doc.fillColor("#4b5563").font("Roboto").fontSize(9.5).text(`• ${item}`, 58, cursorY, {
          width: 475,
          lineGap: 2,
        });
        cursorY += 30;
      });
    } else {
      doc.fillColor("#4b5563").font("Roboto").fontSize(10).text(
        `Profil uzyskał ${input.views} wyświetleń, ${totalClicks} kliknięć kontaktowych oraz ${input.inquiriesCount} przekazanych zapytań RFQ. Łączny CTR wyniósł ${ctr.toFixed(2)}%.`,
        50,
        cursorY,
        { width: 495, lineGap: 3 }
      );
      cursorY += 62;

      doc.fillColor(accent).font("Roboto-Bold").fontSize(12).text("Podstawowe rekomendacje", 50, cursorY);
      cursorY += 22;
      doc.fillColor("#4b5563").font("Roboto").fontSize(9.5).text(
        "Utrzymuj aktualne dane kontaktowe, usługi i technologie. Uzupełniony profil zwiększa szansę na znalezienie firmy w wyszukiwarce i dopasowanie do zapytań RFQ.",
        50,
        cursorY,
        { width: 495, lineGap: 3 }
      );
    }

    doc
      .fillColor("#9ca3af")
      .font("Roboto")
      .fontSize(8.5)
      .text("Raport wygenerowany automatycznie przez PolskiEMS.pl", 50, doc.page.height - 42, {
        width: 495,
        align: "center",
      });

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
  const period = previousMonthRange();

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
        views: sql<number>`COUNT(*) FILTER (WHERE ${companyEvents.eventType} = 'view')`,
        websiteClicks: sql<number>`COUNT(*) FILTER (WHERE ${companyEvents.eventType} = 'website_click')`,
        emailClicks: sql<number>`COUNT(*) FILTER (WHERE ${companyEvents.eventType} = 'email_click')`,
      })
      .from(companyEvents)
      .where(
        and(
          eq(companyEvents.companyId, company.id),
          gte(companyEvents.createdAt, period.startSql),
          lt(companyEvents.createdAt, period.endExclusiveSql)
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
          eq(inquiryRecipients.status, "sent_to_company"),
          gte(inquiryRecipients.sentAt, period.startSql),
          lt(inquiryRecipients.sentAt, period.endExclusiveSql)
        )
      );

    const stats = statsRows[0] || { views: 0, websiteClicks: 0, emailClicks: 0 };
    const inquiriesCount = Number(inquiriesRows[0]?.inquiriesCount ?? 0);

    const pdfBuffer = await createPdfBuffer({
      companyName: company.nazwa,
      periodLabel: period.label,
      packageType: company.packageType as "standard" | "premium",
      views: Number(stats.views ?? 0),
      websiteClicks: Number(stats.websiteClicks ?? 0),
      emailClicks: Number(stats.emailClicks ?? 0),
      inquiriesCount,
    });

    await sendMonthlyReportEmail({
      companyEmail: company.email,
      companyName: company.nazwa,
      periodLabel: period.label,
      pdfBase64: pdfBuffer.toString("base64"),
    });

    sent += 1;
  }

  return NextResponse.json({ ok: true, sent, total: paidCompanies.length, period: period.label });
}
