import Link from "next/link";
import { getDashboardStats, getPageViewsStats } from "@/lib/actions";
import { getTaxonomyHealthSummary } from "@/lib/adminCompanyTaxonomyActions";
import styles from "./style.module.css";
import LogoutButton from "@/app/components/admin/LogoutButton";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const menuItems = [
  {
    href: "/admin/firmy",
    title: "Firmy i dostawcy",
    description: "Edycja profili, pakietów, typów firm i taksonomii.",
  },
  {
    href: "/admin/zapytania",
    title: "Zapytania ofertowe",
    description: "Obsługa zgłoszeń klientów i przekazywania do firm.",
  },
  {
    href: "/admin/subskrypcje",
    title: "Subskrypcje",
    description: "Pakiety Standard/Premium, płatności i aktywacje.",
  },
  {
    href: "/admin/statystyki",
    title: "Statystyki",
    description: "Ruch, kliknięcia i podstawowe dane katalogu.",
  },
  {
    href: "/admin/wykresy",
    title: "Wykresy",
    description: "Trendy ruchu i kliknięć w wybranym zakresie dni.",
  },
  {
    href: "/admin/ranking",
    title: "Ranking firm",
    description: "Najczęściej oglądane profile i kliknięcia WWW/email.",
  },
  {
    href: "/admin/raporty",
    title: "Raporty",
    description: "Raporty PDF dla firm i pakietów płatnych.",
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("pl-PL").format(value);
}

export default async function AdminDashboardPage() {
  const data = await getDashboardStats(30);
  const pageViewsStats = await getPageViewsStats(30);
  const taxonomyHealth = await getTaxonomyHealthSummary();

  const statCards = [
    { label: "Aktywne firmy", value: data.activeCompanies, hint: "profile widoczne publicznie" },
    { label: "Klik WWW", value: data.websiteClicks, hint: "ostatnie 30 dni" },
    { label: "Klik Email", value: data.emailClicks, hint: "ostatnie 30 dni" },
    { label: "Firmy z typem", value: taxonomyHealth.typedCompanies, hint: `${taxonomyHealth.totalCompanies} wszystkich profili` },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logoutTop}>
          <LogoutButton />
        </div>

        <section className={styles.hero}>
          <p className={styles.eyebrow}>PolskiEMS Admin</p>
          <h1>Panel zarządzania platformą</h1>
          <p>
            Zarządzaj firmami, zapytaniami, pakietami i jakością danych pod nowy model platformy B2B dla producentów elektroniki.
          </p>
        </section>

        <section className={styles.statGrid} aria-label="Najważniejsze liczby">
          {statCards.map((card) => (
            <article key={card.label} className={styles.statCard}>
              <span>{card.label}</span>
              <strong>{formatNumber(Number(card.value ?? 0))}</strong>
              <small>{card.hint}</small>
            </article>
          ))}
        </section>

        <section className={styles.healthCard}>
          <div>
            <p className={styles.sectionKicker}>Etap 3 / taksonomia</p>
            <h2>Porządkowanie profili firm</h2>
            <p>
              W adminie można teraz prowadzić dane pod docelowe sekcje: typ firmy, usługi, możliwości technologiczne, branże i certyfikaty.
            </p>
          </div>
          <div className={styles.healthMetrics}>
            <span>Usługi: {taxonomyHealth.companiesWithServices}</span>
            <span>Branże: {taxonomyHealth.companiesWithIndustries}</span>
          </div>
        </section>

        <section className={styles.adminMenu} aria-label="Nawigacja panelu administratora">
          {menuItems.map((item) => (
            <Link href={item.href} className={styles.adminBox} key={item.href}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </Link>
          ))}
        </section>

        <section className={styles.dashboardGrid}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Wyświetlenia stron / 30 dni</h2>
            <div className={styles.metricList}>
              <p><strong>Home:</strong> {formatNumber(pageViewsStats.home)}</p>
              <p><strong>Wszyscy producenci:</strong> {formatNumber(pageViewsStats["all-producers"])}</p>
              <p><strong>Wyszukiwarka:</strong> {formatNumber(pageViewsStats.search)}</p>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Top 5 firm</h2>
            {Array.isArray(data.topCompanies) && data.topCompanies.length > 0 ? (
              <ol className={styles.topList}>
                {data.topCompanies.map((company) => (
                  <li key={company.companyId} className={styles.topListItem}>
                    <span>{company.firma}</span>
                    <strong>{formatNumber(Number(company.views ?? 0))} views</strong>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.emptyState}>Brak danych o wyświetleniach profili.</p>
            )}
          </article>

          <article className={`${styles.card} ${styles.fullWidth}`}>
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
                    {data.recentEvents.map((event) => (
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
              <p className={styles.emptyState}>Brak eventów.</p>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
