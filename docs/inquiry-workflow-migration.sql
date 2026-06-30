-- Workflow akceptacji zapytań ofertowych PolskiEMS.
-- Uruchom przed wdrożeniem kodu, jeśli baza ma wcześniejszą wersję tabel inquiries/inquiry_recipients.

ALTER TABLE inquiries
  ADD COLUMN has_documentation BOOLEAN NOT NULL DEFAULT FALSE AFTER deadline,
  ADD COLUMN source ENUM('company_card', 'company_profile', 'global_form') NOT NULL DEFAULT 'global_form' AFTER message,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER created_at;

UPDATE inquiry_recipients SET status = 'pending_review' WHERE status IN ('new', 'blocked');
UPDATE inquiry_recipients SET status = 'sent_to_company' WHERE status = 'sent';
UPDATE inquiry_recipients SET status = 'failed' WHERE status = 'error';

ALTER TABLE inquiry_recipients
  MODIFY COLUMN status ENUM('pending_review', 'sent_to_company', 'rejected', 'failed') NOT NULL DEFAULT 'pending_review',
  ADD COLUMN admin_note TEXT NULL AFTER status,
  ADD COLUMN rejected_at DATETIME NULL AFTER sent_at,
  ADD COLUMN error_message TEXT NULL AFTER rejected_at,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER error_message;

-- Załącznik dokumentacji technicznej do zapytania ofertowego.
ALTER TABLE inquiries
  ADD COLUMN attachment_name VARCHAR(255) NULL AFTER has_documentation,
  ADD COLUMN attachment_type VARCHAR(120) NULL AFTER attachment_name,
  ADD COLUMN attachment_content MEDIUMTEXT NULL AFTER attachment_type;
