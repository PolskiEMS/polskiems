import Link from "next/link";
import { getAdminCompanies } from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const success = params?.success === "1";

  const companies = await getAdminCompanies();

  return (
    <div className={styles.page}>
      {success && (
        <div className={styles.successBox}>
          Firma została pomyślnie dodana.
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Firmy</h1>
        <Link href="/admin/firmy/nowa" className={styles.addBtn}>
          Dodaj firmę
        </Link>
      </div>

      <div className={styles.listBox}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
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
                  <td>{c.email || "-"}</td>
                  <td>{c.www || "-"}</td>
                  <td
                    className={
                      c.isActive ? styles.statusActive : styles.statusInactive
                    }
                  >
                    {c.isActive ? "Aktywna" : "Nieaktywna"}
                  </td>
                  <td>
                    <Link
                      href={`/admin/firmy/${c.id}`}
                      className={styles.editBtn}
                    >
                      Edytuj
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.cards}>
          {companies.map((c) => (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardTitle}>{c.nazwa}</div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>ID:</span> {c.id}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Email:</span>{" "}
                {c.email || "-"}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>WWW:</span> {c.www || "-"}
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Status:</span>{" "}
                <span
                  className={
                    c.isActive ? styles.statusActive : styles.statusInactive
                  }
                >
                  {c.isActive ? "Aktywna" : "Nieaktywna"}
                </span>
              </div>

              <Link href={`/admin/firmy/${c.id}`} className={styles.editBtn}>
                Edytuj
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottomBack}>
        <Link href="/admin" className={styles.backBtn}>
          Powrót do panelu
        </Link>
      </div>
    </div>
  );
}
