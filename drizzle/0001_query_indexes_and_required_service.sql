-- Apply once through the controlled deployment/migration process; do not run from a page request.
INSERT INTO "dzialania_ems" ("nazwa") VALUES ('Montaż SMT') ON CONFLICT ("nazwa") DO NOTHING;

CREATE INDEX IF NOT EXISTS "producenci_active_package_idx" ON "producenci" ("isActive", "packageType");
CREATE INDEX IF NOT EXISTS "producenci_dzialania_company_idx" ON "producenci_ems_dzialania" ("company_id");
CREATE INDEX IF NOT EXISTS "producenci_produkcja_company_idx" ON "producenci_ems_produkcja" ("company_id");
CREATE INDEX IF NOT EXISTS "company_events_company_type_created_idx" ON "company_events" ("company_id", "event_type", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "company_events_type_created_idx" ON "company_events" ("event_type", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "page_views_page_created_idx" ON "page_views" ("page", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "inquiry_recipients_inquiry_idx" ON "inquiry_recipients" ("inquiry_id");
CREATE INDEX IF NOT EXISTS "inquiry_recipients_company_status_idx" ON "inquiry_recipients" ("company_id", "status");
