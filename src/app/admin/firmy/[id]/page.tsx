import Link from "next/link";
import { getCompanyById, getAllRegion, updateCompanyAction } from "@/lib/actions";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyById(Number(id));
  const regions = await getAllRegion();

  if (!company) {
    return <div style={{ padding: "20px" }}>Nie znaleziono firmy.</div>;
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px" }}>
      <h1>Edytuj firmę</h1>

      <form action={updateCompanyAction} style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
        <input type="hidden" name="id" value={company.id} />

        <div>
          <label>Nazwa firmy</label>
          <input
            type="text"
            name="nazwa"
            defaultValue={company.nazwa || ""}
            required
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <div>
          <label>Województwo</label>
          <select
            name="wojewodztwoId"
            defaultValue={company.wojewodztwoId ? String(company.wojewodztwoId) : ""}
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
            defaultValue={company.opis || ""}
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <div>
          <label>Telefon</label>
          <input
            type="text"
            name="telefon"
            defaultValue={company.telefon || ""}
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            defaultValue={company.email || ""}
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <div>
          <label>WWW</label>
          <input
            type="text"
            name="www"
            defaultValue={company.www || ""}
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={!!company.isActive}
          />
          Aktywna
        </label>

        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button type="submit">Zapisz zmiany</button>

          <Link href="/admin/firmy">
            <button type="button">Anuluj</button>
          </Link>
        </div>
      </form>
    </div>
  );
}