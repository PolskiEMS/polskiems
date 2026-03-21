import styles from './styles.module.css'
import Link from "next/link";
import TrackHomeView from "@/app/components/TrackHomeView";

export default function Home() {
  return (
    <div className={styles.page}>
    <TrackHomeView />
      
      <h1>Polski <br /> EMS</h1>
      <h2>Znajdź swojego producenta</h2>
      <div className={styles.buttons}>
        <Link href={'/wyszukaj'}><button>Wyszukaj</button></Link>
        <Link href={'/wszyscy-producenci'}><button>Wszyscy Producenci</button></Link>
      </div>
      <Link href={'formularz_zgloszeniowy_firmy.docx'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>

      <section className={styles.seoSection}>
        <h3>Najczęściej wyszukiwane usługi EMS</h3>
        <div className={styles.seoLinks}>
          <Link href="/produkcja-pcb-polska">Produkcja PCB w Polsce</Link>
          <Link href="/montaz-smt-polska">Montaż SMT w Polsce</Link>
          <Link href="/montaz-tht-polska">Montaż THT w Polsce</Link>
          <Link href="/montaz-elektroniki-w-polsce">Montaż elektroniki w Polsce</Link>
          <Link href="/kontraktowy-montaz-elektroniki">Kontraktowy montaż elektroniki w Polsce</Link>
        </div>
      </section>
    </div>
  );
}
