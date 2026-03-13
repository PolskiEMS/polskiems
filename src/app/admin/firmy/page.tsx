import Link from "next/link";
import { getAdminCompanies } from "@/lib/actions";

export default async function AdminCompanies() {
  const companies = await getAdminCompanies();

  return (
    <div style={{maxWidth:1000, margin:"0 auto"}}>
      <h1>Firmy</h1>

      <Link href="/admin/firmy/nowa">
        <button>Dodaj firmę</button>
      </Link>

      <table style={{width:"100%", marginTop:20}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Email</th>
            <th>WWW</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {companies.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nazwa}</td>
              <td>{c.email}</td>
              <td>{c.www}</td>
              <td>{c.isActive ? "Aktywna" : "Nieaktywna"}</td>

              <td>
                <Link href={`/admin/firmy/${c.id}`}>
                  Edytuj
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}