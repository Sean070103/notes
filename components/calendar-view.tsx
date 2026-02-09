'use client'

import { useState } from 'react'
import { useExpenses } from '@/lib/expenses-context'

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
    const dateStr = date.toISOString().split('T')[0]
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
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90"
        >
          ← PREV
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-primary text-center">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90"
        >
          NEXT →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
          <div key={day} className="text-center font-bold text-sm text-primary">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const total = getDailyTotal(date)
          const hasExpenses = total > 0

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center border-2 transition ${
                hasExpenses
                  ? 'bg-primary/20 border-primary'
                  : 'bg-muted border-muted'
              }`}
            >
              <div className="text-sm font-bold text-foreground">{day}</div>
              {hasExpenses && (
                <div className="text-xs text-primary font-bold mt-1">₱{total.toFixed(0)}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
