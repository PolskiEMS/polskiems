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
    </div>
  );
}
