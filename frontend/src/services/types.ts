// Backend DTO types - matches Java DTOs exactly

// Enums matching backend
export type ReconciliationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
export type ExceptionType =
  | 'MISSING_SOURCE'
  | 'MISSING_TARGET'
  | 'VALUE_MISMATCH'
  | 'DUPLICATE'
  | 'FORMAT_ERROR'
  | 'TOLERANCE_EXCEEDED'
  | 'POTENTIAL_MATCH'
export type ExceptionSeverity = 'CRITICAL' | 'WARNING' | 'INFO'
export type ExceptionStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_REVIEW' | 'RESOLVED' | 'IGNORED'
export type ColumnType = 'STRING' | 'INTEGER' | 'DECIMAL' | 'DATE' | 'BOOLEAN'
export type MatchType = 'EXACT' | 'FUZZY' | 'RANGE' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH'

// Dashboard metrics from DashboardMetricsResponse
export interface DashboardMetrics {
  totalReconciliations: number
  completedReconciliations: number
  pendingReconciliations: number
  failedReconciliations: number
  overallMatchRate: number
  totalExceptions: number
  openExceptions: number
  resolvedExceptions: number
  totalFilesUploaded: number
  totalRuleSets: number
  recentReconciliations: ReconciliationSummary[]
  exceptionsByType: Record<string, number>
  exceptionsBySeverity: Record<string, number>
}

export interface ReconciliationSummary {
  id: number
  name: string
  status: string
  matchRate: number
  exceptionCount: number
  createdAt: string
}

// Reconciliation from ReconciliationResponse
export interface Reconciliation {
  id: number
  name: string
  description: string | null
  status: ReconciliationStatus
  sourceFileId: number | null
  sourceFileName: string | null
  targetFileId: number | null
  targetFileName: string | null
  ruleSetId: number | null
  ruleSetName: string | null
  totalSourceRecords: number | null
  totalTargetRecords: number | null
  matchedRecords: number | null
  unmatchedSourceRecords: number | null
  unmatchedTargetRecords: number | null
  exceptionCount: number | null
  matchRate: number | null
  progress: number | null
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
  results: Record<string, unknown> | null
  statistics: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// Exception from ReconciliationExceptionResponse
export interface ReconciliationException {
  id: number
  type: ExceptionType
  severity: ExceptionSeverity
  status: ExceptionStatus
  description: string | null
  fieldName: string | null
  sourceValue: string | null
  targetValue: string | null
  sourceData: Record<string, unknown> | null
  targetData: Record<string, unknown> | null
  aiSuggestion: string | null
  resolution: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  reconciliationId: number
  reconciliationName: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface ExceptionQueryParams {
  reconciliationId?: number
  status?: string
  type?: string
  severity?: string
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export interface ExceptionRunSummary {
  reconciliationId: number
  reconciliationName: string
  createdAt: string
  openCount: number
  inReviewCount: number
  criticalOpenCount: number
  aiActionableCount: number
  totalInScope: number
}

export interface AutoResolveExceptionsRequest {
  reconciliationId?: number
  status?: ExceptionStatus
  type?: ExceptionType
  severity?: ExceptionSeverity
  fromDate?: string
  toDate?: string
  resolutionTemplate?: string
  resolvedBy?: string
}

export interface AutoResolveExceptionsResponse {
  updatedCount: number
  skippedCount: number
  updatedIds: number[]
  skippedReasonCounts?: Record<string, number>
}

// Uploaded file from UploadedFileResponse
export interface UploadedFile {
  id: number
  filename: string
  originalFilename: string
  contentType: string | null
  fileSize: number
  rowCount: number | null
  columnCount: number | null
  schema: ColumnSchema[] | null
  storagePath: string | null
  status: string
  missing: boolean
  createdAt: string
  updatedAt: string
}

export interface ColumnSchema {
  name: string
  type: ColumnType
  nullable: boolean
  sampleValues: string[]
}

// Rule set from RuleSetResponse
export interface RuleSet {
  id: number
  name: string
  description: string | null
  sourceFileId: number | null
  targetFileId: number | null
  fieldMappings: FieldMapping[]
  matchingRules: MatchingRule[]
  isActive: boolean
  isAiGenerated: boolean | null
  createdAt: string
  updatedAt: string
}

export interface FieldMapping {
  id: number
  sourceField: string
  targetField: string
  isKeyField: boolean
  displayOrder: number
}

export interface MatchingRule {
  id: number
  name: string
  sourceField: string
  targetField: string
  matchType: MatchType
  threshold: number | null
  isActive: boolean
}

// Chat types
export interface ChatSession {
  id: number
  title: string
  messageCount: number
  lastMessageAt: string | null
  createdAt: string
}

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface ChatResponse {
  sessionId: number
  response: string
}

// Request DTOs
export interface CreateReconciliationRequest {
  name: string
  description?: string
  sourceFileId: number
  targetFileId: number
  ruleSetId: number
}

export interface CreateRuleSetRequest {
  name: string
  description?: string
  sourceFileId?: number
  targetFileId?: number
  isAiGenerated?: boolean
}

export interface UpdateRuleSetRequest {
  name: string
  description?: string
  fieldMappings?: CreateFieldMappingRequest[]
  matchingRules?: CreateMatchingRuleRequest[]
}

export interface CreateFieldMappingRequest {
  sourceField: string
  targetField: string
  isKey: boolean
  displayOrder?: number
}

export interface CreateMatchingRuleRequest {
  name: string
  sourceField: string
  targetField: string
  matchType: MatchType
  fuzzyThreshold?: number
  tolerance?: number
  isActive?: boolean
}

export interface ResolveExceptionRequest {
  resolution: string
  resolvedBy?: string
}

export interface UpdateExceptionRequest {
  status?: ExceptionStatus
  resolution?: string
  resolvedBy?: string
}

// AI Suggestion types (matches AiMappingSuggestionResponse and AiRuleSuggestionResponse)
export interface AiSuggestedMapping {
  sourceField: string
  targetField: string
  confidence: number
  reason?: string
  isKey?: boolean
  suggestedTransform?: string
}

export interface AiMappingSuggestionResult {
  mappings: AiSuggestedMapping[]
  explanation?: string
}

export interface AiSuggestedRule {
  name: string
  sourceField: string
  targetField: string
  matchType: MatchType
  isKey?: boolean
  fuzzyThreshold?: number
  tolerance?: number
  priority?: number
  reason?: string
}

export interface AiRuleSuggestionResult {
  rules: AiSuggestedRule[]
  explanation?: string
}

export interface ChatMessageRequest {
  message: string
  context?: Record<string, unknown>
}

// Knowledge Base types
export type KnowledgeDomain =
  | 'BANKING'
  | 'TRADING'
  | 'ACCOUNTS_PAYABLE'
  | 'INVENTORY'
  | 'INTERCOMPANY'
  | 'ECOMMERCE'
  | 'TECHNICAL'
  | 'GENERAL'

export interface KnowledgeDocument {
  id: number
  title: string
  domain: KnowledgeDomain
  fileType: string
  chunkCount: number
  createdByEmail: string | null
  createdAt: string
}

export interface DomainDetectionResult {
  domain: KnowledgeDomain
  confidence: number
}
