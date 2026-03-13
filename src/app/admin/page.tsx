import Link from "next/link";
import { getDashboardStats } from "@/lib/actions";
import styles from "./style.module.css";
import LogoutButton from "@/app/components/admin/LogoutButton";

export default async function AdminDashboardPage() {
  const data = await getDashboardStats(30);

  return (
    <div className={styles.page}>
      <div className={styles.container}>

      <div className={styles.logoutTop}>
           <LogoutButton />
      </div>

        <h1 className={styles.title}>Panel Admina</h1>
        
        <div className={styles.adminMenu}>
          <Link href="/admin/statystyki" className={styles.adminBox}>
            Statystyki
          </Link>

          <Link href="/admin/ranking" className={styles.adminBox}>
            Ranking firm
          </Link>

          <Link href="/admin/wykresy" className={styles.adminBox}>
            Wykresy
          </Link>

          <Link href="/admin/raporty" className={styles.adminBox}>
            Raporty
          </Link>

          <Link href="/admin/firmy" className={styles.card}>
          Firmy
          </Link>

        </div>       

        <div className={styles.dashboardGrid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Liczby główne</h2>

            <p>
              <strong>Aktywne firmy:</strong> {data.activeCompanies}
            </p>

            <p>
              <strong>Wyświetlenia strony PolskiEMS (30 dni):</strong>{" "}
              {data.pageViews}
            </p>

            <p>
              <strong>Klik WWW (30 dni):</strong> {data.websiteClicks}
            </p>

            <p>
              <strong>Klik Email (30 dni):</strong> {data.emailClicks}
            </p>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Top 5 firm</h2>

            {Array.isArray(data.topCompanies) && data.topCompanies.length > 0 ? (
              <ol className={styles.topList}>
                {data.topCompanies.map((company: any) => (
                  <li key={company.companyId} className={styles.topListItem}>
                    {company.firma} — {company.views} views
                  </li>
                ))}
              </ol>
            ) : (
              <p>Brak danych</p>
            )}
          </div>

          <div className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>Ostatnie eventy</h2>

            {Array.isArray(data.recentEvents) && data.recentEvents.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Firma</th>
                      <th>Event</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.map((event: any) => (
                      <tr key={event.id}>
                        <td>{event.firma}</td>
                        <td>{event.eventType}</td>
                        <td>{event.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Brak eventów</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
