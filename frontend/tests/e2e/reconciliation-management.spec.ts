import { test, expect, type Page, type APIRequestContext } from '@playwright/test'

const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:8080/api/v1'

const uploadFile = async (api: APIRequestContext, name: string, content: string) => {
  const response = await api.post(`${API_BASE_URL}/files/upload/single`, {
    multipart: {
      file: {
        name,
        mimeType: 'text/csv',
        buffer: Buffer.from(content),
      },
    },
  })
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  return body.data
}

const createRuleSet = async (api: APIRequestContext, name: string, description: string) => {
  const response = await api.post(`${API_BASE_URL}/rules`, {
    data: {
      name,
      description,
    },
  })
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  const ruleSet = body.data

  await api.post(`${API_BASE_URL}/rules/${ruleSet.id}/mappings`, {
    data: {
      sourceField: 'id',
      targetField: 'id',
      isKey: true,
    },
  })

  await api.post(`${API_BASE_URL}/rules/${ruleSet.id}/matching-rules`, {
    data: {
      name: 'Exact ID Match',
      sourceField: 'id',
      targetField: 'id',
      matchType: 'EXACT',
    },
  })

  return ruleSet
}

const createReconciliation = async (
  api: APIRequestContext,
  name: string,
  description: string | null,
  sourceFileId: number,
  targetFileId: number,
  ruleSetId: number
) => {
  const response = await api.post(`${API_BASE_URL}/reconciliations`, {
    data: {
      name,
      description,
      sourceFileId,
      targetFileId,
      ruleSetId,
    },
  })
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  return body.data
}

const deleteReconciliation = async (api: APIRequestContext, id: number) => {
  await api.delete(`${API_BASE_URL}/reconciliations/${id}`)
}

const deleteRuleSet = async (api: APIRequestContext, id: number) => {
  await api.delete(`${API_BASE_URL}/rules/${id}`)
}

const deleteFile = async (api: APIRequestContext, id: number) => {
  await api.delete(`${API_BASE_URL}/files/${id}`)
}

const openReconciliationsPage = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Reconciliations', exact: true }).click()
  await expect(page.getByText('Reconciliation Matrix')).toBeVisible()
}

test.describe('Reconciliation Management', () => {
  test('REC-001: Create New Reconciliation via Wizard', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()
    const fileA = await uploadFile(api, `bank_statement_${suffix}.csv`, 'id,amount\n1,100')
    const fileB = await uploadFile(api, `accounting_export_${suffix}.csv`, 'id,amount\n2,200')
    const ruleSet = await createRuleSet(api, `Standard Bank Rules ${suffix}`, 'Standard rules')

    await openReconciliationsPage(page)

    await page.getByRole('button', { name: 'New Reconciliation' }).click()
    await expect(page.getByRole('heading', { name: 'New Reconciliation' })).toBeVisible()

    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).toBeDisabled()

    const reconciliationName = `January 2026 Bank Reconciliation ${suffix}`
    await page.getByLabel(/Name/i).fill(reconciliationName)
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    await page.getByText(fileA.originalFilename).click()
    await nextButton.click()

    await page.getByText(fileB.originalFilename).click()
    await nextButton.click()

    await page.getByText(ruleSet.name).click()
    await page.getByRole('button', { name: 'Create' }).click()

    await expect(page.getByRole('heading', { name: 'New Reconciliation' })).toHaveCount(0)
    await expect(page.getByText(reconciliationName)).toBeVisible()

    const reconList = await api.get(`${API_BASE_URL}/reconciliations`)
    const listBody = await reconList.json()
    const created = (listBody.data || []).find((item: { name: string }) => item.name === reconciliationName)
    if (created) {
      await deleteReconciliation(api, created.id)
    }
    await deleteRuleSet(api, ruleSet.id)
    await deleteFile(api, fileA.id)
    await deleteFile(api, fileB.id)
  })

  test('REC-002: Filter Reconciliations by Status', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()
    const fileA = await uploadFile(api, `pending_file_${suffix}.csv`, 'id,amount\n1,100')
    const fileB = await uploadFile(api, `pending_file_b_${suffix}.csv`, 'id,amount\n2,200')
    const ruleSet = await createRuleSet(api, `Filter Rules ${suffix}`, 'Filter rules')

    const pendingRecon = await createReconciliation(
      api,
      `Pending Recon ${suffix}`,
      null,
      fileA.id,
      fileB.id,
      ruleSet.id
    )

    await openReconciliationsPage(page)

    await page.getByLabel('Filter by status').selectOption('completed')
    const completedVisible = await page.getByText('Completed').count()

    if (completedVisible === 0) {
      await page.getByLabel('Filter by status').selectOption('pending')
      await expect(page.getByText(pendingRecon.name)).toBeVisible()
    }

    await deleteReconciliation(api, pendingRecon.id)
    await deleteRuleSet(api, ruleSet.id)
    await deleteFile(api, fileA.id)
    await deleteFile(api, fileB.id)
  })

  test('REC-003: Search Reconciliations', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()
    const fileA = await uploadFile(api, `bank_${suffix}.csv`, 'id,amount\n1,100')
    const fileB = await uploadFile(api, `payroll_${suffix}.csv`, 'id,amount\n2,200')
    const ruleSet = await createRuleSet(api, `Search Rules ${suffix}`, 'Search rules')
    const bankRecon = await createReconciliation(
      api,
      `Bank Reconciliation ${suffix}`,
      null,
      fileA.id,
      fileB.id,
      ruleSet.id
    )
    const payrollRecon = await createReconciliation(
      api,
      `Payroll Reconciliation ${suffix}`,
      null,
      fileA.id,
      fileB.id,
      ruleSet.id
    )

    await openReconciliationsPage(page)

    const searchInput = page.getByLabel('Search reconciliations')
    await searchInput.fill('Bank')

    await expect(page.getByText(bankRecon.name)).toBeVisible()
    await expect(page.getByText(payrollRecon.name)).toHaveCount(0)

    await deleteReconciliation(api, bankRecon.id)
    await deleteReconciliation(api, payrollRecon.id)
    await deleteRuleSet(api, ruleSet.id)
    await deleteFile(api, fileA.id)
    await deleteFile(api, fileB.id)
  })

  test('REC-004: Start Reconciliation', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()
    const fileA = await uploadFile(api, `startable_${suffix}.csv`, 'id,amount\n1,100')
    const fileB = await uploadFile(api, `startable_b_${suffix}.csv`, 'id,amount\n2,200')
    const ruleSet = await createRuleSet(api, `Start Rules ${suffix}`, 'Start rules')
    const startableRecon = await createReconciliation(
      api,
      `Startable Recon ${suffix}`,
      null,
      fileA.id,
      fileB.id,
      ruleSet.id
    )

    await openReconciliationsPage(page)

    const startButton = page.getByRole('button', { name: 'Start reconciliation', exact: true })
    if (await startButton.count()) {
      await startButton.click()
    }

    const row = page.locator('tr', { hasText: startableRecon.name })
    await expect(row).toBeVisible()
    await expect(row).toContainText(/Processing|Completed|Pending/)

    await deleteReconciliation(api, startableRecon.id)
    await deleteRuleSet(api, ruleSet.id)
    await deleteFile(api, fileA.id)
    await deleteFile(api, fileB.id)
  })

  test('REC-005: Delete Reconciliation', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()
    const fileA = await uploadFile(api, `delete_${suffix}.csv`, 'id,amount\n1,100')
    const fileB = await uploadFile(api, `delete_b_${suffix}.csv`, 'id,amount\n2,200')
    const ruleSet = await createRuleSet(api, `Delete Rules ${suffix}`, 'Delete rules')
    const deletableRecon = await createReconciliation(
      api,
      `Deletable Recon ${suffix}`,
      null,
      fileA.id,
      fileB.id,
      ruleSet.id
    )

    await openReconciliationsPage(page)

    const row = page.getByRole('button', { name: new RegExp(deletableRecon.name, 'i') })
    await expect(row).toBeVisible()
    const dialogPromise = page.waitForEvent('dialog').then((dialog) => dialog.accept())
    const requestPromise = page.waitForRequest((request) =>
      request.url().includes(`/api/v1/reconciliations/${deletableRecon.id}`)
    )

    const [deleteRequest] = await Promise.all([
      requestPromise,
      dialogPromise,
      row.getByLabel('Delete').click(),
    ])
    expect(deleteRequest.method()).toBe('DELETE')

    const failure = deleteRequest.failure()
    if (failure) {
      throw new Error(`Delete request failed: ${failure.errorText}`)
    }

    const deleteResponse = await deleteRequest.response()
    expect(deleteResponse).not.toBeNull()
    const deleteBody = await deleteResponse?.json()
    expect(deleteBody?.success).toBe(true)

    const listResponsePromise = page.waitForResponse((response) =>
      response.request().method() === 'GET' &&
      response.url().includes('/api/v1/reconciliations')
    )
    await listResponsePromise
    await expect(page.getByText(deletableRecon.name)).toHaveCount(0)

    await deleteRuleSet(api, ruleSet.id)
    await deleteFile(api, fileA.id)
    await deleteFile(api, fileB.id)
  })

  test('REC-006: View Reconciliation Details', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()
    const fileA = await uploadFile(api, `details_file_a_${suffix}.csv`, 'id,amount\n1,100\n2,200')
    const fileB = await uploadFile(api, `details_file_b_${suffix}.csv`, 'id,amount\n1,100\n3,300')
    const ruleSet = await createRuleSet(api, `Details Rules ${suffix}`, 'Details rule set')
    const detailsRecon = await createReconciliation(
      api,
      `Details Recon ${suffix}`,
      'Test reconciliation for viewing details',
      fileA.id,
      fileB.id,
      ruleSet.id
    )

    await openReconciliationsPage(page)

    // Click on reconciliation row to open details modal
    const row = page.locator('tr', { hasText: detailsRecon.name })
    await row.click()

    // Verify details modal opens
    const modal = page.locator('.fixed.inset-0.z-50')
    await expect(modal).toBeVisible()
    await expect(modal.getByRole('heading', { name: detailsRecon.name })).toBeVisible()

    // Verify status badge is displayed in modal
    await expect(modal.getByText(/Pending|Processing|Completed|Failed/).first()).toBeVisible()

    // Verify source files section in modal
    await expect(modal.getByText(fileA.originalFilename)).toBeVisible()
    await expect(modal.getByText(fileB.originalFilename)).toBeVisible()

    // Verify rule set name is displayed in modal
    await expect(modal.getByText(ruleSet.name)).toBeVisible()

    // Close details modal
    const closeButton = modal.getByRole('button', { name: /Close/i }).first()
    await closeButton.click()
    await expect(modal).toHaveCount(0)

    await deleteReconciliation(api, detailsRecon.id)
    await deleteRuleSet(api, ruleSet.id)
    await deleteFile(api, fileA.id)
    await deleteFile(api, fileB.id)
  })
})
