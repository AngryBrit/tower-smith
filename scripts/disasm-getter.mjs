#!/usr/bin/env node
/**
 * Disassemble an il2cpp getter from libil2cpp.so for formula provenance.
 *
 * Usage:
 *   node scripts/disasm-getter.mjs --so "h:/.../libil2cpp.so" --il2cpp "h:/.../il2cpp.json" GetOutOfRoundRecoveryAmount
 *   node scripts/disasm-getter.mjs --so ... --il2cpp ... --address 0x01EA8B7C
 *
 * Requires Python 3 + capstone (`pip install capstone`).
 */

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

function parseArgs(argv) {
  const out = { so: '', il2cpp: '', name: '', address: '', bytes: 256 }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--so') out.so = argv[++i] ?? ''
    else if (a === '--il2cpp') out.il2cpp = argv[++i] ?? ''
    else if (a === '--address') out.address = argv[++i] ?? ''
    else if (a === '--bytes') out.bytes = Number(argv[++i] ?? 256)
    else if (!a.startsWith('-')) out.name = a
  }
  return out
}

const args = parseArgs(process.argv)
if (!args.so) {
  console.error('Missing --so path to libil2cpp.so')
  process.exit(1)
}

let startVa = args.address ? Number(args.address) : NaN
let resolvedName = args.name
let dotNetSig = ''

if (args.il2cpp) {
  const dump = JSON.parse(readFileSync(args.il2cpp, 'utf8'))
  const methods = dump.addresses ?? dump
  const list = Array.isArray(methods) ? methods : Object.values(methods).flat()
  const needle = args.name || ''
  const match = list.find((m) => {
    if (!m || typeof m !== 'object') return false
    if (args.address) return String(m.virtualAddress).toLowerCase() === args.address.toLowerCase()
    const sig = m.dotNetSignature ?? ''
    const nm = m.name ?? ''
    return (
      sig.includes(needle) ||
      nm.includes(needle) ||
      sig === `${needle}()` ||
      sig.endsWith(` ${needle}()`)
    )
  })
  if (match) {
    startVa = Number(match.virtualAddress)
    resolvedName = match.dotNetSignature ?? match.name ?? needle
    dotNetSig = match.dotNetSignature ?? ''
  } else if (!args.address) {
    console.error(`No il2cpp match for: ${needle}`)
    process.exit(1)
  }
}

if (!Number.isFinite(startVa)) {
  console.error('Could not resolve virtual address (pass --address or a resolvable name with --il2cpp)')
  process.exit(1)
}

const py = `
import json, struct, sys
from capstone import Cs, CS_ARCH_ARM64, CS_MODE_ARM

so_path, start, size = sys.argv[1], int(sys.argv[2], 0), int(sys.argv[3])
with open(so_path, 'rb') as f:
    data = f.read()
e_phoff = struct.unpack_from('<Q', data, 0x20)[0]
e_phentsize = struct.unpack_from('<H', data, 0x36)[0]
e_phnum = struct.unpack_from('<H', data, 0x38)[0]
segs = []
for i in range(e_phnum):
    off = e_phoff + i * e_phentsize
    if struct.unpack_from('<I', data, off)[0] != 1:
        continue
    p_offset = struct.unpack_from('<Q', data, off + 0x08)[0]
    p_vaddr = struct.unpack_from('<Q', data, off + 0x10)[0]
    p_filesz = struct.unpack_from('<Q', data, off + 0x20)[0]
    segs.append((p_vaddr, p_offset, p_filesz))

def va_to_off(va):
    for vaddr, offset, filesz in segs:
        if vaddr <= va < vaddr + filesz:
            return offset + (va - vaddr)
    return None

def read_f32(va):
    o = va_to_off(va)
    return struct.unpack_from('<f', data, o)[0] if o else None

def read_f64(va):
    o = va_to_off(va)
    return struct.unpack_from('<d', data, o)[0] if o else None

md = Cs(CS_ARCH_ARM64, CS_MODE_ARM)
off = va_to_off(start)
if off is None:
    print('VA not in load segment', file=sys.stderr)
    sys.exit(2)
code = data[off:off + size]
pending = {}
calls = []
constants = []
for ins in md.disasm(code, start):
    line = f"  {ins.address:#010x}:  {ins.mnemonic:<8} {ins.op_str}"
    if ins.mnemonic == 'adrp':
        try:
            reg = ins.op_str.split(',')[0].strip()
            pending[reg] = int(ins.op_str.split('#')[1], 16)
        except Exception:
            pass
    if ins.mnemonic == 'ldr' and '[' in ins.op_str and '#' in ins.op_str.split('[')[1]:
        try:
            reg = ins.op_str.split('[')[1].split(',')[0].strip()
            disp = int(ins.op_str.split('#')[1].rstrip(']'), 16)
            if reg in pending:
                va = pending[reg] + disp
                f32 = read_f32(va)
                f64 = read_f64(va)
                line += f"   ; [{hex(va)}] f32={f32} f64={f64}"
                constants.append({"hex": hex(va), "f32": f32, "f64": f64, "at": hex(ins.address)})
        except Exception:
            pass
    if ins.mnemonic == 'bl':
        try:
            target = int(ins.op_str.lstrip('#'), 16)
            calls.append({"from": hex(ins.address), "to": hex(target)})
        except Exception:
            pass
    if ins.mnemonic == 'ldr' and '#0x' in ins.op_str and '[' in ins.op_str:
        # struct field offset hints: ldr wN, [xM, #0xNN]
        pass
    print(line)
    if ins.mnemonic == 'ret':
        break
print('--- calls ---', file=sys.stderr)
for c in calls:
    print(json.dumps(c), file=sys.stderr)
print('--- constants ---', file=sys.stderr)
for c in constants:
    print(json.dumps(c), file=sys.stderr)
`

const dir = mkdtempSync(join(tmpdir(), 'disasm-getter-'))
const pyFile = join(dir, 'disasm.py')
writeFileSync(pyFile, py)

console.log(`# ${resolvedName}`)
if (dotNetSig) console.log(`# ${dotNetSig}`)
console.log(`# virtualAddress 0x${startVa.toString(16).toUpperCase()}`)
console.log('')

const run = spawnSync('python', [pyFile, args.so, `0x${startVa.toString(16)}`, String(args.bytes)], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
})

if (run.status !== 0) {
  process.stderr.write(run.stderr)
  console.error(
    '\nDisassembly failed. Install capstone: pip install capstone',
  )
  process.exit(run.status ?? 1)
}

process.stdout.write(run.stdout)
if (run.stderr) process.stderr.write(run.stderr)
