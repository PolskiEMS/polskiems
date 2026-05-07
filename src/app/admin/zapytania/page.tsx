import Link from 'next/link';
import { getAdminInquiries, sendInquiryToCompanyAction } from '@/lib/actions';
import styles from './style.module.css';

export const dynamic = 'force-dynamic';

type AdminInquiryRow = Awaited<ReturnType<typeof getAdminInquiries>>[number];

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("pl-PL");
}

function getStatusClass(status: string | null | undefined) {
  switch (status) {
    case "new":
      return styles.statusNew;
    case "sent":
      return styles.statusSent;
    case "error":
      return styles.statusError;
    case "blocked":
      return styles.statusBlocked;
    default:
      return "";
  }
}

function getPackageBadgeLabel(packageType: string | null | undefined) {
  if (packageType === "standard") return "Standard";
  if (packageType === "premium") return "Premium";
  return null;
}

function getPackageBadgeClass(packageType: string | null | undefined) {
  if (packageType === "premium") return styles.packageBadgePremium;
  return styles.packageBadgeStandard;
}

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
                  <td>{formatDate(row.createdAt)}</td>
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
                  <td>{row.quantity || '-'}</td>
                  <td>
                    {row.companyName ? (
                      <div>
                        <div className={styles.companyRow}>
                          <span>{row.companyName}</span>
                          {getPackageBadgeLabel(row.packageType) && (
                            <span className={`${styles.packageBadge} ${getPackageBadgeClass(row.packageType)}`}>
                              {getPackageBadgeLabel(row.packageType)}
                            </span>
                          )}
                        </div>
                        <div className={styles.muted}>{row.companyEmail}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(row.status)}`}>
                      {row.status || "-"}
                    </span>
                  </td>
                  <td>
                    {row.recipientId && row.status !== 'sent' ? (
                      <form action={sendInquiryToCompanyAction}>
                        <input type="hidden" name="recipientId" value={String(row.recipientId)} />
                        <button type="submit" className={styles.sendBtn}>
                          Akceptuj i wyślij
                        </button>
                      </form>
                    ) : (
                      '-'
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
                {row.customerCompany ? ` — ${row.customerCompany}` : ''}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Data:</span> {formatDate(row.createdAt)}
              </div>
              <div className={styles.cardRow}>
                <span className={styles.label}>Email:</span> {row.customerEmail}
              </div>
              <div className={styles.cardRow}>
                <span className={styles.label}>Telefon:</span> {row.customerPhone || '-'}
              </div>
              <div className={styles.cardRow}>
                <span className={styles.label}>Usługa:</span> {row.serviceType}
              </div>
              <div className={styles.cardRow}>
                <span className={styles.label}>Ilość:</span> {row.quantity || '-'}
              </div>
              <div className={styles.cardRow}>
                <span className={styles.label}>Termin:</span> {row.deadline || '-'}
              </div>
              <div className={styles.cardRow}>
                <span className={styles.label}>Firma:</span> {row.companyName || '-'}
                {getPackageBadgeLabel(row.packageType) && (
                  <span className={`${styles.packageBadge} ${getPackageBadgeClass(row.packageType)}`}>
                    {getPackageBadgeLabel(row.packageType)}
                  </span>
                )}
              </div>
              <div className={styles.cardRow}>
                <span className={styles.label}>Status:</span>{" "}
                <span className={`${styles.status} ${getStatusClass(row.status)}`}>
                  {row.status || "-"}
                </span>
              </div>

              <div className={styles.messageBox}>
                <div className={styles.label}>Opis projektu:</div>
                <p>{row.message}</p>
              </div>

              {row.recipientId && row.status !== 'sent' && (
                <form action={sendInquiryToCompanyAction}>
                  <input type="hidden" name="recipientId" value={String(row.recipientId)} />
                  <button type="submit" className={styles.sendBtn}>
                    Akceptuj i wyślij
                  </button>
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
