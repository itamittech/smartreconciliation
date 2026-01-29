// Backend DTO types - matches Java DTOs exactly

// Enums matching backend
export type ReconciliationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
export type ExceptionType = 'MISSING_SOURCE' | 'MISSING_TARGET' | 'MISMATCH' | 'DUPLICATE'
export type ExceptionSeverity = 'CRITICAL' | 'WARNING' | 'INFO'
export type ExceptionStatus = 'OPEN' | 'RESOLVED' | 'IGNORED'
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
}

export interface CreateFieldMappingRequest {
  sourceField: string
  targetField: string
  isKeyField: boolean
  displayOrder?: number
}

export interface CreateMatchingRuleRequest {
  name: string
  sourceField: string
  targetField: string
  matchType: MatchType
  threshold?: number
  isActive?: boolean
}

export interface ResolveExceptionRequest {
  resolution: string
  resolvedBy?: string
}

export interface ChatMessageRequest {
  message: string
  context?: Record<string, unknown>
}
