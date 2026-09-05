import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { producenci } from "./schema";

export const companyTypeValues = [
  "unclassified",
  "ems",
  "pcb_manufacturer",
  "electronics_manufacturer",
  "electronics_design",
  "cable_wire_harness",
  "box_build_system_integration",
  "testing_laboratory",
  "component_manufacturer",
  "component_distributor",
  "materials_supplier",
  "equipment_consulting",
] as const;

export type CompanyType = (typeof companyTypeValues)[number];

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
});

export const capabilities = pgTable("capabilities", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
});

export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
});

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const producerServices = pgTable(
  "producer_services",
  {
    companyId: integer("company_id")
      .notNull()
      .references(() => producenci.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 32 }).notNull().default("listed"),
  },
  (table) => [primaryKey({ columns: [table.companyId, table.serviceId] })]
);

export const producerCapabilities = pgTable(
  "producer_capabilities",
  {
    companyId: integer("company_id")
      .notNull()
      .references(() => producenci.id, { onDelete: "cascade" }),
    capabilityId: integer("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 32 }).notNull().default("listed"),
  },
  (table) => [primaryKey({ columns: [table.companyId, table.capabilityId] })]
);

export const producerIndustries = pgTable(
  "producer_industries",
  {
    companyId: integer("company_id")
      .notNull()
      .references(() => producenci.id, { onDelete: "cascade" }),
    industryId: integer("industry_id")
      .notNull()
      .references(() => industries.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 32 }).notNull().default("listed"),
  },
  (table) => [primaryKey({ columns: [table.companyId, table.industryId] })]
);

export const producerCertifications = pgTable(
  "producer_certifications",
  {
    companyId: integer("company_id")
      .notNull()
      .references(() => producenci.id, { onDelete: "cascade" }),
    certificationId: integer("certification_id")
      .notNull()
      .references(() => certifications.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 24 }).notNull().default("listed"),
  },
  (table) => [primaryKey({ columns: [table.companyId, table.certificationId] })]
);
