import Link from "next/link";
import {
  createCompanyAction,
  getAllRegion,
  getAllDzialaniaEms,
  getAllProdukcjaScales,
} from "@/lib/actions";
import styles from "../style.module.css";

export default async function NewCompanyPage() {
  const region = await getAllRegion();
  const dzialania = await getAllDzialaniaEms();
  const produkcja = await getAllProdukcjaScales();

  return (
    <div className={styles.page}>
      <div className={styles.formTop}>
        <Link href="/admin/firmy" className={styles.editBtn}>
          Powrót do Firmy
        </Link>
      </div>
      <div className={styles.formBox}>
        <h1 className={styles.title}>Dodaj firmę</h1>

        <form action={createCompanyAction} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="nazwa">Nazwa firmy</label>
            <input id="nazwa" name="nazwa" className={styles.input} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="opis">Opis</label>
            <textarea id="opis" name="opis" className={styles.textarea} />
          </div>

          <div className={styles.field}>
            <label htmlFor="telefon">Telefon</label>
            <input id="telefon" name="telefon" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label htmlFor="www">WWW</label>
            <input id="www" name="www" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label htmlFor="wojewodztwoId">Województwo</label>
            <select id="wojewodztwoId" name="wojewodztwoId" className={styles.select}>
              <option value="">Wybierz województwo</option>
              {region.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.nazwa}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Produkcja / skala produkcji</label>
            <div className={styles.checkboxGroup}>
              {produkcja.map((item) => (
                <label key={item.id} className={styles.checkboxItem}>
                  <input type="checkbox" name="produkcjaIds" value={item.id} />
                  {item.zakres}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" name="featured" />
              Wyróżniony producent
            </label>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              Zapisz
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
