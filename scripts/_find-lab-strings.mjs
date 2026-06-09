const res = await fetch('https://tower-workshop-calculator.netlify.app/static/js/main.cbe71c97.js')
const text = await res.text()
for (const s of ['lab-select', 'cost-table', 'Game Speed', 'Workshop Attack Discount', '#main', 'jory-fool']) {
  console.log(s, text.includes(s))
}
