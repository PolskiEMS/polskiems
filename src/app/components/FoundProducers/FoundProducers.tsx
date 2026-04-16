'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './styles.module.css';
import { trackCompanyEvent } from '@/lib/trackCompanyEvent';

type Producer = {
  id?: number;
  nazwa: string;
  opis?: string | null;
  wojewodztwo?: string | null;
  email?: string | null;
  www?: string | null;
  featured?: boolean | null;
  packageType?: string | null;
};

const SearchContent = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const regions = searchParams.getAll('regions');
  const requirements = searchParams.getAll('requirements');
  const scales = searchParams.getAll('scales');

  const getProducers = async () => {
    setIsLoading(true);
    setNotFound(false);

    try {
      const response = await fetch('/api/searchProducers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regions, requirements, scales }),
      });

      if (!response.ok) {
        console.error('searchProducers error:', response.status, await response.text());
        setProducers([]);
        setNotFound(true);
        return;
      }

      const data = await response.json();
      const arr = Array.isArray(data) ? data : [];
      setProducers(arr);
      setNotFound(arr.length === 0);
    } catch (error) {
      console.error('Fetch error:', error);
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
                  className={`${styles.producerBlock} ${
                    producer.packageType === 'premium'
                      ? styles.premiumBlock
                      : producer.packageType === 'standard'
                        ? styles.standardBlock
                        : ''
                  }`}
                  key={producer.id ?? i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  onViewportEnter={() => {
                    if (producer.id) trackCompanyEvent(producer.id, 'view');
                  }}
                  transition={{ duration: 1.2, delay: i <= 2 ? 0.3 * i : 0.3 }}
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
                      {producer.wojewodztwo && (
                        <p className={styles.regionBadge}>Województwo: {producer.wojewodztwo}</p>
                      )}

                      <div className={styles.btnRow}>
                        {producer.email && (
                          <a
                            href={`mailto:${producer.email}`}
                            onClick={() => {
                              if (producer.id) trackCompanyEvent(producer.id, 'email_click');
                            }}
                          >
                            <button className={styles.contactMeBtn}>Skontaktuj się</button>
                          </a>
                        )}

                        {producer.id && (
                          <Link href={`/zapytania-ofertowe?companyId=${producer.id}`}>
                            <button className={styles.contactMeBtn}>Poproś o wycenę</button>
                          </Link>
                        )}

                        {producer.www && (
                          <a
                            href={producer.www.startsWith('http') ? producer.www : `https://${producer.www}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => {
                              if (producer.id) trackCompanyEvent(producer.id, 'website_click');
                            }}
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
