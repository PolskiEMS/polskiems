import Image from "next/image";
import Link from "next/link";
import styles from "./service-landing.module.css";

type Section = {
  heading: string;
  paragraphs: string[];
};

type Card = {
  title: string;
  text: string;
};

type Props = {
  title: string;
  lead: string;
  searchHref: string;
  heroImage: {
    src: string;
    alt: string;
  };
  sections: Section[];
  cards: Card[];
};

export default function ServiceLandingPage({
  title,
  lead,
  searchHref,
  heroImage,
  sections,
  cards,
}: Props) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Usługi EMS w Polsce</p>
          <h1>{title}</h1>
          <p className={styles.lead}>{lead}</p>

          <div className={styles.ctaRow}>
            <Link href={searchHref} className={styles.primaryBtn}>
              Wyszukaj producenta
            </Link>
            <Link href="/wszyscy-producenci" className={styles.secondaryBtn}>
              Wszyscy producenci
            </Link>
          </div>
        </div>

        <div className={styles.heroImageWrap}>
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            className={styles.heroImage}
            sizes="(max-width: 1024px) 100vw, 460px"
            priority
          />
        </div>
      </section>

      <section className={styles.content}>
        {sections.map((section) => (
          <article key={section.heading} className={styles.section}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}

        <div className={styles.cardGrid}>
          {cards.map((card) => (
            <article key={card.title} className={styles.card}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.bottomCta}>
        <h2>Porównaj firmy i wybierz partnera do projektu</h2>
        <p>
          Sprawdź producentów EMS, którzy realizują {title.toLowerCase()} i skróć
          czas wyboru dostawcy dzięki jednemu katalogowi B2B.
        </p>
        <div className={styles.ctaRow}>
          <Link href={searchHref} className={styles.primaryBtn}>
            Znajdź partnera
          </Link>
          <Link href="/kontakt" className={styles.secondaryBtn}>
            Skontaktuj się z nami
          </Link>
        </div>
      </section>
    </main>
  );
}
