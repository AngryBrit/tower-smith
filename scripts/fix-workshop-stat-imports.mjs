import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/data')

for (const f of fs.readdirSync(dataDir).filter((x) => x.startsWith('workshop') && x.endsWith('.ts'))) {
  const p = path.join(dataDir, f)
  let t = fs.readFileSync(p, 'utf8')
  if (!t.includes('workshopToolkitStatValue')) continue
  if (/import\s*\{[^}]*workshopToolkitStatValue[^}]*\}\s*from\s*'\.\.\/workshopCosts'/.test(t)) continue

  const re = /import\s*\{([^}]+)\}\s*from\s*'\.\.\/workshopCosts'/
  if (re.test(t)) {
    t = t.replace(re, (_m, inner) => {
      const names = inner.split(',').map((s) => s.trim()).filter(Boolean)
      if (!names.includes('workshopToolkitStatValue')) names.push('workshopToolkitStatValue')
      return `import { ${names.join(', ')} } from '../workshopCosts'`
    })
  } else {
    const m = t.match(/^(\/\*\*[\s\S]*?\*\/\s*\n|\/\/[^\n]*\n)*/)
    const ins = "import { workshopToolkitStatValue } from '../workshopCosts'\n"
    t = t.slice(0, m[0].length) + ins + t.slice(m[0].length)
  }
  fs.writeFileSync(p, t)
  console.log('import', f)
}
