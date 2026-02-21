// Maps HTTP status codes to safe, user-friendly error messages.
// Never expose raw backend error messages to the user — they may leak
// file paths, SQL errors, stack traces, or internal service details.

const SAFE_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item was not found.',
  409: 'A conflict occurred. The item may already exist.',
  413: 'The file is too large. Maximum size is 100MB.',
  422: 'The submitted data is invalid. Please review your input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An unexpected error occurred. Please try again later.',
  502: 'Service temporarily unavailable. Please try again shortly.',
  503: 'Service temporarily unavailable. Please try again shortly.',
}

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error && 'status' in error) {
    const status = (error as { status: number }).status
    return SAFE_ERROR_MESSAGES[status] ?? 'An error occurred. Please try again or contact support.'
  }
  return 'An error occurred. Please try again or contact support.'
}

export function getSafeErrorMessageByStatus(status: number): string {
  return SAFE_ERROR_MESSAGES[status] ?? 'An error occurred. Please try again or contact support.'
}
