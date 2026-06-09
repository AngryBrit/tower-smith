/**
 * Scrape obfuscated wiki / workshop tables across click-pagination pages.
 *
 * Presets:
 *   workshop-calculator — https://tower-workshop-calculator.netlify.app/ (Data → Upgrades | Enhancements)
 *   lab-calculator      — https://tower-lab-calculator.netlify.app/ (Cost Tables → lab-select)
 *
 * Usage (from repo root):
 *   npx tsx scripts/scrape-wiki-table.mjs --preset workshop-calculator --upgrade "Attack Speed" output.tsv
 *   npx tsx scripts/scrape-wiki-table.mjs --preset lab-calculator --lab "Damage" output.tsv
 *   npx tsx scripts/scrape-wiki-table.mjs --preset lab-calculator --all-labs ./lab-tables/
 * Lab calculator Cost Tables options (set automatically):
 *   Hide Maxed: off | Use Current Lab Level: off | Include %: off
 *   npx tsx scripts/scrape-wiki-table.mjs --preset workshop-calculator --category defense --upgrade "Health" output.tsv
 *   npx tsx scripts/scrape-wiki-table.mjs --preset workshop-calculator --category attack --all-upgrades ./tables-out/
 *   npx tsx scripts/scrape-wiki-table.mjs --preset workshop-calculator --all-categories --all-upgrades ./tables-out/
 *
 * Options:
 *   --preset <name>       workshop-calculator | lab-calculator
 *   --lab <label>         Cost table name (lab-calculator; select.lab-select)
 *   --all-labs            Scrape every lab-select option (lab-calculator)
 *   --section <name>      Workshop data section: upgrades or enhancements (workshop-calculator; default upgrades)
 *   --category <name>     Workshop tab: attack, defense, or utility (workshop-calculator)
 *   --all-categories      Scrape every category tab (workshop-calculator)
 *   --upgrade <label>     Upgrade name or select value (workshop-calculator preset)
 *   --all-upgrades        Scrape every upgrade in the dropdown (workshop-calculator preset)
 *   --next <selector>     Next-page control (auto-detect if omitted)
 *   --table <selector>    Table selector (default: table)
 *   --max-pages <n>       Safety cap (default: 200)
 *   --wait-ms <n>         Ms to wait after each page turn (default: 800)
 *   --headers <n>         Header rows to skip on pages 2+ (default: 1)
 *   --no-headless         Show the browser window
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import {
  extractWikiTableRowsFromDocument,
  mergeWikiTablePages,
} from '../src/extractVisibleSpanText.ts'

const WORKSHOP_CALCULATOR_URL = 'https://tower-workshop-calculator.netlify.app/'
const LAB_CALCULATOR_URL = 'https://tower-lab-calculator.netlify.app/'
const WORKSHOP_CATEGORIES = ['attack', 'defense', 'utility']
const WORKSHOP_SECTIONS = ['upgrades', 'enhancements']
const WORKSHOP_CALCULATOR_PRESET = {
  url: WORKSHOP_CALCULATOR_URL,
  tableSelector: '.upgrade-table table',
  nextSelector: '.upgrade-table .pagination button:nth-of-type(2)',
  itemSelector: 'select[name="upgrade"]',
  categorySelector: '.upgrade-table .categories button',
}
const LAB_CALCULATOR_PRESET = {
  url: LAB_CALCULATOR_URL,
  tableSelector: '#main .cost-table table, .cost-table table',
  nextSelector: '#main .pagination button:nth-of-type(2), .cost-table .pagination button:nth-of-type(2)',
  itemSelector: 'select.lab-select',
}

function parseArgs(argv) {
  const positional = []
  let preset = ''
  let section = 'upgrades'
  let category = ''
  let allCategories = false
  let upgrade = ''
  let allUpgrades = false
  let lab = ''
  let allLabs = false
  let nextSelector = ''
  let tableSelector = 'table'
  let maxPages = 200
  let waitMs = 800
  let headerRows = 1
  let headless = true

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--preset') {
      preset = argv[++i] ?? ''
    } else if (arg === '--section') {
      section = argv[++i] ?? ''
    } else if (arg === '--category') {
      category = argv[++i] ?? ''
    } else if (arg === '--all-categories') {
      allCategories = true
    } else if (arg === '--upgrade') {
      upgrade = argv[++i] ?? ''
    } else if (arg === '--all-upgrades') {
      allUpgrades = true
    } else if (arg === '--lab') {
      lab = argv[++i] ?? ''
    } else if (arg === '--all-labs') {
      allLabs = true
    } else if (arg === '--next') {
      nextSelector = argv[++i] ?? ''
    } else if (arg === '--table') {
      tableSelector = argv[++i] ?? 'table'
    } else if (arg === '--max-pages') {
      maxPages = Number.parseInt(argv[++i] ?? '200', 10)
    } else if (arg === '--wait-ms') {
      waitMs = Number.parseInt(argv[++i] ?? '800', 10)
    } else if (arg === '--headers') {
      headerRows = Number.parseInt(argv[++i] ?? '1', 10)
    } else if (arg === '--no-headless') {
      headless = false
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`)
      process.exit(1)
    } else {
      positional.push(arg)
    }
  }

  return {
    positional,
    preset,
    section,
    category,
    allCategories,
    upgrade,
    allUpgrades,
    lab,
    allLabs,
    nextSelector,
    tableSelector,
    maxPages,
    waitMs,
    headerRows,
    headless,
  }
}

function applyPreset(name, config) {
  if (name === 'workshop-calculator') {
    return {
      ...config,
      url: config.url || WORKSHOP_CALCULATOR_PRESET.url,
      tableSelector: WORKSHOP_CALCULATOR_PRESET.tableSelector,
      nextSelector: config.nextSelector || WORKSHOP_CALCULATOR_PRESET.nextSelector,
      itemSelector: WORKSHOP_CALCULATOR_PRESET.itemSelector,
      categorySelector: WORKSHOP_CALCULATOR_PRESET.categorySelector,
    }
  }
  if (name === 'lab-calculator') {
    return {
      ...config,
      url: config.url || LAB_CALCULATOR_PRESET.url,
      tableSelector: LAB_CALCULATOR_PRESET.tableSelector,
      nextSelector: config.nextSelector || LAB_CALCULATOR_PRESET.nextSelector,
      itemSelector: LAB_CALCULATOR_PRESET.itemSelector,
    }
  }
  console.error(`Unknown preset: ${name}`)
  process.exit(1)
}

function slugify(name) {
  return name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim()
}

async function setCheckbox(page, selector, checked) {
  const box = page.locator(selector)
  await box.waitFor({ state: 'visible', timeout: 15_000 })
  if (checked) await box.check()
  else await box.uncheck()
}

/** Full cost tables: leave maxed visible, start from level 1, exclude partial-% rows. */
async function configureLabCalculatorCostTableOptions(page) {
  await setCheckbox(page, '#hideMaxed', false)
  await setCheckbox(page, '#from-initial', false)
  await setCheckbox(page, '#include-partial', false)
  await page.waitForTimeout(800)
}

const extractPageFn = extractWikiTableRowsFromDocument
  .toString()
  .replace(/\b__name\([^)]*\)/g, '')

async function extractTableRows(page, tableSelector) {
  return page.evaluate(
    ({ fnSource, selector }) => {
      const extract = new Function('doc', 'sel', `return (${fnSource})(doc, sel)`)
      return extract(document, selector)
    },
    { fnSource: extractPageFn, selector: tableSelector },
  )
}

function rowKey(row) {
  return row.join('\u001f')
}

async function acceptTowerCalculatorTerms(page) {
  if ((await page.locator('#tos').count()) === 0) return

  console.log('Accepting terms of service')
  await page.locator('#agree').check()
  await page.locator('#tos button').waitFor({ state: 'visible' })
  await page.locator('#tos button').click()
  await page.waitForSelector('.nav-bar', { timeout: 60_000 })
}

function normalizeCategory(name) {
  const key = name.trim().toLowerCase()
  if (WORKSHOP_CATEGORIES.includes(key)) return key
  throw new Error(`Unknown category "${name}". Use: ${WORKSHOP_CATEGORIES.join(', ')}`)
}

function normalizeSection(name) {
  const key = name.trim().toLowerCase()
  if (WORKSHOP_SECTIONS.includes(key)) return key
  throw new Error(`Unknown section "${name}". Use: ${WORKSHOP_SECTIONS.join(', ')}`)
}

async function selectWorkshopCategory(page, category) {
  const key = normalizeCategory(category)
  const tab = page.locator(`.upgrade-table .categories button.${key}, .upgrade-table .categories button[value="${WORKSHOP_CATEGORIES.indexOf(key)}"]`).first()
  await tab.waitFor({ state: 'visible', timeout: 15_000 })
  await tab.click()
  await page.waitForTimeout(500)
  return key
}

async function findUpgradeCategory(page, itemSelector, upgrade) {
  for (const category of WORKSHOP_CATEGORIES) {
    await selectWorkshopCategory(page, category)
    const options = await listSelectOptions(page, itemSelector)
    const match = matchSelectOption(options, upgrade)
    if (match) return { category, match }
  }
  return null
}

async function selectWorkshopDataSection(page, section) {
  const key = normalizeSection(section)
  const secondaryNav = page.locator('.nav-bar').nth(1)
  await secondaryNav.waitFor({ state: 'visible', timeout: 15_000 })
  const label = key === 'enhancements' ? 'Enhancements' : 'Upgrades'
  const tab = secondaryNav
    .locator(`button[value="${key === 'enhancements' ? '1' : '0'}"], button:has-text("${label}")`)
    .first()
  await tab.click()
  await page.waitForTimeout(500)
  return key
}

async function openWorkshopCalculatorDataView(page, section = 'upgrades') {
  const dataTab = page.locator('.nav-bar button[value="4"], .nav-bar button:has-text("Data")').first()
  await dataTab.waitFor({ state: 'visible', timeout: 30_000 })
  await dataTab.click()
  await page.locator('.nav-bar').nth(1).waitFor({ state: 'visible', timeout: 30_000 })
  await selectWorkshopDataSection(page, section)
  await page.waitForSelector('select[name="upgrade"]', { timeout: 60_000 })
  await page.waitForSelector('.upgrade-table table', { timeout: 60_000 })
}

async function openLabCalculatorCostTables(page) {
  await page.locator('.nav-bar').first().locator('button').filter({ hasText: /^Cost Tables$/ }).click()
  await page.waitForSelector('select.lab-select', { timeout: 60_000 })
  await configureLabCalculatorCostTableOptions(page)
  await page.waitForSelector('#main .cost-table table, .cost-table table', { timeout: 60_000 })
}

function matchSelectOption(options, query) {
  const q = query.toLowerCase()
  return (
    options.find((o) => o.label.toLowerCase() === q) ??
    options.find((o) => o.value === query) ??
    options.find((o) => o.label.toLowerCase().startsWith(q)) ??
    options.find((o) => o.label.toLowerCase().includes(q))
  )
}

async function listSelectOptions(page, itemSelector) {
  return page.evaluate((selector) => {
    const sel = document.querySelector(selector)
    if (!sel) return []
    return [...sel.options].map((o) => ({ value: o.value, label: o.textContent?.trim() ?? o.value }))
  }, itemSelector)
}

async function selectDropdownOption(page, itemSelector, query) {
  const options = await listSelectOptions(page, itemSelector)
  const match = matchSelectOption(options, query)

  if (!match) {
    throw new Error(
      `Unknown option "${query}". Examples: ${options.slice(0, 8).map((o) => o.label).join(', ')}…`,
    )
  }

  await page.selectOption(itemSelector, match.value)
  await page.waitForTimeout(500)
  return match.label
}

async function listUpgradeOptions(page, itemSelector) {
  return listSelectOptions(page, itemSelector)
}

async function selectUpgrade(page, itemSelector, upgrade) {
  return selectDropdownOption(page, itemSelector, upgrade)
}

async function findNextLocator(page, nextSelector) {
  if (nextSelector) {
    const custom = page.locator(nextSelector).first()
    if ((await custom.count()) > 0) return custom
    console.warn(`Next selector matched nothing (${nextSelector}); trying auto-detect`)
  }

  const candidates = [
    '#main .pagination button:nth-of-type(2)',
    '.cost-table .pagination button:nth-of-type(2)',
    '.upgrade-table .pagination button:nth-of-type(2)',
    '.upgrade-table .pagination button:last-of-type',
    '.upgrade-table .pagination button:has-text("Next")',
    '[rel="next"]',
    'a[aria-label="Next"]',
    'button[aria-label="Next"]',
    '.pagination a.next',
    '.pagination li.next a',
    '.pager .next a',
    '.pager-next a',
    'a.next',
    'button.next',
    'a:has-text("Next")',
    'button:has-text("Next")',
    'a:has-text("›")',
    'a:has-text("»")',
  ]

  for (const sel of candidates) {
    const loc = page.locator(sel).first()
    if ((await loc.count()) === 0) continue
    if (await loc.isDisabled().catch(() => false)) continue
    const cls = (await loc.getAttribute('class')) ?? ''
    if (/\bdisabled\b/i.test(cls)) continue
    const ariaDisabled = await loc.getAttribute('aria-disabled')
    if (ariaDisabled === 'true') continue
    return loc
  }

  return null
}

async function isNextAvailable(page, nextSelector) {
  const next = await findNextLocator(page, nextSelector)
  if (!next) return false
  if (await next.isDisabled().catch(() => false)) return false
  const cls = (await next.getAttribute('class')) ?? ''
  if (/\bdisabled\b/i.test(cls)) return false
  const ariaDisabled = await next.getAttribute('aria-disabled')
  if (ariaDisabled === 'true') return false
  return true
}

async function clickNext(page, nextSelector, tableSelector, previousFirstKey, headerRows) {
  const next = await findNextLocator(page, nextSelector)
  if (!next) return false

  await next.click()
  const changed = await page
    .waitForFunction(
      ({ fnSource, selector, prevKey, skipRows }) => {
        const extract = new Function('doc', 'sel', `return (${fnSource})(doc, sel)`)
        const rows = extract(document, selector)
        const key = (rows[skipRows] ?? rows[0] ?? []).join('\u001f')
        return key.length > 0 && key !== prevKey
      },
      {
        fnSource: extractPageFn,
        selector: tableSelector,
        prevKey: previousFirstKey,
        skipRows: headerRows,
      },
      { timeout: 15_000 },
    )
    .then(() => true)
    .catch(() => false)

  return changed
}

async function scrapePaginatedTable(page, config) {
  const { tableSelector, nextSelector, maxPages, waitMs, headerRows } = config
  const pages = []
  let previousFirstKey = ''

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    await page.waitForTimeout(waitMs)
    const rows = await extractTableRows(page, tableSelector)
    if (rows.length === 0) {
      console.warn(`Page ${pageNum}: no rows found`)
      break
    }

    const firstKey = rowKey(rows[headerRows] ?? rows[0])
    if (pageNum > 1 && firstKey === previousFirstKey) {
      console.warn(`Page ${pageNum}: table unchanged — stopping`)
      break
    }

    pages.push(rows)
    previousFirstKey = firstKey
    console.log(
      `Page ${pageNum}: ${rows.length} rows (first data row: ${rows[headerRows]?.join('\t') ?? rows[0]?.join('\t')})`,
    )

    if (pageNum >= maxPages) break
    if (!(await isNextAvailable(page, nextSelector))) {
      console.log('No next page control — done')
      break
    }

    const clicked = await clickNext(
      page,
      nextSelector,
      tableSelector,
      previousFirstKey,
      headerRows,
    )
    if (!clicked) {
      console.log('Next page did not load new rows — done')
      break
    }
  }

  return mergeWikiTablePages(pages, headerRows)
}

function writeTsv(outputPath, rows) {
  const outDir = path.dirname(outputPath)
  if (outDir && outDir !== '.' && !existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const tsv = rows.map((row) => row.join('\t')).join('\n')
  writeFileSync(outputPath, `${tsv}\n`, 'utf8')
}

function printUsage() {
  console.error(`Usage:
  npx tsx scripts/scrape-wiki-table.mjs --preset lab-calculator --lab "Damage" output.tsv
  npx tsx scripts/scrape-wiki-table.mjs --preset lab-calculator --all-labs ./lab-tables/
  npx tsx scripts/scrape-wiki-table.mjs --preset workshop-calculator --upgrade "Attack Speed" output.tsv
  npx tsx scripts/scrape-wiki-table.mjs --preset workshop-calculator --category attack --all-upgrades ./out/
  npx tsx scripts/scrape-wiki-table.mjs <url> [output.tsv] [options]

Options:
  --preset <name>       workshop-calculator | lab-calculator
  --lab <label>         Cost table / lab name (lab-calculator)
  --all-labs            Scrape every lab-select option (lab-calculator)
  --section <name>      upgrades or enhancements (workshop-calculator; default upgrades)
  --category <name>     attack, defense, or utility (workshop-calculator)
  --all-categories      Scrape all three category tabs (workshop-calculator)
  --upgrade <label>     Upgrade name (workshop-calculator)
  --all-upgrades        Scrape every upgrade dropdown option (workshop-calculator)
  --next <selector>     Next-page button/link
  --table <selector>    Table selector
  --max-pages <n>       Safety cap (default: 200)
  --wait-ms <n>         Delay after page turn (default: 800)
  --headers <n>         Header rows to skip on pages 2+ (default: 1)
  --no-headless         Show browser window`)
}

let args = parseArgs(process.argv.slice(2))

if (args.preset) {
  args = applyPreset(args.preset, args)
}

const url = args.url || args.positional[0] || ''
const outputPath = path.resolve(
  args.preset
    ? (args.positional[0] ??
        (args.allLabs
          ? 'lab-tables'
          : args.allUpgrades
            ? 'workshop-tables'
            : `${slugify(args.lab || args.upgrade || 'wiki-table')}.tsv`))
    : (args.positional[1] ?? (url ? 'wiki-table.tsv' : '')),
)

if (!url && !args.preset) {
  printUsage()
  process.exit(1)
}

const openUrl =
  url ||
  (args.preset === 'lab-calculator' ? LAB_CALCULATOR_URL : WORKSHOP_CALCULATOR_URL)

const browser = await chromium.launch({ headless: args.headless })
const page = await browser.newPage()

try {
  console.log(`Opening ${openUrl}`)
  await page.goto(openUrl, { waitUntil: 'networkidle', timeout: 120_000 })

  if (args.preset === 'workshop-calculator' || args.preset === 'lab-calculator') {
    await acceptTowerCalculatorTerms(page)
  }

  if (args.preset === 'workshop-calculator') {
    await openWorkshopCalculatorDataView(page, args.section || 'upgrades')
  } else if (args.preset === 'lab-calculator') {
    await openLabCalculatorCostTables(page)
  }

  await page.waitForSelector(args.tableSelector, { timeout: 60_000 })

  const jobs = []

  if (args.preset === 'lab-calculator' && args.allLabs && args.itemSelector) {
    const outDir = outputPath || path.resolve('lab-tables')
    const options = await listSelectOptions(page, args.itemSelector)
    for (const opt of options) {
      jobs.push({
        item: opt.label,
        outputPath: path.join(outDir, `${slugify(opt.label)}.tsv`),
      })
    }
  } else if (args.preset === 'lab-calculator' && args.lab && args.itemSelector) {
    jobs.push({
      item: args.lab,
      outputPath: outputPath || path.resolve(`${slugify(args.lab)}.tsv`),
    })
  } else if (args.allUpgrades && args.itemSelector) {
    const categories = args.allCategories
      ? WORKSHOP_CATEGORIES
      : [normalizeCategory(args.category || 'attack')]
    const outDir = outputPath || path.resolve('workshop-tables')
    const sectionDir = normalizeSection(args.section || 'upgrades')

    for (const category of categories) {
      await selectWorkshopCategory(page, category)
      const options = await listSelectOptions(page, args.itemSelector)
      for (const opt of options) {
        jobs.push({
          category,
          upgrade: opt.label,
          outputPath: path.join(outDir, sectionDir, category, `${slugify(opt.label)}.tsv`),
        })
      }
    }
  } else if (args.upgrade && args.itemSelector) {
    let category = args.category ? normalizeCategory(args.category) : null
    if (!category) {
      const found = await findUpgradeCategory(page, args.itemSelector, args.upgrade)
      if (!found) {
        throw new Error(`Unknown upgrade "${args.upgrade}" in attack, defense, or utility`)
      }
      category = found.category
    }
    jobs.push({
      category,
      upgrade: args.upgrade,
      outputPath: outputPath || path.resolve(`${slugify(args.upgrade)}.tsv`),
    })
  } else {
    jobs.push({
      category: args.category ? normalizeCategory(args.category) : 'attack',
      upgrade: '',
      outputPath: outputPath || path.resolve('wiki-table.tsv'),
    })
  }

  for (const job of jobs) {
    if (args.preset === 'workshop-calculator' && job.category) {
      await selectWorkshopCategory(page, job.category)
    }

    if (job.item && args.itemSelector) {
      const label = await selectDropdownOption(page, args.itemSelector, job.item)
      console.log(`\n=== ${job.category ? `${job.category} / ` : ''}${label} ===`)
      job.item = label
      if (args.preset === 'lab-calculator') {
        await configureLabCalculatorCostTableOptions(page)
      }
    } else if (job.upgrade && args.itemSelector) {
      const label = await selectUpgrade(page, args.itemSelector, job.upgrade)
      console.log(`\n=== ${job.category ? `${job.category} / ` : ''}${label} ===`)
      job.upgrade = label
    }

    const merged = await scrapePaginatedTable(page, args)
    if (merged.length === 0) {
      console.error(`No data extracted for ${job.item || job.upgrade || 'table'}`)
      continue
    }

    writeTsv(job.outputPath, merged)
    console.log(`Merged ${merged.length} rows → ${job.outputPath}`)
  }
} finally {
  await browser.close()
}
