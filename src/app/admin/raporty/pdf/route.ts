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

    const fontRegular = path.join(
      process.cwd(),
      "public/fonts/Roboto-Regular.ttf"
    );
    const fontBold = path.join(
      process.cwd(),
      "public/fonts/Roboto-Bold.ttf"
    );

    doc.registerFont("Regular", fontRegular);
    doc.registerFont("Bold", fontBold);
    doc.font("Regular");

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const views = safeNumber(report.views);
      const websiteClicks = safeNumber(report.websiteClicks);
      const emailClicks = safeNumber(report.emailClicks);
      const websiteCtrPct = safeNumber(report.websiteCtrPct);
      const emailCtrPct = safeNumber(report.emailCtrPct);

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 100;

      // Header box
      doc.roundedRect(40, 35, pageWidth - 80, 110, 18).fill("#f5f3ff");

      doc
        .fillColor("#4c1d95")
        .font("Bold")
        .fontSize(24)
        .text("Raport PolskiEMS", 60, 55, {
          width: 320,
          align: "left",
        });

      doc
        .fillColor("#111827")
        .font("Bold")
        .fontSize(16)
        .text(String(report.firma ?? "Firma"), 60, 88, {
          width: 340,
          align: "left",
        });

      doc
        .fillColor("#6b7280")
        .font("Regular")
        .fontSize(11)
        .text(`Zakres raportu: ostatnie ${days} dni`, 60, 112);

      let currentY = 175;

      // Podsumowanie
      doc
        .fillColor("#111827")
        .font("Bold")
        .fontSize(15)
        .text("Podsumowanie", 50, currentY);

      currentY += 22;

      doc
        .fillColor("#4b5563")
        .font("Regular")
        .fontSize(10)
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

        doc.roundedRect(x, y, cardWidth, cardHeight, 12).fillAndStroke(
          "#ffffff",
          "#ddd6fe"
        );

        doc
          .fillColor("#6d28d9")
          .font("Regular")
          .fontSize(10)
          .text(card.label, x + 14, y + 12);

        doc
          .fillColor("#111827")
          .font("Bold")
          .fontSize(22)
          .text(card.value, x + 14, y + 34);
      });

      currentY += 180;

      // Mini wykres
      doc
        .fillColor("#111827")
        .font("Bold")
        .fontSize(15)
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
          .font("Regular")
          .fontSize(11)
          .text(item.label, 50, y + 2, { width: 95 });

        doc.roundedRect(barX, y, barW, barH, 8).fill("#ede9fe");

        if (item.value > 0) {
          doc.roundedRect(barX, y, fillW, barH, 8).fill("#8b5cf6");
        }

        doc
          .fillColor("#111827")
          .font("Bold")
          .fontSize(11)
          .text(String(item.value), 495, y + 1, {
            width: 40,
            align: "right",
          });
      });

      currentY += 145;

      // Interpretacja
      doc
        .fillColor("#111827")
        .font("Bold")
        .fontSize(15)
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
        .font("Regular")
        .fontSize(10.5)
        .text(interpretation, 50, currentY, {
          width: contentWidth,
          align: "left",
        });

      // Stopka
      doc
        .fillColor("#9ca3af")
        .font("Regular")
        .fontSize(9)
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
    });

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
    return new Response(
      error instanceof Error ? error.message : String(error),
      { status: 500 }
    );
  }
}
