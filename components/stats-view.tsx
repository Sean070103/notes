'use client'

import { useExpenses } from '@/lib/expenses-context'
import { getMonthlyTotal } from '@/lib/expense-totals'
import { exportExpensesToCsv } from '@/lib/export-csv'
import { formatDateKey, parseDateKey } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface StatsViewProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

export function StatsView({ currentMonth, onMonthChange }: StatsViewProps) {
  const { allExpenses: expenses } = useExpenses()

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
  const monthlyTotal = getMonthlyTotal(expenses, currentMonth.getFullYear(), currentMonth.getMonth())
  const categoryBreakdown = getCategoryBreakdown(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const hasData = monthlyTotal > 0

  const prevMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="neo-card p-4 xs:p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="min-h-[44px] px-3 xs:px-4 py-2 bg-primary text-primary-foreground rounded-md font-bold text-xs xs:text-sm neo-border neo-shadow-sm neo-btn-press shrink-0"
          >
            ← PREV
          </button>
          <h2 className="text-base xs:text-xl sm:text-2xl font-bold text-primary text-center truncate">{monthName}</h2>
          <button
            type="button"
            onClick={nextMonth}
            className="min-h-[44px] px-3 xs:px-4 py-2 bg-primary text-primary-foreground rounded-md font-bold text-xs xs:text-sm neo-border neo-shadow-sm neo-btn-press shrink-0"
          >
            NEXT →
          </button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            className="font-bold text-xs"
            onClick={() =>
              exportExpensesToCsv(
                expenses,
                currentMonth.getFullYear(),
                currentMonth.getMonth()
              )
            }
          >
            📥 Export month CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="font-bold text-xs"
            onClick={() => exportExpensesToCsv(expenses, currentMonth.getFullYear())}
          >
            📥 Export year CSV
          </Button>
        </div>
      </div>

      {!hasData ? (
        <div className="neo-card p-8 text-center border-2 border-dashed border-primary/30">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm font-bold text-primary mb-1">No stats for {monthName}</p>
          <p className="text-xs text-muted-foreground">
            Add some expenses this month to see weekly breakdowns and categories!
          </p>
        </div>
      ) : (
        <>
          <div className="neo-card p-4 xs:p-5 sm:p-6">
            <h3 className="text-base xs:text-lg font-bold text-primary mb-3 xs:mb-4">WEEKLY BREAKDOWN</h3>
            <div className="space-y-2 sm:space-y-3">
              {weeks.map((week, idx) => (
                <div
                  key={idx}
                  className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0 p-3 xs:p-4 bg-card neo-border neo-shadow-sm rounded-md"
                >
                  <div className="text-xs xs:text-sm font-bold text-foreground min-w-0">
                    Week {idx + 1}: {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                    {week.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-base xs:text-lg font-bold text-primary shrink-0">
                    ₱{week.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {categoryBreakdown.length > 0 && (
            <div className="neo-card p-4 xs:p-5 sm:p-6">
              <h3 className="text-base xs:text-lg font-bold text-primary mb-3 xs:mb-4">SPENDING BY CATEGORY</h3>
              <div className="space-y-2 sm:space-y-3">
                {categoryBreakdown.map((category) => {
                  const percentage = monthlyTotal > 0 ? (category.amount / monthlyTotal) * 100 : 0
                  return (
                    <div key={category.name} className="space-y-1.5 xs:space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground text-xs xs:text-sm truncate">
                          {category.name}
                        </span>
                        <span className="text-xs xs:text-sm font-bold text-primary shrink-0">
                          ₱{category.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 xs:h-2 overflow-hidden">
                        <div
                          className="h-full bg-secondary neo-border rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
