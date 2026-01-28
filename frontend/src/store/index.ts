import { create } from 'zustand'
import type { ChatMessage, Reconciliation, ReconciliationException, UploadedFile } from '@/types'

interface AppState {
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
}

export const useAppStore = create<AppState>((set) => ({
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
}))
