import Link from "next/link";
import { createCompanyAction, getAllRegion } from "@/lib/actions";

export default async function NewCompanyPage() {
  const regions = await getAllRegion();

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px" }}>
      <h1>Dodaj firmę</h1>

      <form action={createCompanyAction} style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
        <div>
          <label>Nazwa firmy</label>
          <input
            type="text"
            name="nazwa"
            required
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <div>
          <label>Województwo</label>
          <select
            name="wojewodztwoId"
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          >
            <option value="">Wybierz województwo</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nazwa}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Opis</label>
          <textarea
            name="opis"
            rows={5}
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <div>
          <label>Telefon</label>
          <input
            type="text"
            name="telefon"
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <div>
          <label>WWW</label>
          <input
            type="text"
            name="www"
            placeholder="https://twojafirma.pl"
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button type="submit">Zapisz firmę</button>

          <Link href="/admin/firmy">
            <button type="button">Anuluj</button>
          </Link>
        </div>
      </form>
    </div>
  );
}