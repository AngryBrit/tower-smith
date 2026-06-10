import type { EffectivePathsLinkedWorkbook } from '../../../src/effectivePaths/parseIdsMasterWorkbooks'
import { SPREADSHEET_ID_RE } from './effectivePathsHttp'
import { checkSpreadsheetAccess, type SpreadsheetAccess } from './googleSheetsClient'

export type LinkedWorkbookAccess = {
  name: string
  spreadsheetId: string
  access: SpreadsheetAccess
}

function uniqueWorkbooks(
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): EffectivePathsLinkedWorkbook[] {
  const seen = new Set<string>()
  const out: EffectivePathsLinkedWorkbook[] = []
  for (const workbook of workbooks) {
    const key = `${workbook.name}:${workbook.spreadsheetId}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(workbook)
  }
  return out
}

async function probeWorkbookAccess(
  accessToken: string,
  workbook: EffectivePathsLinkedWorkbook,
): Promise<LinkedWorkbookAccess> {
  if (!SPREADSHEET_ID_RE.test(workbook.spreadsheetId)) {
    return { name: workbook.name, spreadsheetId: workbook.spreadsheetId, access: 'not_found' }
  }
  return {
    name: workbook.name,
    spreadsheetId: workbook.spreadsheetId,
    access: await checkSpreadsheetAccess(accessToken, workbook.spreadsheetId),
  }
}

/** Probe Sheets API access for each IDS-linked workbook (after OAuth). */
export async function authorizeLinkedWorkbooks(
  accessToken: string,
  workbooks: readonly EffectivePathsLinkedWorkbook[],
): Promise<LinkedWorkbookAccess[]> {
  const unique = uniqueWorkbooks(workbooks)
  const out: LinkedWorkbookAccess[] = []
  const batchSize = 4
  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize)
    out.push(...(await Promise.all(batch.map((workbook) => probeWorkbookAccess(accessToken, workbook)))))
  }
  return out
}
