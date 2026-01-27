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

// Base fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

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
export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return fetchApi<ApiResponse<T>>(endpoint, {
    method: 'DELETE',
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

  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    method: 'POST',
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

export { API_BASE_URL }
