import Link from "next/link";
import { getDashboardStats } from "@/lib/actions";

const boxStyle: React.CSSProperties = {
  border: "3px solid black",
  minHeight: 90,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  fontSize: 22,
  fontWeight: 700,
  textDecoration: "none",
  color: "black",
  background: "rgba(255,255,255,0.12)",
  borderRadius: 10,
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "2px solid rgba(0,0,0,0.5)",
  borderRadius: 12,
  padding: 20,
};

export default async function AdminDashboardPage() {
  const data = await getDashboardStats(30);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(90deg, #a694df 0%, #5517c7 100%)",
        padding: "36px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1
          style={{
            textAlign: "center",
            color: "black",
            fontSize: 40,
            fontWeight: 800,
            marginBottom: 35,
          }}
        >
          Panel Admina
        </h1>

        <div className="adminMenu">
          <Link href="/admin/statystyki" style={boxStyle}>
            Statystyki
          </Link>
          <Link href="/admin/ranking" style={boxStyle}>
            Ranking firm
          </Link>
          <Link href="/admin/wykresy" style={boxStyle}>
            Wykresy
          </Link>
          <Link href="/admin/raporty" style={boxStyle}>
            Raporty
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 40,
          }}
          className="dashboardGrid"
        >
          <div style={cardStyle}>
            <h2>Liczby główne</h2>
            <p><strong>Aktywne firmy:</strong> {data.activeCompanies}</p>
            <p><strong>Wyświetlenia strony PolskiEMS (30 dni):</strong> {data.pageViews}</p>
            <p><strong>Klik WWW (30 dni):</strong> {data.websiteClicks}</p>
            <p><strong>Klik Email (30 dni):</strong> {data.emailClicks}</p>
          </div>

          <div style={cardStyle}>
            <h2>Top 5 firm</h2>
            {Array.isArray(data.topCompanies) && data.topCompanies.length > 0 ? (
              <ol style={{ paddingLeft: 20 }}>
                {data.topCompanies.map((company: any) => (
                  <li key={company.companyId} style={{ marginBottom: 8 }}>
                    {company.firma} — {company.views} views
                  </li>
                ))}
              </ol>
            ) : (
              <p>Brak danych</p>
            )}
          </div>

          <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
            <h2>Ostatnie eventy</h2>
            {Array.isArray(data.recentEvents) && data.recentEvents.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th align="left">Firma</th>
                    <th align="left">Event</th>
                    <th align="left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentEvents.map((event: any) => (
                    <tr key={event.id}>
                      <td style={{ padding: "8px 4px" }}>{event.firma}</td>
                      <td style={{ padding: "8px 4px" }}>{event.eventType}</td>
                      <td style={{ padding: "8px 4px" }}>{event.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Brak eventów</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .adminMenu {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .adminMenu {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboardGrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}