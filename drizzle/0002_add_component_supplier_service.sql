-- Add the component-supply category to the EMS activities catalog.
INSERT INTO "dzialania_ems" ("nazwa")
VALUES ('Dostarcza komponenty')
ON CONFLICT ("nazwa") DO NOTHING;
