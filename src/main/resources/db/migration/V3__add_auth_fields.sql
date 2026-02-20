-- Add auth fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- Expand role check constraint to include new roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('ADMIN', 'ANALYST', 'FINANCE', 'IT_ADMIN', 'OPERATIONS', 'COMPLIANCE', 'VIEWER'));

-- Seed the initial admin user (BCrypt of "Admin@1234")
INSERT INTO users (email, name, role, active, password, must_change_password, organization_id, created_at, updated_at)
SELECT
  'admin@company.com',
  'System Admin',
  'ADMIN',
  TRUE,
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
  FALSE,
  id,
  NOW(),
  NOW()
FROM organizations
WHERE name = 'Default Organization'
LIMIT 1
ON CONFLICT (email) DO NOTHING;
