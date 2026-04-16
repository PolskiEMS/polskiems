import Link from "next/link";
import { approveCompanyAction, getAdminCompanies } from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";

type AdminCompany = Awaited<ReturnType<typeof getAdminCompanies>>[number];

function getPackageLabel(packageType: string | null | undefined) {
  switch (packageType) {
    case "free":
      return "Free";
    case "standard":
      return "Standard";
    case "premium":
      return "Premium";
    default:
      return "-";
  }
}

function getFeaturedLabel(featured: boolean | null | undefined) {
  return featured ? "Tak" : "Nie";
}

function getStatusLabel(isActive: boolean | null | undefined) {
  return isActive ? "Aktywna" : "Oczekuje akceptacji";
}

function getLeadUsageLabel(
  monthlyInquiryCount: number | null | undefined,
  monthlyInquiryLimit: number | null | undefined
) {
  const count = Number(monthlyInquiryCount ?? 0);
  const limit = Number(monthlyInquiryLimit ?? 0);

  return `${count} / ${limit}`;
}

export default async function AdminCompaniesPage() {
  const companies = await getAdminCompanies();
  const pendingCompanies = companies.filter((company) => !company.isActive);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>Firmy</h1>

          <Link href="/admin/firmy/nowa" className={styles.addBtn}>
            Dodaj firmę
          </Link>
        </div>

        {pendingCompanies.length > 0 && (
          <div className={styles.pendingBox}>
            <strong>Nowe zgłoszenia do akceptacji:</strong> {pendingCompanies.length}
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nazwa</th>
                <th>Email</th>
                <th>WWW</th>
                <th>Pakiet</th>
                <th>Featured</th>
                <th>Leady / miesiąc</th>
                <th>Status</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company: AdminCompany) => (
                <tr key={company.id}>
                  <td>{company.id}</td>
                  <td>{company.nazwa || "-"}</td>
                  <td>{company.email || "-"}</td>
                  <td>
                    {company.www ? (
                      <a
                        href={company.www}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                      >
                        {company.www}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{getPackageLabel(company.packageType)}</td>
                  <td>{getFeaturedLabel(company.featured)}</td>
                  <td>
                    {getLeadUsageLabel(
                      company.monthlyInquiryCount,
                      company.monthlyInquiryLimit
                    )}
                  </td>
                  <td>{getStatusLabel(company.isActive)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {!company.isActive && (
                        <form action={approveCompanyAction}>
                          <input type="hidden" name="id" value={company.id} />
                          <button type="submit" className={styles.approveBtn}>
                            Akceptuj
                          </button>
                        </form>
                      )}

                      <Link
                        href={`/admin/firmy/${company.id}`}
                        className={styles.editBtn}
                      >
                        Edytuj
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.cards}>
          {companies.map((company: AdminCompany) => (
            <div key={company.id} className={styles.card}>
              <div className={styles.cardTitle}>
                {company.nazwa || "-"}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>ID:</span> {company.id}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Email:</span> {company.email || "-"}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>WWW:</span>{" "}
                {company.www ? (
                  <a
                    href={company.www}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.link}
                  >
                    {company.www}
                  </a>
                ) : (
                  "-"
                )}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Pakiet:</span>{" "}
                {getPackageLabel(company.packageType)}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Featured:</span>{" "}
                {getFeaturedLabel(company.featured)}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Leady / miesiąc:</span>{" "}
                {getLeadUsageLabel(
                  company.monthlyInquiryCount,
                  company.monthlyInquiryLimit
                )}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.label}>Status:</span>{" "}
                {getStatusLabel(company.isActive)}
              </div>

              <div className={styles.cardActions}>
                <div className={styles.actionButtons}>
                  {!company.isActive && (
                    <form action={approveCompanyAction}>
                      <input type="hidden" name="id" value={company.id} />
                      <button type="submit" className={styles.approveBtn}>
                        Akceptuj
                      </button>
                    </form>
                  )}

                  <Link
                    href={`/admin/firmy/${company.id}`}
                    className={styles.editBtn}
                  >
                    Edytuj
                  </Link>
                </div>
              </div>
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
