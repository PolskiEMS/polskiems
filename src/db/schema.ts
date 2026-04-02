import {
  mysqlTable,
  varchar,
  datetime,
  text,
  boolean,
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

export const producenci = mysqlTable("producenci", {
  id: int().primaryKey().autoincrement(),
  nazwa: varchar("nazwa", { length: 255 }).notNull(),
  opis: text("opis"),
  wojewodztwoId: int("wojewodztwo_id").references(() => wojewodztwa.id),
  telefon: varchar("telefon", { length: 30 }),
  email: varchar("email", { length: 100 }),
  www: varchar("www", { length: 255 }),
  featured: boolean("featured").default(false),
  isActive: boolean("isActive").default(false),
  createdAt: datetime("created_at", { mode: "string" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  packageType: varchar("packageType", { length: 20 })
    .notNull()
    .default("standard"),

  monthlyInquiryLimit: int("monthlyInquiryLimit")
    .notNull()
    .default(0),

  monthlyInquiryCount: int("monthlyInquiryCount")
    .notNull()
    .default(0),
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
  createdAt: datetime("created_at", { mode: "string" })
  .default(sql`CURRENT_TIMESTAMP`),
});

export const companyEvents = mysqlTable("company_events", {
  id: int("id").primaryKey().autoincrement(),

  companyId: int("company_id")
    .notNull()
    .references(() => producenci.id),

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

  createdAt: datetime("created_at", { mode: "string" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

  export const pageViews = mysqlTable("page_views", {
  id: int().primaryKey().autoincrement(),
  page: varchar("page", { length: 100 }).notNull(),
  referrer: varchar("referrer", { length: 255 }),
  visitorId: varchar("visitor_id", { length: 100 }),

  createdAt: datetime("created_at", { mode: "string" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

  export const inquiries = mysqlTable("inquiries", {
    id: int("id").primaryKey().autoincrement(),
    customerName: varchar("customer_name", { length: 150 }).notNull(),
    customerCompany: varchar("customer_company", { length: 150 }),
    customerEmail: varchar("customer_email", { length: 150 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 50 }),
    serviceType: varchar("service_type", { length: 100 }).notNull(),
    quantity: varchar("quantity", { length: 100 }),
    deadline: varchar("deadline", { length: 100 }),
    message: text("message").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    });

  export const inquiryRecipients = mysqlTable("inquiry_recipients", {
    id: int("id").primaryKey().autoincrement(),

    inquiryId: int("inquiry_id")
      .notNull()
      .references(() => inquiries.id),

      companyId: int("company_id")
        .notNull()
        .references(() => producenci.id),

      companyEmail: varchar("company_email", { length: 150 }).notNull(),

      status: varchar("status", { length: 50 }).notNull().default("sent"),

      sentAt: datetime("sent_at", { mode: "string" })
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
      });