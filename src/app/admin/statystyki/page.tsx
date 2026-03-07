import { getCompanyStats } from "@/lib/actions";
import styles from "./style.module.css";

export default async function AdminStatsPage() {
  const companies = await getCompanyStats(30);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Statystyki firm (30 dni)</h1>

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
              {companies.map((company: any) => (
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
      </div>
    </div>
  );
}