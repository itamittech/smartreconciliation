import { create } from 'zustand'
import type { ChatMessage, CurrentUser, Reconciliation, ReconciliationException, UploadedFile } from '@/types'

interface AppState {
  // Auth
  currentUser: CurrentUser | null
  token: string | null
  refreshToken: string | null
  setAuth: (user: CurrentUser, token: string, refreshToken: string) => void
  clearAuth: () => void
  initializeAuth: () => Promise<void>

  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void

  // Chat
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  clearChat: () => void

  // Reconciliations
  reconciliations: Reconciliation[]
  setReconciliations: (reconciliations: Reconciliation[]) => void
  selectedReconciliation: Reconciliation | null
  setSelectedReconciliation: (reconciliation: Reconciliation | null) => void

  // Exceptions
  exceptions: ReconciliationException[]
  setExceptions: (exceptions: ReconciliationException[]) => void

  // Files
  uploadedFiles: UploadedFile[]
  addUploadedFile: (file: UploadedFile) => void
  setUploadedFiles: (files: UploadedFile[]) => void

  // UI
  activeView: 'home' | 'chat' | 'reconciliations' | 'exceptions' | 'rules' | 'files' | 'settings'
  setActiveView: (view: AppState['activeView']) => void
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: AppState['theme']) => void
  accentColor: 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate'
  setAccentColor: (color: AppState['accentColor']) => void
  compactMode: boolean
  toggleCompactMode: () => void
}

// Only refreshToken persists to localStorage — never accessToken or user PII
const storedRefreshToken = localStorage.getItem('auth_refresh_token')
const storedTheme = (localStorage.getItem('theme') as AppState['theme']) || 'system'
const storedAccentColor = (localStorage.getItem('accentColor') as AppState['accentColor']) || 'indigo'
const storedCompactMode = localStorage.getItem('compactMode') === 'true'

export const useAppStore = create<AppState>((set) => ({
  // Auth
  currentUser: null,        // Will be restored via initializeAuth() on app load
  token: null,              // Access token is memory-only
  refreshToken: storedRefreshToken,
  setAuth: (user, token, refreshToken) => {
    // Only persist the refresh token — access token and user PII stay in memory only
    localStorage.setItem('auth_refresh_token', refreshToken)
    // Clean up any legacy values from previous sessions
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    set({ currentUser: user, token, refreshToken })
  },
  clearAuth: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
    set({ currentUser: null, token: null, refreshToken: null })
  },
  initializeAuth: async () => {
    const { refreshToken } = useAppStore.getState()
    if (!refreshToken) return

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!refreshRes.ok) {
        useAppStore.getState().clearAuth()
        return
      }
      const refreshData = await refreshRes.json()
      const newToken = refreshData.data?.token || refreshData.data?.accessToken
      const newRefreshToken = refreshData.data?.refreshToken

      const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${newToken}` },
      })
      if (!meRes.ok) {
        useAppStore.getState().clearAuth()
        return
      }
      const meData = await meRes.json()
      const user = meData.data

      useAppStore.getState().setAuth(user, newToken, newRefreshToken || refreshToken)
    } catch {
      useAppStore.getState().clearAuth()
    }
  },

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Chat
  chatMessages: [],
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChat: () => set({ chatMessages: [] }),

  // Reconciliations
  reconciliations: [],
  setReconciliations: (reconciliations) => set({ reconciliations }),
  selectedReconciliation: null,
  setSelectedReconciliation: (reconciliation) =>
    set({ selectedReconciliation: reconciliation }),

  // Exceptions
  exceptions: [],
  setExceptions: (exceptions) => set({ exceptions }),

  // Files
  uploadedFiles: [],
  addUploadedFile: (file) =>
    set((state) => ({ uploadedFiles: [...state.uploadedFiles, file] })),
  setUploadedFiles: (files) => set({ uploadedFiles: files }),

  // UI
  activeView: 'home',
  setActiveView: (view) => set({ activeView: view }),
  theme: storedTheme,
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
  accentColor: storedAccentColor,
  setAccentColor: (color) => {
    localStorage.setItem('accentColor', color)
    set({ accentColor: color })
  },
  compactMode: storedCompactMode,
  toggleCompactMode: () => set((state) => {
    localStorage.setItem('compactMode', String(!state.compactMode))
    return { compactMode: !state.compactMode }
  }),
}))
