/**
 * Workshop v3.0.1 Master Sheet (clean template).
 * https://docs.google.com/spreadsheets/d/1l3oO3CirBpSU2G_cEn_RpTOrDv-aZgQsMp138V_ctZE/edit?gid=2122117923
 *
 * Upgrades: B=Unlock, C=name, D=farming level, N=max.
 * Enhancements: P=name, R=farming level (Preset 3), W=max on clean sheet.
 */
export function buildWorkshopV301CleanRows(): string[][] {
  const rows = Array.from({ length: 70 }, () => Array<string>(24).fill(''))
  const set = (row: number, col: number, value: string) => {
    rows[row]![col] = value
  }

  set(0, 1, 'Workshop Upgrade')
  set(0, 2, 'Farming')
  set(0, 3, 'Max')
  set(0, 15, 'Preset 3')

  set(2, 2, 'Damage')
  set(2, 3, '0')
  set(2, 13, '6000')
  set(2, 15, 'Damage +')
  set(2, 17, '0')
  set(2, 22, '400')

  set(3, 2, 'Attack Speed')
  set(3, 3, '0')
  set(3, 13, '99')

  set(4, 2, 'Critical Chance')
  set(4, 3, '0')
  set(4, 13, '79')

  set(5, 2, 'Critical Factor')
  set(5, 3, '0')
  set(5, 13, '150')

  set(6, 2, 'Unlock Range (50 ¢)')
  set(6, 3, '0')
  set(6, 13, '79')

  set(7, 2, 'Unlock Range (50 ¢)')
  set(7, 3, '0')
  set(7, 13, '200')

  set(8, 1, 'FALSE')
  set(8, 3, '0')
  set(8, 13, '99')
  set(8, 15, 'Health +')
  set(8, 17, '0')
  set(8, 22, '400')

  set(14, 1, 'FALSE')
  set(14, 3, '0')
  set(14, 13, '60')
  set(14, 15, 'Cash Bonus +')
  set(14, 17, '0')
  set(14, 22, '400')

  set(19, 2, 'Health')
  set(19, 3, '0')
  set(19, 13, '6000')

  set(20, 2, 'Health Regen')
  set(20, 3, '0')
  set(20, 13, '6000')

  return rows
}
