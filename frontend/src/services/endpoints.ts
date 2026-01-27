// API endpoint functions - organized by domain
import { get, post, put, del, uploadFile } from './api'
import type {
  DashboardMetrics,
  Reconciliation,
  ReconciliationException,
  UploadedFile,
  RuleSet,
  FieldMapping,
  MatchingRule,
  ChatSession,
  ChatMessage,
  ChatResponse,
  CreateReconciliationRequest,
  CreateRuleSetRequest,
  CreateFieldMappingRequest,
  CreateMatchingRuleRequest,
  ResolveExceptionRequest,
  ChatMessageRequest,
} from './types'

// ============================================
// Dashboard
// ============================================
export const dashboardApi = {
  getMetrics: () => get<DashboardMetrics>('/dashboard/metrics'),
}

// ============================================
// Files
// ============================================
export const filesApi = {
  getAll: () => get<UploadedFile[]>('/files'),
  getById: (id: number) => get<UploadedFile>(`/files/${id}`),
  upload: (file: File, type?: string) =>
    uploadFile<UploadedFile>('/files/upload', file, type ? { type } : undefined),
  delete: (id: number) => del<void>(`/files/${id}`),
  getPreview: (id: number, limit?: number) =>
    get<{ headers: string[]; rows: Record<string, unknown>[] }>(
      `/files/${id}/preview${limit ? `?limit=${limit}` : ''}`
    ),
}

// ============================================
// Reconciliations
// ============================================
export const reconciliationsApi = {
  getAll: () => get<Reconciliation[]>('/reconciliations'),
  getById: (id: number) => get<Reconciliation>(`/reconciliations/${id}`),
  create: (data: CreateReconciliationRequest) =>
    post<Reconciliation>('/reconciliations', data),
  start: (id: number) => post<Reconciliation>(`/reconciliations/${id}/start`),
  cancel: (id: number) => post<Reconciliation>(`/reconciliations/${id}/cancel`),
  delete: (id: number) => del<void>(`/reconciliations/${id}`),
}

// ============================================
// Exceptions
// ============================================
export const exceptionsApi = {
  getAll: (filters?: { reconciliationId?: number; status?: string; type?: string; severity?: string }) => {
    const params = new URLSearchParams()
    if (filters?.reconciliationId) params.append('reconciliationId', filters.reconciliationId.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.severity) params.append('severity', filters.severity)
    const queryString = params.toString()
    return get<ReconciliationException[]>(`/exceptions${queryString ? `?${queryString}` : ''}`)
  },
  getById: (id: number) => get<ReconciliationException>(`/exceptions/${id}`),
  resolve: (id: number, data: ResolveExceptionRequest) =>
    put<ReconciliationException>(`/exceptions/${id}/resolve`, data),
  ignore: (id: number) => put<ReconciliationException>(`/exceptions/${id}/ignore`),
  bulkResolve: (ids: number[], resolution: string) =>
    post<ReconciliationException[]>('/exceptions/bulk-resolve', { ids, resolution }),
  bulkIgnore: (ids: number[]) =>
    post<ReconciliationException[]>('/exceptions/bulk-ignore', { ids }),
}

// ============================================
// Rules
// ============================================
export const rulesApi = {
  // Rule Sets
  getAllRuleSets: () => get<RuleSet[]>('/rules'),
  getRuleSetById: (id: number) => get<RuleSet>(`/rules/${id}`),
  createRuleSet: (data: CreateRuleSetRequest) => post<RuleSet>('/rules', data),
  updateRuleSet: (id: number, data: Partial<CreateRuleSetRequest>) =>
    put<RuleSet>(`/rules/${id}`, data),
  deleteRuleSet: (id: number) => del<void>(`/rules/${id}`),

  // Field Mappings
  addFieldMapping: (ruleSetId: number, data: CreateFieldMappingRequest) =>
    post<FieldMapping>(`/rules/${ruleSetId}/mappings`, data),
  updateFieldMapping: (ruleSetId: number, mappingId: number, data: Partial<CreateFieldMappingRequest>) =>
    put<FieldMapping>(`/rules/${ruleSetId}/mappings/${mappingId}`, data),
  deleteFieldMapping: (ruleSetId: number, mappingId: number) =>
    del<void>(`/rules/${ruleSetId}/mappings/${mappingId}`),

  // Matching Rules
  addMatchingRule: (ruleSetId: number, data: CreateMatchingRuleRequest) =>
    post<MatchingRule>(`/rules/${ruleSetId}/matching-rules`, data),
  updateMatchingRule: (ruleSetId: number, ruleId: number, data: Partial<CreateMatchingRuleRequest>) =>
    put<MatchingRule>(`/rules/${ruleSetId}/matching-rules/${ruleId}`, data),
  deleteMatchingRule: (ruleSetId: number, ruleId: number) =>
    del<void>(`/rules/${ruleSetId}/matching-rules/${ruleId}`),
}

// ============================================
// Chat
// ============================================
export const chatApi = {
  // Sessions
  getAllSessions: () => get<ChatSession[]>('/chat/sessions'),
  getSession: (id: number) => get<ChatSession>(`/chat/sessions/${id}`),
  createSession: (title?: string) =>
    post<ChatSession>('/chat/sessions', title ? { title } : undefined),
  deleteSession: (id: number) => del<void>(`/chat/sessions/${id}`),

  // Messages
  getMessages: (sessionId: number) => get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId: number, data: ChatMessageRequest) =>
    post<ChatResponse>(`/chat/sessions/${sessionId}/message`, data),

  // Quick chat (no session needed)
  quickChat: (data: ChatMessageRequest) => post<ChatResponse>('/chat/message', data),
}

// ============================================
// AI
// ============================================
export const aiApi = {
  suggestMappings: (sourceFileId: number, targetFileId: number) =>
    post<{ mappings: CreateFieldMappingRequest[] }>('/ai/suggest-mappings', {
      sourceFileId,
      targetFileId,
    }),
  suggestRules: (sourceFileId: number, targetFileId: number, mappings: CreateFieldMappingRequest[]) =>
    post<{ rules: CreateMatchingRuleRequest[] }>('/ai/suggest-rules', {
      sourceFileId,
      targetFileId,
      mappings,
    }),
  suggestResolution: (exceptionId: number) =>
    post<{ suggestion: string }>(`/ai/suggest-resolution/${exceptionId}`),
}

// ============================================
// Health
// ============================================
export const healthApi = {
  check: () => get<{ status: string; timestamp: string }>('/health'),
}
