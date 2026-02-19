/**
 * End-to-end test: Create Reconciliation via AI Rules wizard
 * Run: npx tsx tests/e2e/reconciliation-e2e.ts  (from frontend/)
 */

import { chromium, type Page } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'http://localhost:5173'
const BANK_CSV = path.resolve(__dirname, 'fixtures/bank-statement.csv')
const LEDGER_CSV = path.resolve(__dirname, 'fixtures/ledger-entries.csv')

async function screenshot(page: Page, name: string) {
  const dir = path.resolve(__dirname, '../../test-results')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`    📸 ${file}`)
}

const log: { step: string; result: string; detail?: string }[] = []
function pass(s: string, detail?: string) { log.push({ step: s, result: '✅ PASS', detail }); console.log(` ✅  ${s}${detail ? ` — ${detail}` : ''}`) }
function fail(s: string, detail?: string) { log.push({ step: s, result: '❌ FAIL', detail }); console.log(` ❌  ${s}${detail ? ` — ${detail}` : ''}`) }

;(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 })
  const page = await browser.newPage()
  page.setDefaultTimeout(30000)

  // Capture browser console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  [browser error] ${msg.text()}`)
  })
  // Log all API calls
  page.on('request', req => {
    if (req.url().includes('localhost:8080')) console.log(`  [req] ${req.method()} ${req.url()}`)
  })
  page.on('response', res => {
    if (res.url().includes('localhost:8080')) console.log(`  [res] ${res.status()} ${res.url()}`)
  })

  try {
    // ── 1. App loads ──────────────────────────────────────────────────────────
    console.log('\n▶ 1. App loads')
    await page.goto(BASE_URL)
    await page.waitForSelector('text=Smart Recon')
    pass('App loads')
    await screenshot(page, '01-home')

    // ── 2. Navigate to Data Sources (= Files page) ────────────────────────────
    console.log('\n▶ 2. Navigate to Data Sources')
    await page.click('text=Data Sources')
    await page.waitForSelector('text=Uploaded Files')
    pass('Data Sources / Files page loads')
    await screenshot(page, '02-files-page')

    // ── 3. Upload source file ─────────────────────────────────────────────────
    console.log('\n▶ 3. Upload bank-statement.csv')
    {
      const [chooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        page.locator('button:has-text("Upload File")').click()
      ])
      await chooser.setFiles(BANK_CSV)
      await page.waitForSelector('text=bank-statement.csv', { timeout: 30000 })
      pass('bank-statement.csv uploaded')
    }
    await screenshot(page, '03-source-uploaded')

    // ── 4. Upload target file ─────────────────────────────────────────────────
    console.log('\n▶ 4. Upload ledger-entries.csv')
    {
      const [chooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        page.locator('button:has-text("Upload File")').click()
      ])
      await chooser.setFiles(LEDGER_CSV)
      await page.waitForSelector('text=ledger-entries.csv', { timeout: 30000 })
      pass('ledger-entries.csv uploaded')
    }
    await screenshot(page, '04-target-uploaded')

    // ── 5. Go to Reconciliations ──────────────────────────────────────────────
    console.log('\n▶ 5. Navigate to Reconciliations')
    await page.click('text=Reconciliations')
    await page.waitForSelector('button:has-text("New Reconciliation")')
    pass('Reconciliations page loads')
    await screenshot(page, '05-reconciliations-page')

    // ── 6. Open wizard ────────────────────────────────────────────────────────
    console.log('\n▶ 6. Open New Reconciliation wizard')
    await page.click('button:has-text("New Reconciliation")')
    await page.waitForSelector('text=New Reconciliation')
    pass('Wizard opens')
    await screenshot(page, '06-wizard-open')

    // ── 7. Step 0 — Details ───────────────────────────────────────────────────
    console.log('\n▶ 7. Fill Details step')
    // Scope to wizard dialog to avoid matching global search bar or pagination Next
    const wizard = page.locator('.fixed.inset-0.z-50').last()
    await wizard.locator('input[placeholder*="Monthly"], input[placeholder*="name"], input[type="text"]').first().fill('E2E Bank vs Ledger Jan 2024')
    const desc = wizard.locator('textarea').first()
    if (await desc.count()) await desc.fill('Automated E2E test reconciliation')
    await wizard.locator('button:has-text("Next")').click()
    pass('Details filled and Next clicked')
    await screenshot(page, '07-details')

    // ── 8. Step 1 — Source file ───────────────────────────────────────────────
    console.log('\n▶ 8. Select source file')
    await wizard.locator('text=bank-statement.csv').first().waitFor({ timeout: 10000 })
    await wizard.locator('text=bank-statement.csv').first().click()
    await page.waitForTimeout(500)
    await wizard.locator('button:has-text("Next")').click()
    pass('bank-statement.csv selected as source')
    await screenshot(page, '08-source-selected')

    // ── 9. Step 2 — Target file ───────────────────────────────────────────────
    console.log('\n▶ 9. Select target file')
    await wizard.locator('text=ledger-entries.csv').first().waitFor({ timeout: 10000 })
    await wizard.locator('text=ledger-entries.csv').first().click()
    await page.waitForTimeout(500)
    await wizard.locator('button:has-text("Next")').click()
    pass('ledger-entries.csv selected as target')
    await screenshot(page, '09-target-selected')

    // ── 10. Step 3 — Click "Analyze with AI" ─────────────────────────────────
    console.log('\n▶ 10. Click Analyze with AI')
    await wizard.locator('button:has-text("Analyze with AI")').waitFor({ timeout: 10000 })
    await wizard.locator('button:has-text("Analyze with AI")').click()
    pass('"Analyze with AI" clicked')

    // ── 11. Wait for mapping suggestions ─────────────────────────────────────
    console.log('\n▶ 11. Wait for AI mapping suggestions (up to 60s)')
    await wizard.locator('text=Review AI-suggested field mappings').waitFor({ timeout: 60000 })
    pass('AI mapping suggestions appeared')
    await screenshot(page, '10-mappings-suggested')

    // ── 12. Accept all mappings → Let AI Suggest Rules ────────────────────────
    console.log('\n▶ 12. Accept all mappings')
    const acceptAllLink = wizard.locator('button:has-text("Accept all")')
    if (await acceptAllLink.count()) {
      await acceptAllLink.click()
      pass('Clicked "Accept all" for mappings')
    } else {
      pass('All mappings appear pre-accepted')
    }
    await screenshot(page, '11-mappings-accepted')

    await wizard.locator('button:has-text("Let AI Suggest Rules")').click()
    pass('"Let AI Suggest Rules" clicked')

    // ── 13. Wait for rule suggestions ────────────────────────────────────────
    console.log('\n▶ 13. Wait for AI rule suggestions (up to 60s)')
    await wizard.locator('text=Review AI-suggested matching rules').waitFor({ timeout: 60000 })
    pass('AI rule suggestions appeared')
    await screenshot(page, '12-rules-suggested')

    // ── 14. Accept all rules → Create Rule Set & Use It ──────────────────────
    console.log('\n▶ 14. Accept all rules and create rule set')
    const acceptAllRules = wizard.locator('button:has-text("Accept all")')
    if (await acceptAllRules.count()) {
      await acceptAllRules.click()
      pass('Clicked "Accept all" for rules')
    } else {
      pass('All rules appear pre-accepted')
    }
    await wizard.locator('button:has-text("Create Rule Set")').click()
    pass('"Create Rule Set & Use It" clicked')

    // ── 15. Wait for "rule set created" confirmation ──────────────────────────
    console.log('\n▶ 15. Wait for rule set created confirmation')
    await wizard.locator('text=Rule set created successfully').waitFor({ timeout: 30000 })
    pass('Rule set created successfully banner shown')
    await screenshot(page, '13-ruleset-created')

    // ── 16. Final Create button ───────────────────────────────────────────────
    console.log('\n▶ 16. Click Create to finish wizard')
    await wizard.locator('button:has-text("Create")').click()
    pass('"Create" button clicked')

    // ── 17. Reconciliation appears in list ────────────────────────────────────
    console.log('\n▶ 17. Reconciliation appears in list')
    await page.waitForSelector('text=E2E Bank vs Ledger Jan 2024', { timeout: 15000 })
    pass('Reconciliation visible in list')
    await screenshot(page, '14-in-list')

    // ── 18. Check status is PENDING ───────────────────────────────────────────
    console.log('\n▶ 18. Check initial status is PENDING (not auto-started)')
    const row = page.locator('tr').filter({ hasText: 'E2E Bank vs Ledger Jan 2024' })
    const statusCell = row.locator('text=PENDING, text=IN_PROGRESS, text=COMPLETED, text=FAILED')
    const statusText = await statusCell.first().textContent().catch(() => 'not found')
    if (statusText?.includes('PENDING')) {
      pass('Status is PENDING — auto-start fix confirmed')
    } else if (statusText?.includes('IN_PROGRESS') || statusText?.includes('COMPLETED')) {
      fail('Status check', `Expected PENDING but got ${statusText} — auto-start may still be active`)
    } else {
      fail('Status check', `Status text: "${statusText}"`)
    }

    // ── 19. Click Start ───────────────────────────────────────────────────────
    console.log('\n▶ 19. Click Start button')
    const startBtn = row.locator('button').filter({ hasText: /start/i })
    if (await startBtn.count()) {
      await startBtn.first().click()
      pass('Start button clicked')
    } else {
      // Maybe there's a play/run icon button — try by aria-label
      const iconStart = row.locator('button[aria-label*="Start"], button[title*="Start"]')
      if (await iconStart.count()) {
        await iconStart.first().click()
        pass('Start button (icon) clicked')
      } else {
        fail('Start button', 'Not found in row — check UI for start affordance')
      }
    }
    await screenshot(page, '15-started')

    // ── 20. Poll until COMPLETED or FAILED ────────────────────────────────────
    console.log('\n▶ 20. Waiting for reconciliation to complete…')
    let finalStatus = 'unknown'
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(5000)
      const badge = row.locator('text=COMPLETED, text=FAILED, text=IN_PROGRESS, text=PENDING').first()
      const txt = await badge.textContent().catch(() => '')
      if (txt) {
        finalStatus = txt
        process.stdout.write(`\r    Status: ${txt.padEnd(15)}`)
        if (txt.includes('COMPLETED') || txt.includes('FAILED')) break
      }
    }
    console.log()
    if (finalStatus.includes('COMPLETED')) {
      pass('Reconciliation completed', `Final status: ${finalStatus}`)
    } else if (finalStatus.includes('FAILED')) {
      fail('Reconciliation completed', `Ended as FAILED`)
    } else {
      fail('Reconciliation completed', `Timed out — final status: ${finalStatus}`)
    }
    await screenshot(page, '16-final-status')

    // ── 21. Open details modal ────────────────────────────────────────────────
    console.log('\n▶ 21. Open details modal')
    // Click the row to open details
    await row.first().click()
    const modal = page.locator('[role="dialog"], .fixed.inset-0').last()
    const modalVisible = await modal.isVisible().catch(() => false)
    if (modalVisible) {
      pass('Details modal opened via row click')
    } else {
      // try eye button
      const eyeBtn = row.locator('button[aria-label*="View"], button[aria-label*="Detail"], button[aria-label*="Preview"]').first()
      if (await eyeBtn.count()) {
        await eyeBtn.click()
        pass('Details modal opened via Eye button')
      } else {
        fail('Details modal', 'Could not open details')
      }
    }
    await screenshot(page, '17-details-modal')

  } catch (err: any) {
    fail('Test execution', err.message)
    await screenshot(page, 'error-state')
  }

  // ── Print summary ──────────────────────────────────────────────────────────
  console.log('\n\n════════════════════════════════════════════════')
  console.log('  END-TO-END TEST RESULTS')
  console.log('════════════════════════════════════════════════')
  for (const e of log) {
    console.log(`${e.result}  ${e.step}${e.detail ? `  →  ${e.detail}` : ''}`)
  }
  const passed = log.filter(l => l.result.includes('PASS')).length
  const failed = log.filter(l => l.result.includes('FAIL')).length
  console.log(`\n  ${passed} passed  /  ${failed} failed  /  ${log.length} total`)
  console.log('════════════════════════════════════════════════\n')
  console.log('Screenshots saved to: frontend/test-results/\n')

  await page.waitForTimeout(4000)
  await browser.close()
})()
