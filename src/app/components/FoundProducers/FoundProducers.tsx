'use client'
import Image from 'next/image';
import styles from './styles.module.css'
import { motion } from "motion/react"
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { trackCompanyEvent } from "@/lib/trackCompanyEvent";

const SearchContent = () => {
  const [producers, setProducers] = useState<any[]>([])
  const searchParams = useSearchParams();
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const regions = searchParams.getAll("regions")
  const requirements = searchParams.getAll("requirements")
  const scales = searchParams.getAll("scales")

  const getProducers = async () => {
    setIsLoading(true);
    setNotFound(false);

    try {
      const response = await fetch('/api/searchProducers', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regions, requirements, scales })
      });

      if (!response.ok) {
        console.error("searchProducers error:", response.status, await response.text());
        setProducers([]);
        setNotFound(true);
        return;
      }

      const data = await response.json();
      console.log("API DATA:", data);

      const arr = Array.isArray(data) ? data : [];
      setProducers(arr);
      setNotFound(arr.length === 0);

    } catch (e) {
      console.error("Fetch error:", e);
      setProducers([]);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducers();
  }, [regions.join('|'), requirements.join('|'), scales.join('|')]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      {!isLoading ? (
        <div>
          {producers.length > 0 && (
            <div className={styles.producers}>
              {producers.map((producer, i) => (
                <motion.div
                  className={styles.producerBlock}
                  key={producer.id ?? i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: i <= 2 ? 0.3 * i : 0.3 }}
                >
                  <div className={styles.divToMove}>
                    <Image
                      src={`/images/producers/${producer.nazwa}.jpg`}
                      width={210}
                      height={210}
                      alt={`Producent ${producer.nazwa}`}
                    />
                    <h2>{producer.nazwa}</h2>
                    <div className={styles.bottom}>
                      <p>{producer.opis}</p>

                      <div className={styles.btnRow}></div>

                      {producer.email && (
                        <a href={`mailto:${producer.email}`}
                        onClick={() =>
                        trackCompanyEvent(producer.id, "email_click")
                        }
                        >
                          <button className={styles.contactMeBtn}>Skontaktuj się</button>
                        </a>
                      )}

                      {producer.www && (
                        <a
                          href={producer.www.startsWith("http") ? producer.www : `https://${producer.www}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => trackCompanyEvent(producer.id, "website_click")}
                        >
                          <button className={styles.contactMeBtn}>Strona firmy</button>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {notFound && <p className={styles.notFound}>Nie znaleziono takich producentów</p>}
          {!notFound && producers.length === 0 && <div style={{ marginBottom: '420px' }} />}
        </div>
      ) : (
        <p className={styles.notFound}>Ładowanie...</p>
      )}
    </div>
  );
};

const FoundProducers = () => {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default FoundProducers;