import { getcompanyStats } from "@/lib/actions";

export default async function AdminStatsPage() {
  const rows = await getcompanyStats(30);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20, color: "white" }}>
      <h1>Statystyki firm (30 dni)</h1>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr>
            <th align="left">Firma</th>
            <th>Wyświetlenia</th>
            <th>Klik WWW</th>
            <th>Klik Email</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.companyId}>
              <td style={{ padding: "8px 6px" }}>{r.firma}</td>
              <td align="center">{r.views}</td>
              <td align="center">{r.websiteClicks}</td>
              <td align="center">{r.emailClicks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}