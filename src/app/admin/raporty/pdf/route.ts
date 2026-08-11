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

function drawFooter(doc: PDFKit.PDFDocument, contentWidth: number, now: Date) {
  doc.switchToPage(doc.bufferedPageRange().count - 1);

  const bottomY = doc.page.height - 40;

  doc
    .fillColor("#9ca3af")
    .font("Roboto")
    .fontSize(8.5)
    .text(
      `Raport wygenerowany automatycznie | PolskiEMS.pl | ${formatDate(now)}`,
      50,
      bottomY,
      {
        width: contentWidth,
        align: "center",
      }
    );
}

function drawHeader(doc: PDFKit.PDFDocument, data: ReportPdfData, logoPath: string) {
  const headerBg = data.isPremium ? "#f5f3ff" : "#eff6ff";
  const accent = data.isPremium ? "#6d28d9" : "#2563eb";
  const badgeBg = data.isPremium ? "#6d28d9" : "#dbeafe";
  const badgeText = data.isPremium ? "#ffffff" : "#1d4ed8";

  doc.roundedRect(40, 32, data.pageWidth - 80, 120, 18).fill(headerBg);

  doc.image(logoPath, 62, 46, {
    fit: [78, 78],
    align: "center",
    valign: "center",
  });

  doc
    .fillColor(accent)
    .font("Roboto-Bold")
    .fontSize(22)
    .text("Raport PolskiEMS", 160, 50, {
      width: 250,
      align: "left",
    });

  doc
    .fillColor("#111827")
    .font("Roboto-Bold")
    .fontSize(15)
    .text(data.companyName, 160, 80, {
      width: 260,
      align: "left",
    });

  doc
    .fillColor("#6b7280")
    .font("Roboto")
    .fontSize(10)
    .text(`Zakres raportu: ${data.reportRangeLabel}`, 160, 102, {
      width: 260,
      align: "left",
    });

  doc
    .fillColor("#6b7280")
    .font("Roboto")
    .fontSize(10)
    .text("Aktywność profilu firmy w katalogu PolskiEMS", 160, 118, {
      width: 280,
      align: "left",
    });

  doc.roundedRect(448, 50, 96, 26, 13).fill(badgeBg);

  doc
    .fillColor(badgeText)
    .font("Roboto-Bold")
    .fontSize(10)
    .text(data.isPremium ? "PREMIUM" : "STANDARD", 448, 58, {
      width: 96,
      align: "center",
    });
}

function drawCompanyInfoCard(doc: PDFKit.PDFDocument, data: ReportPdfData) {
  const y = 168;

  doc.roundedRect(50, y, data.contentWidth, 58, 12).fillAndStroke("#ffffff", "#e5e7eb");

  doc
    .fillColor("#111827")
    .font("Roboto-Bold")
    .fontSize(10.5)
    .text("Dane firmy", 64, y + 10);

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(9.6)
    .text(`Firma: ${data.companyName}`, 64, y + 28, { width: 180 });

  doc.text(`Pakiet: ${data.packageType.toUpperCase()}`, 64, y + 42, {
    width: 180,
  });

  const rightX = 250;
  let rightY = y + 18;

  if (data.companyWebsite) {
    doc.text(`WWW: ${data.companyWebsite}`, rightX, rightY, { width: 290 });
    rightY += 14;
  }

  if (data.companyEmail) {
    doc.text(`Email: ${data.companyEmail}`, rightX, rightY, { width: 290 });
    rightY += 14;
  }

  if (data.companyPhone) {
    doc.text(`Telefon: ${data.companyPhone}`, rightX, rightY, { width: 290 });
  }
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string, y: number, accent = "#111827") {
  doc
    .fillColor(accent)
    .font("Roboto-Bold")
    .fontSize(12.5)
    .text(title, 50, y);

  doc
    .moveTo(50, y + 18)
    .lineTo(545, y + 18)
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .stroke();
}

function drawKpiCardsStandard(doc: PDFKit.PDFDocument, data: ReportPdfData, y: number) {
  const cards = [
    { label: "Wyświetlenia", value: String(data.views) },
    { label: "Klik WWW", value: String(data.websiteClicks) },
    { label: "Klik Email", value: String(data.emailClicks) },
    { label: "Łączny CTR", value: `${data.totalCtrPct.toFixed(2)}%` },
  ];

  const cardWidth = 114;
  const cardHeight = 62;
  const gap = 13;

  cards.forEach((card, index) => {
    const x = 50 + index * (cardWidth + gap);

    doc.roundedRect(x, y, cardWidth, cardHeight, 10).fillAndStroke("#ffffff", "#dbeafe");

    doc
      .fillColor("#6b7280")
      .font("Roboto")
      .fontSize(8.8)
      .text(card.label, x, y + 11, {
        width: cardWidth,
        align: "center",
      });

    doc
      .fillColor("#111827")
      .font("Roboto-Bold")
      .fontSize(18)
      .text(card.value, x, y + 28, {
        width: cardWidth,
        align: "center",
      });
  });
}

function drawKpiCardsPremium(doc: PDFKit.PDFDocument, data: ReportPdfData, y: number) {
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
  const cardHeight = 66;
  const gap = 10;

  cards.forEach((card, index) => {
    const x = 50 + index * (cardWidth + gap);

    doc.roundedRect(x, y, cardWidth, cardHeight, 10).fillAndStroke("#ffffff", "#ddd6fe");

    doc
      .fillColor("#7c3aed")
      .font("Roboto")
      .fontSize(8.5)
      .text(card.label, x, y + 10, {
        width: cardWidth,
        align: "center",
      });

    doc
      .fillColor("#111827")
      .font("Roboto-Bold")
      .fontSize(16.5)
      .text(card.value, x, y + 29, {
        width: cardWidth,
        align: "center",
      });
  });
}

function drawActivityChart(
  doc: PDFKit.PDFDocument,
  items: { label: string; value: number; color: string }[],
  y: number
) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  items.forEach((item, index) => {
    const rowY = y + index * 26;
    const barX = 165;
    const barW = 280;
    const barH = 12;
    const fillW = (item.value / maxValue) * barW;

    doc
      .fillColor("#374151")
      .font("Roboto")
      .fontSize(9.8)
      .text(item.label, 50, rowY + 1, { width: 95 });

    doc.roundedRect(barX, rowY, barW, barH, 6).fill("#e5e7eb");

    if (item.value > 0) {
      doc.roundedRect(barX, rowY, fillW, barH, 6).fill(item.color);
    }

    doc
      .fillColor("#111827")
      .font("Roboto-Bold")
      .fontSize(9.8)
      .text(String(item.value), 468, rowY, {
        width: 50,
        align: "right",
      });
  });
}

function drawMiniInfoBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  text: string,
  accentColor: string,
  bg = "#f8fafc",
  border = "#e5e7eb"
) {
  const paddingX = 12;
  const titleY = y + 10;
  const textY = y + 27;
  const textWidth = w - paddingX * 2;

  doc.roundedRect(x, y, w, h, 10).fillAndStroke(bg, border);

  doc
    .fillColor(accentColor)
    .font("Roboto-Bold")
    .fontSize(9.2)
    .text(title, x + paddingX, titleY, {
      width: textWidth,
      align: "left",
      lineBreak: false,
      ellipsis: true,
    });

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(8.3)
    .text(text, x + paddingX, textY, {
      width: textWidth,
      height: h - 32,
      align: "left",
      ellipsis: true,
    });
}

function drawStandardReport(doc: PDFKit.PDFDocument, data: ReportPdfData) {
  let y = 245;

  drawSectionTitle(doc, "Podsumowanie", y);
  y += 24;

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(9.8)
    .text(
      "Standard zawiera podstawowe wskaźniki aktywności profilu i krótkie wskazówki optymalizacyjne.",
      50,
      y,
      {
        width: data.contentWidth,
        align: "left",
      }
    );

  y += 30;

  drawKpiCardsStandard(doc, data, y);
  y += 82;

  drawSectionTitle(doc, "Aktywność profilu", y);
  y += 28;

  drawActivityChart(
    doc,
    [
      { label: "Wyświetlenia", value: data.views, color: "#2563eb" },
      { label: "Klik WWW", value: data.websiteClicks, color: "#60a5fa" },
      { label: "Klik Email", value: data.emailClicks, color: "#93c5fd" },
    ],
    y
  );

  y += 92;

  drawSectionTitle(doc, "Interpretacja", y);
  y += 26;

  const interpretation =
    data.totalCtrPct >= 8
      ? "Profil notuje dobrą aktywność i skutecznie kieruje do kontaktu."
      : data.totalCtrPct > 0
      ? "Profil generuje ruch, ale można zwiększyć liczbę interakcji."
      : "Profil ma wyświetlenia, ale nie generuje jeszcze kliknięć.";

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(9.8)
    .text(interpretation, 50, y, {
      width: data.contentWidth,
      align: "left",
    });

  y += 34;

  drawSectionTitle(doc, "Podstawowe rekomendacje", y);
  y += 28;

  const boxW = 155;
  const boxH = 60;
  const gap = 15;

  drawMiniInfoBox(
    doc,
    50,
    y,
    boxW,
    boxH,
    "Opis profilu",
    "Doprecyzuj zakres usług.",
    "#1d4ed8",
    "#f8fbff",
    "#dbeafe"
  );

  drawMiniInfoBox(
    doc,
    50 + boxW + gap,
    y,
    boxW,
    boxH,
    "CTA",
    "Dodaj krótką zachętę do kontaktu.",
    "#1d4ed8",
    "#f8fbff",
    "#dbeafe"
  );

  drawMiniInfoBox(
    doc,
    50 + (boxW + gap) * 2,
    y,
    boxW,
    boxH,
    "Dane kontaktowe",
    "Sprawdź WWW i email.",
    "#1d4ed8",
    "#f8fbff",
    "#dbeafe"
  );

  y += 72;

  doc.roundedRect(50, y, data.contentWidth, 44, 10).fillAndStroke("#eff6ff", "#bfdbfe");

  doc
    .fillColor("#1d4ed8")
    .font("Roboto-Bold")
    .fontSize(9.8)
    .text("Rozszerz raport do Premium", 62, y + 10);

  doc
    .fillColor("#3b82f6")
    .font("Roboto")
    .fontSize(8.8)
    .text(
      "Odblokuj wynik profilu, wnioski i szczegółowe rekomendacje.",
      62,
      y + 24,
      {
        width: 430,
        align: "left",
      }
    );
}

function drawPremiumReport(doc: PDFKit.PDFDocument, data: ReportPdfData) {
  let y = 245;

  drawSectionTitle(doc, "Podsumowanie Premium", y, "#6d28d9");
  y += 24;

  doc
    .fillColor("#4b5563")
    .font("Roboto")
    .fontSize(9.8)
    .text(
      "Premium zawiera rozszerzoną analizę skuteczności profilu oraz dodatkowe wnioski i rekomendacje.",
      50,
      y,
      {
        width: data.contentWidth,
        align: "left",
      }
    );

  y += 28;

  drawKpiCardsPremium(doc, data, y);
  y += 82;

  drawSectionTitle(doc, "Aktywność i skuteczność", y, "#6d28d9");
  y += 26;

  drawActivityChart(
    doc,
    [
      { label: "Wyświetlenia", value: data.views, color: "#7c3aed" },
      { label: "Klik WWW", value: data.websiteClicks, color: "#8b5cf6" },
      { label: "Klik Email", value: data.emailClicks, color: "#a78bfa" },
    ],
    y
  );

  y += 86;

  drawSectionTitle(doc, "Wnioski Premium", y, "#6d28d9");
  y += 24;

  const leadPotential =
    data.totalCtrPct >= 10 ? "Wysoki" : data.totalCtrPct > 0 ? "Średni" : "Niski";

  const insightBoxW = 158;
  const insightGap = 10;
  const insightBoxH = 60;

  drawMiniInfoBox(
    doc,
    50,
    y,
    insightBoxW,
    insightBoxH,
    "Łączny CTR",
    `${data.totalCtrPct.toFixed(2)}%`,
    "#6d28d9",
    "#faf5ff",
    "#ddd6fe"
  );

  drawMiniInfoBox(
    doc,
    50 + insightBoxW + insightGap,
    y,
    insightBoxW,
    insightBoxH,
    "Potencjał leadowy",
    leadPotential,
    "#6d28d9",
    "#faf5ff",
    "#ddd6fe"
  );

  drawMiniInfoBox(
    doc,
    50 + (insightBoxW + insightGap) * 2,
    y,
    insightBoxW,
    insightBoxH,
    "Wniosek",
    data.totalCtrPct < 4
      ? "Największa przestrzeń do poprawy dotyczy CTA i oferty."
      : "Profil ma poprawne wyniki i potencjał wzrostu.",
    "#6d28d9",
    "#faf5ff",
    "#ddd6fe"
  );

  y += 66;

  drawSectionTitle(doc, "AI rekomendacja", y, "#6d28d9");
  y += 24;

  const recommendation =
  !data.companyWebsite || !data.companyEmail
    ? "Uzupełnij dane kontaktowe, aby zwiększyć wiarygodność profilu."
    : data.totalCtrPct >= 8
    ? "Wyniki są dobre. Testuj nowe warianty oferty i aktualizuj profil."
    : "Wzmocnij komunikat oferty, dodaj CTA i rozbuduj opis usług.";

const recommendationTextWidth = data.contentWidth - 28;

doc.font("Roboto").fontSize(9.6);
const recommendationTextHeight = doc.heightOfString(recommendation, {
  width: recommendationTextWidth,
  align: "left",
});

const recommendationBoxHeight = Math.max(56, recommendationTextHeight + 30);

doc
  .roundedRect(50, y, data.contentWidth, recommendationBoxHeight, 10)
  .fillAndStroke("#faf5ff", "#ddd6fe");

doc
  .fillColor("#6d28d9")
  .font("Roboto-Bold")
  .fontSize(9.5)
  .text("Rekomendacja:", 62, y + 10, {
    width: 120,
    align: "left",
  });

doc
  .fillColor("#4b5563")
  .font("Roboto")
  .fontSize(9.4)
  .text(recommendation, 62, y + 24, {
    width: recommendationTextWidth,
    align: "left",
  });
}
  
const PRESET_DAYS = [7, 30, 90] as const;
const isValidIsoDate = (value: string | null) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

export async function GET(req: NextRequest) {
    try {
    const companyId = Number(req.nextUrl.searchParams.get("companyId") ?? 0);
    const daysRaw = Number(req.nextUrl.searchParams.get("days") ?? 30);
    const days = PRESET_DAYS.includes(daysRaw as (typeof PRESET_DAYS)[number]) ? daysRaw : 30;
    const startDateParam = req.nextUrl.searchParams.get("startDate");
    const endDateParam = req.nextUrl.searchParams.get("endDate");
    const startDate = isValidIsoDate(startDateParam) ? startDateParam : null;
    const endDate = isValidIsoDate(endDateParam) ? endDateParam : null;
    const hasCustomRange = Boolean(startDate && endDate);

    if (!Number.isFinite(companyId) || companyId <= 0) {
      return new Response("Invalid companyId", { status: 400 });
    }

    if ((startDateParam || endDateParam) && !hasCustomRange) {
      return new Response("Invalid startDate/endDate", { status: 400 });
    }

    if (hasCustomRange && new Date(startDate!) > new Date(endDate!)) {
      return new Response("startDate cannot be greater than endDate", { status: 400 });
    }

    const report = await getCompanyReport(companyId, hasCustomRange ? null : days, startDate, endDate);

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
      const reportRangeLabel = hasCustomRange && startDate && endDate
        ? `${formatDate(new Date(startDate))} – ${formatDate(new Date(endDate))}`
        : (() => {
            const start = new Date();
            start.setDate(now.getDate() - days);
            return `${formatDate(start)} – ${formatDate(now)}`;
          })();

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

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="raport-${safeName}-${hasCustomRange ? `${startDate}-${endDate}` : `${days}dni`}.pdf"`,
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