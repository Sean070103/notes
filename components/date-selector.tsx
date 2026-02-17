'use client'

import { Card } from '@/components/ui/card'
import { formatDateKey, parseDateKey } from '@/lib/utils'

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

function sameDayInMonth(from: Date, targetYear: number, targetMonth: number): Date {
  const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate()
  const day = Math.min(from.getDate(), lastDay)
  return new Date(targetYear, targetMonth, day)
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const goPrevMonth = () => {
    const y = selectedDate.getFullYear()
    const m = selectedDate.getMonth()
    onDateChange(sameDayInMonth(selectedDate, m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1))
  }

  const goNextMonth = () => {
    const y = selectedDate.getFullYear()
    const m = selectedDate.getMonth()
    const nextYear = m === 11 ? y + 1 : y
    const nextMonth = m === 11 ? 0 : m + 1
    const next = sameDayInMonth(selectedDate, nextYear, nextMonth)
    if (next > today) onDateChange(today)
    else onDateChange(next)
  }

  const monthLabel = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <Card className="bg-card p-3 xs:p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between gap-2 mb-3 xs:mb-4">
        <h3 className="text-xs xs:text-sm font-bold text-foreground">Select Date</h3>
        <span className="text-[10px] xs:text-xs font-bold text-muted-foreground" aria-live="polite">
          {monthLabel}
        </span>
      </div>
      <div className="flex flex-col gap-2 xs:gap-3">
        <div className="flex flex-col xs:flex-row flex-wrap gap-2 xs:gap-3">
          <button
            type="button"
            onClick={() => onDateChange(yesterday)}
            className={`min-h-[44px] px-4 py-2.5 text-xs xs:text-sm font-bold rounded-lg transition flex-1 xs:flex-none ${
              isSelected(yesterday)
                ? 'bg-secondary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => onDateChange(today)}
            className={`min-h-[44px] px-4 py-2.5 text-xs xs:text-sm font-bold rounded-lg transition flex-1 xs:flex-none ${
              isSelected(today)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Today
          </button>
          <input
            type="date"
            value={formatDateKey(selectedDate)}
            onChange={(e) => onDateChange(parseDateKey(e.target.value))}
            className="bg-input text-foreground border-2 border-border rounded-lg text-xs xs:text-sm font-bold px-3 py-2.5 min-h-[44px] w-full xs:w-auto flex-1 xs:flex-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrevMonth}
            className="min-h-[44px] flex-1 px-3 py-2.5 text-xs xs:text-sm font-bold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition"
          >
            ← Previous month
          </button>
          <button
            type="button"
            onClick={goNextMonth}
            className="min-h-[44px] flex-1 px-3 py-2.5 text-xs xs:text-sm font-bold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition disabled:opacity-50 disabled:pointer-events-none"
            disabled={selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear()}
          >
            Next month →
          </button>
        </div>
      </div>
    </Card>
  )
}
