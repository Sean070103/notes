'use client'

import { useMemo } from 'react'
import { useExpenses } from '@/lib/expenses-context'
import { getDailyTotal, getMonthlyTotal } from '@/lib/expense-totals'
import { formatDateKey } from '@/lib/utils'

function formatCompactAmount(amount: number): string {
  if (amount >= 1000) return `₱${(amount / 1000).toFixed(1)}k`
  return `₱${amount.toFixed(0)}`
}

interface CalendarViewProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
  onDaySelect: (date: Date) => void
}

export function CalendarView({ currentMonth, onMonthChange, onDaySelect }: CalendarViewProps) {
  const { allExpenses: expenses } = useExpenses()

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthTotal = useMemo(
    () => getMonthlyTotal(expenses, currentMonth.getFullYear(), currentMonth.getMonth()),
    [expenses, currentMonth]
  )

  const hasAnyExpenses = monthTotal > 0

  const prevMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="space-y-4">
      <div className="neo-card p-3 xs:p-4 sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-4 xs:mb-6">
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

        <p className="text-[10px] xs:text-xs text-muted-foreground font-bold text-center mb-3">
          Tap any day to view or add expenses
        </p>

        <div className="grid grid-cols-7 gap-1 xs:gap-2 mb-2 xs:mb-4">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day} className="text-center font-bold text-[10px] xs:text-xs sm:text-sm text-primary truncate">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 xs:gap-2">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square min-w-0" />
          ))}
          {days.map((day) => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const dateKey = formatDateKey(date)
            const total = getDailyTotal(expenses, dateKey)
            const hasExpenses = total > 0
            const isToday = formatDateKey(new Date()) === dateKey

            return (
              <button
                key={day}
                type="button"
                onClick={() => onDaySelect(date)}
                className={`aspect-square min-w-0 rounded-md p-0.5 xs:p-1 sm:p-2 flex flex-col items-center justify-center neo-border transition cursor-pointer hover:scale-105 active:scale-95 ${
                  hasExpenses
                    ? 'bg-primary text-primary-foreground neo-shadow-sm'
                    : 'bg-card neo-shadow-sm hover:bg-muted'
                } ${isToday ? 'ring-2 ring-secondary ring-offset-1' : ''}`}
              >
                <div
                  className={`text-[10px] xs:text-xs sm:text-sm font-bold leading-tight ${
                    hasExpenses ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {day}
                </div>
                {hasExpenses ? (
                  <div className="text-[8px] xs:text-[10px] sm:text-xs text-primary-foreground/90 font-bold mt-0.5 xs:mt-1 truncate w-full text-center">
                    {formatCompactAmount(total)}
                  </div>
                ) : (
                  <div className="text-[8px] xs:text-[10px] text-muted-foreground/50 mt-0.5">—</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {!hasAnyExpenses && (
        <div className="neo-card p-6 text-center border-2 border-dashed border-primary/30">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-sm font-bold text-primary mb-1">No spending this month yet</p>
          <p className="text-xs text-muted-foreground">
            Tap a day on the calendar or switch to Daily to start tracking!
          </p>
        </div>
      )}
    </div>
  )
}
