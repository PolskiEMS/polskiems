import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { getCompanyReport } from "@/lib/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeNumber(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
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

  const chunks: Uint8Array[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  const endPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 100;

  const logoCandidates = [
    path.join(process.cwd(), "public", "images", "logo.png"),
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "public", "images", "logo.jpg"),
  ];

  const logoPath = logoCandidates.find((p) => fs.existsSync(p));

  const views = safeNumber(report.views);
  const websiteClicks = safeNumber(report.websiteClicks);
  const emailClicks = safeNumber(report.emailClicks);
  const websiteCtrPct = safeNumber(report.websiteCtrPct);
  const emailCtrPct = safeNumber(report.emailCtrPct);

  // Tło nagłówka
  doc
    .roundedRect(40, 35, pageWidth - 80, 110, 18)
    .fill("#f5f3ff");

  // Logo
  if (logoPath) {
    doc.image(logoPath, 58, 52, { fit: [90, 60] });
  }

  // Nagłówek
  doc
    .fillColor("#4c1d95")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Raport PolskiEMS", logoPath ? 160 : 60, 55, {
      width: 320,
      align: "left",
    });

  doc
    .fillColor("#111827")
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(String(report.firma ?? "Firma"), logoPath ? 160 : 60, 88, {
      width: 340,
      align: "left",
    });

  doc
    .fillColor("#6b7280")
    .fontSize(11)
    .font("Helvetica")
    .text(`Zakres raportu: ostatnie ${days} dni`, logoPath ? 160 : 60, 112);

  let currentY = 175;

  // Sekcja podsumowania
  doc
    .fillColor("#111827")
    .fontSize(15)
    .font("Helvetica-Bold")
    .text("Podsumowanie", 50, currentY);

  currentY += 22;

  doc
    .fillColor("#4b5563")
    .fontSize(10)
    .font("Helvetica")
    .text(
      "Raport pokazuje aktywność użytkowników wokół profilu firmy w katalogu PolskiEMS.",
      50,
      currentY,
      { width: contentWidth }
    );

  currentY += 34;

  // KPI cards
  const cards = [
    { label: "Wyświetlenia", value: String(views) },
    { label: "Klik WWW", value: String(websiteClicks) },
    { label: "Klik Email", value: String(emailClicks) },
    { label: "CTR WWW", value: `${websiteCtrPct}%` },
    { label: "CTR Email", value: `${emailCtrPct}%` },
  ];

  const cardWidth = 155;
  const cardHeight = 74;
  const cardGap = 15;
  const cardStartX = 50;

  cards.forEach((card, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = cardStartX + col * (cardWidth + cardGap);
    const y = currentY + row * (cardHeight + 16);

    doc
      .roundedRect(x, y, cardWidth, cardHeight, 12)
      .fillAndStroke("#ffffff", "#ddd6fe");

    doc
      .fillColor("#6d28d9")
      .fontSize(10)
      .font("Helvetica")
      .text(card.label, x + 14, y + 12);

    doc
      .fillColor("#111827")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text(card.value, x + 14, y + 34);
  });

  currentY += 180;

  // Mini wykres
  doc
    .fillColor("#111827")
    .fontSize(15)
    .font("Helvetica-Bold")
    .text("Mini wykres aktywności", 50, currentY);

  currentY += 28;

  const chartItems = [
    { label: "Wyświetlenia", value: views },
    { label: "Klik WWW", value: websiteClicks },
    { label: "Klik Email", value: emailClicks },
  ];

  const maxValue = Math.max(...chartItems.map((i) => i.value), 1);

  chartItems.forEach((item, index) => {
    const y = currentY + index * 38;
    const barX = 160;
    const barW = 320;
    const barH = 16;
    const fillW = (item.value / maxValue) * barW;

    doc
      .fillColor("#374151")
      .fontSize(11)
      .font("Helvetica")
      .text(item.label, 50, y + 2, { width: 95 });

    doc
      .roundedRect(barX, y, barW, barH, 8)
      .fill("#ede9fe");

    if (item.value > 0) {
      doc
        .roundedRect(barX, y, fillW, barH, 8)
        .fill("#8b5cf6");
    }

    doc
      .fillColor("#111827")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(String(item.value), 495, y + 1, {
        width: 40,
        align: "right",
      });
  });

  currentY += 145;

  // Interpretacja
  doc
    .fillColor("#111827")
    .fontSize(15)
    .font("Helvetica-Bold")
    .text("Interpretacja", 50, currentY);

  currentY += 24;

  const interpretation =
    websiteCtrPct >= 10
      ? "Profil firmy generuje dobre zainteresowanie i wysoki współczynnik przejścia na stronę WWW."
      : websiteCtrPct > 0
      ? "Profil firmy generuje ruch, ale jest przestrzeń do poprawy opisu, logo lub widoczności."
      : "Profil firmy ma wyświetlenia, ale nie generuje jeszcze przejść na stronę WWW. Warto poprawić prezentację firmy.";

  doc
    .fillColor("#4b5563")
    .fontSize(10.5)
    .font("Helvetica")
    .text(interpretation, 50, currentY, {
      width: contentWidth,
      align: "left",
    });

  // Stopka
  doc
    .fillColor("#9ca3af")
    .fontSize(9)
    .font("Helvetica")
    .text(
      `Wygenerowano: ${new Date().toLocaleString("pl-PL")} | PolskiEMS`,
      50,
      790,
      {
        width: contentWidth,
        align: "center",
      }
    );

  doc.end();

  const pdfBuffer = await endPromise;

  const safeName = String(report.firma ?? "firma")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-ąćęłńóśźż]/gi, "");

      return new Response(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="raport-${safeName}-${days}dni.pdf"`,
        },
      });
    } catch (error) {
      console.error("PDF route error:", error);
      return new Response("PDF generation failed", { status: 500 });
    }
  }