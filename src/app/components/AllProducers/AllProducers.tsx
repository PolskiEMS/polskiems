'use client'
import Image from 'next/image';
import styles from './styles.module.css'
import { motion } from "motion/react"
import Link from "next/link";
import { trackCompanyEvent } from '@/lib/trackCompanyEvent';

const AllProducers = ({ producers }: { producers: any[] }) => {

return (
    <div className={styles.page}>
    <div className={styles.producers}>
    {producers.map((producer, i) => (
    <motion.div
    className={`${styles.producerBlock} ${
        producer.featured ? styles.featuredBlock : ""
    }`}
    key={producer.id ?? i}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    onViewportEnter={() => trackCompanyEvent(producer.id, "view")}
    transition={{duration: 1.2, delay: i == 0 || i == 1 || i == 2 ? 0.3 * i : 0.3}}
    >
    <div className={styles.divToMove}>
    <Image
        src={`/images/producers/${producer.nazwa}.jpg`}
        width={210}
        height={210}
        alt={`Producent ${producer.nazwa}`}
    />

    {producer.featured && (
        <div className={styles.featuredBadge}>Polecany Producent</div>
    )}
    <h2>{producer.nazwa}</h2>

    <div className={styles.bottom}>
        <p>{producer.opis}</p>

        <div className={styles.btnRow}>
        <a href={`mailto:${producer.email}`}
        onClick={() => trackCompanyEvent(producer.id, "email_click")}
            >
        <button className={styles.contactMeBtn}>
            Skontaktuj się
        </button>
        </a>

        <Link href={`/zapytania?companyId=${producer.id}`}>
          <button className={styles.contactMeBtn}>Poproś o wycenę</button>
        </Link>

        {producer.www && (
            <a href={ producer.www.startsWith("http") ? producer.www : `https://${producer.www}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackCompanyEvent(producer.id, "website_click")}
            >
        <button className={styles.contactMeBtn}>Strona firmy</button>
        </a>
    )}
    </div>
    </div>
    </div>
    </motion.div>
    ))}
    </div>
    </div>
    );
};

export default AllProducers;
