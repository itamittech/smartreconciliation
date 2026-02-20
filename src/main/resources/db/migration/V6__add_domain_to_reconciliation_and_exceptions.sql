ALTER TABLE reconciliations
    ADD COLUMN domain VARCHAR(50) NOT NULL DEFAULT 'GENERAL';

ALTER TABLE reconciliation_exceptions
    ADD COLUMN domain VARCHAR(50) NOT NULL DEFAULT 'GENERAL';

UPDATE reconciliation_exceptions e
SET domain = r.domain
FROM reconciliations r
WHERE e.reconciliation_id = r.id;

CREATE INDEX idx_reconciliations_domain ON reconciliations(domain);
CREATE INDEX idx_reconciliation_exceptions_domain ON reconciliation_exceptions(domain);
