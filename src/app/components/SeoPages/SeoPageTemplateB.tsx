import Link from "next/link";
import styles from "./seo-pages.module.css";
import type { SeoPageData } from "./types";

type Props = {
  data: SeoPageData;
};

export default function SeoPageTemplateB({ data }: Props) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Wiedza EMS</p>
          <h1>{data.title}</h1>
          {data.lead.map((paragraph) => (
            <p key={paragraph} className={styles.lead}>
              {paragraph}
            </p>
          ))}

          <div className={styles.heroStats} aria-label="Zakres przewodnika">
            <span>Dobór dostawcy</span>
            <span>Wymagania techniczne</span>
            <span>Proces wyceny</span>
          </div>
        </div>
      </section>

      <section className={styles.contentCard}>
        <div className={styles.contentHeader}>
          <p>Praktyczny przewodnik</p>
          <h2>Co sprawdzić przed wysłaniem zapytania do producenta</h2>
        </div>

        <div className={styles.sectionGrid}>
          {data.mainSections.map((section, index) => (
            <article key={section.heading} className={styles.section}>
              <span className={styles.sectionNumber}>{index + 1}</span>
              <h3>{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>

        {data.infoBoxes && (
          <div className={styles.infoGrid}>
            {data.infoBoxes.map((info) => (
              <article key={info.heading} className={styles.infoBox}>
                <h3>{info.heading}</h3>
                <p>{info.text}</p>
              </article>
            ))}
          </div>
        )}

        <div className={styles.ctaRow}>
          <Link href={data.searchHref} className={styles.primaryBtn}>
            Wyszukaj producenta
          </Link>
          <Link href="/wszyscy-producenci" className={styles.secondaryBtn}>
            Wszyscy producenci
          </Link>
        </div>
      </section>
    </main>
  );
}
