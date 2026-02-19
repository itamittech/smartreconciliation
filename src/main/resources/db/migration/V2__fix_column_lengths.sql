-- Fix for existing databases where Hibernate might have created VARCHAR(255)
ALTER TABLE rule_sets ALTER COLUMN name TYPE TEXT;
ALTER TABLE rule_sets ALTER COLUMN description TYPE TEXT;
ALTER TABLE matching_rules ALTER COLUMN name TYPE TEXT;
ALTER TABLE matching_rules ALTER COLUMN description TYPE TEXT;
ALTER TABLE field_mappings ALTER COLUMN transform TYPE TEXT;
ALTER TABLE reconciliations ALTER COLUMN name TYPE TEXT;
ALTER TABLE reconciliations ALTER COLUMN description TYPE TEXT;
ALTER TABLE reconciliations ALTER COLUMN error_message TYPE TEXT;
ALTER TABLE reconciliation_exceptions ALTER COLUMN description TYPE TEXT;
ALTER TABLE reconciliation_exceptions ALTER COLUMN source_value TYPE TEXT;
ALTER TABLE reconciliation_exceptions ALTER COLUMN target_value TYPE TEXT;
ALTER TABLE reconciliation_exceptions ALTER COLUMN ai_suggestion TYPE TEXT;
ALTER TABLE reconciliation_exceptions ALTER COLUMN resolution TYPE TEXT;
ALTER TABLE uploaded_files ALTER COLUMN processing_error TYPE TEXT;
ALTER TABLE data_sources ALTER COLUMN description TYPE TEXT;
ALTER TABLE data_sources ALTER COLUMN last_test_error TYPE TEXT;
ALTER TABLE organizations ALTER COLUMN description TYPE TEXT;
