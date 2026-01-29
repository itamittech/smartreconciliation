export type ReconciliationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type ExceptionType = 'missing_source' | 'missing_target' | 'mismatch' | 'duplicate'

export type ExceptionSeverity = 'critical' | 'warning' | 'info'

export type ExceptionStatus = 'open' | 'resolved' | 'ignored'

export interface Reconciliation {
  id: string
  name: string
  status: ReconciliationStatus
  sourceAName: string
  sourceBName: string
  totalRecords: number
  matchedRecords: number
  exceptions: number
  createdAt: string
  completedAt?: string
}

export interface ReconciliationException {
  id: string
  reconciliationId: string
  reconciliationName: string
  type: ExceptionType
  severity: ExceptionSeverity
  status: ExceptionStatus
  sourceRecordId?: string
  targetRecordId?: string
  sourceData?: Record<string, unknown>
  targetData?: Record<string, unknown>
  details: string
  aiSuggestion?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    reconciliationId?: string
    suggestions?: string[]
  }
}

export interface DataSource {
  id: string
  name: string
  type: 'file' | 'database' | 'api'
  status: 'active' | 'inactive' | 'error'
  lastSyncedAt?: string
}

export interface UploadedFile {
  id: string
  filename: string
  fileSize: number
  mimeType: string
  rowCount?: number
  detectedSchema?: ColumnSchema[]
  status: 'pending' | 'analyzed' | 'error'
  uploadedAt: string
}

export interface ColumnSchema {
  name: string
  type: 'string' | 'number' | 'date' | 'currency' | 'identifier'
  nullable: boolean
  sampleValues: string[]
}

export interface DashboardMetrics {
  totalReconciliations: number
  matchRate: number
  pendingExceptions: number
  recentActivity: {
    date: string
    reconciliations: number
    exceptions: number
  }[]
}
