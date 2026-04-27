import { getChartsData } from "@/lib/actions";
import styles from "./style.module.css";
import Link from "next/link";
import type { CSSProperties } from "react";

type DashboardCompany = {
  companyId: number;
  firma: string;
  views: number;
  websiteClicks: number;
  emailClicks: number;
  phoneClicks: number;
  totalClicks: number;
  totalCtrPct: number;
  leadPotential: number;
  profileCompleteness: number;
};

const AVAILABLE_DAYS = [7, 30, 90, 365] as const;

const formatPct = (value: number) => `${value.toFixed(2)}%`;

export default async function AdminChartsPage({
  searchParams,
}: {
  searchParams?: { days?: string };
}) {
  const parsedDays = Number(searchParams?.days ?? 30);
  const safeDays = AVAILABLE_DAYS.includes(parsedDays as (typeof AVAILABLE_DAYS)[number])
    ? parsedDays
    : 30;

  const data = (await getChartsData(safeDays)) as {
    days: number;
    companies: DashboardCompany[];
    totals: {
      views: number;
      websiteClicks: number;
      emailClicks: number;
      phoneClicks: number;
      averageCtrPct: number;
      leadPotential: number;
    };
    trend: {
      viewsChangePct: number;
      ctrChangePct: number;
    };
  };

  const sortedByViews = [...data.companies]
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);

  const sortedByCtr = [...data.companies]
    .filter((item) => item.views > 0)
    .sort((a, b) => b.totalCtrPct - a.totalCtrPct)
    .slice(0, 12);

  const bestCompany = [...data.companies].sort((a, b) => b.views - a.views)[0] ?? null;
  const bestCtrCompany = [...data.companies]
    .filter((item) => item.views > 0)
    .sort((a, b) => b.totalCtrPct - a.totalCtrPct)[0] ?? null;

  const actionStats = {
    www: data.totals.websiteClicks,
    email: data.totals.emailClicks,
    telefon: data.totals.phoneClicks,
  };

  const mostFrequentAction =
    Object.entries(actionStats).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "brak";

  const companiesToImprove = data.companies
    .filter((company) => company.views >= 10 && company.totalCtrPct < 2.5)
    .sort((a, b) => a.totalCtrPct - b.totalCtrPct)
    .slice(0, 3);

  const trendViewsSign = data.trend.viewsChangePct >= 0 ? "+" : "";
  const trendCtrSign = data.trend.ctrChangePct >= 0 ? "+" : "";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Dashboard analityczny ({data.days} dni)</h1>

        <div className={styles.rangeSelector}>
          {AVAILABLE_DAYS.map((range) => (
            <Link
              key={range}
              href={`/admin/wykresy?days=${range}`}
              className={range === data.days ? styles.activeRange : ""}
            >
              {range} dni
            </Link>
          ))}
        </div>

        <section className={styles.kpiGrid}>
          <KpiCard title="Wyświetlenia" value={data.totals.views} tooltip="Liczba odsłon wizytówek firm." />
          <KpiCard title="Kliknięcia WWW" value={data.totals.websiteClicks} tooltip="Kliknięcia w stronę internetową." />
          <KpiCard title="Kliknięcia Email" value={data.totals.emailClicks} tooltip="Kliknięcia w adres e-mail." />
          <KpiCard title="Kliknięcia Telefon" value={data.totals.phoneClicks} tooltip="Kliknięcia w numer telefonu." />
          <KpiCard title="Średni CTR" value={formatPct(data.totals.averageCtrPct)} tooltip="Łączny CTR dla wszystkich firm." />
        </section>

        <section className={styles.duoGrid}>
          <ChartCard title="Porównanie firm: aktywność" items={sortedByViews} type="activity" />
          <ChartCard title="CTR per firma" items={sortedByCtr} type="ctr" />
        </section>

        <section className={styles.insightsCard}>
          <h2>Insighty</h2>
          <ul>
            <li>
              <strong>Najlepsza firma:</strong>{" "}
              {bestCompany ? `${bestCompany.firma} (${bestCompany.views} wyświetleń)` : "Brak danych"}
            </li>
            <li>
              <strong>Najwyższy CTR:</strong>{" "}
              {bestCtrCompany ? `${bestCtrCompany.firma} (${formatPct(bestCtrCompany.totalCtrPct)})` : "Brak danych"}
            </li>
            <li>
              <strong>Najczęstsza akcja:</strong> {mostFrequentAction}
            </li>
            <li>
              <strong>Firmy do poprawy:</strong>{" "}
              {companiesToImprove.length > 0
                ? companiesToImprove.map((company) => company.firma).join(", ")
                : "Brak firm wymagających poprawy"}
            </li>
          </ul>
        </section>

        <section className={styles.tableCard}>
          <h2>Tabela wyników</h2>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Firma</th>
                  <th>Views</th>
                  <th>WWW</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>CTR</th>
                  <th>Potencjał leadowy</th>
                  <th>Kompletność profilu</th>
                </tr>
              </thead>
              <tbody>
                {data.companies.map((company) => (
                  <tr key={company.companyId}>
                    <td>{company.firma}</td>
                    <td>{company.views}</td>
                    <td>{company.websiteClicks}</td>
                    <td>{company.emailClicks}</td>
                    <td>{company.phoneClicks}</td>
                    <td>{formatPct(company.totalCtrPct)}</td>
                    <td>{company.leadPotential}</td>
                    <td>{company.profileCompleteness}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.trendCard}>
          <h2>Trend</h2>
          <p>Wyświetlenia ({data.days} dni)</p>
          <p className={data.trend.viewsChangePct >= 0 ? styles.trendUp : styles.trendDown}>
            {data.trend.viewsChangePct >= 0 ? "▲" : "▼"} {trendViewsSign}
            {Math.abs(data.trend.viewsChangePct).toFixed(2)}% vs poprzedni okres
          </p>
          <p>CTR</p>
          <p className={data.trend.ctrChangePct >= 0 ? styles.trendUp : styles.trendDown}>
            {data.trend.ctrChangePct >= 0 ? "▲" : "▼"} {trendCtrSign}
            {Math.abs(data.trend.ctrChangePct).toFixed(2)}%
          </p>
        </section>

        <div className={styles.backRow}>
          <Link href="/admin" className={styles.backLink}>
            ← Powrót do panelu
          </Link>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, tooltip }: { title: string; value: string | number; tooltip: string }) {
  return (
    <article className={styles.kpiCard}>
      <h3 title={tooltip}>{title}</h3>
      <p>{value}</p>
    </article>
  );
}

function ChartCard({
  title,
  items,
  type,
}: {
  title: string;
  items: DashboardCompany[];
  type: "activity" | "ctr";
}) {
  const maxValue =
    type === "activity"
      ? Math.max(1, ...items.map((item) => item.views + item.websiteClicks + item.emailClicks + item.phoneClicks))
      : Math.max(1, ...items.map((item) => item.totalCtrPct));

  return (
    <article className={styles.chartCard}>
      <h2>{title}</h2>
      {items.length > 0 ? (
        <div className={styles.chartList}>
          {items.map((item) => {
            const value =
              type === "activity"
                ? item.views + item.websiteClicks + item.emailClicks + item.phoneClicks
                : item.totalCtrPct;

            return (
              <div key={item.companyId} className={styles.chartRow}>
                <div className={styles.rowHeader}>
                  <span>{item.firma}</span>
                  <span>
                    {type === "activity"
                      ? `V:${item.views} WWW:${item.websiteClicks} E:${item.emailClicks} T:${item.phoneClicks}`
                      : formatPct(item.totalCtrPct)}
                  </span>
                </div>
                <div className={styles.barTrack} title={type === "activity" ? "Suma aktywności" : "CTR firmy"}>
                  <div
                    className={styles.barFill}
                    style={{ "--bar-width": `${(value / maxValue) * 100}%` } as CSSProperties}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>Brak danych</p>
      )}
    </article>
  );
}
