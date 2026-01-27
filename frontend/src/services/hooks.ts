// React Query hooks for API data fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  dashboardApi,
  filesApi,
  reconciliationsApi,
  exceptionsApi,
  rulesApi,
  chatApi,
  aiApi,
  healthApi,
} from './endpoints'
import type {
  CreateReconciliationRequest,
  CreateRuleSetRequest,
  CreateFieldMappingRequest,
  CreateMatchingRuleRequest,
  ResolveExceptionRequest,
  ChatMessageRequest,
} from './types'

// Query keys for cache management
export const queryKeys = {
  health: ['health'] as const,
  dashboard: ['dashboard'] as const,
  files: ['files'] as const,
  file: (id: number) => ['files', id] as const,
  filePreview: (id: number) => ['files', id, 'preview'] as const,
  reconciliations: ['reconciliations'] as const,
  reconciliation: (id: number) => ['reconciliations', id] as const,
  exceptions: (filters?: Record<string, unknown>) => ['exceptions', filters] as const,
  exception: (id: number) => ['exceptions', id] as const,
  ruleSets: ['ruleSets'] as const,
  ruleSet: (id: number) => ['ruleSets', id] as const,
  chatSessions: ['chatSessions'] as const,
  chatSession: (id: number) => ['chatSessions', id] as const,
  chatMessages: (sessionId: number) => ['chatMessages', sessionId] as const,
}

// ============================================
// Health
// ============================================
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthApi.check(),
    refetchInterval: 30000, // Check every 30s
  })
}

// ============================================
// Dashboard
// ============================================
export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => dashboardApi.getMetrics(),
    refetchInterval: 60000, // Refresh every minute
  })
}

// ============================================
// Files
// ============================================
export function useFiles() {
  return useQuery({
    queryKey: queryKeys.files,
    queryFn: () => filesApi.getAll(),
  })
}

export function useFile(id: number) {
  return useQuery({
    queryKey: queryKeys.file(id),
    queryFn: () => filesApi.getById(id),
    enabled: !!id,
  })
}

export function useFilePreview(id: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.filePreview(id),
    queryFn: () => filesApi.getPreview(id, limit),
    enabled: !!id,
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type?: string }) =>
      filesApi.upload(file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// ============================================
// Reconciliations
// ============================================
export function useReconciliations() {
  return useQuery({
    queryKey: queryKeys.reconciliations,
    queryFn: () => reconciliationsApi.getAll(),
  })
}

export function useReconciliation(id: number) {
  return useQuery({
    queryKey: queryKeys.reconciliation(id),
    queryFn: () => reconciliationsApi.getById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Refresh every 5s if in progress
      const status = query.state.data?.data?.status
      return status === 'IN_PROGRESS' ? 5000 : false
    },
  })
}

export function useCreateReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateReconciliationRequest) =>
      reconciliationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reconciliations })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useStartReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reconciliationsApi.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reconciliation(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.reconciliations })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useCancelReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reconciliationsApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reconciliation(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.reconciliations })
    },
  })
}

export function useDeleteReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reconciliationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reconciliations })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// ============================================
// Exceptions
// ============================================
export function useExceptions(filters?: {
  reconciliationId?: number
  status?: string
  type?: string
  severity?: string
}) {
  return useQuery({
    queryKey: queryKeys.exceptions(filters),
    queryFn: () => exceptionsApi.getAll(filters),
  })
}

export function useException(id: number) {
  return useQuery({
    queryKey: queryKeys.exception(id),
    queryFn: () => exceptionsApi.getById(id),
    enabled: !!id,
  })
}

export function useResolveException() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResolveExceptionRequest }) =>
      exceptionsApi.resolve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useIgnoreException() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => exceptionsApi.ignore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useBulkResolveExceptions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, resolution }: { ids: number[]; resolution: string }) =>
      exceptionsApi.bulkResolve(ids, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useBulkIgnoreExceptions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => exceptionsApi.bulkIgnore(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

// ============================================
// Rules
// ============================================
export function useRuleSets() {
  return useQuery({
    queryKey: queryKeys.ruleSets,
    queryFn: () => rulesApi.getAllRuleSets(),
  })
}

export function useRuleSet(id: number) {
  return useQuery({
    queryKey: queryKeys.ruleSet(id),
    queryFn: () => rulesApi.getRuleSetById(id),
    enabled: !!id,
  })
}

export function useCreateRuleSet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRuleSetRequest) => rulesApi.createRuleSet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ruleSets })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useUpdateRuleSet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRuleSetRequest> }) =>
      rulesApi.updateRuleSet(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ruleSet(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.ruleSets })
    },
  })
}

export function useDeleteRuleSet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => rulesApi.deleteRuleSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ruleSets })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useAddFieldMapping() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruleSetId, data }: { ruleSetId: number; data: CreateFieldMappingRequest }) =>
      rulesApi.addFieldMapping(ruleSetId, data),
    onSuccess: (_, { ruleSetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ruleSet(ruleSetId) })
    },
  })
}

export function useAddMatchingRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruleSetId, data }: { ruleSetId: number; data: CreateMatchingRuleRequest }) =>
      rulesApi.addMatchingRule(ruleSetId, data),
    onSuccess: (_, { ruleSetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ruleSet(ruleSetId) })
    },
  })
}

// ============================================
// Chat
// ============================================
export function useChatSessions() {
  return useQuery({
    queryKey: queryKeys.chatSessions,
    queryFn: () => chatApi.getAllSessions(),
  })
}

export function useChatSession(id: number) {
  return useQuery({
    queryKey: queryKeys.chatSession(id),
    queryFn: () => chatApi.getSession(id),
    enabled: !!id,
  })
}

export function useChatMessages(sessionId: number) {
  return useQuery({
    queryKey: queryKeys.chatMessages(sessionId),
    queryFn: () => chatApi.getMessages(sessionId),
    enabled: !!sessionId,
  })
}

export function useCreateChatSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title?: string) => chatApi.createSession(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatSessions })
    },
  })
}

export function useSendChatMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: number; data: ChatMessageRequest }) =>
      chatApi.sendMessage(sessionId, data),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatMessages(sessionId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.chatSessions })
    },
  })
}

export function useQuickChat() {
  return useMutation({
    mutationFn: (data: ChatMessageRequest) => chatApi.quickChat(data),
  })
}

// ============================================
// AI
// ============================================
export function useSuggestMappings() {
  return useMutation({
    mutationFn: ({ sourceFileId, targetFileId }: { sourceFileId: number; targetFileId: number }) =>
      aiApi.suggestMappings(sourceFileId, targetFileId),
  })
}

export function useSuggestRules() {
  return useMutation({
    mutationFn: ({
      sourceFileId,
      targetFileId,
      mappings,
    }: {
      sourceFileId: number
      targetFileId: number
      mappings: CreateFieldMappingRequest[]
    }) => aiApi.suggestRules(sourceFileId, targetFileId, mappings),
  })
}

export function useSuggestResolution() {
  return useMutation({
    mutationFn: (exceptionId: number) => aiApi.suggestResolution(exceptionId),
  })
}
