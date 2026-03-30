import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInquiryEmail(data: {
  companyEmail: string;
  companyName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  serviceType: string;
  quantity?: string | null;
  deadline?: string | null;
  message: string;
}) {
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

      <p><strong>Opis:</strong><br/>${data.message}</p>
    `,
  });
}
