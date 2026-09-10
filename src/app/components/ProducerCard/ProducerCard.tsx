"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { companyProfileSlug } from "@/lib/companySlug";
import { trackCompanyEvent } from "@/lib/trackCompanyEvent";
import styles from "./styles.module.css";

export type ProducerCardData = {
  id?: number;
  nazwa: string;
  opis?: string | null;
  wojewodztwo?: string | null;
  adres?: string | null;
  www?: string | null;
  featured?: boolean | null;
  packageType?: string | null;
};

type ProducerCardProps = {
  producer: ProducerCardData;
  index?: number;
};

const hiddenDescriptions = new Set([["Twój", "krótki", "opis"].join(" ")]);

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PE";
}

function getVisibleDescription(description?: string | null) {
  const normalized = description?.trim();
  if (!normalized || hiddenDescriptions.has(normalized)) {
    return "Profil firmy w bazie PolskiEMS. Sprawdź dane producenta i wyślij zapytanie ofertowe dopasowane do projektu.";
  }

  return normalized;
}

function getPackageBadge(producer: ProducerCardData) {
  if (producer.packageType === "premium" || producer.featured) return "Polecany producent";
  if (producer.packageType === "standard") return "Zweryfikowany profil";
  return "Profil producenta";
}

function getLocationLabel(producer: ProducerCardData) {
  if (producer.wojewodztwo?.trim()) return producer.wojewodztwo.trim();
  if (producer.adres?.trim()) return producer.adres.trim();
  return "Polska";
}

function getWebsiteHref(url?: string | null) {
  const normalized = url?.trim();
  if (!normalized) return null;
  return /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
}

function ProducerLogo({ name }: { name: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return <div className={styles.logoFallback} aria-hidden="true">{getInitials(name)}</div>;
  }

  return (
    <Image
      src={`/images/producers/${name}.jpg`}
      width={92}
      height={92}
      alt={`Logo producenta ${name}`}
      className={styles.logo}
      onError={() => setImageFailed(true)}
    />
  );
}

export default function ProducerCard({ producer, index = 0 }: ProducerCardProps) {
  const router = useRouter();
  const profileHref = producer.id
    ? `/producenci/${companyProfileSlug(producer.nazwa, producer.id)}`
    : "/wszyscy-producenci";
  const inquiryHref = producer.id
    ? `/zapytania-ofertowe?companyId=${producer.id}&source=company_card`
    : "/zapytania-ofertowe";
  const websiteHref = getWebsiteHref(producer.www);

  const openProfile = () => {
    router.push(profileHref);
  };

  return (
    <motion.article
      className={`${styles.card} ${
        producer.packageType === "premium" || producer.featured
          ? styles.premiumCard
          : producer.packageType === "standard"
            ? styles.standardCard
            : ""
      }`}
      id={producer.id ? `producent-${producer.id}` : undefined}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay: index <= 5 ? index * 0.045 : 0 }}
      onViewportEnter={() => {
        if (producer.id) trackCompanyEvent(producer.id, "view");
      }}
      onClick={openProfile}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProfile();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Otwórz profil producenta ${producer.nazwa}`}
    >
      <div className={styles.topRow}>
        <ProducerLogo name={producer.nazwa} />

        <div className={styles.headerContent}>
          <span className={styles.badge}>{getPackageBadge(producer)}</span>
          <h2>{producer.nazwa}</h2>
          <p className={styles.location}>📍 {getLocationLabel(producer)}</p>
        </div>
      </div>

      <p className={styles.description}>{getVisibleDescription(producer.opis)}</p>

      <div className={`${styles.actions} ${websiteHref ? styles.hasWebsiteAction : ""}`}>
        {websiteHref ? (
          <a
            href={websiteHref}
            className={styles.secondaryAction}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              event.stopPropagation();
              if (producer.id) trackCompanyEvent(producer.id, "website_click");
            }}
          >
            Zobacz WWW
          </a>
        ) : null}
        <Link href={inquiryHref} className={styles.primaryAction} onClick={(event) => event.stopPropagation()}>
          Poproś o wycenę
        </Link>
      </div>
    </motion.article>
  );
}
