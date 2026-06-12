import {
  effectivePathsStagingTabTitle,
  isEffectivePathsStagingTabTitle,
  type EffectivePathsStagedSheetRef,
  type EffectivePathsWorkbookAccessContext,
} from '../../../src/effectivePaths/effectivePathsStaging'
import {
  GoogleSheetsApiError,
  sheetsFetch,
  throwIfSheetsAccessDenied,
  type SheetProperties,
} from './googleSheetsClient'

type SpreadsheetMetadata = {
  sheets?: { properties: SheetProperties }[]
}

async function spreadsheetBatchUpdate(
  accessToken: string,
  spreadsheetId: string,
  requests: unknown[],
  accessContext:
    | 'relic_workbook'
    | 'themes_workbook'
    | 'cards_workbook'
    | 'workshop_workbook'
    | 'bots_workbook'
    | 'laboratory_workbook'
    | 'uws_workbook'
    | 'guardians_workbook'
    | 'modules_workbook',
): Promise<void> {
  if (requests.length === 0) return
  const updateRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    },
  )
  throwIfSheetsAccessDenied(updateRes.status, accessContext)
  if (!updateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', updateRes.status, await updateRes.text())
  }
}

async function fetchSpreadsheetSheets(
  accessToken: string,
  spreadsheetId: string,
  accessContext: Parameters<typeof throwIfSheetsAccessDenied>[1],
  options?: { includeGridSize?: boolean },
): Promise<SheetProperties[]> {
  const fields = options?.includeGridSize
    ? 'sheets.properties(sheetId,title,index,gridProperties(rowCount,columnCount))'
    : 'sheets.properties(sheetId,title,index)'
  const metaRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}?fields=${encodeURIComponent(fields)}`,
  )
  throwIfSheetsAccessDenied(metaRes.status, accessContext)
  if (metaRes.status === 404) {
    throw new GoogleSheetsApiError('sheet_not_found', metaRes.status)
  }
  if (!metaRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', metaRes.status, await metaRes.text())
  }
  const meta = (await metaRes.json()) as SpreadsheetMetadata
  return (meta.sheets ?? []).map((sheet) => sheet.properties)
}

function findSheetById(sheets: readonly SheetProperties[], sheetId: number): SheetProperties | null {
  return sheets.find((tab) => tab.sheetId === sheetId) ?? null
}

function findSheetByTitle(sheets: readonly SheetProperties[], title: string): SheetProperties | null {
  return sheets.find((tab) => tab.title === title) ?? null
}

async function deleteSheetsById(
  accessToken: string,
  spreadsheetId: string,
  sheetIds: readonly number[],
  accessContext: Parameters<typeof throwIfSheetsAccessDenied>[1],
): Promise<void> {
  const unique = [...new Set(sheetIds)]
  await spreadsheetBatchUpdate(
    accessToken,
    spreadsheetId,
    unique.map((sheetId) => ({ deleteSheet: { sheetId } })),
    accessContext,
  )
}

/** Remove any leftover preview tab for this original title before creating a new one. */
export async function discardExistingStagingTab(
  accessToken: string,
  spreadsheetId: string,
  originalTitle: string,
  accessContext: Parameters<typeof throwIfSheetsAccessDenied>[1],
): Promise<void> {
  const sheets = await fetchSpreadsheetSheets(accessToken, spreadsheetId, accessContext)
  const stagingTitle = effectivePathsStagingTabTitle(originalTitle)
  const existing = findSheetByTitle(sheets, stagingTitle)
  if (!existing) return
  await deleteSheetsById(accessToken, spreadsheetId, [existing.sheetId], accessContext)
}

export async function duplicateSheetAsStaging(
  accessToken: string,
  spreadsheetId: string,
  sourceSheetId: number,
  sourceTitle: string,
  accessContext: Parameters<typeof throwIfSheetsAccessDenied>[1],
): Promise<EffectivePathsStagedSheetRef> {
  await discardExistingStagingTab(accessToken, spreadsheetId, sourceTitle, accessContext)

  const sheets = await fetchSpreadsheetSheets(accessToken, spreadsheetId, accessContext)
  const source = findSheetById(sheets, sourceSheetId)
  if (!source) {
    throw new GoogleSheetsApiError('sheets_api_error', 400, 'sheet_not_found')
  }

  const stagingTitle = effectivePathsStagingTabTitle(sourceTitle)
  const insertSheetIndex =
    typeof source.index === 'number' ? source.index + 1 : sheets.length

  const duplicateRes = await sheetsFetch(
    accessToken,
    `/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            duplicateSheet: {
              sourceSheetId,
              insertSheetIndex,
              newSheetName: stagingTitle,
            },
          },
        ],
      }),
    },
  )
  throwIfSheetsAccessDenied(duplicateRes.status, accessContext)
  if (!duplicateRes.ok) {
    throw new GoogleSheetsApiError('sheets_api_error', duplicateRes.status, await duplicateRes.text())
  }

  const duplicateBody = (await duplicateRes.json()) as {
    replies?: { duplicateSheet?: { properties?: SheetProperties } }[]
  }
  const stagingSheetId = duplicateBody.replies?.[0]?.duplicateSheet?.properties?.sheetId
  if (stagingSheetId == null) {
    throw new GoogleSheetsApiError('sheets_api_error', 502, 'staging_sheet_create_failed')
  }

  return {
    workbookId: spreadsheetId,
    originalSheetId: sourceSheetId,
    originalTitle: sourceTitle,
    stagingSheetId,
    stagingTitle,
    accessContext,
  }
}

export async function promoteStagedSheets(
  accessToken: string,
  stagedSheets: readonly EffectivePathsStagedSheetRef[],
): Promise<void> {
  const byWorkbook = new Map<string, EffectivePathsStagedSheetRef[]>()
  for (const sheet of stagedSheets) {
    const list = byWorkbook.get(sheet.workbookId) ?? []
    list.push(sheet)
    byWorkbook.set(sheet.workbookId, list)
  }

  for (const [workbookId, sheets] of byWorkbook) {
    const accessContext = sheets[0]?.accessContext ?? 'relic_workbook'
    const workbookTabs = await fetchSpreadsheetSheets(accessToken, workbookId, accessContext, {
      includeGridSize: true,
    })

    const requests: unknown[] = []
    const stagingSheetIds: number[] = []

    for (const sheet of sheets) {
      const original = findSheetById(workbookTabs, sheet.originalSheetId)
      const staging = findSheetById(workbookTabs, sheet.stagingSheetId)
      if (!original) {
        throw new GoogleSheetsApiError('sheets_api_error', 400, 'sheet_not_found')
      }
      if (!staging) {
        throw new GoogleSheetsApiError('sheets_api_error', 400, 'staging_sheet_create_failed')
      }

      const rowCount = Math.max(
        staging.gridProperties?.rowCount ?? 0,
        original.gridProperties?.rowCount ?? 0,
        1,
      )
      const columnCount = Math.max(
        staging.gridProperties?.columnCount ?? 0,
        original.gridProperties?.columnCount ?? 0,
        1,
      )

      // Copy preview onto the original tab so its sheetId (and EP IMPORTRANGE links) stay stable.
      requests.push({
        copyPaste: {
          source: {
            sheetId: sheet.stagingSheetId,
            startRowIndex: 0,
            endRowIndex: rowCount,
            startColumnIndex: 0,
            endColumnIndex: columnCount,
          },
          destination: {
            sheetId: sheet.originalSheetId,
            startRowIndex: 0,
            endRowIndex: rowCount,
            startColumnIndex: 0,
            endColumnIndex: columnCount,
          },
          pasteType: 'PASTE_NORMAL',
          pasteOrientation: 'NORMAL',
        },
      })
      stagingSheetIds.push(sheet.stagingSheetId)
    }

    for (const sheetId of stagingSheetIds) {
      requests.push({ deleteSheet: { sheetId } })
    }

    await spreadsheetBatchUpdate(accessToken, workbookId, requests, accessContext)
  }
}

export async function discardStagedSheets(
  accessToken: string,
  stagedSheets: readonly Pick<
    EffectivePathsStagedSheetRef,
    'workbookId' | 'stagingSheetId' | 'accessContext'
  >[],
): Promise<void> {
  const byWorkbook = new Map<string, { sheetIds: number[]; accessContext: EffectivePathsStagedSheetRef['accessContext'] }>()
  for (const sheet of stagedSheets) {
    const existing = byWorkbook.get(sheet.workbookId)
    const accessContext = sheet.accessContext ?? 'relic_workbook'
    if (existing) {
      existing.sheetIds.push(sheet.stagingSheetId)
    } else {
      byWorkbook.set(sheet.workbookId, { sheetIds: [sheet.stagingSheetId], accessContext })
    }
  }

  for (const [workbookId, { sheetIds, accessContext }] of byWorkbook) {
    await deleteSheetsById(accessToken, workbookId, sheetIds, accessContext)
  }
}

export function filterOutStagingTabs(sheets: readonly SheetProperties[]): SheetProperties[] {
  return sheets.filter((tab) => !isEffectivePathsStagingTabTitle(tab.title))
}
