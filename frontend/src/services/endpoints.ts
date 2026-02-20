// API endpoint functions - organized by domain
import { get, post, put, del, uploadFile, fetchApi } from './api'
import type { ApiResponse } from './api'
import type {
  DashboardMetrics,
  Reconciliation,
  ReconciliationException,
  PaginatedResponse,
  ExceptionQueryParams,
  ExceptionRunSummary,
  AutoResolveExceptionsRequest,
  AutoResolveExceptionsResponse,
  UploadedFile,
  RuleSet,
  FieldMapping,
  MatchingRule,
  ChatSession,
  ChatMessage,
  ChatResponse,
  CreateReconciliationRequest,
  CreateRuleSetRequest,
  UpdateRuleSetRequest,
  CreateFieldMappingRequest,
  CreateMatchingRuleRequest,
  ResolveExceptionRequest,
  UpdateExceptionRequest,
  ChatMessageRequest,
  AiSuggestedMapping,
  AiMappingSuggestionResult,
  AiRuleSuggestionResult,
  KnowledgeDocument,
  KnowledgeDomain,
  DomainDetectionResult,
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
    uploadFile<UploadedFile>('/files/upload/single', file, type ? { type } : undefined),
  delete: (id: number) => del<void>(`/files/${id}`),
  getPreview: (id: number, limit?: number) =>
    get<{ headers: string[]; rows: string[][] }>(
      `/files/${id}/preview${limit ? `?limit=${limit}` : ''}`
    ),
}

// ============================================
// Reconciliations
// ============================================
export const reconciliationsApi = {
  getAll: (params?: {
    page?: number
    size?: number
    sort?: string
    order?: 'asc' | 'desc'
  }) => {
    if (params && (params.page !== undefined || params.size !== undefined)) {
      const queryParams = new URLSearchParams()
      if (params.page !== undefined) queryParams.append('page', params.page.toString())
      if (params.size !== undefined) queryParams.append('size', params.size.toString())
      if (params.sort) queryParams.append('sort', params.sort)
      if (params.order) queryParams.append('order', params.order)
      return get<{
        content: Reconciliation[]
        totalElements: number
        totalPages: number
        size: number
        number: number
      }>(`/reconciliations?${queryParams.toString()}`)
    }
    return get<Reconciliation[]>('/reconciliations')
  },
  getById: (id: number) => get<Reconciliation>(`/reconciliations/${id}`),
  detectDomain: (sourceFileId: number, targetFileId: number) =>
    post<DomainDetectionResult>('/reconciliations/detect-domain', {
      sourceFileId,
      targetFileId,
    }),
  create: (data: CreateReconciliationRequest) =>
    post<Reconciliation>('/reconciliations', data),
  start: (id: number) => post<Reconciliation>(`/reconciliations/${id}/start`),
  cancel: (id: number) => post<Reconciliation>(`/reconciliations/${id}/cancel`),
  delete: (id: number) => del<void>(`/reconciliations/${id}`),
  bulkDelete: (ids: number[]) =>
    del<{
      totalRequested: number
      successCount: number
      failedCount: number
      errors?: string[]
    }>('/reconciliations/bulk', ids),
}

// ============================================
// Exceptions
// ============================================
export const exceptionsApi = {
  getAll: (filters?: ExceptionQueryParams) => {
    const params = new URLSearchParams()
    if (filters?.reconciliationId) params.append('reconciliationId', filters.reconciliationId.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.fromDate) params.append('fromDate', filters.fromDate)
    if (filters?.toDate) params.append('toDate', filters.toDate)
    if (filters?.page !== undefined) params.append('page', filters.page.toString())
    if (filters?.size !== undefined) params.append('size', filters.size.toString())
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortDir) params.append('sortDir', filters.sortDir)
    const queryString = params.toString()
    return get<PaginatedResponse<ReconciliationException> | ReconciliationException[]>(`/exceptions${queryString ? `?${queryString}` : ''}`)
  },
  getRunSummaries: (filters?: Omit<ExceptionQueryParams, 'reconciliationId' | 'page' | 'size' | 'sortBy' | 'sortDir'>) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.fromDate) params.append('fromDate', filters.fromDate)
    if (filters?.toDate) params.append('toDate', filters.toDate)
    const queryString = params.toString()
    return get<ExceptionRunSummary[]>(`/exceptions/runs${queryString ? `?${queryString}` : ''}`)
  },
  getById: (id: number) => get<ReconciliationException>(`/exceptions/${id}`),
  update: (id: number, data: UpdateExceptionRequest) =>
    put<ReconciliationException>(`/exceptions/${id}`, data),
  resolve: (id: number, data: ResolveExceptionRequest) =>
    put<ReconciliationException>(`/exceptions/${id}/resolve`, data),
  ignore: (id: number) => put<ReconciliationException>(`/exceptions/${id}/ignore`),
  bulkResolve: (ids: number[], resolution: string) =>
    post<ReconciliationException[]>('/exceptions/bulk-resolve', { ids, resolution }),
  bulkIgnore: (ids: number[]) =>
    post<ReconciliationException[]>('/exceptions/bulk-ignore', { ids }),
  bulkAutoResolve: (data: AutoResolveExceptionsRequest) =>
    post<AutoResolveExceptionsResponse>('/exceptions/bulk-auto-resolve', data),
}

// ============================================
// Rules
// ============================================
export const rulesApi = {
  // Rule Sets
  getAllRuleSets: () => get<RuleSet[]>('/rules'),
  getRuleSetById: (id: number) => get<RuleSet>(`/rules/${id}`),
  createRuleSet: (data: CreateRuleSetRequest) => post<RuleSet>('/rules', data),
  updateRuleSet: (id: number, data: UpdateRuleSetRequest) =>
    put<RuleSet>(`/rules/${id}`, data),
  deleteRuleSet: (id: number) => del<void>(`/rules/${id}`),
  duplicateRuleSet: (id: number) => post<RuleSet>(`/rules/${id}/duplicate`, {}),

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

  // Test Rule Set
  testRuleSet: (id: number, data: { sampleSize: number }) =>
    post<{
      fieldMappings: Array<{ sourceField: string; targetField: string; success: boolean }>
      matchingRules: Array<{ name: string; matchType: string }>
      stats: { validMappings: number; validRules: number }
    }>(`/rules/${id}/test`, data),
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
  suggestMappings: (sourceFileId: number, targetFileId: number, domain?: KnowledgeDomain) =>
    post<AiMappingSuggestionResult>('/ai/suggest-mappings', {
      sourceFileId,
      targetFileId,
      domain,
    }),
  suggestRules: (
    sourceFileId: number,
    targetFileId: number,
    mappings: AiSuggestedMapping[],
    domain?: KnowledgeDomain
  ) =>
    post<AiRuleSuggestionResult>('/ai/suggest-rules', {
      sourceFileId,
      targetFileId,
      mappings,
      domain,
    }),
  suggestResolution: (exceptionId: number) =>
    post<{ suggestion: string }>(`/ai/suggest-resolution/${exceptionId}`),
}

// ============================================
// Knowledge Base
// ============================================
export const knowledgeApi = {
  // Classify first ~2000 chars of file content into a domain
  detectDomain: (sampleContent: string) =>
    fetchApi<ApiResponse<DomainDetectionResult>>('/knowledge/detect-domain', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: sampleContent,
    }),

  // List all knowledge documents for the current org
  list: () => get<KnowledgeDocument[]>('/knowledge'),

  // Upload and ingest a knowledge file with a given domain
  upload: (file: File, domain: KnowledgeDomain) =>
    uploadFile<KnowledgeDocument>('/knowledge/upload', file, { domain }),

  // Delete a knowledge document and its vectors
  delete: (id: number) => del<void>(`/knowledge/${id}`),
}

// ============================================
// Health
// ============================================
export const healthApi = {
  check: () => get<{ status: string; timestamp: string }>('/health'),
}
