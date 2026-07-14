"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./styles.module.css";

type NavChild = {
  href: string;
  label: string;
};

type NavGroup = {
  label: string;
  children: NavChild[];
};

const navGroups: NavGroup[] = [
  {
    label: "Usługi",
    children: [
      { href: "/montaz-elektroniki-w-polsce", label: "Montaż elektroniki w Polsce" },
      { href: "/kontraktowy-montaz-elektroniki", label: "Kontraktowy montaż elektroniki" },
      { href: "/produkcja-pcb-polska", label: "Produkcja PCB w Polsce" },
      { href: "/montaz-smt-polska", label: "Montaż SMT w Polsce" },
      { href: "/montaz-tht-polska", label: "Montaż THT w Polsce" },
      { href: "/produkcja-prototypowa-elektroniki", label: "Produkcja prototypowa elektroniki" },
    ],
  },
  {
    label: "Lokalizacje",
    children: [
      { href: "/ems-polska", label: "EMS Polska" },
      { href: "/ems-mazowieckie", label: "EMS mazowieckie" },
      { href: "/ems-pomorskie", label: "EMS pomorskie" },
      { href: "/ems-slaskie", label: "EMS śląskie" },
      { href: "/ems-dolnoslaskie", label: "EMS dolnośląskie" },
      { href: "/ems-wielkopolskie", label: "EMS wielkopolskie" },
    ],
  },
  {
    label: "Współpraca",
    children: [
      { href: "/jak-wybrac-firme-ems", label: "Jak wybrać firmę EMS" },
    ],
  },
  {
    label: "Informacje",
    children: [
      { href: "/regulamin", label: "Regulamin" },
      { href: "/cennik", label: "Cennik" },
      { href: "/o-nas", label: "O nas" },
      { href: "/kontakt", label: "Kontakt" },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);

  const toggleSection = (label: string) => {
    setOpenMobileSection((current) => (current === label ? null : label));
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenMobileSection(null);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoWrap} aria-label="Przejdź do strony głównej">
          <Image
            src="/images/logo.png"
            alt="Polski EMS - znajdź swojego producenta"
            width={102}
            height={44}
            className={styles.logo}
          />
        </Link>

        <nav className={styles.desktopNav} aria-label="Główna nawigacja">
          {navGroups.map((group) => (
            <div key={group.label} className={styles.dropdown}>
              <button className={styles.dropbtn} type="button">
                {group.label}
                <span className={styles.caret}>▾</span>
              </button>
              <div className={styles.dropdownContent}>
                {group.children.map((item) => (
                  <Link key={item.href} href={item.href} className={styles.dropdownLink}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <button
          className={styles.hamburger}
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label="Otwórz menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className={styles.mobileMenu}>
          {navGroups.map((group) => (
            <div key={group.label} className={styles.mobileSection}>
              <button
                className={styles.mobileSectionButton}
                type="button"
                onClick={() => toggleSection(group.label)}
                aria-expanded={openMobileSection === group.label}
              >
                {group.label}
                <span className={styles.caret}>{openMobileSection === group.label ? "▴" : "▾"}</span>
              </button>
              {openMobileSection === group.label && (
                <div className={styles.mobileLinks}>
                  {group.children.map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMobileMenu} className={styles.mobileLink}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
