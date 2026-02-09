'use client'

import { useState } from 'react'
import { useExpenses } from '@/lib/expenses-context'
import { formatDateKey } from '@/lib/utils'

export function CalendarView() {
  const { allExpenses: expenses } = useExpenses()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getDailyTotal = (date: Date) => {
    const dateStr = formatDateKey(date)
    const dayExpenses = expenses[dateStr] || []
    return dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="bg-card rounded-lg p-3 xs:p-4 sm:p-6 border border-border overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-4 xs:mb-6">
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
          const total = getDailyTotal(date)
          const hasExpenses = total > 0

          return (
            <div
              key={day}
              className={`aspect-square min-w-0 rounded-md xs:rounded-lg p-0.5 xs:p-1 sm:p-2 flex flex-col items-center justify-center border-2 transition ${
                hasExpenses
                  ? 'bg-primary/20 border-primary'
                  : 'bg-muted border-muted'
              }`}
            >
              <div className="text-[10px] xs:text-xs sm:text-sm font-bold text-foreground leading-tight">{day}</div>
              {hasExpenses && (
                <div className="text-[8px] xs:text-[10px] sm:text-xs text-primary font-bold mt-0.5 xs:mt-1 truncate w-full text-center">₱{total.toFixed(0)}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
