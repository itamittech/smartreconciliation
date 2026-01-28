import { http, HttpResponse } from 'msw';
import {
  mockDashboardMetrics,
  mockFiles,
  mockReconciliations,
  mockExceptions,
  mockRuleSets,
  mockChatSessions,
  mockChatMessages,
} from '../fixtures/data';
import {
  comprehensiveExceptions,
  comprehensiveRuleSets,
  comprehensiveDashboardMetrics,
} from '../fixtures/reconciliation-test-data';

const API_BASE = 'http://localhost:8080/api/v1';

export const handlers = [
  // Health check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      success: true,
      data: { status: 'UP', timestamp: new Date().toISOString() },
    });
  }),

  // Dashboard
  http.get(`${API_BASE}/dashboard/metrics`, () => {
    return HttpResponse.json({
      success: true,
      data: mockDashboardMetrics,
    });
  }),

  // Files
  http.get(`${API_BASE}/files`, () => {
    return HttpResponse.json({
      success: true,
      data: mockFiles,
    });
  }),

  http.get(`${API_BASE}/files/:id`, ({ params }) => {
    const file = mockFiles.find((f) => f.id === params.id);
    if (!file) {
      return HttpResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: file });
  }),

  http.get(`${API_BASE}/files/:id/preview`, ({ params }) => {
    const file = mockFiles.find((f) => f.id === params.id);
    if (!file) {
      return HttpResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: {
        columns: ['id', 'name', 'amount', 'date'],
        rows: [
          ['1', 'Transaction A', '100.00', '2026-01-01'],
          ['2', 'Transaction B', '250.50', '2026-01-02'],
          ['3', 'Transaction C', '75.25', '2026-01-03'],
        ],
      },
    });
  }),

  http.post(`${API_BASE}/files/upload`, async () => {
    const newFile = {
      id: 'file-new-' + Date.now(),
      filename: 'uploaded-file.csv',
      originalFilename: 'uploaded-file.csv',
      filePath: '/uploads/uploaded-file.csv',
      fileSize: 1024,
      mimeType: 'text/csv',
      status: 'PROCESSED',
      rowCount: 100,
      columnCount: 5,
      detectedSchema: [],
      uploadedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newFile }, { status: 201 });
  }),

  http.delete(`${API_BASE}/files/:id`, () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  // Reconciliations
  http.get(`${API_BASE}/reconciliations`, () => {
    return HttpResponse.json({
      success: true,
      data: mockReconciliations,
    });
  }),

  http.get(`${API_BASE}/reconciliations/:id`, ({ params }) => {
    const recon = mockReconciliations.find((r) => r.id === params.id);
    if (!recon) {
      return HttpResponse.json(
        { success: false, error: 'Reconciliation not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: recon });
  }),

  http.post(`${API_BASE}/reconciliations`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newRecon = {
      id: 'recon-new-' + Date.now(),
      name: body.name || 'New Reconciliation',
      description: body.description || '',
      status: 'PENDING',
      sourceFileId: body.sourceFileId,
      targetFileId: body.targetFileId,
      ruleSetId: body.ruleSetId,
      totalSourceRecords: 0,
      totalTargetRecords: 0,
      matchedRecords: 0,
      unmatchedRecords: 0,
      exceptionCount: 0,
      matchRate: 0,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newRecon }, { status: 201 });
  }),

  http.post(`${API_BASE}/reconciliations/:id/start`, ({ params }) => {
    const recon = mockReconciliations.find((r) => r.id === params.id);
    if (!recon) {
      return HttpResponse.json(
        { success: false, error: 'Reconciliation not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...recon, status: 'IN_PROGRESS' },
    });
  }),

  http.post(`${API_BASE}/reconciliations/:id/cancel`, ({ params }) => {
    const recon = mockReconciliations.find((r) => r.id === params.id);
    if (!recon) {
      return HttpResponse.json(
        { success: false, error: 'Reconciliation not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...recon, status: 'FAILED' },
    });
  }),

  http.delete(`${API_BASE}/reconciliations/:id`, () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  // Exceptions
  http.get(`${API_BASE}/exceptions`, ({ request }) => {
    const url = new URL(request.url);
    const severity = url.searchParams.get('severity');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    let filtered = [...mockExceptions];

    if (severity) {
      filtered = filtered.filter((e) => e.severity === severity);
    }
    if (status) {
      filtered = filtered.filter((e) => e.status === status);
    }
    if (type) {
      filtered = filtered.filter((e) => e.type === type);
    }

    return HttpResponse.json({
      success: true,
      data: {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        size: 20,
        number: 0,
      },
    });
  }),

  http.get(`${API_BASE}/exceptions/:id`, ({ params }) => {
    const exception = mockExceptions.find((e) => e.id === params.id);
    if (!exception) {
      return HttpResponse.json(
        { success: false, error: 'Exception not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: exception });
  }),

  http.put(`${API_BASE}/exceptions/:id/resolve`, ({ params }) => {
    const exception = mockExceptions.find((e) => e.id === params.id);
    if (!exception) {
      return HttpResponse.json(
        { success: false, error: 'Exception not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...exception, status: 'RESOLVED' },
    });
  }),

  http.put(`${API_BASE}/exceptions/:id/ignore`, ({ params }) => {
    const exception = mockExceptions.find((e) => e.id === params.id);
    if (!exception) {
      return HttpResponse.json(
        { success: false, error: 'Exception not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...exception, status: 'IGNORED' },
    });
  }),

  http.post(`${API_BASE}/exceptions/bulk-resolve`, async ({ request }) => {
    const body = (await request.json()) as { ids: string[] };
    return HttpResponse.json({
      success: true,
      data: { resolved: body.ids.length },
    });
  }),

  http.post(`${API_BASE}/exceptions/bulk-ignore`, async ({ request }) => {
    const body = (await request.json()) as { ids: string[] };
    return HttpResponse.json({
      success: true,
      data: { ignored: body.ids.length },
    });
  }),

  // Rules
  http.get(`${API_BASE}/rules`, () => {
    return HttpResponse.json({
      success: true,
      data: mockRuleSets,
    });
  }),

  http.get(`${API_BASE}/rules/:id`, ({ params }) => {
    const rule = mockRuleSets.find((r) => r.id === params.id);
    if (!rule) {
      return HttpResponse.json(
        { success: false, error: 'Rule set not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: rule });
  }),

  http.post(`${API_BASE}/rules`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newRule = {
      id: 'rule-new-' + Date.now(),
      name: body.name || 'New Rule Set',
      description: body.description || '',
      fieldMappings: [],
      matchingRules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newRule }, { status: 201 });
  }),

  http.put(`${API_BASE}/rules/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const rule = mockRuleSets.find((r) => r.id === params.id);
    if (!rule) {
      return HttpResponse.json(
        { success: false, error: 'Rule set not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...rule, ...body, updatedAt: new Date().toISOString() },
    });
  }),

  http.delete(`${API_BASE}/rules/:id`, () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  // Chat
  http.get(`${API_BASE}/chat/sessions`, () => {
    return HttpResponse.json({
      success: true,
      data: mockChatSessions,
    });
  }),

  http.post(`${API_BASE}/chat/sessions`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newSession = {
      id: 'session-new-' + Date.now(),
      title: body.title || 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newSession }, { status: 201 });
  }),

  http.get(`${API_BASE}/chat/sessions/:sessionId/messages`, () => {
    return HttpResponse.json({
      success: true,
      data: mockChatMessages,
    });
  }),

  http.post(`${API_BASE}/chat/message`, async ({ request }) => {
    const body = (await request.json()) as { message: string };
    return HttpResponse.json({
      success: true,
      data: {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: `I received your message: "${body.message}". How can I help you further?`,
        timestamp: new Date().toISOString(),
      },
    });
  }),

  // AI suggestions
  http.post(`${API_BASE}/ai/suggest-mappings`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        suggestions: [
          { sourceField: 'id', targetField: 'transaction_id', confidence: 0.95 },
          { sourceField: 'amount', targetField: 'total', confidence: 0.88 },
          { sourceField: 'date', targetField: 'transaction_date', confidence: 0.92 },
        ],
      },
    });
  }),

  http.post(`${API_BASE}/ai/suggest-rules`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        suggestions: [
          {
            name: 'Exact Amount Match',
            matchType: 'EXACT',
            fields: ['amount'],
          },
          {
            name: 'Fuzzy Date Match',
            matchType: 'RANGE',
            fields: ['date'],
            tolerance: { days: 1 },
          },
        ],
      },
    });
  }),

  http.post(`${API_BASE}/ai/suggest-resolution`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        suggestion: 'This exception appears to be a timing difference. The payment was recorded one day later in the target system.',
        confidence: 0.85,
        recommendedAction: 'RESOLVE',
      },
    });
  }),
];
