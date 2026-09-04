"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";

type NavChild = {
  href: string;
  label: string;
  icon: string;
  description?: string;
};

type NavGroup = {
  label: string;
  children: NavChild[];
};

const producerSignupHref = "/dodaj-producenta";

const navGroups: NavGroup[] = [
  {
    label: "Platforma",
    children: [
      { href: "/", label: "Start", icon: "⌂", description: "Strona główna PolskiEMS" },
      { href: "/wyszukaj", label: "Wyszukaj producenta", icon: "⌕", description: "Filtry usług, regionów i skali produkcji" },
      { href: "/wszyscy-producenci", label: "Wszyscy producenci", icon: "▦", description: "Pełna baza firm EMS" },
    ],
  },
  {
    label: "Dla firm EMS",
    children: [
      { href: producerSignupHref, label: "Dodaj firmę EMS", icon: "+", description: "Formularz zgłoszeniowy online" },
      { href: "/cennik", label: "Pakiety i cennik", icon: "◇", description: "Free, Standard i Premium" },
      { href: "/kontakt", label: "Kontakt", icon: "✉", description: "Zapytaj o współpracę" },
    ],
  },
  {
    label: "Wiedza EMS",
    children: [
      { href: "/jak-wybrac-firme-ems", label: "Jak wybrać firmę EMS", icon: "✓", description: "Poradnik dla zlecających produkcję" },
      { href: "/montaz-elektroniki-w-polsce", label: "Montaż elektroniki", icon: "⚙", description: "Usługi montażu elektroniki w Polsce" },
      { href: "/produkcja-pcb-polska", label: "Produkcja PCB", icon: "▣", description: "Firmy od PCB i obwodów drukowanych" },
      { href: "/kontraktowy-montaz-elektroniki", label: "Montaż kontraktowy", icon: "⇄", description: "Outsourcing produkcji elektroniki" },
    ],
  },
  {
    label: "Lokalizacje",
    children: [
      { href: "/ems-polska", label: "EMS Polska", icon: "◎" },
      { href: "/ems-mazowieckie", label: "EMS mazowieckie", icon: "⌖" },
      { href: "/ems-slaskie", label: "EMS śląskie", icon: "⌖" },
      { href: "/ems-dolnoslaskie", label: "EMS dolnośląskie", icon: "⌖" },
      { href: "/ems-pomorskie", label: "EMS pomorskie", icon: "⌖" },
      { href: "/ems-wielkopolskie", label: "EMS wielkopolskie", icon: "⌖" },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    if (!sidebarOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSidebar();
    };

    document.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [sidebarOpen]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <button
            className={styles.menuTrigger}
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            aria-controls="polskiems-sidebar"
            aria-label="Otwórz nawigację PolskiEMS"
          >
            <span className={styles.iconMark} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className={styles.brandText}>PolskiEMS</span>
          </button>

          <Link href="/wyszukaj" className={styles.topCta}>
            Znajdź producenta
          </Link>
        </div>
      </header>

      <div className={`${styles.sidebarLayer} ${sidebarOpen ? styles.sidebarLayerOpen : ""}`} aria-hidden={!sidebarOpen}>
        <button className={styles.backdrop} type="button" onClick={closeSidebar} aria-label="Zamknij menu" />

        <aside id="polskiems-sidebar" className={styles.sidebar} aria-label="Boczna nawigacja PolskiEMS">
          <div className={styles.sidebarBrand}>
            <Link href="/" className={styles.sidebarLogo} onClick={closeSidebar} aria-label="PolskiEMS — strona główna">
              <Image
                src="/images/logo.png"
                alt="PolskiEMS"
                width={58}
                height={58}
                className={styles.sidebarLogoImage}
                priority
              />
            </Link>
            <div>
              <p className={styles.sidebarTitle}>PolskiEMS</p>
              <p className={styles.sidebarSubtitle}>Platforma producentów elektroniki</p>
            </div>
            <button className={styles.closeButton} type="button" onClick={closeSidebar} aria-label="Zamknij menu">
              ×
            </button>
          </div>

          <nav className={styles.sidebarNav}>
            {navGroups.map((group) => (
              <section className={styles.navGroup} key={group.label}>
                <p className={styles.groupLabel}>{group.label}</p>
                <div className={styles.groupLinks}>
                  {group.children.map((item) => {
                    const active = isActivePath(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.sidebarLink} ${active ? styles.sidebarLinkActive : ""}`}
                        onClick={closeSidebar}
                      >
                        <span className={styles.linkIcon} aria-hidden="true">{item.icon}</span>
                        <span className={styles.linkTextWrap}>
                          <span className={styles.linkLabel}>{item.label}</span>
                          {item.description && <span className={styles.linkDescription}>{item.description}</span>}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>

          <div className={styles.sidebarCard}>
            <p className={styles.cardKicker}>Dla producentów EMS</p>
            <h2>Chcesz dodać firmę?</h2>
            <p>Wypełnij formularz online, wybierz pakiet i pokaż ofertę klientom szukającym wykonawcy elektroniki.</p>
            <Link href={producerSignupHref} className={styles.cardButton} onClick={closeSidebar}>
              Przejdź do formularza
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
