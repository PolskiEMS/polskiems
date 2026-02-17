import Link from "next/link";
import styles from "./styles.module.css";

const Onas = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>O nas</h1>

        <p className={styles.lead}>
          PolskiEMS powstało z potrzeby, którą zauważyłem podczas wielu rozmów z firmami z branży EMS.
          Wiele z nich nie miało prostego, skutecznego miejsca do pokazania swoich usług i dotarcia do nowych klientów.
        </p>

        <h2 className={styles.h2}>Co robimy</h2>
        <p className={styles.p}>
          Tworzymy katalog i stronę ogłoszeniową dla firm EMS — miejsce, w którym zarówno mniejsze, jak i większe firmy
          mogą zaprezentować ofertę w przejrzysty sposób, być łatwo znalezione i zdobywać zapytania.
        </p>

        <h2 className={styles.h2}>Dlaczego my</h2>
        <p className={styles.p}>
          PolskiEMS to nie tylko prezentacja oferty, ale narzędzie, które pomaga wyrównać szanse na rynku.
          Stawiamy na prostotę, szybkość działania i realną użyteczność — bez zbędnych formalności.
        </p>

        <ul className={styles.list}>
          <li>przejrzyste wizytówki firm i szybki kontakt</li>
          <li>wyszukiwanie po województwie, usługach i zakresie produkcji</li>
          <li>rozwój portalu w oparciu o potrzeby branży</li>
        </ul>

        <h2 className={styles.h2}>Kto za tym stoi</h2>
        <p className={styles.p}>
          Za projektem stoi programista i specjalista od zarządzania, nastawiony na bezpośredni kontakt i szybką reakcję.
          Dzięki doświadczeniu w branży EMS lepiej rozumiemy realne wyzwania rynku i tworzymy rozwiązania dopasowane do oczekiwań firm.
        </p>

        <div className={styles.ctaBox}>
          <div>
            <p className={styles.ctaTitle}>Chcesz dodać swoją firmę?</p>
            <p className={styles.ctaDesc}>
              Zgłoszenie zajmuje chwilę — możesz przesłać dane przez formularz.
            </p>
          </div>

          <Link href="/formularz_zgloszeniowy_firmy.docx" className={styles.ctaBtn}>
            Chcę znaleźć się na stronie
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Onas;
