/**
 * Builds tables/labs/main/enhancement-coin-discount.json from lab calculator screenshots.
 * Marginal time/coins match wiki ladder; marginal gems from screenshot; totals cumulated.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(
  __dirname,
  '..',
  'tables',
  'labs',
  'main',
  'enhancement-coin-discount.json',
)

/** Marginal gems per level (screenshot L1–100). */
const MARGINAL_GEMS = `
175 325 476 627 777 928 1060 1180 1300 1420 1540 1660 1780 1900 2020 2140 2260 2380 2500 2620 2740 2860 2980 3100 3220 3340 3460 3570 3650 3730 3810 3890 3970 4050 4130 4210 4290 4370 4450 4530 4610 4690 4770 4850 4930 5010 5090 5170 5250 5330 5410 5490 5570 5650 5730 5810 5890 5970 6050 6130 6210 6290 6370 6450 6530 6610 6690 6770 6850 6930 7010 7090 7170 7250 7330 7410 7490 7570 7650 7730 7810 7890 7970 8050 8110 8180 8250 8320 8390 8450 8520 8590 8660 8730 8790 8860 8930 9000 9070 9130
`
  .trim()
  .split(/\s+/)
  .map(Number)

const rows = `
1	1d 1h 55m	1.00B	0.30%
2	2d 3h 50m	1.30B	0.60%
3	3d 5h 45m	1.69B	0.90%
4	4d 7h 40m	2.20B	1.20%
5	5d 9h 35m	2.86B	1.50%
6	6d 11h 30m	3.71B	1.80%
7	7d 13h 25m	4.83B	2.10%
8	8d 15h 21m	6.27B	2.40%
9	9d 17h 16m	8.16B	2.70%
10	10d 19h 11m	10.60B	3.00%
11	11d 21h 6m	13.79B	3.30%
12	12d 23h 1m	17.92B	3.60%
13	14d 0h 56m	23.30B	3.90%
14	15d 2h 51m	30.29B	4.20%
15	16d 4h 46m	39.37B	4.50%
16	17d 6h 42m	51.19B	4.80%
17	18d 8h 37m	66.54B	5.10%
18	19d 10h 32m	86.50B	5.40%
19	20d 12h 27m	112.46B	5.70%
20	21d 14h 22m	146.19B	6.00%
21	22d 16h 17m	190.05B	6.30%
22	23d 18h 12m	247.06B	6.60%
23	24d 20h 8m	321.18B	6.90%
24	25d 22h 3m	417.54B	7.20%
25	26d 23h 58m	542.80B	7.50%
26	28d 1h 53m	705.64B	7.80%
27	29d 3h 48m	917.33B	8.10%
28	30d 5h 43m	1.19T	8.40%
29	31d 7h 38m	1.55T	8.70%
30	32d 9h 33m	2.02T	9.00%
31	33d 11h 29m	2.62T	9.30%
32	34d 13h 24m	3.41T	9.60%
33	35d 15h 19m	4.43T	9.90%
34	36d 17h 14m	5.76T	10.20%
35	37d 19h 9m	7.48T	10.50%
36	38d 21h 4m	9.73T	10.80%
37	39d 22h 59m	12.65T	11.10%
38	41d 0h 54m	16.44T	11.40%
39	42d 2h 50m	21.37T	11.70%
40	43d 4h 45m	27.78T	12.00%
41	44d 6h 40m	36.12T	12.30%
42	45d 8h 35m	46.95T	12.60%
43	46d 10h 30m	61.04T	12.90%
44	47d 12h 25m	79.35T	13.20%
45	48d 14h 20m	103.16T	13.50%
46	49d 16h 16m	134.11T	13.80%
47	50d 18h 11m	174.34T	14.10%
48	51d 20h 6m	226.64T	14.40%
49	52d 22h 1m	294.63T	14.70%
50	53d 23h 56m	383.02T	15.00%
51	55d 1h 51m	497.93T	15.30%
52	56d 3h 46m	647.31T	15.60%
53	57d 5h 41m	841.50T	15.90%
54	58d 7h 37m	1.09q	16.20%
55	59d 9h 32m	1.42q	16.50%
56	60d 11h 27m	1.85q	16.80%
57	61d 13h 22m	2.40q	17.10%
58	62d 15h 17m	3.12q	17.40%
59	63d 17h 12m	4.06q	17.70%
60	64d 19h 7m	5.28q	18.00%
61	65d 21h 2m	6.86q	18.30%
62	66d 22h 58m	8.92q	18.60%
63	68d 0h 53m	11.60q	18.90%
64	69d 2h 48m	15.08q	19.20%
65	70d 4h 43m	19.61q	19.50%
66	71d 6h 38m	25.49q	19.80%
67	72d 8h 33m	33.13q	20.10%
68	73d 10h 28m	43.07q	20.40%
69	74d 12h 24m	55.99q	20.70%
70	75d 14h 19m	72.79q	21.00%
71	76d 16h 14m	94.63q	21.30%
72	77d 18h 9m	123.02q	21.60%
73	78d 20h 4m	159.93q	21.90%
74	79d 21h 59m	207.90q	22.20%
75	80d 23h 54m	270.28q	22.50%
76	82d 1h 49m	351.36q	22.80%
77	83d 3h 45m	456.77q	23.10%
78	84d 5h 40m	593.80q	23.40%
79	85d 7h 35m	771.94q	23.70%
80	86d 9h 30m	1.00Q	24.00%
81	87d 11h 25m	1.30Q	24.30%
82	88d 13h 20m	1.70Q	24.60%
83	89d 15h 15m	2.20Q	24.90%
84	90d 17h 10m	2.87Q	25.20%
85	91d 19h 6m	3.73Q	25.50%
86	92d 21h 1m	4.84Q	25.80%
87	93d 22h 56m	6.30Q	26.10%
88	95d 0h 51m	8.19Q	26.40%
89	96d 2h 46m	10.64Q	26.70%
90	97d 4h 41m	13.83Q	27.00%
91	98d 6h 36m	17.98Q	27.30%
92	99d 8h 32m	23.38Q	27.60%
93	100d 10h 27m	30.39Q	27.90%
94	101d 12h 22m	39.51Q	28.20%
95	102d 14h 17m	51.37Q	28.50%
96	103d 16h 12m	66.78Q	28.80%
97	104d 18h 7m	86.81Q	29.10%
98	105d 20h 2m	112.85Q	29.40%
99	106d 21h 57m	146.71Q	29.70%
100	107d 23h 53m	190.72Q	30.00%
`
  .trim()
  .split('\n')

function parseDur(s) {
  const m = /^(\d+)d (\d+)h (\d+)m$/.exec(s.trim())
  if (!m) throw new Error(`bad dur ${s}`)
  return (
    parseInt(m[1], 10) * 86400 +
    parseInt(m[2], 10) * 3600 +
    parseInt(m[3], 10) * 60
  )
}

function wikiDurToDisplay(s) {
  const m = /^(\d+)d (\d+)h (\d+)m$/.exec(s.trim())
  if (!m) throw new Error(`bad dur ${s}`)
  const days = parseInt(m[1], 10)
  const dayLabel = days === 1 ? '1 day' : `${days} days`
  return `${dayLabel}, ${m[2]}h, ${m[3]}m, 0s`
}

function parseAbbrevNum(raw) {
  const s = String(raw).trim().replace(/,/g, '')
  if (/Q$/.test(s)) return Math.round(parseFloat(s) * 1e18)
  if (/q$/.test(s)) return Math.round(parseFloat(s) * 1e15)
  if (/T$/.test(s)) return Math.round(parseFloat(s) * 1e12)
  if (/B$/.test(s)) return Math.round(parseFloat(s) * 1e9)
  if (/K$/.test(s)) return Math.round(parseFloat(s) * 1_000)
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n) : 0
}

function formatAbbrevNum(n) {
  if (n >= 1e18) return `${(n / 1e18).toFixed(2)}Q`
  if (n >= 1e15) return `${(n / 1e15).toFixed(2)}q`
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return String(Math.round(n))
}

function formatDurationFromSeconds(totalSec) {
  let sec = totalSec
  const years = Math.floor(sec / (365 * 86400))
  sec -= years * 365 * 86400
  const days = Math.floor(sec / 86400)
  sec -= days * 86400
  const hours = Math.floor(sec / 3600)
  sec -= hours * 3600
  const mins = Math.floor(sec / 60)
  const secs = sec - mins * 60
  const parts = []
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`)
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`)
  if (hours > 0 || parts.length === 0) parts.push(`${hours}h`)
  if (mins > 0 || (parts.length === 0 && hours === 0)) parts.push(`${mins}m`)
  parts.push(`${secs}s`)
  return parts.join(', ')
}

function parseTimeToSeconds(display) {
  let sec = 0
  const year = display.match(/(\d+)\s*years?/i)
  const day = display.match(/(\d+)\s*days?/i)
  const hour = display.match(/(\d+)h\b/i)
  const min = display.match(/(\d+)m\b/i)
  const secPart = display.match(/(\d+)s\b/i)
  if (year) sec += Number(year[1]) * 365 * 86400
  if (day) sec += Number(day[1]) * 86400
  if (hour) sec += Number(hour[1]) * 3600
  if (min) sec += Number(min[1]) * 60
  if (secPart) sec += Number(secPart[1])
  return sec
}

if (MARGINAL_GEMS.length !== 100) {
  throw new Error(`Expected 100 gem rows, got ${MARGINAL_GEMS.length}`)
}

const levels = []
let totalSec = 0
let totalGems = 0
let totalCoins = 0

for (let i = 0; i < rows.length; i++) {
  const [lv, dur, cost, pct] = rows[i].split('\t')
  const level = parseInt(lv, 10)
  const timeDisplay = wikiDurToDisplay(dur)
  const timeSec = parseDur(dur)
  const coins = parseAbbrevNum(cost)
  const gems = MARGINAL_GEMS[i]
  const value = parseFloat(pct.replace('%', ''))

  totalSec += timeSec
  totalGems += gems
  totalCoins += coins

  const totalTimeDisplay = formatDurationFromSeconds(totalSec)

  levels.push({
    level,
    value,
    time: { display: timeDisplay, seconds: timeSec },
    gems,
    coins,
    totalTime: {
      display: totalTimeDisplay,
      seconds: totalSec,
    },
    totalGems,
    totalCoins: totalCoins,
  })
}

const doc = {
  name: 'Enhancement Attack - Coin Discount',
  maxLevel: 100,
  levels,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n')
console.log('Wrote', outPath, `(${levels.length} levels)`)
console.log('L100 coins', levels[99].coins, 'totalCoins', levels[99].totalCoins)
