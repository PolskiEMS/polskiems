import PDFDocument from "pdfkit";
import path from "path";
import { NextRequest } from "next/server";
import { getCompanyReport } from "@/lib/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeNumber(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type ReportPdfData = {
  companyName: string;
  packageType: string;
  isPremium: boolean;
  reportRangeLabel: string;
  companyWebsite: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  views: number;
  websiteClicks: number;
  emailClicks: number;
  websiteCtrPct: number;
  emailCtrPct: number;
  totalCtrPct: number;
  contentWidth: number;
  pageWidth: number;
};

function drawFooter(doc: any, contentWidth: number, now: Date) {
  doc
    .fillColor("#9ca3af")
    .font("Roboto")
    .fontSize(9)
    .text(
      `Raport wygenerowany automatycznie | PolskiEMS.pl | ${formatDate(now)}`,
      50,
      790,
      {
        width: contentWidth,
        align: "center",
      }
    );
}

function drawHeader(doc: any, data: ReportPdfData, logoPath: string) {
  const headerBg = data.isPremium ? "#f5f3ff" : "#eff6ff";
  const accent = data.isPremium ? "#6d28d9" : "#2563eb";
  const badgeBg = data.isPremium ? "#6d28d9" : "#dbeafe";
  const badgeText = data.isPremium ? "#ffffff" : "#1d4ed8";

  doc.roundedRect(40, 35, data.pageWidth - 80, 140, 18).fill(headerBg);

  doc.image(logoPath, 65, 52, {
    fit: [92, 92],
  });

  doc
    .fillColor(accent)
    .font("Roboto-Bold")
    .fontSize(24)
    .text("Raport PolskiEMS", 180, 58, {
      width: 260,
      align: "left",
    });

  doc
    .fillColor("#111827")
    .font("Roboto-Bold")
    .fontSize(16)
    .text(data.companyName, 180, 90, {
      width: 260,
      align: "left",
    });

  doc
    .fillColor("#6b7280")
    .font("Roboto")
    .fontSize(10.5)
    .text(`Zakres raportu: ${data.reportRangeLabel}`, 180, 114);

  doc
    .fillColor("#6b7280")
    .font("Roboto")
    .fontSize(10.5)
    .text("Aktywność profilu firmy w katalogu PolskiEMS", 180, 130, {
      width: 260,
      align: "left",
    });

  doc.roundedRect(455, 58, 90, 26, 13).fill(badgeBg);

  doc
    .fillColor(badgeText)
    .font("Roboto-Bold")
    .fontSize(10)
    .text(data.isPremium ? "PREMIUM" : "STANDARD", 455, 66, {
      width: 90,
      align: "center",
    });
}

function drawCompanyInfoCard(doc: any, data: ReportPdfData) {
  const y = 190;

  doc.roundedRect(50, y, data.contentWidth, 72, 14).fillAndStroke("#ffffff", "#e5e7eb");

  doc
    .fillColor("#111827")
    .font("Roboto-Bold")
    .fontSize(11)
    .text("Dane firmy", 66, y + 14);

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(10)
    .text(`Firma: ${data.companyName}`, 66, y + 34, { width: 220 });

  doc.text(`Pakiet: ${data.packageType.toUpperCase()}`, 66, y + 50, {
    width: 220,
  });

  let rightY = y + 34;

  if (data.companyWebsite) {
    doc.text(`WWW: ${data.companyWebsite}`, 310, rightY, { width: 230 });
    rightY += 16;
  }

  if (data.companyEmail) {
    doc.text(`Email: ${data.companyEmail}`, 310, rightY, { width: 230 });
    rightY += 16;
  }

  if (data.companyPhone) {
    doc.text(`Telefon: ${data.companyPhone}`, 310, rightY, { width: 230 });
  }
}

function drawSectionTitle(doc: any, title: string, y: number) {
  doc
    .fillColor("#111827")
    .font("Roboto-Bold")
    .fontSize(14)
    .text(title, 50, y);

  doc
    .moveTo(50, y + 20)
    .lineTo(545, y + 20)
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .stroke();
}

function drawKpiCardsStandard(doc: any, data: ReportPdfData, y: number) {
  const cards = [
    { label: "Wyświetlenia", value: String(data.views) },
    { label: "Klik WWW", value: String(data.websiteClicks) },
    { label: "Klik Email", value: String(data.emailClicks) },
    { label: "Łączny CTR", value: `${data.totalCtrPct.toFixed(2)}%` },
  ];

  const cardWidth = 115;
  const cardHeight = 78;
  const gap = 12;

  cards.forEach((card, index) => {
    const x = 50 + index * (cardWidth + gap);

    doc.roundedRect(x, y, cardWidth, cardHeight, 12).fillAndStroke("#ffffff", "#dbeafe");

    doc
      .fillColor("#6b7280")
      .font("Roboto")
      .fontSize(9.5)
      .text(card.label, x, y + 14, {
        width: cardWidth,
        align: "center",
      });

    doc
      .fillColor("#111827")
      .font("Roboto-Bold")
      .fontSize(22)
      .text(card.value, x, y + 34, {
        width: cardWidth,
        align: "center",
      });
  });
}

function drawKpiCardsPremium(doc: any, data: ReportPdfData, y: number) {
  const engagementScore = Math.round(
    Math.min(100, data.websiteCtrPct * 5 + data.emailCtrPct * 5 + Math.min(30, data.views / 20))
  );

  const cards = [
    { label: "Wyświetlenia", value: String(data.views) },
    { label: "Klik WWW", value: String(data.websiteClicks) },
    { label: "Klik Email", value: String(data.emailClicks) },
    { label: "CTR WWW", value: `${data.websiteCtrPct.toFixed(2)}%` },
    { label: "Score", value: `${engagementScore}/100` },
  ];

  const cardWidth = 90;
  const cardHeight = 82;
  const gap = 10;

  cards.forEach((card, index) => {
    const x = 50 + index * (cardWidth + gap);

    doc.roundedRect(x, y, cardWidth, cardHeight, 12).fillAndStroke("#ffffff", "#ddd6fe");

    doc
      .fillColor("#7c3aed")
      .font("Roboto")
      .fontSize(9)
      .text(card.label, x, y + 14, {
        width: cardWidth,
        align: "center",
      });

    doc
      .fillColor("#111827")
      .font("Roboto-Bold")
      .fontSize(20)
      .text(card.value, x, y + 38, {
        width: cardWidth,
        align: "center",
      });
  });
}

function drawActivityChart(
  doc: any,
  items: { label: string; value: number; color: string }[],
  y: number
) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  items.forEach((item, index) => {
    const rowY = y + index * 34;
    const barX = 170;
    const barW = 290;
    const barH = 14;
    const fillW = (item.value / maxValue) * barW;

    doc
      .fillColor("#374151")
      .font("Roboto")
      .fontSize(10.5)
      .text(item.label, 50, rowY + 1, { width: 105 });

    doc.roundedRect(barX, rowY, barW, barH, 7).fill("#e5e7eb");

    if (item.value > 0) {
      doc.roundedRect(barX, rowY, fillW, barH, 7).fill(item.color);
    }

    doc
      .fillColor("#111827")
      .font("Roboto-Bold")
      .fontSize(10.5)
      .text(String(item.value), 480, rowY, {
        width: 50,
        align: "right",
      });
  });
}

function drawStandardReport(doc: any, data: ReportPdfData) {
  let y = 285;

  drawSectionTitle(doc, "Podsumowanie", y);
  y += 32;

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(10.5)
    .text(
      "Raport pokazuje podstawową aktywność użytkowników wokół profilu firmy w katalogu PolskiEMS. Standard zawiera najważniejsze wskaźniki oraz podstawowe wskazówki dotyczące skuteczności profilu.",
      50,
      y,
      { width: data.contentWidth, align: "left" }
    );

  y += 62;

  drawKpiCardsStandard(doc, data, y);
  y += 102;

  drawSectionTitle(doc, "Aktywność profilu", y);
  y += 34;

  drawActivityChart(
    doc,
    [
      { label: "Wyświetlenia", value: data.views, color: "#2563eb" },
      { label: "Klik WWW", value: data.websiteClicks, color: "#60a5fa" },
      { label: "Klik Email", value: data.emailClicks, color: "#93c5fd" },
    ],
    y
  );

  y += 118;

  drawSectionTitle(doc, "Interpretacja wyników", y);
  y += 32;

  const interpretation =
    data.totalCtrPct >= 8
      ? "Profil generuje dobrą aktywność i skutecznie kieruje użytkowników do kontaktu lub strony WWW."
      : data.totalCtrPct > 0
      ? "Profil generuje podstawowe zainteresowanie, ale nadal istnieje przestrzeń do zwiększenia liczby interakcji."
      : "Profil jest wyświetlany, ale nie generuje jeszcze kliknięć do kontaktu ani strony WWW.";

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(10.5)
    .text(interpretation, 50, y, {
      width: data.contentWidth,
      align: "left",
    });

  y += 52;

  drawSectionTitle(doc, "Podstawowe rekomendacje", y);
  y += 34;

  const recs = [
    {
      title: "Opis profilu",
      text: "Doprecyzuj zakres usług i specjalizację firmy.",
    },
    {
      title: "CTA",
      text: "Dodaj krótką zachętę do kontaktu lub wysłania zapytania.",
    },
    {
      title: "Dane kontaktowe",
      text: "Upewnij się, że WWW i email są aktualne i widoczne.",
    },
  ];

  const boxW = 155;
  const boxGap = 15;

  recs.forEach((rec, i) => {
    const x = 50 + i * (boxW + boxGap);

    doc.roundedRect(x, y, boxW, 72, 12).fillAndStroke("#f8fafc", "#e5e7eb");

    doc
      .fillColor("#111827")
      .font("Roboto-Bold")
      .fontSize(10)
      .text(rec.title, x + 12, y + 12, { width: boxW - 24 });

    doc
      .fillColor("#6b7280")
      .font("Roboto")
      .fontSize(9.2)
      .text(rec.text, x + 12, y + 30, {
        width: boxW - 24,
        align: "left",
      });
  });

  y += 94;

  doc.roundedRect(50, y, data.contentWidth, 54, 12).fillAndStroke("#eff6ff", "#bfdbfe");

  doc
    .fillColor("#1d4ed8")
    .font("Roboto-Bold")
    .fontSize(10.5)
    .text("Rozszerz raport do Premium", 64, y + 12);

  doc
    .fillColor("#3b82f6")
    .font("Roboto")
    .fontSize(9.5)
    .text(
      "Odblokuj bardziej szczegółową analizę, wskaźnik jakości profilu, rozbudowane rekomendacje i dodatkowe insighty.",
      64,
      y + 28,
      { width: 430 }
    );
}

function drawPremiumReport(doc: any, data: ReportPdfData) {
  let y = 285;

  drawSectionTitle(doc, "Podsumowanie Premium", y);
  y += 32;

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(10.5)
    .text(
      "Raport Premium zawiera rozszerzoną analizę skuteczności profilu wraz z dodatkowymi wskaźnikami i rekomendacjami optymalizacyjnymi.",
      50,
      y,
      { width: data.contentWidth, align: "left" }
    );

  y += 56;

  drawKpiCardsPremium(doc, data, y);
  y += 106;

  drawSectionTitle(doc, "Aktywność i skuteczność", y);
  y += 34;

  drawActivityChart(
    doc,
    [
      { label: "Wyświetlenia", value: data.views, color: "#7c3aed" },
      { label: "Klik WWW", value: data.websiteClicks, color: "#8b5cf6" },
      { label: "Klik Email", value: data.emailClicks, color: "#a78bfa" },
    ],
    y
  );

  y += 118;

  drawSectionTitle(doc, "Insighty Premium", y);
  y += 30;

  const leadPotential =
    data.totalCtrPct >= 10 ? "Wysoki" : data.totalCtrPct > 0 ? "Średni" : "Niski";

  const insights = [
    `Łączny CTR profilu wynosi ${data.totalCtrPct.toFixed(2)}%.`,
    `Potencjał leadowy: ${leadPotential}.`,
    data.totalCtrPct < 4
      ? "Największa przestrzeń do poprawy dotyczy komunikacji oferty i CTA."
      : "Profil osiąga poprawne wyniki i warto kontynuować dalszą optymalizację.",
  ];

  insights.forEach((text, idx) => {
    doc
      .fillColor("#4b5563")
      .font("Roboto")
      .fontSize(10.3)
      .text(`• ${text}`, 50, y + idx * 18, {
        width: data.contentWidth,
      });
  });

  y += 72;

  drawSectionTitle(doc, "Rekomendacja Premium", y);
  y += 32;

  const recommendation =
    !data.companyWebsite || !data.companyEmail
      ? "Uzupełnij wszystkie dane kontaktowe, ponieważ pełny profil zwiększa szansę na kontakt i buduje wiarygodność firmy."
      : data.totalCtrPct >= 8
      ? "Wyniki są dobre. Warto testować nowe wersje oferty, rozwijać opis firmy i utrzymywać pełną aktualność danych."
      : "Warto przetestować bardziej konkretne komunikaty oferty, dodać mocniejsze CTA oraz rozbudować opis usług, aby zwiększyć CTR.";

  doc.roundedRect(50, y, data.contentWidth, 72, 12).fillAndStroke("#faf5ff", "#ddd6fe");

  doc
    .fillColor("#6d28d9")
    .font("Roboto-Bold")
    .fontSize(11)
    .text("AI rekomendacja", 64, y + 12);

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(10)
    .text(recommendation, 64, y + 30, {
      width: data.contentWidth - 28,
      align: "left",
    });
}

export async function GET(req: NextRequest) {
  try {
    const companyId = Number(req.nextUrl.searchParams.get("companyId") ?? 0);
    const days = Number(req.nextUrl.searchParams.get("days") ?? 30);

    if (!Number.isFinite(companyId) || companyId <= 0) {
      return new Response("Invalid companyId", { status: 400 });
    }

    const report = await getCompanyReport(companyId, days);

    if (!report) {
      return new Response("Report not found", { status: 404 });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const fontRegular = path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf");
    const fontBold = path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf");
    const logoPath = path.join(process.cwd(), "public/images/logo.png");

    doc.registerFont("Roboto", fontRegular);
    doc.registerFont("Roboto-Bold", fontBold);
    doc.font("Roboto");

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const pdfBuffer: Buffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const views = safeNumber(report.views);
      const websiteClicks = safeNumber(report.websiteClicks);
      const emailClicks = safeNumber(report.emailClicks);
      const websiteCtrPct = safeNumber(report.websiteCtrPct);
      const emailCtrPct = safeNumber(report.emailCtrPct);
      const totalCtrPct = safeNumber(
        views > 0 ? ((websiteClicks + emailClicks) / views) * 100 : 0
      );

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 100;

      const now = new Date();
      const start = new Date();
      start.setDate(now.getDate() - days);
      const reportRangeLabel = `${formatDate(start)} – ${formatDate(now)}`;

      const companyName = String(report.firma ?? "Firma");
      const packageType = String(report.packageType ?? "free").toLowerCase();
      const isPremium = packageType === "premium";
      const companyWebsite = report.www ? String(report.www) : null;
      const companyEmail = report.email ? String(report.email) : null;
      const companyPhone = report.telefon ? String(report.telefon) : null;

      const pdfData: ReportPdfData = {
        companyName,
        packageType,
        isPremium,
        reportRangeLabel,
        companyWebsite,
        companyEmail,
        companyPhone,
        views,
        websiteClicks,
        emailClicks,
        websiteCtrPct,
        emailCtrPct,
        totalCtrPct,
        contentWidth,
        pageWidth,
      };

      drawHeader(doc, pdfData, logoPath);
      drawCompanyInfoCard(doc, pdfData);

      if (isPremium) {
        drawPremiumReport(doc, pdfData);
      } else {
        drawStandardReport(doc, pdfData);
      }

      drawFooter(doc, contentWidth, now);

      doc.end();
    });

    const safeName = String(report.firma ?? "firma")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-ąćęłńóśźż]/gi, "");

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="raport-${safeName}-${days}dni.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF route error:", error);

    return new Response(
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 }
    );
  }
}
