import PDFDocument from "pdfkit";
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
    console.log("PDF REPORT:", report);

    if (!report) {
      return new Response("Report not found", { status: 404 });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

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

      doc.fontSize(22).text("Raport PolskiEMS", { align: "center" });
      doc.moveDown(0.5);

      doc.fontSize(16).text(String(report.firma ?? "Firma"), { align: "center" });
      doc.moveDown(0.3);

      doc.fontSize(11).text(`Zakres: ostatnie ${days} dni`, { align: "center" });
      doc.moveDown(2);

      doc.fontSize(14).text("Podsumowanie", { underline: true });
      doc.moveDown();

      doc.fontSize(12).text(`Wyświetlenia: ${views}`);
      doc.text(`Klik WWW: ${websiteClicks}`);
      doc.text(`Klik Email: ${emailClicks}`);
      doc.text(`CTR WWW: ${websiteCtrPct}%`);
      doc.text(`CTR Email: ${emailCtrPct}%`);

      doc.moveDown(2);
      doc.fontSize(10).fillColor("gray").text(
        `Wygenerowano: ${new Date().toLocaleString("pl-PL")}`,
        { align: "left" }
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
