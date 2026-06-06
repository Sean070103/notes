import type { Expense, StorageExpenses } from '@/lib/expenses-context'
import { parseDateKey } from '@/lib/utils'

export type SearchResult = {
  dateKey: string
  expense: Expense
}

export function searchExpenses(
  expenses: StorageExpenses,
  query: string,
  categoryFilter?: string
): SearchResult[] {
  const q = query.trim().toLowerCase()
  const results: SearchResult[] = []

  for (const [dateKey, dayExpenses] of Object.entries(expenses)) {
    for (const expense of dayExpenses) {
      if (categoryFilter && expense.category !== categoryFilter) continue
      if (!q) {
        results.push({ dateKey, expense })
        continue
      }
      const haystack = `${expense.description} ${expense.category} ${expense.amount} ${dateKey}`.toLowerCase()
      if (haystack.includes(q)) {
        results.push({ dateKey, expense })
      }
    }
  }

  return results.sort((a, b) => {
    const da = parseDateKey(a.dateKey).getTime()
    const db = parseDateKey(b.dateKey).getTime()
    return db - da
  })
}
