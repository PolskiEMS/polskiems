import Link from "next/link";
import { getAdminInquiries, sendInquiryToCompanyAction } from "@/lib/actions";
import styles from './style.module.css';

export const dynamic = "force-dynamic";

type AdminInquiryRow = Awaited<ReturnType<typeof getAdminInquiries>>[number];

export default async function AdminInquiriesPage() {
  const rows = await getAdminInquiries();
  
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Zapytania ofertowe</h1>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Klient</th>
                <th>Email</th>
                <th>Usługa</th>
                <th>Ilość</th>
                <th>Firma</th>
                <th>Status</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: AdminInquiryRow, index: number) => (
                <tr key={`${row.inquiryId}-${row.recipientId ?? index}`}>
                  <td>{row.createdAt || "-"}</td>
                  <td>
                    <div>{row.customerName}</div>
                    {row.customerCompany && (
                      <div className={styles.muted}>{row.customerCompany}</div>
                    )}
                  </td>
                  <td>
                    <div>{row.customerEmail}</div>
                    {row.customerPhone && (
                      <div className={styles.muted}>{row.customerPhone}</div>
                    )}
                  </td>
                  <td>{row.serviceType}</td>
                  <td>{row.quantity || "-"}</td>
                  <td>
                    {row.companyName ? (
                      <div>
                        <div>{row.companyName}</div>
                        <div className={styles.muted}>{row.companyEmail}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{row.status || "-"}</td>
                  <td>
                    {row.recipientId && row.status !== "sent" ? (
                      <form action={sendInquiryToCompanyAction}>
                        <input type="hidden" name="recipientId" value={String(row.recipientId)} />
                        <button type="submit" className={styles.sendBtn}>
                          Wyślij
                        </button>
                      </form>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.cards}>
          {rows.map((row: AdminInquiryRow, index: number) => (
            <div key={`${row.inquiryId}-${row.recipientId ?? index}`} className={styles.card}>
              <div className={styles.cardTitle}>
                {row.customerName}
                {row.customerCompany ? ` — ${row.customerCompany}` : ""}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Data:</span> {row.createdAt || "-"}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Email:</span> {row.customerEmail}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Telefon:</span>{" "}
                {row.customerPhone || "-"}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Usługa:</span> {row.serviceType}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Ilość:</span> {row.quantity || "-"}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Termin:</span> {row.deadline || "-"}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Firma:</span> {row.companyName || "-"}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Status:</span> {row.status || "-"}
              </div>

              <div className={styles.messageBox}>
                <div className={styles.label}>Opis projektu:</div>
                <p>{row.message}</p>
              </div>

              {row.recipientId && row.status !== "sent" && (
                <form action={sendInquiryToCompanyAction}>
                  <input type="hidden" name="recipientId" value={String(row.recipientId)} />
                  <button type="submit">Wyślij</button>
                </form>
              )}
            </div>
          ))}
        </div>

        <div className={styles.bottomBack}>
          <Link href="/admin" className={styles.backBtn}>
            Powrót do panelu
          </Link>
        </div>
      </div>
    </div>
  );
}