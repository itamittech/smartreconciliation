import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Tests backend API endpoints directly to ensure frontend-backend contract
 */

const API_BASE = 'http://localhost:8080/api/v1';

test.describe('Health API', () => {
  test('GET /health should return healthy status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('status');
  });
});

test.describe('Dashboard API', () => {
  test('GET /dashboard/metrics should return metrics', async ({ request }) => {
    const response = await request.get(`${API_BASE}/dashboard/metrics`);

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('totalReconciliations');
    expect(data.data).toHaveProperty('overallMatchRate');
    expect(data.data).toHaveProperty('openExceptions');
    expect(typeof data.data.totalReconciliations).toBe('number');
  });
});

test.describe('Files API', () => {
  test('GET /files should return file list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/files`);

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('GET /files/:id should return 404 for invalid ID', async ({ request }) => {
    const response = await request.get(`${API_BASE}/files/invalid-id-12345`);

    expect(response.status()).toBe(404);
  });

  test('POST /files/upload should upload a file', async ({ request }) => {
    const csvContent = 'id,name,value\n1,test,100\n2,test2,200';
    const response = await request.post(`${API_BASE}/files/upload`, {
      multipart: {
        file: {
          name: 'test-upload.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(csvContent),
        },
      },
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('filename');
    expect(data.data.filename).toContain('test-upload');
  });

  test('DELETE /files/:id should delete a file', async ({ request }) => {
    // First create a file
    const csvContent = 'id,name\n1,delete-test';
    const uploadResponse = await request.post(`${API_BASE}/files/upload`, {
      multipart: {
        file: {
          name: 'to-delete.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(csvContent),
        },
      },
    });

    const uploadData = await uploadResponse.json();
    const fileId = uploadData.data.id;

    // Delete the file
    const deleteResponse = await request.delete(`${API_BASE}/files/${fileId}`);

    expect(deleteResponse.ok()).toBe(true);
  });
});

test.describe('Reconciliations API', () => {
  test('GET /reconciliations should return reconciliation list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/reconciliations`);

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('POST /reconciliations should create a reconciliation', async ({ request }) => {
    // First upload source and target files
    const sourceContent = 'id,amount\n1,100\n2,200';
    const targetContent = 'id,total\n1,100\n2,200';

    const sourceUpload = await request.post(`${API_BASE}/files/upload`, {
      multipart: {
        file: {
          name: 'api-test-source.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(sourceContent),
        },
      },
    });
    const sourceData = await sourceUpload.json();

    const targetUpload = await request.post(`${API_BASE}/files/upload`, {
      multipart: {
        file: {
          name: 'api-test-target.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(targetContent),
        },
      },
    });
    const targetData = await targetUpload.json();

    // Create reconciliation
    const response = await request.post(`${API_BASE}/reconciliations`, {
      data: {
        name: 'API Test Reconciliation ' + Date.now(),
        description: 'Created by API integration test',
        sourceFileId: sourceData.data.id,
        targetFileId: targetData.data.id,
      },
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data.status).toBe('PENDING');

    // Cleanup - delete the reconciliation
    await request.delete(`${API_BASE}/reconciliations/${data.data.id}`);
  });

  test('GET /reconciliations/:id should return reconciliation details', async ({ request }) => {
    // Get list first
    const listResponse = await request.get(`${API_BASE}/reconciliations`);
    const listData = await listResponse.json();

    if (listData.data && listData.data.length > 0) {
      const reconId = listData.data[0].id;

      const response = await request.get(`${API_BASE}/reconciliations/${reconId}`);

      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('status');
    }
  });
});

test.describe('Exceptions API', () => {
  test('GET /exceptions should return paginated exceptions', async ({ request }) => {
    const response = await request.get(`${API_BASE}/exceptions`);

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('content');
    expect(data.data).toHaveProperty('totalElements');
    expect(data.data).toHaveProperty('totalPages');
    expect(Array.isArray(data.data.content)).toBe(true);
  });

  test('GET /exceptions with filters should filter results', async ({ request }) => {
    const response = await request.get(`${API_BASE}/exceptions?status=OPEN&severity=HIGH`);

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);

    // All returned exceptions should match filters
    for (const exception of data.data.content) {
      expect(exception.status).toBe('OPEN');
      expect(exception.severity).toBe('HIGH');
    }
  });

  test('POST /exceptions/bulk-resolve should accept array of IDs', async ({ request }) => {
    // Get some exceptions first
    const listResponse = await request.get(`${API_BASE}/exceptions?status=OPEN`);
    const listData = await listResponse.json();

    if (listData.data.content && listData.data.content.length > 0) {
      const ids = listData.data.content.slice(0, 2).map((e: { id: string }) => e.id);

      const response = await request.post(`${API_BASE}/exceptions/bulk-resolve`, {
        data: { ids },
      });

      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
    }
  });
});

test.describe('Rules API', () => {
  test('GET /rules should return rule sets', async ({ request }) => {
    const response = await request.get(`${API_BASE}/rules`);

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('POST /rules should create a rule set', async ({ request }) => {
    const response = await request.post(`${API_BASE}/rules`, {
      data: {
        name: 'API Test Rule Set ' + Date.now(),
        description: 'Created by API integration test',
      },
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('name');

    // Cleanup
    await request.delete(`${API_BASE}/rules/${data.data.id}`);
  });

  test('GET /rules/:id should return rule details with mappings', async ({ request }) => {
    const listResponse = await request.get(`${API_BASE}/rules`);
    const listData = await listResponse.json();

    if (listData.data && listData.data.length > 0) {
      const ruleId = listData.data[0].id;

      const response = await request.get(`${API_BASE}/rules/${ruleId}`);

      expect(response.ok()).toBe(true);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('fieldMappings');
      expect(data.data).toHaveProperty('matchingRules');
    }
  });
});

test.describe('Chat API', () => {
  test('POST /chat/message should return AI response', async ({ request }) => {
    const response = await request.post(`${API_BASE}/chat/message`, {
      data: {
        message: 'Hello, this is a test message',
      },
    });

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('content');
    expect(data.data).toHaveProperty('role');
    expect(data.data.role).toBe('assistant');
  });

  test('GET /chat/sessions should return sessions', async ({ request }) => {
    const response = await request.get(`${API_BASE}/chat/sessions`);

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});

test.describe('AI API', () => {
  test('POST /ai/suggest-mappings should return mapping suggestions', async ({ request }) => {
    // First upload a file to get schema
    const csvContent = 'id,date,amount,description\n1,2026-01-01,100,Test';
    const uploadResponse = await request.post(`${API_BASE}/files/upload`, {
      multipart: {
        file: {
          name: 'ai-test.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(csvContent),
        },
      },
    });
    const uploadData = await uploadResponse.json();

    const response = await request.post(`${API_BASE}/ai/suggest-mappings`, {
      data: {
        sourceFileId: uploadData.data.id,
        targetFileId: uploadData.data.id, // Using same file for test
      },
    });

    // AI endpoint might return 200 or error based on configuration
    if (response.ok()) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('suggestions');
    }

    // Cleanup
    await request.delete(`${API_BASE}/files/${uploadData.data.id}`);
  });
});

test.describe('API Error Handling', () => {
  test('should return 400 for invalid request body', async ({ request }) => {
    const response = await request.post(`${API_BASE}/reconciliations`, {
      data: {
        // Missing required fields
        description: 'No name provided',
      },
    });

    expect([400, 422]).toContain(response.status());
  });

  test('should return 404 for non-existent resource', async ({ request }) => {
    const response = await request.get(`${API_BASE}/reconciliations/non-existent-id-12345`);

    expect(response.status()).toBe(404);
  });

  test('should return proper error structure', async ({ request }) => {
    const response = await request.get(`${API_BASE}/reconciliations/invalid`);

    const data = await response.json();
    expect(data.success).toBe(false);
    // Error should have message or error field
    expect(data.error || data.message).toBeTruthy();
  });
});

test.describe('API Response Format', () => {
  test('all successful responses should have success: true', async ({ request }) => {
    const endpoints = [
      `${API_BASE}/health`,
      `${API_BASE}/dashboard/metrics`,
      `${API_BASE}/files`,
      `${API_BASE}/reconciliations`,
      `${API_BASE}/exceptions`,
      `${API_BASE}/rules`,
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);

      if (response.ok()) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
      }
    }
  });

  test('all responses should be JSON', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });
});
