import { create } from 'zustand'
import type { ChatMessage, CurrentUser, Reconciliation, ReconciliationException, UploadedFile } from '@/types'

interface AppState {
  // Auth
  currentUser: CurrentUser | null
  token: string | null
  refreshToken: string | null
  setAuth: (user: CurrentUser, token: string, refreshToken: string) => void
  clearAuth: () => void

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

// Rehydrate token + refreshToken from localStorage on startup
const storedToken = localStorage.getItem('auth_token')
const storedRefreshToken = localStorage.getItem('auth_refresh_token')
const storedUser = localStorage.getItem('auth_user')
const initialUser: CurrentUser | null = storedUser ? JSON.parse(storedUser) : null
const storedTheme = (localStorage.getItem('theme') as AppState['theme']) || 'system'
const storedAccentColor = (localStorage.getItem('accentColor') as AppState['accentColor']) || 'indigo'
const storedCompactMode = localStorage.getItem('compactMode') === 'true'

export const useAppStore = create<AppState>((set) => ({
  // Auth
  currentUser: initialUser,
  token: storedToken,
  refreshToken: storedRefreshToken,
  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_refresh_token', refreshToken)
    localStorage.setItem('auth_user', JSON.stringify(user))
    set({ currentUser: user, token, refreshToken })
  },
  clearAuth: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
    set({ currentUser: null, token: null, refreshToken: null })
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
