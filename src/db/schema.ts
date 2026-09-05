import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  timestamp,
  text,
  boolean,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const wojewodztwa = pgTable("wojewodztwa", {
  id: serial().primaryKey(),
  nazwa: varchar("nazwa", { length: 100 }).unique().notNull(),
});

export const dzialaniaEms = pgTable("dzialania_ems", {
  id: serial().primaryKey(),
  nazwa: varchar("nazwa", { length: 100 }).unique().notNull(),
});

export const produkcja = pgTable("produkcja", {
  id: serial().primaryKey(),
  zakres: varchar("zakres", { length: 50 }).unique().notNull(),
  sortOrder: integer("sort_order"),
});

export const taxonomySections = pgTable("taxonomy_sections", {
  key: varchar("key", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 120 }).unique().notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const producenci = pgTable("producenci", {
  id: serial().primaryKey(),
  nazwa: varchar("nazwa", { length: 255 }).notNull(),
  opis: text("opis"),
  wojewodztwoId: integer("wojewodztwo_id").references(() => wojewodztwa.id),
  adres: varchar("adres", { length: 255 }),
  telefon: varchar("telefon", { length: 30 }),
  email: varchar("email", { length: 100 }),
  www: varchar("www", { length: 255 }),
  companyType: varchar("companyType", { length: 64 }).notNull().default("unclassified"),
  featured: boolean("featured").default(false),
  isActive: boolean("isActive").default(false),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  packageType: varchar("packageType", { length: 20 }).notNull().default("free"),
  monthlyInquiryLimit: integer("monthlyInquiryLimit").notNull().default(0),
  monthlyInquiryCount: integer("monthlyInquiryCount").notNull().default(0),
  packageValidUntil: timestamp("package_valid_until", { mode: "string" }),
});

export const producenciEmsDzialania = pgTable("producenci_ems_dzialania", {
  id: serial().primaryKey(),
  companyId: integer("company_id").notNull().references(() => producenci.id),
  dzialanieId: integer("dzialanie_id").notNull().references(() => dzialaniaEms.id),
});

export const producenciEmsProdukcja = pgTable("producenci_ems_produkcja", {
  id: serial().primaryKey(),
  companyId: integer("company_id").notNull().references(() => producenci.id),
  produkcjaId: integer("produkcja_id").notNull().references(() => produkcja.id),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 160 }).unique().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order"),
});

export const capabilities = pgTable("capabilities", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 180 }).unique().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order"),
});

export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 160 }).unique().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order"),
});

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order"),
});

export const producerServices = pgTable("producer_services", {
  companyId: integer("company_id").notNull().references(() => producenci.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  source: varchar("source", { length: 50 }).notNull().default("listed"),
}, (table) => [
  primaryKey({ columns: [table.companyId, table.serviceId] }),
]);

export const producerCapabilities = pgTable("producer_capabilities", {
  companyId: integer("company_id").notNull().references(() => producenci.id),
  capabilityId: integer("capability_id").notNull().references(() => capabilities.id),
  source: varchar("source", { length: 50 }).notNull().default("listed"),
}, (table) => [
  primaryKey({ columns: [table.companyId, table.capabilityId] }),
]);

export const producerIndustries = pgTable("producer_industries", {
  companyId: integer("company_id").notNull().references(() => producenci.id),
  industryId: integer("industry_id").notNull().references(() => industries.id),
  source: varchar("source", { length: 50 }).notNull().default("listed"),
}, (table) => [
  primaryKey({ columns: [table.companyId, table.industryId] }),
]);

export const producerCertifications = pgTable("producer_certifications", {
  companyId: integer("company_id").notNull().references(() => producenci.id),
  certificationId: integer("certification_id").notNull().references(() => certifications.id),
  status: varchar("status", { length: 32 }).notNull().default("listed"),
}, (table) => [
  primaryKey({ columns: [table.companyId, table.certificationId] }),
]);

export const statystyki = pgTable("statystyki", {
  id: serial().primaryKey(),
  wynik: varchar("wynik", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
});

export const companyEventType = pgEnum("company_event_type", ["view", "phone_click", "email_click", "website_click", "doc_download"]);

export const companyEvents = pgTable("company_events", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => producenci.id),
  eventType: companyEventType("event_type").notNull(),
  referrer: varchar("referrer", { length: 255 }),
  utmSource: varchar("utm_source", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pageViews = pgTable("page_views", {
  id: serial().primaryKey(),
  page: varchar("page", { length: 100 }).notNull(),
  referrer: varchar("referrer", { length: 255 }),
  visitorId: varchar("visitor_id", { length: 100 }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const inquirySource = pgEnum("inquiry_source", ["company_card", "company_profile", "global_form"]);

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
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
  attachmentContent: text("attachment_content"),
  message: text("message").notNull(),
  source: inquirySource("source").notNull().default("global_form"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const inquiryRecipientStatus = pgEnum("inquiry_status", ["pending_review", "sent_to_company", "rejected", "failed"]);

export const inquiryRecipients = pgTable("inquiry_recipients", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id").notNull().references(() => inquiries.id),
  companyId: integer("company_id").notNull().references(() => producenci.id),
  companyEmail: varchar("company_email", { length: 150 }).notNull(),
  status: inquiryRecipientStatus("status").notNull().default("pending_review"),
  adminNote: text("admin_note"),
  sentAt: timestamp("sent_at", { mode: "string" }),
  rejectedAt: timestamp("rejected_at", { mode: "string" }),
  errorMessage: text("error_message"),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const packageType = pgEnum("package_order_type", ["standard", "premium"]);
export const paymentProvider = pgEnum("payment_provider", ["stripe", "przelewy24"]);
export const paymentStatus = pgEnum("payment_status_type", ["pending_payment", "paid", "paid_pending_activation", "active", "failed", "canceled"]);

export const packageOrders = pgTable("package_orders", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => producenci.id),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  companyEmail: varchar("company_email", { length: 150 }).notNull(),
  companyPhone: varchar("company_phone", { length: 50 }),
  companyDescription: text("company_description"),
  packageType: packageType("package_type").notNull(),
  provider: paymentProvider("provider").notNull(),
  amountGross: integer("amount_gross").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("PLN"),
  billingCycleMonths: integer("billing_cycle_months").notNull().default(1),
  buyerName: varchar("buyer_name", { length: 150 }),
  buyerEmail: varchar("buyer_email", { length: 150 }),
  buyerPhone: varchar("buyer_phone", { length: 50 }),
  buyerCompanyName: varchar("buyer_company_name", { length: 180 }),
  buyerTaxId: varchar("buyer_tax_id", { length: 30 }),
  buyerAddressLine1: varchar("buyer_address_line1", { length: 255 }),
  buyerPostalCode: varchar("buyer_postal_code", { length: 20 }),
  buyerCity: varchar("buyer_city", { length: 120 }),
  buyerCountry: varchar("buyer_country", { length: 120 }),
  paymentStatus: paymentStatus("payment_status").notNull().default("pending_payment"),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }),
  paidAt: timestamp("paid_at", { mode: "string" }),
  activatedAt: timestamp("activated_at", { mode: "string" }),
  accessValidUntil: timestamp("access_valid_until", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
