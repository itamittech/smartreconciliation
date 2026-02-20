// API Service Layer - Connects frontend to backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

// Generic API response wrapper matching backend ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T
  timestamp: string
}

// API error class
export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Access Zustand store state directly (no hook, works outside React components)
import { useAppStore } from '@/store'

function getStore() {
  return useAppStore.getState()
}

// Flag to prevent infinite refresh loops
let isRefreshing = false

// Base fetch wrapper with auth header + 401 refresh handling
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  skipAuthRetry = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const store = getStore()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (store.token) {
    headers['Authorization'] = `Bearer ${store.token}`
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  const response = await fetch(url, config)

  if (response.status === 401 && !skipAuthRetry && !isRefreshing) {
    const currentRefreshToken = store.refreshToken

    if (currentRefreshToken) {
      isRefreshing = true
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          const newToken = refreshData.data.token
          const newRefreshToken = refreshData.data.refreshToken
          const currentUser = store.currentUser
          if (currentUser) {
            store.setAuth(currentUser, newToken, newRefreshToken)
          }

          // Retry the original request with the new token
          return fetchApi<T>(endpoint, options, true)
        }
      } catch {
        // Refresh failed — fall through to clearAuth
      } finally {
        isRefreshing = false
      }
    }

    // Refresh failed or no refresh token — clear auth
    store.clearAuth()
    throw new ApiError('Session expired. Please log in again.', 401)
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new ApiError(
      errorData?.message || `HTTP error ${response.status}`,
      response.status,
      errorData
    )
  }

  return response.json()
}

// GET request
export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return fetchApi<ApiResponse<T>>(endpoint)
}

// POST request
export async function post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  return fetchApi<ApiResponse<T>>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// PUT request
export async function put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  return fetchApi<ApiResponse<T>>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// DELETE request
export async function del<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  return fetchApi<ApiResponse<T>>(endpoint, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// PATCH request
export async function patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  return fetchApi<ApiResponse<T>>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// File upload (multipart form data)
export async function uploadFile<T>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, string>
): Promise<ApiResponse<T>> {
  const formData = new FormData()
  formData.append('file', file)

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }

  const store = getStore()
  const url = `${API_BASE_URL}${endpoint}`
  const headers: Record<string, string> = {}
  if (store.token) {
    headers['Authorization'] = `Bearer ${store.token}`
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    // Note: Don't set Content-Type header for FormData, browser sets it automatically
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new ApiError(
      errorData?.message || `HTTP error ${response.status}`,
      response.status,
      errorData
    )
  }

  return response.json()
}

// SSE streaming POST — calls onChunk for each token, onDone when complete
export async function streamPost(
  endpoint: string,
  data: unknown,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const url = `${API_BASE_URL}${endpoint}`
  const store = getStore()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }
  if (store.token) {
    headers['Authorization'] = `Bearer ${store.token}`
  }

  const parseEvent = (eventPayload: string): string | null => {
    const lines = eventPayload.split('\n')
    const dataLines: string[] = []

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '')
      if (!line) continue

      if (line.startsWith('data:')) {
        let content: string

        // Tolerate duplicated SSE framing like "data: data: ...".
        if (/^data:\s*data:\s*/.test(line)) {
          content = line.replace(/^data:\s*data:\s*/, '')
        } else {
          content = line.slice(5)
          // SSE allows one optional separator space after "data:".
          if (content.startsWith(' ')) {
            content = content.slice(1)
          }
        }

        dataLines.push(content)
      } else if (!line.startsWith(':')) {
        // Be tolerant of malformed frames where continuation lines are emitted without "data:".
        dataLines.push(line)
      }
    }

    if (!dataLines.length) {
      return null
    }

    // Some servers emit a trailing empty data line per event; avoid injecting artificial newlines.
    const hasNonEmptyData = dataLines.some((part) => part.length > 0)
    if (hasNonEmptyData) {
      while (dataLines.length > 0 && dataLines[dataLines.length - 1] === '') {
        dataLines.pop()
      }
    }

    const combined = dataLines.join('\n')
    if (!combined) return null
    if (combined.trim() === '[DONE]') return null
    return combined
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new ApiError(
        errorData?.message || `HTTP error ${response.status}`,
        response.status,
        errorData
      )
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    const flushEventsFromBuffer = (forceFlushRemainder = false) => {
      let separatorIndex = buffer.indexOf('\n\n')
      while (separatorIndex !== -1) {
        const eventPayload = buffer.slice(0, separatorIndex)
        buffer = buffer.slice(separatorIndex + 2)
        const parsed = parseEvent(eventPayload)
        if (parsed) onChunk(parsed)
        separatorIndex = buffer.indexOf('\n\n')
      }

      if (forceFlushRemainder && buffer.length > 0) {
        const parsed = parseEvent(buffer)
        if (parsed) onChunk(parsed)
        buffer = ''
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
      flushEventsFromBuffer()
    }

    buffer += decoder.decode().replace(/\r\n/g, '\n')
    flushEventsFromBuffer(true)
    onDone()
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)))
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    post<import('@/types').AuthResponse>('/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    post<{ token: string; refreshToken: string; expiresIn: number }>('/auth/refresh', { refreshToken }),
  me: () => get<import('@/types').CurrentUser>('/auth/me'),
}

// Admin API
export const adminApi = {
  listUsers: () => get<import('@/types').UserDetailResponse[]>('/admin/users'),
  createUser: (data: import('@/types').CreateUserRequest) =>
    post<{ user: import('@/types').UserDetailResponse; tempPassword: string }>('/admin/users', data),
  updateUser: (id: number, data: import('@/types').UpdateUserRequest) =>
    put<import('@/types').UserDetailResponse>(`/admin/users/${id}`, data),
  getUser: (id: number) => get<import('@/types').UserDetailResponse>(`/admin/users/${id}`),
}

// DataSource API
export const dataSourcesApi = {
  getAll: () => get<import('@/types').DataSource[]>('/datasources'),
  getById: (id: number) => get<import('@/types').DataSource>(`/datasources/${id}`),
  create: (data: import('@/types').DataSourceRequest) => post<import('@/types').DataSource>('/datasources', data),
  update: (id: number, data: import('@/types').DataSourceRequest) =>
    put<import('@/types').DataSource>(`/datasources/${id}`, data),
  delete: (id: number) => del<void>(`/datasources/${id}`),
  testConnection: (id: number) => post<import('@/types').DataSource>(`/datasources/${id}/test`),
}

// AI Configuration API
export const aiConfigApi = {
  getConfig: () => get<import('@/types').AiConfig>('/ai/config'),
  updateConfig: (data: import('@/types').AiConfigRequest) => put<import('@/types').AiConfig>('/ai/config', data),
}

export { API_BASE_URL }
