import type { StorageExpenses } from '@/lib/expenses-context'
import { parseDateKey } from '@/lib/utils'

export function exportExpensesToCsv(
  expenses: StorageExpenses,
  year: number,
  month?: number
): void {
  const rows: string[][] = [['Date', 'Amount', 'Category', 'Description']]

  for (const [dateStr, dayExpenses] of Object.entries(expenses)) {
    const d = parseDateKey(dateStr)
    if (d.getFullYear() !== year) continue
    if (month !== undefined && d.getMonth() !== month) continue
    for (const exp of dayExpenses) {
      rows.push([
        dateStr,
        exp.amount.toFixed(2),
        exp.category,
        exp.description.replace(/"/g, '""'),
      ])
    }
  }

  rows.sort((a, b) => (a[0] > b[0] ? 1 : -1))

  const csv = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')

  const label =
    month !== undefined
      ? `${year}-${String(month + 1).padStart(2, '0')}`
      : String(year)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `expenses-${label}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
