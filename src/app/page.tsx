import styles from './styles.module.css'
import Link from "next/link";
import PageViewTracker from "@/app/components/PageViewTracker";
import Image from "next/image";
import { getFeaturedProducers } from "@/lib/actions";

export default async function Home() {
  const featuredProducers = await getFeaturedProducers(3);

  return (
    <div className={styles.page}>
      <PageViewTracker page="home" />
      
      <h1>Polski <br /> EMS</h1>
      <h2>Znajdź swojego producenta</h2>
      <div className={styles.buttons}>
        <Link href={'/wyszukaj'}><button>Wyszukaj</button></Link>
        <Link href={'/wszyscy-producenci'}><button>Wszyscy Producenci</button></Link>
      </div>
      <Link href={'/api/formularz-v2'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>

      {featuredProducers.length > 0 && (
        <section className={styles.recommendedSection}>
          <h3>Polecani producenci</h3>
          <div className={styles.recommendedGrid}>
            {featuredProducers.map((featuredProducer, index) => (
              <div key={featuredProducer.id ?? index} className={styles.recommendedCard}>
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
            ))}
          </div>
          <div className={styles.recommendedCta}>
            <p>
              Szukasz partnera EMS do projektu seryjnego lub prototypowego? Wyślij jedno zapytanie,
              a dopasujemy je do firm gotowych do szybkiej i rzetelnej wyceny.
            </p>
            <Link href="/zapytania-ofertowe" className={styles.recommendedCtaButton}>
              Dodaj zapytanie ofertowe
            </Link>
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
