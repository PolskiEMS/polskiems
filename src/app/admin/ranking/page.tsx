import { getCompanyRanking } from "@/lib/actions";
import styles from "./style.module.css";

export default async function AdminRankingPage() {
  const data = await getCompanyRanking(30);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Ranking firm (30 dni)</h1>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Top 10 wyświetleń</h2>
            <ol className={styles.list}>
              {data.topViews.map((company) => (
                <li key={company.companyId} className={styles.listItem}>
                  <span>{company.firma}</span>
                  <strong>{company.views}</strong>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Top 10 klików WWW</h2>
            <ol className={styles.list}>
              {data.topWebsiteClicks.map((company) => (
                <li key={company.companyId} className={styles.listItem}>
                  <span>{company.firma}</span>
                  <strong>{company.websiteClicks}</strong>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>Top 10 CTR WWW</h2>
            <ol className={styles.list}>
              {data.topWebsiteCtr.map((company) => (
                <li key={company.companyId} className={styles.listItem}>
                  <span>{company.firma}</span>
                  <strong>{company.websiteCtrPct}%</strong>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}