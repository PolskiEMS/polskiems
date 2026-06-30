import {
  mysqlTable,
  varchar,
  datetime,
  text,
  mediumtext,
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
  adres: varchar("adres", { length: 255 }),
  telefon: varchar("telefon", { length: 30 }),
  email: varchar("email", { length: 100 }),
  www: varchar("www", { length: 255 }),
  featured: boolean("featured").default(false),
  isActive: boolean("isActive").default(false),
  createdAt: datetime("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  packageType: varchar("packageType", { length: 20 }).notNull().default("free"),
  monthlyInquiryLimit: int("monthlyInquiryLimit").notNull().default(0),
  monthlyInquiryCount: int("monthlyInquiryCount").notNull().default(0),
  packageValidUntil: datetime("package_valid_until", { mode: "string" }),
});

export const producenciEmsDzialania = mysqlTable("producenci_ems_dzialania", {
  id: int().primaryKey().autoincrement(),
  companyId: int("company_id").notNull().references(() => producenci.id),
  dzialanieId: int("dzialanie_id").notNull().references(() => dzialaniaEms.id),
});

export const producenciEmsProdukcja = mysqlTable("producenci_ems_produkcja", {
  id: int().primaryKey().autoincrement(),
  companyId: int("company_id").notNull().references(() => producenci.id),
  produkcjaId: int("produkcja_id").notNull().references(() => produkcja.id),
});

export const statystyki = mysqlTable("statystyki", {
  id: int().primaryKey().autoincrement(),
  wynik: varchar("wynik", { length: 255 }).notNull(),
  createdAt: datetime("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
});

export const companyEvents = mysqlTable("company_events", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").notNull().references(() => producenci.id),
  eventType: mysqlEnum("event_type", ["view", "phone_click", "email_click", "website_click", "doc_download"]).notNull(),
  referrer: varchar("referrer", { length: 255 }),
  utmSource: varchar("utm_source", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  createdAt: datetime("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pageViews = mysqlTable("page_views", {
  id: int().primaryKey().autoincrement(),
  page: varchar("page", { length: 100 }).notNull(),
  referrer: varchar("referrer", { length: 255 }),
  visitorId: varchar("visitor_id", { length: 100 }),
  createdAt: datetime("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
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
  hasDocumentation: boolean("has_documentation").notNull().default(false),
  attachmentName: varchar("attachment_name", { length: 255 }),
  attachmentType: varchar("attachment_type", { length: 120 }),
  attachmentContent: mediumtext("attachment_content"),
  message: text("message").notNull(),
  source: mysqlEnum("source", ["company_card", "company_profile", "global_form"]).notNull().default("global_form"),
  createdAt: datetime("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const inquiryRecipients = mysqlTable("inquiry_recipients", {
  id: int("id").primaryKey().autoincrement(),
  inquiryId: int("inquiry_id").notNull().references(() => inquiries.id),
  companyId: int("company_id").notNull().references(() => producenci.id),
  companyEmail: varchar("company_email", { length: 150 }).notNull(),
  status: mysqlEnum("status", ["pending_review", "sent_to_company", "rejected", "failed"]).notNull().default("pending_review"),
  adminNote: text("admin_note"),
  sentAt: datetime("sent_at", { mode: "string" }),
  rejectedAt: datetime("rejected_at", { mode: "string" }),
  errorMessage: text("error_message"),
  updatedAt: datetime("updated_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const packageOrders = mysqlTable("package_orders", {
  id: int("id").primaryKey().autoincrement(),
  companyId: int("company_id").references(() => producenci.id),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  companyEmail: varchar("company_email", { length: 150 }).notNull(),
  companyPhone: varchar("company_phone", { length: 50 }),
  companyDescription: text("company_description"),
  packageType: mysqlEnum("package_type", ["standard", "premium"]).notNull(),
  provider: mysqlEnum("provider", ["stripe", "przelewy24"]).notNull(),
  amountGross: int("amount_gross").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("PLN"),
  billingCycleMonths: int("billing_cycle_months").notNull().default(1),
  buyerName: varchar("buyer_name", { length: 150 }),
  buyerEmail: varchar("buyer_email", { length: 150 }),
  buyerPhone: varchar("buyer_phone", { length: 50 }),
  buyerCompanyName: varchar("buyer_company_name", { length: 180 }),
  buyerTaxId: varchar("buyer_tax_id", { length: 30 }),
  buyerAddressLine1: varchar("buyer_address_line1", { length: 255 }),
  buyerPostalCode: varchar("buyer_postal_code", { length: 20 }),
  buyerCity: varchar("buyer_city", { length: 120 }),
  buyerCountry: varchar("buyer_country", { length: 120 }),
  paymentStatus: mysqlEnum("payment_status", ["pending_payment", "paid", "paid_pending_activation", "active", "failed", "canceled"]).notNull().default("pending_payment"),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }),
  paidAt: datetime("paid_at", { mode: "string" }),
  activatedAt: datetime("activated_at", { mode: "string" }),
  accessValidUntil: datetime("access_valid_until", { mode: "string" }),
  createdAt: datetime("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
