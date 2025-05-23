'use client'
import Image from 'next/image';
import styles from './styles.module.css'
import { motion } from "motion/react"
import { FaCirclePlus } from "react-icons/fa6";
import Link from 'next/link';

const AllProducers = ({ producers }: { producers: any[] }) => {

    return (
        <div className={styles.page}>
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
                                <Image src={`/images/producers/${producer.nazwa}.jpg`} width={210} height={210} alt={`Producent ${producer.name}`} />
                                <p>{producer.opis}</p>
                                <div className={styles.bottom}>
                                    <h2>{producer.nazwa}</h2>
                                    <Link href={`mailto:${producer.email}`}><button className={styles.contactMeBtn}>Skontaktuj się</button></Link>
                                </div>
                            </div>
                        </motion.div>
                    ))
                }
            </div >
        </div >
    );
};

export default AllProducers;