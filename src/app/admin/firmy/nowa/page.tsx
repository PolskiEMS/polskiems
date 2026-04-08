import Link from "next/link";
import {
  createCompanyAction,
  getAllDzialaniaEms,
  getAllProdukcjaScales,
  getAllRegion,
} from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";

export default async function NewCompanyPage() {
  const [dzialania, produkcja, regions] = await Promise.all([
    getAllDzialaniaEms(),
    getAllProdukcjaScales(),
    getAllRegion(),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Dodaj firmę</h1>

        <form action={createCompanyAction} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="nazwa">Nazwa firmy</label>
              <input id="nazwa" name="nazwa" type="text" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="telefon">Telefon</label>
              <input id="telefon" name="telefon" type="text" />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" />
            </div>

            <div className={styles.field}>
              <label htmlFor="www">Strona WWW</label>
              <input id="www" name="www" type="text" placeholder="https://..." />
            </div>

            <div className={styles.field}>
              <label htmlFor="wojewodztwoId">Województwo</label>
              <select id="wojewodztwoId" name="wojewodztwoId">
                <option value="">Wybierz województwo</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.nazwa}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="packageType">Pakiet</label>
              <select
                id="packageType"
                name="packageType"
                defaultValue="free"
              >
                <option value="free">Free</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldFull}>
            <label htmlFor="opis">Opis firmy</label>
            <textarea id="opis" name="opis" rows={5} />
          </div>

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="featured" />
              <span>Wyróżniona firma</span>
            </label>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Działania EMS</h2>
            <div className={styles.optionsGrid}>
              {dzialania.map((item) => (
                <label key={item.id} className={styles.optionLabel}>
                  <input
                    type="checkbox"
                    name="dzialaniaIds"
                    value={item.id}
                  />
                  <span>{item.nazwa}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Skala produkcji</h2>
            <div className={styles.optionsGrid}>
              {produkcja.map((item) => (
                <label key={item.id} className={styles.optionLabel}>
                  <input
                    type="checkbox"
                    name="produkcjaIds"
                    value={item.id}
                  />
                  <span>{item.zakres}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              Zapisz firmę
            </button>

            <Link href="/admin/firmy" className={styles.backBtn}>
              Powrót
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}