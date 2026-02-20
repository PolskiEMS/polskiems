import {
  mysqlTable,
  varchar,
  datetime,
  int,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

import { sql } from "drizzle-orm";

export const wojewodztwa = mysqlTable("wojewodztwa", {
  id: int().primaryKey().autoincrement(),
  nazwa: varchar("nazwa", { length: 100 }).unique().notNull(),
});

export const dzialaniaEms = mysqlTable("dzialania_ems", {
  id: int().primaryKey().autoincrement(),
  nazwa: varchar("nazwa", { length: 100 }).unique().notNull(),
});

export const produkcja = mysqlTable("produkcja", {
  id: int().primaryKey().autoincrement(),

  zakres: varchar("zakres", { length: 50 }).unique().notNull(),
});

export const companyEvents = mysqlTable("company_events", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull(),
  eventType: mysqlEnum("event_type", [
    "view",
    "phone_click",
    "email_click",
    "website_click",
    "doc_download",
  ]).notNull(),
  referrer: varchar("referrer", { length: 255 }),
  utmSource: varchar("utm_source", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  createdAt: datetime("created_at", { mode: "string" }).default("current_timestamp"),
});

export const producenci = mysqlTable("producenci", {
  id: int().primaryKey().autoincrement(),
  nazwa: varchar("nazwa", { length: 255 }).notNull(),
  opis: text("opis"),
  wojewodztwoId: int("wojewodztwo_id").references(() => wojewodztwa.id),
  telefon: varchar("telefon", { length: 30 }),
  email: varchar("email", { length: 100 }),
  isActive: boolean("isActive").default(false),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`now()`),
});

export const producenciEmsDzialania = mysqlTable("producenci_ems_dzialania", {
  id: int().primaryKey().autoincrement(),
  companyId: int("company_id")
    .notNull()
    .references(() => producenci.id),
  dzialanieId: int("dzialanie_id")
    .notNull()
    .references(() => dzialaniaEms.id),
});

export const producenciEmsProdukcja = mysqlTable("producenci_ems_produkcja", {
  id: int().primaryKey().autoincrement(),
  companyId: int("company_id")
    .notNull()
    .references(() => producenci.id),
  produkcjaId: int("produkcja_id")
    .notNull()
    .references(() => produkcja.id),
});

export const statystyki = mysqlTable("statystyki", {
  id: int().primaryKey().autoincrement(),
  wynik: varchar("wynik", { length: 255 }).notNull(),
  createdAt: datetime("created_at").default(sql`now()`),
});
