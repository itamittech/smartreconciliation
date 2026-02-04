import { test, expect, type Page, type Route } from '@playwright/test'

const now = '2026-02-04T12:00:00Z'

const ok = <T,>(data: T) => ({
  success: true,
  message: null,
  data,
  timestamp: now,
})

const errorPayload = (message: string) => ({
  message,
})

const fulfillOk = async <T,>(route: Route, data: T) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(ok(data)),
  })
}

const fulfillError = async (route: Route, status: number, message: string) => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(errorPayload(message)),
  })
}

const addCatchAll = async (page: Page) => {
  await page.route('**/api/v1/**', (route) => fulfillOk(route, []))
}

const sampleMetrics = {
  totalReconciliations: 12,
  completedReconciliations: 10,
  pendingReconciliations: 2,
  failedReconciliations: 0,
  overallMatchRate: 96.4,
  totalExceptions: 3,
  openExceptions: 2,
  resolvedExceptions: 1,
  totalFilesUploaded: 4,
  totalRuleSets: 2,
  recentReconciliations: [
    {
      id: 1,
      name: 'January Close',
      status: 'COMPLETED',
      matchRate: 98.2,
      exceptionCount: 1,
      createdAt: now,
    },
  ],
  exceptionsByType: {
    MISMATCH: 2,
    MISSING_SOURCE: 1,
  },
  exceptionsBySeverity: {
    CRITICAL: 1,
    WARNING: 2,
  },
}

const sampleFile = {
  id: 1,
  filename: 'transactions.csv',
  originalFilename: 'transactions.csv',
  contentType: 'text/csv',
  fileSize: 1024,
  rowCount: 10,
  columnCount: 4,
  schema: null,
  storagePath: null,
  status: 'PROCESSED',
  createdAt: now,
  updatedAt: now,
}

const sampleRuleSet = {
  id: 7,
  name: 'Bank Match Rules',
  description: 'Monthly bank reconciliation rules',
  sourceFileId: 1,
  targetFileId: 2,
  fieldMappings: [
    {
      id: 11,
      sourceField: 'amount',
      targetField: 'amount',
      isKeyField: true,
      displayOrder: 1,
    },
  ],
  matchingRules: [
    {
      id: 21,
      name: 'Exact Amount Match',
      sourceField: 'amount',
      targetField: 'amount',
      matchType: 'EXACT',
      threshold: null,
      isActive: true,
    },
  ],
  isActive: true,
  createdAt: now,
  updatedAt: now,
}

test('TC-FE-001: Default Navigation Loads Dashboard', async ({ page }) => {
  await page.route('**/api/v1/dashboard/metrics', (route) => fulfillOk(route, sampleMetrics))
  await addCatchAll(page)

  await page.goto('/')

  await expect(page.getByText('Neural Command Center')).toBeVisible()
  await expect(page.getByText('Total Reconciliations')).toBeVisible()
  await expect(page.getByText('Neural Network Offline')).toHaveCount(0)
})

test('TC-FE-002: Sidebar Navigation Switches Pages', async ({ page }) => {
  await page.route('**/api/v1/dashboard/metrics', (route) => fulfillOk(route, sampleMetrics))
  await page.route('**/api/v1/files', (route) => fulfillOk(route, []))
  await page.route('**/api/v1/reconciliations', (route) => fulfillOk(route, []))
  await page.route('**/api/v1/exceptions', (route) => fulfillOk(route, []))
  await page.route('**/api/v1/rules', (route) => fulfillOk(route, []))
  await addCatchAll(page)

  await page.goto('/')

  await page.getByRole('button', { name: 'Files' }).click()
  await expect(page.getByText('Uploaded Files')).toBeVisible()

  await page.getByRole('button', { name: 'Reconciliations' }).click()
  await expect(page.getByText('Reconciliation Matrix')).toBeVisible()

  await page.getByRole('button', { name: 'Exceptions' }).click()
  await expect(page.getByText('Exception Queue')).toBeVisible()
})

test.skip('TC-FE-003: Navigation Preserves Unsaved State (Local)', 'No cross-view state persistence in current UI.')
test.skip('TC-FE-004: Global Error Banner for Failed API Calls', 'Global error banner component not present.')

test('TC-FE-005: Loading Skeletons During Fetch', async ({ page }) => {
  await page.route('**/api/v1/dashboard/metrics', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    await fulfillOk(route, sampleMetrics)
  })
  await addCatchAll(page)

  await page.goto('/')
  await expect(page.getByText('Initializing quantum interface...')).toBeVisible()
})

test('TC-FE-006: Empty State Rendering', async ({ page }) => {
  await page.route('**/api/v1/files', (route) => fulfillOk(route, []))
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Files' }).click()

  await expect(page.getByText('No files uploaded yet. Upload your first file!')).toBeVisible()
})

test('TC-FE-007: Dashboard Metrics Render', async ({ page }) => {
  await page.route('**/api/v1/dashboard/metrics', (route) => fulfillOk(route, sampleMetrics))
  await addCatchAll(page)

  await page.goto('/')

  await expect(page.getByText('Total Reconciliations')).toBeVisible()
  await expect(page.getByText('12')).toBeVisible()
  await expect(page.getByText('10 completed')).toBeVisible()
  await expect(page.getByText('Match Rate')).toBeVisible()
  await expect(page.getByText('96.4%')).toBeVisible()
})

test('TC-FE-008: Files Upload Success', async ({ page }) => {
  const files = [] as typeof sampleFile[]

  await page.route('**/api/v1/files', (route) => fulfillOk(route, files))
  await page.route('**/api/v1/files/upload', async (route) => {
    const uploaded = {
      ...sampleFile,
      id: 22,
      filename: 'upload.csv',
      originalFilename: 'upload.csv',
    }
    files.push(uploaded)
    await fulfillOk(route, uploaded)
  })
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Files' }).click()

  await page.setInputFiles('input[type="file"]', {
    name: 'upload.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('id,amount\n1,100'),
  })

  await expect(page.getByText('upload.csv')).toBeVisible()
})

test('TC-FE-009: Files Preview Modal', async ({ page }) => {
  await page.route('**/api/v1/files', (route) => fulfillOk(route, [sampleFile]))
  await page.route(/.*\/api\/v1\/files\/\d+\/preview.*/, (route) =>
    fulfillOk(route, {
      headers: ['Account', 'Amount'],
      rows: [
        ['A-100', '250.00'],
        ['A-200', '125.00'],
      ],
    })
  )
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Files' }).click()
  await page.getByRole('button', { name: 'Preview file' }).click()

  await expect(page.getByText('File Preview (First 10 rows)')).toBeVisible()
  await expect(page.getByText('Account')).toBeVisible()
  await expect(page.getByText('A-100')).toBeVisible()
})

test('TC-FE-010: Reconciliation Creation Wizard', async ({ page }) => {
  const files = [
    { ...sampleFile, id: 1, originalFilename: 'source.csv' },
    { ...sampleFile, id: 2, originalFilename: 'target.csv' },
  ]
  await page.route('**/api/v1/files', (route) => fulfillOk(route, files))
  await page.route('**/api/v1/rules', (route) => fulfillOk(route, [sampleRuleSet]))
  await page.route('**/api/v1/reconciliations', async (route, request) => {
    if (request.method() === 'POST') {
      await fulfillOk(route, {
        id: 55,
        name: 'February Close',
        description: null,
        status: 'PENDING',
        sourceFileId: 1,
        sourceFileName: 'source.csv',
        targetFileId: 2,
        targetFileName: 'target.csv',
        ruleSetId: 7,
        ruleSetName: 'Bank Match Rules',
        totalSourceRecords: 10,
        totalTargetRecords: 10,
        matchedRecords: 0,
        unmatchedSourceRecords: 0,
        unmatchedTargetRecords: 0,
        exceptionCount: 0,
        matchRate: 0,
        progress: 0,
        errorMessage: null,
        startedAt: null,
        completedAt: null,
        results: null,
        statistics: null,
        createdAt: now,
        updatedAt: now,
      })
      return
    }
    await fulfillOk(route, [])
  })
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Reconciliations' }).click()
  await page.getByRole('button', { name: 'New Reconciliation' }).click()

  await page.getByLabel(/Name/i).fill('February Close')
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByText('source.csv').click()
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByText('target.csv').click()
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByText('Bank Match Rules').click()
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByText('New Reconciliation')).toHaveCount(0)
})

test.skip('TC-FE-011: Reconciliation Status Polling', 'No reconciliation detail view using polling in current UI.')

test('TC-FE-012: Reconciliation Download Action', async ({ page }) => {
  await page.route('**/api/v1/reconciliations', (route) =>
    fulfillOk(route, [
      {
        id: 9,
        name: 'Month End Close',
        description: null,
        status: 'COMPLETED',
        sourceFileId: 1,
        sourceFileName: 'source.csv',
        targetFileId: 2,
        targetFileName: 'target.csv',
        ruleSetId: 7,
        ruleSetName: 'Bank Match Rules',
        totalSourceRecords: 100,
        totalTargetRecords: 100,
        matchedRecords: 98,
        unmatchedSourceRecords: 2,
        unmatchedTargetRecords: 0,
        exceptionCount: 2,
        matchRate: 98,
        progress: 100,
        errorMessage: null,
        startedAt: now,
        completedAt: now,
        results: null,
        statistics: null,
        createdAt: now,
        updatedAt: now,
      },
    ])
  )
  await addCatchAll(page)

  let alertMessage = ''
  page.on('dialog', (dialog) => {
    alertMessage = dialog.message()
    dialog.accept()
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Reconciliations' }).click()
  await page.getByRole('button', { name: 'Download results' }).click()

  expect(alertMessage).toContain('Quantum export for: Month End Close')
})

test('TC-FE-013: Exceptions Filtering', async ({ page }) => {
  const exceptions = [
    {
      id: 1,
      type: 'MISMATCH',
      severity: 'CRITICAL',
      status: 'OPEN',
      description: 'Mismatch on Amount',
      fieldName: 'amount',
      sourceValue: '100',
      targetValue: '90',
      sourceData: null,
      targetData: null,
      aiSuggestion: null,
      resolution: null,
      resolvedBy: null,
      resolvedAt: null,
      reconciliationId: 1,
      reconciliationName: 'January Close',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      type: 'MISSING_SOURCE',
      severity: 'WARNING',
      status: 'OPEN',
      description: 'Missing Source Record',
      fieldName: null,
      sourceValue: null,
      targetValue: null,
      sourceData: null,
      targetData: null,
      aiSuggestion: null,
      resolution: null,
      resolvedBy: null,
      resolvedAt: null,
      reconciliationId: 1,
      reconciliationName: 'January Close',
      createdAt: now,
      updatedAt: now,
    },
  ]

  await page.route(/.*\/api\/v1\/exceptions.*/, async (route, request) => {
    const url = new URL(request.url())
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')
    const severity = url.searchParams.get('severity')

    const filtered = exceptions.filter((ex) => {
      const statusMatch = status ? ex.status === status : true
      const typeMatch = type ? ex.type === type : true
      const severityMatch = severity ? ex.severity === severity : true
      return statusMatch && typeMatch && severityMatch
    })

    await fulfillOk(route, filtered)
  })
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Exceptions' }).click()

  await page.getByLabel('Filter by severity').selectOption('critical')
  await page.getByLabel('Filter by type').selectOption('mismatch')
  await page.getByLabel('Filter by status').selectOption('open')

  await expect(page.getByText('Mismatch on Amount')).toBeVisible()
  await expect(page.getByText('Missing Source Record')).toHaveCount(0)
})

test('TC-FE-014: Exception Resolution Actions', async ({ page }) => {
  let currentStatus: 'OPEN' | 'RESOLVED' = 'OPEN'

  await page.route('**/api/v1/exceptions', (route, request) => {
    if (request.method() !== 'GET') {
      return fulfillOk(route, [])
    }
    return fulfillOk(route, [
      {
        id: 3,
        type: 'MISMATCH',
        severity: 'WARNING',
        status: currentStatus,
        description: 'Amount mismatch in ledger',
        fieldName: 'amount',
        sourceValue: '50',
        targetValue: '45',
        sourceData: null,
        targetData: null,
        aiSuggestion: null,
        resolution: null,
        resolvedBy: null,
        resolvedAt: null,
        reconciliationId: 2,
        reconciliationName: 'February Close',
        createdAt: now,
        updatedAt: now,
      },
    ])
  })
  await page.route(/.*\/api\/v1\/exceptions\/\d+\/resolve/, async (route) => {
    currentStatus = 'RESOLVED'
    await fulfillOk(route, { status: 'RESOLVED' })
  })
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Exceptions' }).click()

  await page.getByRole('button', { name: 'Accept suggestion' }).click()

  await expect(page.getByRole('button', { name: 'Accept suggestion' })).toHaveCount(0)
})

test('TC-FE-015: AI Suggestion Display', async ({ page }) => {
  await page.route('**/api/v1/exceptions', (route) =>
    fulfillOk(route, [
      {
        id: 4,
        type: 'MISSING_TARGET',
        severity: 'INFO',
        status: 'OPEN',
        description: 'Missing target record',
        fieldName: 'amount',
        sourceValue: '70',
        targetValue: null,
        sourceData: null,
        targetData: null,
        aiSuggestion: 'Match to transaction #4432 based on memo',
        resolution: null,
        resolvedBy: null,
        resolvedAt: null,
        reconciliationId: 2,
        reconciliationName: 'February Close',
        createdAt: now,
        updatedAt: now,
      },
    ])
  )
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Exceptions' }).click()

  await expect(page.getByText('AI Suggestion')).toBeVisible()
  await expect(page.getByText('Match to transaction #4432 based on memo')).toBeVisible()
})

test('TC-FE-016: Rules List and Detail View', async ({ page }) => {
  await page.route('**/api/v1/rules', (route) => fulfillOk(route, [sampleRuleSet]))
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Rules' }).click()

  await page.getByText('Bank Match Rules').click()
  await expect(page.getByText('Field Mappings')).toBeVisible()
  await expect(page.getByText('amount')).toBeVisible()
  await expect(page.getByText('Exact Amount Match')).toBeVisible()
})

test('TC-FE-017: Rules Delete Action', async ({ page }) => {
  let ruleSets = [
    { ...sampleRuleSet, id: 1, name: 'Payroll Rules' },
    { ...sampleRuleSet, id: 2, name: 'Bank Match Rules' },
  ]

  await page.route(/.*\/api\/v1\/rules\/\d+/, async (route, request) => {
    if (request.method() === 'DELETE') {
      const url = new URL(request.url())
      const id = Number(url.pathname.split('/').pop())
      ruleSets = ruleSets.filter((rule) => rule.id !== id)
      await fulfillOk(route, {})
      return
    }
    await fulfillOk(route, ruleSets)
  })
  await page.route('**/api/v1/rules', (route) => fulfillOk(route, ruleSets))
  await addCatchAll(page)

  page.on('dialog', (dialog) => dialog.accept())

  await page.goto('/')
  await page.getByRole('button', { name: 'Rules' }).click()
  await page.getByText('Payroll Rules').click()
  await page.getByRole('button', { name: 'Delete' }).click()

  await expect(page.getByText('Payroll Rules')).toHaveCount(0)
})

test('TC-FE-018: Chat Message Send (Sync)', async ({ page }) => {
  await page.route('**/api/v1/chat/message', (route) =>
    fulfillOk(route, { sessionId: 1, response: 'Hello from AI' })
  )
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'AI Chat' }).click()

  await page.getByLabel('Chat message').fill('Hi there')
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.getByText('Hello from AI')).toBeVisible()
})

test('TC-FE-019: Chat File Upload from Chat UI', async ({ page }) => {
  await page.route('**/api/v1/files/upload', (route) =>
    fulfillOk(route, {
      ...sampleFile,
      id: 77,
      originalFilename: 'chat-upload.csv',
    })
  )
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'AI Chat' }).click()

  await page.setInputFiles('input[aria-label="Upload file"]', {
    name: 'chat-upload.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('id,amount\n1,200'),
  })

  await expect(page.getByText('Uploading: chat-upload.csv')).toBeVisible()
  await expect(page.getByText('analyzed successfully')).toBeVisible()
})

test('TC-FE-020: Settings Tabs Render', async ({ page }) => {
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()

  await expect(page.getByText('Profile Settings')).toBeVisible()

  await page.getByRole('button', { name: 'Data Sources' }).click()
  await expect(page.getByText('Data Source Connections')).toBeVisible()

  await page.getByRole('button', { name: 'AI Settings' }).click()
  await expect(page.getByText('AI Configuration')).toBeVisible()

  await page.getByRole('button', { name: 'Notifications' }).click()
  await expect(page.getByText('Notification Preferences')).toBeVisible()

  await page.getByRole('button', { name: 'Security' }).click()
  await expect(page.getByText('Security Settings')).toBeVisible()

  await page.getByRole('button', { name: 'Appearance' }).click()
  await expect(page.getByText('Appearance Settings')).toBeVisible()
})

test('TC-FE-021: Settings Data Source Connection List', async ({ page }) => {
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Data Sources' }).click()

  await expect(page.getByText('Production Database')).toBeVisible()
  await expect(page.getByText('Accounting System API')).toBeVisible()
})

test('TC-FE-022: Settings AI Provider Selection', async ({ page }) => {
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'AI Settings' }).click()

  await page.getByLabel('AI Provider').selectOption('openai')
  await expect(page.getByLabel('AI Provider')).toHaveValue('openai')
  await page.getByRole('button', { name: 'Save AI Settings' }).click()
})

test('TC-FE-023: Hook Error Handling for 404', async ({ page }) => {
  await page.route('**/api/v1/files', (route) => fulfillError(route, 404, 'Not Found'))
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Files' }).click()

  await expect(page.getByText('Failed to load files')).toBeVisible()
  await expect(page.getByText('Not Found')).toBeVisible()
})

test('TC-FE-024: Hook Error Handling for 401/403', async ({ page }) => {
  await page.route('**/api/v1/reconciliations', (route) => fulfillError(route, 403, 'Forbidden'))
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Reconciliations' }).click()

  await expect(page.getByText('Neural Connection Failed')).toBeVisible()
  await expect(page.getByText('Forbidden')).toBeVisible()
})

test.skip('TC-FE-025: File Upload Validation Error', 'Upload validation messaging not implemented in UI.')
test.skip('TC-FE-026: Optimistic UI Update Rollback', 'No optimistic UI updates defined in hooks.')
test.skip('TC-FE-027: Keyboard Navigation in Tables', 'Table keyboard navigation not implemented.')

test('TC-FE-028: Accessible Form Labels', async ({ page }) => {
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()

  await expect(page.getByLabel('First Name')).toBeVisible()
  await expect(page.getByLabel('Last Name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
})

test('TC-FE-029: Responsive Layout (Mobile)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.route('**/api/v1/dashboard/metrics', (route) => fulfillOk(route, sampleMetrics))
  await addCatchAll(page)

  await page.goto('/')

  const hasOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  )
  expect(hasOverflow).toBe(false)
})

test('TC-FE-030: Responsive Layout (Desktop)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.route('**/api/v1/dashboard/metrics', (route) => fulfillOk(route, sampleMetrics))
  await addCatchAll(page)

  await page.goto('/')

  const hasOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  )
  expect(hasOverflow).toBe(false)
})

test('TC-FE-031: Empty State Call-to-Action', async ({ page }) => {
  await page.route('**/api/v1/files', (route) => fulfillOk(route, []))
  await addCatchAll(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Files' }).click()

  await expect(page.getByRole('button', { name: 'Upload File' })).toBeVisible()
})

test.skip('TC-FE-032: Error Retry Button', 'Error retry banner component not implemented.')
