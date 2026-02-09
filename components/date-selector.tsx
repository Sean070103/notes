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
    <Card className="bg-card p-4 border border-border rounded-lg">
      <h3 className="text-sm font-bold text-foreground mb-4">Select Date</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onDateChange(yesterday)}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
            isSelected(yesterday)
              ? 'bg-secondary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Yesterday
        </button>
        <button
          onClick={() => onDateChange(today)}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
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
          className="bg-input text-foreground border-2 border-border rounded-lg text-sm font-bold px-4 py-2"
        />
      </div>
    </Card>
  )
}
