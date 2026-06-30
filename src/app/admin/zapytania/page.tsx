import Link from 'next/link';
import { getAdminInquiries, rejectInquiryAction, sendInquiryToCompanyAction } from '@/lib/actions';
import styles from './style.module.css';

export const dynamic = 'force-dynamic';

type AdminInquiryRow = Awaited<ReturnType<typeof getAdminInquiries>>[number];

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pl-PL');
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case 'pending_review':
      return styles.statusPending;
    case 'sent_to_company':
      return styles.statusSent;
    case 'rejected':
      return styles.statusRejected;
    case 'failed':
      return styles.statusFailed;
    default:
      return styles.statusPending;
  }
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case 'pending_review':
      return 'pending_review';
    case 'sent_to_company':
      return 'sent_to_company';
    case 'rejected':
      return 'rejected';
    case 'failed':
      return 'failed';
    default:
      return status || '-';
  }
}

function getSourceLabel(source?: string | null) {
  switch (source) {
    case 'company_card':
      return 'company_card';
    case 'company_profile':
      return 'company_profile';
    default:
      return 'global_form';
  }
}

function getPackageBadgeLabel(packageType: string | null | undefined) {
  if (packageType === 'premium') return 'Premium';
  if (packageType === 'standard') return 'Standard';
  return null;
}

function getPackageBadgeClass(packageType: string | null | undefined) {
  if (packageType === 'premium') return styles.packageBadgePremium;
  return styles.packageBadgeStandard;
}

function InquiryDetails({ row }: { row: AdminInquiryRow }) {
  return (
    <details className={styles.details}>
      <summary>Szczegóły</summary>
      <div className={styles.detailsGrid}>
        <div>
          <h3>Dane klienta</h3>
          <p><strong>Imię i nazwisko:</strong> {row.customerName}</p>
          <p><strong>Firma klienta:</strong> {row.customerCompany || '-'}</p>
          <p><strong>E-mail:</strong> {row.customerEmail}</p>
          <p><strong>Telefon:</strong> {row.customerPhone || '-'}</p>
          <p><strong>Źródło:</strong> {getSourceLabel(row.source)}</p>
        </div>
        <div>
          <h3>Wybrana firma EMS</h3>
          <p><strong>Nazwa:</strong> {row.companyName || '-'}</p>
          <p><strong>E-mail zapisany:</strong> {row.companyEmail || '-'}</p>
          <p><strong>Aktualny e-mail:</strong> {row.currentCompanyEmail || '-'}</p>
          <p><strong>Aktywna:</strong> {row.companyIsActive ? 'Tak' : 'Nie'}</p>
        </div>
      </div>
      <div className={styles.detailsGrid}>
        <div>
          <h3>Zakres zapytania</h3>
          <p><strong>Typ usługi:</strong> {row.serviceType}</p>
          <p><strong>Liczba sztuk / skala:</strong> {row.quantity || '-'}</p>
          <p><strong>Termin:</strong> {row.deadline || '-'}</p>
          <p><strong>Dokumentacja techniczna:</strong> {row.hasDocumentation ? 'Tak' : 'Nie / w przygotowaniu'}</p>
          <p><strong>Załącznik:</strong> {row.attachmentName || '-'}</p>
        </div>
        <div>
          <h3>Workflow</h3>
          <p><strong>Utworzono:</strong> {formatDate(row.createdAt)}</p>
          <p><strong>Wysłano:</strong> {formatDate(row.sentAt)}</p>
          <p><strong>Odrzucono:</strong> {formatDate(row.rejectedAt)}</p>
          <p><strong>Notatka admina:</strong> {row.adminNote || '-'}</p>
          <p><strong>Błąd:</strong> {row.errorMessage || '-'}</p>
        </div>
      </div>
      <div className={styles.messageBox}>
        <div className={styles.label}>Opis projektu:</div>
        <p>{row.message}</p>
      </div>
    </details>
  );
}

function PendingActions({ row }: { row: AdminInquiryRow }) {
  if (row.status !== 'pending_review' || !row.recipientId) {
    return <span className={styles.noAction}>Brak akcji</span>;
  }

  return (
    <div className={styles.actionStack}>
      <form action={sendInquiryToCompanyAction} className={styles.actionForm}>
        <input type="hidden" name="recipientId" value={String(row.recipientId)} />
        <textarea name="adminNote" className={styles.noteInput} placeholder="Notatka admina (opcjonalnie)" />
        <button type="submit" className={styles.sendBtn}>Akceptuj i wyślij do firmy</button>
      </form>
      <form action={rejectInquiryAction} className={styles.actionForm}>
        <input type="hidden" name="recipientId" value={String(row.recipientId)} />
        <textarea name="adminNote" className={styles.noteInput} placeholder="Powód odrzucenia / notatka" />
        <button type="submit" className={styles.rejectBtn}>Odrzuć</button>
      </form>
    </div>
  );
}

export default async function AdminInquiriesPage() {
  let rows: AdminInquiryRow[] = [];
  let loadError: string | null = null;

  try {
    rows = await getAdminInquiries();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Nieznany błąd pobierania zapytań.';
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Zapytania ofertowe</h1>
        <p className={styles.lead}>Lead trafia do firmy dopiero po akceptacji przez administratora.</p>

        {loadError && (
          <div className={styles.errorBox}>
            <strong>Podstrona zapytań ofertowych nie może pobrać danych.</strong> Najczęstsza przyczyna to brak aktualnej migracji bazy danych dla workflow zapytań lub kolumn załączników. Uruchom migrację z pliku <code>docs/inquiry-workflow-migration.sql</code>. Komunikat techniczny: {loadError}
          </div>
        )}

        {!loadError && rows.length === 0 && (
          <div className={styles.emptyBox}>Brak zapytań ofertowych do wyświetlenia.</div>
        )}

        {!loadError && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Klient</th>
                <th>Kontakt</th>
                <th>Usługa</th>
                <th>Firma EMS</th>
                <th>Status</th>
                <th>Szczegóły</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: AdminInquiryRow, index: number) => (
                <tr key={`${row.inquiryId}-${row.recipientId ?? index}`}>
                  <td>{formatDate(row.createdAt)}</td>
                  <td>
                    <div>{row.customerName}</div>
                    {row.customerCompany && <div className={styles.muted}>{row.customerCompany}</div>}
                  </td>
                  <td>
                    <div>{row.customerEmail}</div>
                    {row.customerPhone && <div className={styles.muted}>{row.customerPhone}</div>}
                  </td>
                  <td>
                    <div>{row.serviceType}</div>
                    <div className={styles.muted}>{row.quantity || '-'} / {row.deadline || '-'}</div>
                  </td>
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
                        <div className={styles.muted}>{row.currentCompanyEmail || row.companyEmail}</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(row.status)}`}>
                      {getStatusLabel(row.status)}
                    </span>
                  </td>
                  <td><InquiryDetails row={row} /></td>
                  <td><PendingActions row={row} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {!loadError && (
        <div className={styles.cards}>
          {rows.map((row: AdminInquiryRow, index: number) => (
            <div key={`${row.inquiryId}-${row.recipientId ?? index}`} className={styles.card}>
              <div className={styles.cardTitle}>{row.customerName}{row.customerCompany ? ` — ${row.customerCompany}` : ''}</div>
              <div className={styles.cardRow}><span className={styles.label}>Data:</span> {formatDate(row.createdAt)}</div>
              <div className={styles.cardRow}><span className={styles.label}>Email:</span> {row.customerEmail}</div>
              <div className={styles.cardRow}><span className={styles.label}>Telefon:</span> {row.customerPhone || '-'}</div>
              <div className={styles.cardRow}><span className={styles.label}>Firma:</span> {row.companyName || '-'}</div>
              <div className={styles.cardRow}>
                <span className={styles.label}>Status:</span>{' '}
                <span className={`${styles.status} ${getStatusClass(row.status)}`}>{getStatusLabel(row.status)}</span>
              </div>
              <InquiryDetails row={row} />
              <PendingActions row={row} />
            </div>
          ))}
        </div>
        )}

        <div className={styles.bottomBack}>
          <Link href="/admin" className={styles.backBtn}>Powrót do panelu</Link>
        </div>
      </div>
    </div>
  );
}
