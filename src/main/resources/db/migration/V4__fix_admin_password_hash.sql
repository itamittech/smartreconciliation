-- Fix admin password hash: V3 contained an incorrect BCrypt hash for "Admin@1234".
-- This corrects it on existing deployments. On fresh installs V3+V4 both run, net result is correct.
UPDATE users
SET password = '$2a$10$wQQZgJvrFNldjBZw1DVal.Av4gjuIHM/11W9TVUhLoQVIODrKi/XC'
WHERE email = 'admin@company.com';
