import { Resend } from "resend";

type SendInquiryEmailData = {
  companyEmail: string;
  companyName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  serviceType: string;
  quantity?: string | null;
  deadline?: string | null;
  message: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Brak RESEND_API_KEY");
  }

  return new Resend(apiKey);
}

export async function sendInquiryEmail(data: SendInquiryEmailData) {
  const resend = getResendClient();

  return await resend.emails.send({
    from: "PolskiEMS <onboarding@resend.dev>",
    to: data.companyEmail,
    subject: `Nowe zapytanie ofertowe – ${data.companyName}`,
    html: `
      <h2>Nowe zapytanie ofertowe</h2>

      <p><strong>Imię i nazwisko:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail}</p>
      <p><strong>Telefon:</strong> ${data.customerPhone || "-"}</p>

      <hr />

      <p><strong>Usługa:</strong> ${data.serviceType}</p>
      <p><strong>Ilość:</strong> ${data.quantity || "-"}</p>
      <p><strong>Termin:</strong> ${data.deadline || "-"}</p>

      <hr />

      <p><strong>Opis projektu:</strong></p>
      <p>${data.message.replace(/\n/g, "<br />")}</p>
    `,
  });
}

type SendMonthlyReportEmailData = {
  companyEmail: string;
  companyName: string;
  periodLabel: string;
  pdfBase64: string;
};

export async function sendMonthlyReportEmail(data: SendMonthlyReportEmailData) {
  const resend = getResendClient();

  return await resend.emails.send({
    from: "PolskiEMS <onboarding@resend.dev>",
    to: data.companyEmail,
    subject: `Miesięczny raport PDF – ${data.companyName}`,
    html: `
      <h2>Miesięczny raport PolskiEMS</h2>
      <p>Firma: <strong>${data.companyName}</strong></p>
      <p>Zakres: ${data.periodLabel}</p>
      <p>W załączniku znajdziesz raport PDF.</p>
    `,
    attachments: [
      {
        filename: `raport-${data.companyName.replace(/\\s+/g, "-").toLowerCase()}.pdf`,
        content: data.pdfBase64,
      },
    ],
  });
}
