'use client'

import { useState } from 'react'
import { useExpenses } from '@/lib/expenses-context'
import { formatDateKey, parseDateKey } from '@/lib/utils'

export function StatsView() {
  const { allExpenses: expenses } = useExpenses()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  /** Weeks as day ranges inside the month only: 1-7, 8-14, 15-21, 22-last. No March in February view. */
  const getWeeksInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const lastDate = new Date(year, month + 1, 0).getDate()
    const weeks: Array<{ start: Date; end: Date; total: number }> = []
    const ranges: Array<{ startDay: number; endDay: number }> = [
      { startDay: 1, endDay: 7 },
      { startDay: 8, endDay: 14 },
      { startDay: 15, endDay: 21 },
      { startDay: 22, endDay: lastDate },
    ]
    for (const { startDay, endDay } of ranges) {
      const weekStart = new Date(year, month, startDay)
      const weekEnd = new Date(year, month, endDay)
      let weekTotal = 0
      for (let d = startDay; d <= endDay; d++) {
        const dateStr = formatDateKey(new Date(year, month, d))
        const dayExpenses = expenses[dateStr] || []
        weekTotal += dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      }
      weeks.push({ start: weekStart, end: weekEnd, total: weekTotal })
    }
    return weeks
  }

  const getMonthlyTotal = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    let total = 0
    
    for (const [dateStr, dayExpenses] of Object.entries(expenses)) {
      const expenseDate = parseDateKey(dateStr)
      if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
        total += dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      }
    }
    
    return total
  }

  const getCategoryBreakdown = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const categories: { [key: string]: number } = {}
    
    for (const [dateStr, dayExpenses] of Object.entries(expenses)) {
      const expenseDate = parseDateKey(dateStr)
      if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
        dayExpenses.forEach((exp) => {
          categories[exp.category] = (categories[exp.category] || 0) + exp.amount
        })
      }
    }
    
    return Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const weeks = getWeeksInMonth(currentMonth)
  const monthlyTotal = getMonthlyTotal(currentMonth)
  const categoryBreakdown = getCategoryBreakdown(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-card rounded-lg p-4 xs:p-5 sm:p-6 border border-border">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <button
            type="button"
            onClick={prevMonth}
            className="min-h-[44px] px-3 xs:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs xs:text-sm hover:opacity-90 shrink-0"
          >
            ← PREV
          </button>
          <h2 className="text-base xs:text-xl sm:text-2xl font-bold text-primary text-center truncate">{monthName}</h2>
          <button
            type="button"
            onClick={nextMonth}
            className="min-h-[44px] px-3 xs:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs xs:text-sm hover:opacity-90 shrink-0"
          >
            NEXT →
          </button>
        </div>

        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4 xs:p-5 sm:p-6 border border-primary/30">
          <p className="text-xs xs:text-sm font-bold text-muted-foreground mb-1 xs:mb-2">MONTHLY TOTAL</p>
          <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-primary break-all">₱{monthlyTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 xs:p-5 sm:p-6 border border-border">
        <h3 className="text-base xs:text-lg font-bold text-primary mb-3 xs:mb-4">WEEKLY BREAKDOWN</h3>
        <div className="space-y-2 sm:space-y-3">
          {weeks.map((week, idx) => (
            <div key={idx} className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0 p-3 xs:p-4 bg-muted rounded-lg border border-border">
              <div className="text-xs xs:text-sm font-bold text-foreground min-w-0">
                Week {idx + 1}: {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {week.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-base xs:text-lg font-bold text-primary shrink-0">₱{week.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {categoryBreakdown.length > 0 && (
        <div className="bg-card rounded-lg p-4 xs:p-5 sm:p-6 border border-border">
          <h3 className="text-base xs:text-lg font-bold text-primary mb-3 xs:mb-4">SPENDING BY CATEGORY</h3>
          <div className="space-y-2 sm:space-y-3">
            {categoryBreakdown.map((category) => {
              const percentage = (category.amount / monthlyTotal) * 100
              return (
                <div key={category.name} className="space-y-1.5 xs:space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground text-xs xs:text-sm truncate">{category.name}</span>
                    <span className="text-xs xs:text-sm font-bold text-primary shrink-0">₱{category.amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 xs:h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
