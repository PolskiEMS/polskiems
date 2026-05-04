import Link from 'next/link';
import styles from './styles.module.css'

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <nav className={styles.links} aria-label="Stopka">
                <Link href={'/o-nas'}>O nas</Link>
                <Link href={'/kontakt'}>Kontakt</Link>
                <Link href={'/regulamin'}>Regulamin</Link>
                <Link href={'/cennik'}>Cennik</Link>
            </nav>
        </footer>
    );
}

export default Footer;
