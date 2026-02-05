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
})
