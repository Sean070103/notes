'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  return (
    <Card className="bg-card p-3 xs:p-4 border border-border rounded-lg">
      <h3 className="text-xs xs:text-sm font-bold text-foreground mb-3 xs:mb-4">Select Date</h3>
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
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          className="bg-input text-foreground border-2 border-border rounded-lg text-xs xs:text-sm font-bold px-3 py-2.5 min-h-[44px] w-full xs:w-auto flex-1 xs:flex-none"
        />
      </div>
    </Card>
  )
}
