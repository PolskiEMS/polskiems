import { getChartsData } from "@/lib/actions";
import styles from "./style.module.css";
import Link from "next/link";

export type ChartRow = {
  companyId: number;
  firma: string;
  views: number;
  websiteClicks: number;
  emailClicks: number;
};

export default async function AdminChartsPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  const params = await searchParams;
  const days = Number(params?.days ?? 30);

  const data = (await getChartsData(days)) as {
    viewsChart: ChartRow[];
    websiteClicksChart: ChartRow[];
    emailClicksChart: ChartRow[];
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Wykresy ({days} dni)</h1>

        <div className={styles.rangeSelector}>
        <Link href="/admin/wykresy?days=7">7 dni</Link>
        <Link href="/admin/wykresy?days=30">30 dni</Link>
        <Link href="/admin/wykresy?days=90">90 dni</Link>
        <Link href="/admin/wykresy?days=365">365 dni</Link>
        </div>

        <div className={styles.grid}>
          <ChartCard
            title="Top 10 wyświetleń"
            items={data.viewsChart.map((item: ChartRow) => ({
              companyId: item.companyId,
              firma: item.firma,
              value: item.views,
            }))}
          />

          <ChartCard
            title="Top 10 klików WWW"
            items={data.websiteClicksChart.map((item: ChartRow) => ({
              companyId: item.companyId,
              firma: item.firma,
              value: item.websiteClicks,
            }))}
          />

          <div className={`${styles.card} ${styles.fullWidth}`}>
            <ChartCard
              title="Top 10 klików Email"
              items={data.emailClicksChart.map((item: ChartRow) => ({
                companyId: item.companyId,
                firma: item.firma,
                value: item.emailClicks,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  items,
}: {
  title: string;
  items: { companyId: number; firma: string; value: number }[];
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>

      {items.length > 0 ? (
        <div className={styles.chartList}>
          {items.map((item) => (
            <div key={item.companyId} className={styles.chartRow}>
              <div className={styles.labelRow}>
                <span className={styles.label}>{item.firma}</span>
                <span className={styles.value}>{item.value}</span>
              </div>

              <div className={styles.barTrack}>
                {item.value > 0 && (
                <div
                  className={styles.barFill}
                  style={
                    {
                      "--bar-width": `${(item.value / maxValue) * 100}%`,
                    } as React.CSSProperties
                  }
                />
              )}
              </div>
              <div className={styles.backRow}>
                <Link href="/admin" className={styles.backLink}>
                  ← Powrót do panelu
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Brak danych</p>
      )}
    </div>
  );
}