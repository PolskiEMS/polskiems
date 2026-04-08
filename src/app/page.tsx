import styles from './styles.module.css'
import Link from "next/link";
import PageViewTracker from "@/app/components/PageViewTracker";
import Image from "next/image";
import { getFeaturedProducers } from "@/lib/actions";

export default async function Home() {
  const featuredProducer = (await getFeaturedProducers(1))[0];

  return (
    <div className={styles.page}>
      <PageViewTracker page="home" />
      
      <h1>Polski <br /> EMS</h1>
      <h2>Znajdź swojego producenta</h2>
      <div className={styles.buttons}>
        <Link href={'/wyszukaj'}><button>Wyszukaj</button></Link>
        <Link href={'/wszyscy-producenci'}><button>Wszyscy Producenci</button></Link>
      </div>
      <Link href={'formularz_zgloszeniowy_firmy.docx'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>

      {featuredProducer && (
        <section className={styles.recommendedSection}>
          <h3>Polecany producent</h3>
          <div className={styles.recommendedCard}>
            <Image
              src={`/images/producers/${featuredProducer.nazwa}.jpg`}
              width={110}
              height={110}
              alt={`Polecany producent ${featuredProducer.nazwa}`}
            />
            <div className={styles.recommendedContent}>
              <h4>{featuredProducer.nazwa}</h4>
              <p>{featuredProducer.opis || "Sprawdź profil producenta i poproś o wycenę."}</p>
              <div className={styles.recommendedActions}>
                <Link href="/wszyscy-producenci">Zobacz profil</Link>
                {featuredProducer.id && (
                  <Link href={`/zapytania-ofertowe?companyId=${featuredProducer.id}`}>
                    Poproś o wycenę
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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
