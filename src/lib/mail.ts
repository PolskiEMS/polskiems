import { Resend } from "resend";

type SendInquiryEmailData = {
  companyEmail: string;
  companyName: string;
  customerName: string;
  customerCompany?: string | null;
  customerEmail: string;
  customerPhone?: string | null;
  serviceType: string;
  quantity?: string | null;
  deadline?: string | null;
  hasDocumentation: boolean;
  message: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Brak RESEND_API_KEY");
  }

  return new Resend(apiKey);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendInquiryEmail(data: SendInquiryEmailData) {
  const resend = getResendClient();
  const clientLabel = data.customerCompany || data.customerName;

  return await resend.emails.send({
    from: "PolskiEMS <onboarding@resend.dev>",
    to: data.companyEmail,
    subject: `Nowe zapytanie ofertowe z PolskiEMS - ${clientLabel}`,
    html: `
      <h2>Nowe zapytanie ofertowe z PolskiEMS</h2>
      <p>Ten lead został przekazany po weryfikacji przez zespół PolskiEMS. Prosimy o bezpośredni kontakt z klientem.</p>

      <h3>Dane klienta</h3>
      <p><strong>Imię i nazwisko:</strong> ${escapeHtml(data.customerName)}</p>
      <p><strong>Firma klienta:</strong> ${escapeHtml(data.customerCompany || "-")}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.customerEmail)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(data.customerPhone || "-")}</p>

      <hr />

      <h3>Zakres zapytania</h3>
      <p><strong>Typ usługi:</strong> ${escapeHtml(data.serviceType)}</p>
      <p><strong>Liczba sztuk / skala produkcji:</strong> ${escapeHtml(data.quantity || "-")}</p>
      <p><strong>Termin realizacji:</strong> ${escapeHtml(data.deadline || "-")}</p>
      <p><strong>Dokumentacja techniczna:</strong> ${data.hasDocumentation ? "Tak" : "Nie"}</p>

      <hr />

      <p><strong>Opis projektu:</strong></p>
      <p>${escapeHtml(data.message).replace(/\n/g, "<br />")}</p>

      <p>Prosimy o kontakt bezpośrednio z klientem i przygotowanie wyceny zgodnie z przesłanymi informacjami.</p>
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
