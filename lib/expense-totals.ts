import type { StorageExpenses } from '@/lib/expenses-context'
import { parseDateKey } from '@/lib/utils'

export function getDailyTotal(expenses: StorageExpenses, dateKey: string): number {
  return (expenses[dateKey] || []).reduce((sum, exp) => sum + exp.amount, 0)
}

export function getMonthlyTotal(expenses: StorageExpenses, year: number, month: number): number {
  let total = 0
  for (const [dateStr, dayExpenses] of Object.entries(expenses)) {
    const expenseDate = parseDateKey(dateStr)
    if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
      total += dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    }
  }
  return total
}

export function getYearlyTotal(expenses: StorageExpenses, year: number): number {
  let total = 0
  for (const [dateStr, dayExpenses] of Object.entries(expenses)) {
    const expenseDate = parseDateKey(dateStr)
    if (expenseDate.getFullYear() === year) {
      total += dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    }
  }
  return total
}
