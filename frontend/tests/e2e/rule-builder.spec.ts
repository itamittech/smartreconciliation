import { test, expect, type Page, type APIRequestContext } from '@playwright/test'

const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:8080/api/v1'

// Helper functions for test fixtures
const createRuleSet = async (
  api: APIRequestContext,
  name: string,
  description: string | null
) => {
  const response = await api.post(`${API_BASE_URL}/rules`, {
    data: {
      name,
      description,
    },
  })
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  return body.data
}

const createFieldMapping = async (
  api: APIRequestContext,
  ruleSetId: number,
  sourceField: string,
  targetField: string,
  isKeyField: boolean = false
) => {
  const response = await api.post(`${API_BASE_URL}/rules/${ruleSetId}/mappings`, {
    data: {
      sourceField,
      targetField,
      isKeyField,
    },
  })
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  return body.data
}

const createMatchingRule = async (
  api: APIRequestContext,
  ruleSetId: number,
  name: string,
  sourceField: string,
  targetField: string,
  matchType: string = 'EXACT'
) => {
  const response = await api.post(`${API_BASE_URL}/rules/${ruleSetId}/matching-rules`, {
    data: {
      name,
      sourceField,
      targetField,
      matchType,
    },
  })
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  return body.data
}

const deleteRuleSet = async (api: APIRequestContext, id: number) => {
  await api.delete(`${API_BASE_URL}/rules/${id}`)
}

const openRulesPage = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Rules', exact: true }).click()
  await expect(page.getByText('Rule Library')).toBeVisible()
}

test.describe('Rule Builder', () => {
  test('RULE-001: View Rule Library', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()

    // Create 5 rule sets with varied data
    const ruleSets = []
    for (let i = 1; i <= 5; i++) {
      const ruleSet = await createRuleSet(
        api,
        `Test Rule Set ${i} - ${suffix}`,
        `Description for rule set ${i}`
      )

      // Add field mappings
      for (let j = 1; j <= i + 2; j++) {
        await createFieldMapping(
          api,
          ruleSet.id,
          `SourceField${j}`,
          `TargetField${j}`,
          j === 1
        )
      }

      // Add matching rules
      for (let k = 1; k <= i; k++) {
        await createMatchingRule(
          api,
          ruleSet.id,
          `Match Rule ${k}`,
          `SourceField${k}`,
          `TargetField${k}`,
          'EXACT'
        )
      }

      ruleSets.push(ruleSet)
    }

    try {
      // Navigate to Rules page
      await openRulesPage(page)

      // Verify two-panel layout exists
      const ruleLibraryPanel = page.locator('div').filter({ hasText: 'Rule Library' }).first()
      await expect(ruleLibraryPanel).toBeVisible()

      // Verify search input exists
      const searchInput = page.getByPlaceholder('Search rules...')
      await expect(searchInput).toBeVisible()

      // Verify at least 5 rule cards are displayed
      for (let i = 1; i <= 5; i++) {
        await expect(page.getByText(`Test Rule Set ${i} - ${suffix}`)).toBeVisible()
      }

      // Verify each rule card displays key information
      const firstRuleCard = page.locator('div[role="button"]').filter({
        hasText: `Test Rule Set 1 - ${suffix}`
      })
      await expect(firstRuleCard).toBeVisible()

      // Verify mappings count is displayed (should be 3 for first rule)
      await expect(firstRuleCard.getByText('3 mappings')).toBeVisible()

      // Verify matching rules count is displayed (should be 1 for first rule)
      await expect(firstRuleCard.getByText('1 rules')).toBeVisible()

      // Verify description is shown
      await expect(firstRuleCard.getByText('Description for rule set 1')).toBeVisible()

      // Click on a rule to select it
      await firstRuleCard.click()

      // Verify the rule is highlighted/selected
      await expect(firstRuleCard).toHaveAttribute('aria-selected', 'true')

      // Verify right panel shows rule details
      const detailsPanel = page.locator('div.flex-1.overflow-auto').last()
      await expect(detailsPanel.getByRole('heading', { name: `Test Rule Set 1 - ${suffix}` })).toBeVisible()
      await expect(detailsPanel.getByText('Description for rule set 1')).toBeVisible()

      // Verify action buttons are present in details panel
      await expect(detailsPanel.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(detailsPanel.getByRole('button', { name: 'Duplicate' })).toBeVisible()
      await expect(detailsPanel.getByRole('button', { name: 'Delete' })).toBeVisible()

    } finally {
      // Cleanup: delete all created rule sets
      for (const ruleSet of ruleSets) {
        await deleteRuleSet(api, ruleSet.id)
      }
    }
  })

  test('RULE-002: Search Rule Library', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()

    // Create rule sets with varied names for search testing
    const ruleSets = []
    const ruleSetConfigs = [
      { name: `Bank Reconciliation Rules ${suffix}`, description: 'Rules for bank statement reconciliation' },
      { name: `Invoice Processing Rules ${suffix}`, description: 'Rules for invoice data processing' },
      { name: `Payment Matching Rules ${suffix}`, description: 'Rules for payment matching' },
      { name: `General Ledger Rules ${suffix}`, description: 'Rules for general ledger reconciliation' },
      { name: `Vendor Statement Rules ${suffix}`, description: 'Rules for vendor statement matching' },
    ]

    for (const config of ruleSetConfigs) {
      const ruleSet = await createRuleSet(api, config.name, config.description)
      // Add at least one mapping to each
      await createFieldMapping(api, ruleSet.id, 'SourceField1', 'TargetField1', true)
      ruleSets.push(ruleSet)
    }

    try {
      // Navigate to Rules page
      await openRulesPage(page)

      // Locate search input
      const searchInput = page.getByPlaceholder('Search rules...')
      await expect(searchInput).toBeVisible()

      // Verify all rules are initially visible
      for (const config of ruleSetConfigs) {
        await expect(page.getByText(config.name)).toBeVisible()
      }

      // Test search filtering - search for "bank"
      await searchInput.fill('bank')

      // Verify only matching rules are shown
      await expect(page.getByText(`Bank Reconciliation Rules ${suffix}`)).toBeVisible()
      await expect(page.getByText(`Invoice Processing Rules ${suffix}`)).not.toBeVisible()
      await expect(page.getByText(`Payment Matching Rules ${suffix}`)).not.toBeVisible()

      // Test case-insensitive search
      await searchInput.fill('BANK')
      await expect(page.getByText(`Bank Reconciliation Rules ${suffix}`)).toBeVisible()

      // Test search by description
      await searchInput.fill('invoice')
      await expect(page.getByText(`Invoice Processing Rules ${suffix}`)).toBeVisible()
      await expect(page.getByText(`Bank Reconciliation Rules ${suffix}`)).not.toBeVisible()

      // Test no results
      await searchInput.fill('xyz123nonexistent')
      await expect(page.getByText('No matching rules')).toBeVisible()

      // Clear search - verify all rules reappear
      await searchInput.clear()
      for (const config of ruleSetConfigs) {
        await expect(page.getByText(config.name)).toBeVisible()
      }

      // Test partial match
      await searchInput.fill('Rules')
      // Should show all rules since they all contain "Rules" in the name
      for (const config of ruleSetConfigs) {
        await expect(page.getByText(config.name)).toBeVisible()
      }

    } finally {
      // Cleanup: delete all created rule sets
      for (const ruleSet of ruleSets) {
        await deleteRuleSet(api, ruleSet.id)
      }
    }
  })

  test('RULE-003: Select and View Rule Details', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()

    // Create a comprehensive rule set with field mappings and matching rules
    const ruleSet = await createRuleSet(
      api,
      `Comprehensive Test Rules ${suffix}`,
      'Complete rule set for detailed testing'
    )

    // Add multiple field mappings
    await createFieldMapping(api, ruleSet.id, 'TransactionDate', 'Date', true)
    await createFieldMapping(api, ruleSet.id, 'Amount', 'DebitAmount', false)
    await createFieldMapping(api, ruleSet.id, 'Reference', 'ReferenceNumber', false)
    await createFieldMapping(api, ruleSet.id, 'Description', 'TransactionDescription', false)

    // Add multiple matching rules
    await createMatchingRule(api, ruleSet.id, 'Exact ID Match', 'TransactionDate', 'Date', 'EXACT')
    await createMatchingRule(api, ruleSet.id, 'Amount Match', 'Amount', 'DebitAmount', 'EXACT')
    await createMatchingRule(api, ruleSet.id, 'Fuzzy Reference', 'Reference', 'ReferenceNumber', 'FUZZY')

    try {
      // Navigate to Rules page
      await openRulesPage(page)

      // Click on the rule to select it
      const ruleCard = page.locator('div[role="button"]').filter({
        hasText: `Comprehensive Test Rules ${suffix}`
      })
      await expect(ruleCard).toBeVisible()
      await ruleCard.click()

      // Verify rule is selected
      await expect(ruleCard).toHaveAttribute('aria-selected', 'true')

      // Get details panel
      const detailsPanel = page.locator('div.flex-1.overflow-auto').last()

      // Verify Overview section
      await expect(detailsPanel.getByRole('heading', { name: `Comprehensive Test Rules ${suffix}` })).toBeVisible()
      await expect(detailsPanel.getByText('Complete rule set for detailed testing')).toBeVisible()

      // Verify action buttons
      await expect(detailsPanel.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(detailsPanel.getByRole('button', { name: 'Duplicate' })).toBeVisible()
      await expect(detailsPanel.getByRole('button', { name: 'Delete' })).toBeVisible()

      // Verify Field Mappings section
      await expect(detailsPanel.getByRole('heading', { name: 'Field Mappings' })).toBeVisible()

      // Verify specific field mappings are displayed
      await expect(detailsPanel.getByText('TransactionDate').first()).toBeVisible()
      await expect(detailsPanel.getByText('Date').first()).toBeVisible()
      await expect(detailsPanel.getByText('Amount').first()).toBeVisible()
      await expect(detailsPanel.getByText('DebitAmount').first()).toBeVisible()
      await expect(detailsPanel.getByText('Reference').first()).toBeVisible()
      await expect(detailsPanel.getByText('ReferenceNumber').first()).toBeVisible()

      // Verify key field badge is shown for the first mapping
      await expect(detailsPanel.getByText('Key')).toBeVisible()

      // Verify Matching Rules section
      await expect(detailsPanel.getByRole('heading', { name: 'Matching Rules' })).toBeVisible()

      // Verify specific matching rules are displayed
      await expect(detailsPanel.getByText('Exact ID Match')).toBeVisible()
      await expect(detailsPanel.getByText('Amount Match')).toBeVisible()
      await expect(detailsPanel.getByText('Fuzzy Reference')).toBeVisible()

      // Verify match types are shown
      const matchTypeBadges = detailsPanel.locator('text=EXACT')
      await expect(matchTypeBadges.first()).toBeVisible()
      await expect(detailsPanel.getByText('FUZZY').first()).toBeVisible()

      // Verify Summary section with counts
      await expect(detailsPanel.getByRole('heading', { name: 'Summary' })).toBeVisible()
      const summarySection = detailsPanel.locator('text=Summary').locator('..').locator('..')
      await expect(summarySection.getByText('4').first()).toBeVisible() // 4 field mappings
      await expect(summarySection.getByText('3').first()).toBeVisible() // 3 matching rules

    } finally {
      // Cleanup
      await deleteRuleSet(api, ruleSet.id)
    }
  })

  test('RULE-008: Delete Rule Set', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()

    // Create a rule set to delete
    const ruleSet = await createRuleSet(
      api,
      `Delete Test Rule ${suffix}`,
      'Rule set for deletion testing'
    )

    // Add a mapping so it's a valid rule set
    await createFieldMapping(api, ruleSet.id, 'Field1', 'Field2', true)

    // Navigate to Rules page
    await openRulesPage(page)

    // Select the rule
    const ruleCard = page.locator('div[role="button"]').filter({
      hasText: `Delete Test Rule ${suffix}`
    })
    await expect(ruleCard).toBeVisible()
    await ruleCard.click()

    // Get details panel and click delete button
    const detailsPanel = page.locator('div.flex-1.overflow-auto').last()
    const deleteButton = detailsPanel.getByRole('button', { name: 'Delete' })
    await expect(deleteButton).toBeVisible()

    // Set up dialog handler to cancel first
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toContain('Are you sure you want to delete this rule set?')
      await dialog.dismiss()
    })

    await deleteButton.click()

    // Wait a bit to ensure dialog was handled
    await page.waitForTimeout(500)

    // Verify rule still exists after canceling
    await expect(ruleCard).toBeVisible()

    // Now delete for real - set up dialog handler to accept
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      await dialog.accept()
    })

    await deleteButton.click()

    // Wait for the rule to be removed from the list
    await expect(ruleCard).not.toBeVisible({ timeout: 10000 })

    // Verify the rule is no longer in the list
    await expect(page.getByText(`Delete Test Rule ${suffix}`)).not.toBeVisible()

    // Note: No cleanup needed since we deleted the rule in the test
  })

  test('RULE-004: Create New Rule Set (Manual)', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()

    // Navigate to Rules page
    await openRulesPage(page)

    // Click "New" button to open create modal (use first one in the header)
    const newButton = page.getByRole('button', { name: 'New' }).first()
    await expect(newButton).toBeVisible()
    await newButton.click()

    // Verify modal opens
    await expect(page.getByRole('heading', { name: 'Create Rule Set' })).toBeVisible()

    // Fill in basic info
    await page.getByLabel('Rule Set Name *').fill(`Test Create Rule ${suffix}`)
    await page.getByLabel('Description').fill('Created via E2E test')

    // Add field mappings (use first() for field mapping section)
    await page.getByLabel('Source Field').first().fill('TransactionDate')
    await page.getByLabel('Target Field').first().fill('Date')
    await page.getByLabel('Key').check()
    await page.getByRole('button', { name: 'Add field mapping' }).click()

    // Verify mapping was added
    await expect(page.getByText('TransactionDate').first()).toBeVisible()
    await expect(page.getByText('Date').first()).toBeVisible()
    await expect(page.getByText('Key').first()).toBeVisible()

    // Add another field mapping
    await page.getByLabel('Source Field').first().fill('Amount')
    await page.getByLabel('Target Field').first().fill('DebitAmount')
    await page.getByRole('button', { name: 'Add field mapping' }).click()

    // Add matching rule (use nth(1) for matching rule section)
    await page.getByLabel('Rule Name').fill('Exact Date Match')
    await page.getByLabel('Match Type').selectOption('EXACT')
    await page.getByLabel('Source Field').nth(1).fill('TransactionDate')
    await page.getByLabel('Target Field').nth(1).fill('Date')
    await page.getByRole('button', { name: 'Add Matching Rule' }).click()

    // Verify matching rule was added
    await expect(page.getByText('Exact Date Match')).toBeVisible()
    await expect(page.getByText('EXACT').first()).toBeVisible()

    // Submit the form (scroll into view first)
    const submitButton = page.getByRole('button', { name: 'Create Rule Set' })
    await submitButton.scrollIntoViewIfNeeded()
    await submitButton.click()

    // Wait for modal to close and rule to appear in list
    await expect(page.getByRole('heading', { name: 'Create Rule Set' })).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText(`Test Create Rule ${suffix}`).first()).toBeVisible()

    // Verify the rule is auto-selected and shows details
    const detailsPanel = page.locator('div.flex-1.overflow-auto').last()
    await expect(detailsPanel.getByRole('heading', { name: `Test Create Rule ${suffix}` })).toBeVisible()

    // Verify rule details sections are visible
    await expect(detailsPanel.getByRole('heading', { name: 'Field Mappings' })).toBeVisible()
    await expect(detailsPanel.getByRole('heading', { name: 'Matching Rules' })).toBeVisible()

    // Cleanup - find the created rule and delete it
    const response = await api.get(`${API_BASE_URL}/rules`)
    const body = await response.json()
    const createdRule = body.data.find((r: { name: string }) =>
      r.name === `Test Create Rule ${suffix}`
    )
    if (createdRule) {
      await deleteRuleSet(api, createdRule.id)
    }
  })

  test('RULE-007: Duplicate Rule Set', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()

    // Create a rule set to duplicate
    const ruleSet = await createRuleSet(
      api,
      `Original Rule ${suffix}`,
      'Original description for duplication test'
    )

    // Add field mappings
    await createFieldMapping(api, ruleSet.id, 'SourceA', 'TargetA', true)
    await createFieldMapping(api, ruleSet.id, 'SourceB', 'TargetB', false)

    // Add matching rules
    await createMatchingRule(api, ruleSet.id, 'Match Rule 1', 'SourceA', 'TargetA', 'EXACT')
    await createMatchingRule(api, ruleSet.id, 'Match Rule 2', 'SourceB', 'TargetB', 'FUZZY')

    try {
      // Navigate to Rules page
      await openRulesPage(page)

      // Select the original rule
      const originalRuleCard = page.locator('div[role="button"]').filter({
        hasText: `Original Rule ${suffix}`
      })
      await expect(originalRuleCard).toBeVisible()
      await originalRuleCard.click()

      // Test duplicate via API directly
      const duplicateResponse = await api.post(`${API_BASE_URL}/rules/${ruleSet.id}/duplicate`, {})
      if (!duplicateResponse.ok()) {
        const errorBody = await duplicateResponse.text()
        console.log(`Duplicate API failed with status ${duplicateResponse.status()}: ${errorBody}`)
      }
      expect(duplicateResponse.ok()).toBeTruthy()
      const duplicateBody = await duplicateResponse.json()
      const duplicatedRule = duplicateBody.data

      // Navigate back to rules page to see the duplicate
      await openRulesPage(page)

      // Verify duplicate appears in list
      await expect(page.getByText(`Original Rule ${suffix} (Copy)`).first()).toBeVisible()

      // Verify field mappings and matching rules were copied
      expect(duplicatedRule.fieldMappings).toHaveLength(2)
      expect(duplicatedRule.matchingRules).toHaveLength(2)
      expect(duplicatedRule.name).toBe(`Original Rule ${suffix} (Copy)`)
      expect(duplicatedRule.id).not.toBe(ruleSet.id)

      // Cleanup - delete both original and duplicate
      await deleteRuleSet(api, ruleSet.id)
      await deleteRuleSet(api, duplicatedRule.id)
    } catch (error) {
      // Cleanup on error
      const rulesResponse = await api.get(`${API_BASE_URL}/rules`)
      const rulesBody = await rulesResponse.json()
      const rules = rulesBody.data.filter((r: { name: string }) =>
        r.name.includes(`Original Rule ${suffix}`)
      )
      for (const rule of rules) {
        await deleteRuleSet(api, rule.id)
      }
      throw error
    }
  })

  test('RULE-006: Edit Existing Rule Set', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()

    // Create a rule set to edit
    const ruleSet = await createRuleSet(
      api,
      `Editable Rule ${suffix}`,
      'Original description'
    )

    // Add some field mappings and matching rules
    await createFieldMapping(api, ruleSet.id, 'Field1', 'Target1', true)
    await createMatchingRule(api, ruleSet.id, 'Rule1', 'Field1', 'Target1', 'EXACT')

    try {
      // Navigate to Rules page
      await openRulesPage(page)

      // Select the rule
      const ruleCard = page.locator('div[role="button"]').filter({
        hasText: `Editable Rule ${suffix}`
      })
      await expect(ruleCard).toBeVisible()
      await ruleCard.click()

      // Click Edit button
      const detailsPanel = page.locator('div.flex-1.overflow-auto').last()
      const editButton = detailsPanel.getByRole('button', { name: 'Edit' })
      await expect(editButton).toBeVisible()
      await editButton.click()

      // Verify edit modal opens
      await expect(page.getByRole('heading', { name: 'Edit Rule Set' })).toBeVisible()

      // Verify form is pre-filled with current values
      const nameInput = page.getByLabel('Rule Set Name *')
      await expect(nameInput).toHaveValue(`Editable Rule ${suffix}`)
      const descInput = page.getByLabel('Description')
      await expect(descInput).toHaveValue('Original description')

      // Edit the name and description
      await nameInput.fill(`Edited Rule ${suffix}`)
      await descInput.fill('Updated description')

      // Save changes
      await page.getByRole('button', { name: 'Save Changes' }).click()

      // Wait for modal to close
      await expect(page.getByRole('heading', { name: 'Edit Rule Set' })).not.toBeVisible({ timeout: 5000 })

      // Verify changes appear in the details panel
      await expect(detailsPanel.getByRole('heading', { name: `Edited Rule ${suffix}` })).toBeVisible()
      await expect(detailsPanel.getByText('Updated description').first()).toBeVisible()

      // Verify changes appear in the rule card
      await expect(page.getByText(`Edited Rule ${suffix}`).first()).toBeVisible()

      // Verify changes persisted to backend
      const updatedResponse = await api.get(`${API_BASE_URL}/rules/${ruleSet.id}`)
      expect(updatedResponse.ok()).toBeTruthy()
      const updatedBody = await updatedResponse.json()
      expect(updatedBody.data.name).toBe(`Edited Rule ${suffix}`)
      expect(updatedBody.data.description).toBe('Updated description')

      // Cleanup
      await deleteRuleSet(api, ruleSet.id)
    } catch (error) {
      // Cleanup on error
      await deleteRuleSet(api, ruleSet.id)
      throw error
    }
  })

  test('RULE-009: Test Rule Set (Preview)', async ({ page }) => {
    const api = page.request
    const suffix = Date.now()

    // Create a rule set with mappings and rules for testing
    const ruleSet = await createRuleSet(api, `Test Preview Rule ${suffix}`, 'Rule for testing preview')

    // Add field mappings
    await createFieldMapping(api, ruleSet.id, 'Date', 'TransactionDate', true)
    await createFieldMapping(api, ruleSet.id, 'Amount', 'DebitAmount', false)

    // Add matching rules
    await createMatchingRule(api, ruleSet.id, 'Exact Match', 'Date', 'TransactionDate', 'EXACT')
    await createMatchingRule(api, ruleSet.id, 'Fuzzy Match', 'Reference', 'RefNumber', 'FUZZY')

    try {
      // Navigate to Rules page
      await openRulesPage(page)

      // Select the rule set
      await page.getByText(`Test Preview Rule ${suffix}`).first().click()

      // Click "Test Rule" button
      const detailsPanel = page.locator('div.flex-1.overflow-auto').last()
      const testButton = detailsPanel.getByRole('button', { name: 'Test Rule' })
      await expect(testButton).toBeVisible()
      await testButton.click()

      // Verify test modal opens
      const modal = page.locator('[role="dialog"]').last()
      await expect(modal.getByRole('heading', { name: 'Test Rule Set' })).toBeVisible()

      // Verify rule summary is shown
      await expect(modal.getByText(`Test Preview Rule ${suffix}`).first()).toBeVisible()
      await expect(modal.getByText('Field Mappings: 2')).toBeVisible()
      await expect(modal.getByText('Matching Rules: 2')).toBeVisible()

      // Click "Run Test" button
      const runTestButton = page.getByRole('button', { name: 'Run Test' })
      await expect(runTestButton).toBeVisible()
      await runTestButton.click()

      // Wait for test to complete and results to appear
      await expect(modal.getByText('Test Passed')).toBeVisible({ timeout: 10000 })

      // Verify Field Mappings Test section
      await expect(modal.getByRole('heading', { name: 'Field Mappings Test' })).toBeVisible()
      await expect(modal.getByText('Date → TransactionDate')).toBeVisible()
      await expect(modal.getByText('Amount → DebitAmount')).toBeVisible()

      // Verify Matching Rules Test section
      await expect(modal.getByRole('heading', { name: 'Matching Rules Test' })).toBeVisible()
      await expect(modal.getByText('Exact Match')).toBeVisible()
      await expect(modal.getByText('Fuzzy Match')).toBeVisible()

      // Verify Overall Statistics section
      await expect(modal.getByRole('heading', { name: 'Overall Statistics' })).toBeVisible()
      const statsRegion = modal.getByRole('region', { name: 'Test results' })
      await expect(statsRegion.getByText('2').first()).toBeVisible() // Valid Mappings
      await expect(statsRegion.getByText('2').last()).toBeVisible() // Valid Rules

      // Verify "Run Again" button appears
      await expect(modal.getByRole('button', { name: 'Run Again' })).toBeVisible()

      // Close the modal
      await modal.getByRole('button', { name: 'Close', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Test Rule Set' })).not.toBeVisible()

      // Cleanup
      await deleteRuleSet(api, ruleSet.id)
    } catch (error) {
      // Cleanup on error
      await deleteRuleSet(api, ruleSet.id)
      throw error
    }
  })
})
