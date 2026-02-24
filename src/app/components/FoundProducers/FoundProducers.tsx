'use client'
import Image from 'next/image';
import styles from './styles.module.css'
import { motion } from "motion/react"
import { FaCirclePlus } from "react-icons/fa6";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const SearchContent = () => {
    const [producers, setProducers] = useState<any[]>([])
    const searchParams = useSearchParams();
    const [notFound, setNotFound] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const regions = searchParams.getAll("regions")
    const requirements = searchParams.getAll("requirements")
    const scales = searchParams.getAll("scales")

    const getProducers = async () => {
        const response = await fetch('/api/searchProducers', {
            method: 'POST',
            body: JSON.stringify({ regions: regions, requirements: requirements, scales: scales })
        })
        const data = await response.json()
        if (data.length === 0) {
            setNotFound(true)
        }
        setIsLoading(false)
        setProducers(data)
    }

    useEffect(() => {
        getProducers()
    }, [])

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.page}>
            {
                !isLoading ? <div>
                    {
                        producers.length > 0 &&
                        <div className={styles.producers}>
                            {
                                producers.map((producer, i) => (
                                    <motion.div className={styles.producerBlock}
                                        key={i}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.2, delay: i == 0 || i == 1 || i == 2 ? 0.3 * i : 0.3 }}>
                                        <div className={styles.divToMove}>
                                            <Image src={`/images/producers/${producer.nazwa}.jpg`} width={210} height={210} alt={`Producent ${producer.nazwa}`} />
                                            <h2>{producer.nazwa}</h2>
                                            <div className={styles.bottom}>
                                                <p>{producer.opis}</p>
                                                <Link href={`mailto:${producer.email}`}><button className={styles.contactMeBtn}>Skontaktuj się</button></Link>
                                                
                                                {producer.www && producer.www.trim() !== "" && (
                                                <a
                                                  href={producer.www.startsWith("http") ? producer.www : `https://${producer.www}`}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                >
                                                  <button className={styles.contactMeBtn}>Strona firmy</button>
                                                </a>
                                              )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            }
                        </div >
                    }
                    {
                        notFound && <p className={styles.notFound}>Nie znaleziono takich producentów</p>
                    }
                    {
                        !notFound && producers.length === 0 && <div style={{ marginBottom: '420px' }} />
                    }
                </div> :
                    <p className={styles.notFound}>Ładowanie...</p>
            }
        </div >
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
