import type { ExceptionType, UserRole } from '@/types'

const EXCEPTION_ROLE_MAP: Record<ExceptionType, UserRole[]> = {
  MISSING_SOURCE: ['ADMIN', 'ANALYST', 'IT_ADMIN'],
  MISSING_TARGET: ['ADMIN', 'ANALYST', 'IT_ADMIN'],
  VALUE_MISMATCH: ['ADMIN', 'ANALYST', 'FINANCE'],
  DUPLICATE: ['ADMIN', 'ANALYST', 'OPERATIONS', 'COMPLIANCE'],
  FORMAT_ERROR: ['ADMIN', 'ANALYST', 'IT_ADMIN'],
  TOLERANCE_EXCEEDED: ['ADMIN', 'ANALYST', 'FINANCE', 'COMPLIANCE'],
  POTENTIAL_MATCH: ['ADMIN', 'ANALYST', 'OPERATIONS'],
}

export function canActionException(role: UserRole, type: ExceptionType): boolean {
  return EXCEPTION_ROLE_MAP[type]?.includes(role) ?? false
}
