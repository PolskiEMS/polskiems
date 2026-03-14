import Link from "next/link";
import { getAllRegion, getCompanyById, updateCompanyAction } from "@/lib/actions";
import styles from "../style.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCompanyPage({ params }: Props) {
  const { id } = await params;
  const company = await getCompanyById(Number(id));
  const regions = await getAllRegion();

  if (!company) {
    return (
      <div className={styles.page}>
        <div className={styles.formBox}>
        <Link href="/admin/firmy" className={styles.backBtn}>
          Powrót do Firmy
        </Link>
      </div>
        <div className={styles.formBox}>
          <h1 className={styles.title}>Nie znaleziono firmy</h1>
          <div className={styles.actions}>
            <Link href="/admin/firmy" className={styles.cancelBtn}>
              Powrót do listy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.formBox}>
        <h1 className={styles.title}>Edytuj firmę</h1>

        <form action={updateCompanyAction} className={styles.form}>
          <input type="hidden" name="id" value={company.id} />

          <div className={styles.field}>
            <label htmlFor="nazwa">Nazwa firmy</label>
            <input
              id="nazwa"
              name="nazwa"
              defaultValue={company.nazwa ?? ""}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="opis">Opis</label>
            <textarea
              id="opis"
              name="opis"
              defaultValue={company.opis ?? ""}
              className={styles.textarea}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="telefon">Telefon</label>
            <input
              id="telefon"
              name="telefon"
              defaultValue={company.telefon ?? ""}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={company.email ?? ""}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="www">WWW</label>
            <input
              id="www"
              name="www"
              defaultValue={company.www ?? ""}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="wojewodztwoId">Województwo</label>
            <select
              id="wojewodztwoId"
              name="wojewodztwoId"
              defaultValue={company.wojewodztwoId ? String(company.wojewodztwoId) : ""}
              className={styles.select}
            >
              <option value="">Wybierz województwo</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.nazwa}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={Boolean(company.isActive)}
              />{" "}
              Aktywna
            </label>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              Zapisz zmiany
            </button>
            <Link href="/admin/firmy" className={styles.cancelBtn}>
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
