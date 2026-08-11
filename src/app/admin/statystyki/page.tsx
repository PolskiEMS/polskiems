import Link from "next/link";
import { getCompanyStats } from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = Number(params?.days ?? 30);

  const companies = await getCompanyStats(days);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Statystyki firm ({days} dni)</h1>

        <div className={styles.rangeSelector}>
          <Link href="/admin/statystyki?days=7">7 dni</Link>
          <Link href="/admin/statystyki?days=30">30 dni</Link>
          <Link href="/admin/statystyki?days=90">90 dni</Link>
          <Link href="/admin/statystyki?days=365">365 dni</Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Firma</th>
                <th>Wyświetlenia</th>
                <th>Klik WWW</th>
                <th>Klik Email</th>
                <th>CTR WWW</th>
                <th>CTR Email</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => (
                <tr key={company.companyId}>
                  <td>{company.firma}</td>
                  <td>{company.views}</td>
                  <td>{company.websiteClicks}</td>
                  <td>{company.emailClicks}</td>
                  <td>{company.websiteCtrPct}%</td>
                  <td>{company.emailCtrPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.backRow}>
      <Link href="/admin" className={styles.backLink}>
       ← Powrót do panelu
     </Link>
     </div>
      </div>
    </div>
  );
}

