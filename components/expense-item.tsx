'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Expense {
  id: string
  amount: number
  category: string
  description: string
}

interface ExpenseItemProps {
  expense: Expense
  onDelete: (id: string) => void
}

const categoryColors: Record<string, string> = {
  Food: 'bg-accent/20 text-accent border-accent/30',
  Transport: 'bg-secondary/20 text-secondary border-secondary/30',
  Shopping: 'bg-primary/20 text-primary border-primary/30',
  Entertainment: 'bg-destructive/20 text-destructive border-destructive/30',
}

export function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
  const categoryColor = categoryColors[expense.category] || 'bg-primary/20 text-primary border-primary/30'

  return (
    <Card className="bg-card p-3 xs:p-4 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 border border-border rounded-lg hover:shadow-md transition">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 xs:gap-3 mb-1 xs:mb-2">
          <span className={`text-[10px] xs:text-xs font-bold px-2 xs:px-3 py-0.5 xs:py-1 rounded-full border ${categoryColor}`}>{expense.category}</span>
        </div>
        <p className="text-xs xs:text-sm text-foreground font-bold break-words">{expense.description}</p>
      </div>

      <div className="flex items-center justify-between xs:justify-end gap-3 xs:gap-4 xs:ml-4 shrink-0">
        <div className="text-left xs:text-right">
          <div className="text-base xs:text-lg font-bold text-primary">₱{expense.amount.toFixed(2)}</div>
        </div>
        <Button
          onClick={() => onDelete(expense.id)}
          className="bg-destructive/20 text-destructive hover:bg-destructive/30 font-bold px-3 text-xs xs:text-sm rounded-lg border border-destructive/20 min-h-[44px] xs:min-h-9"
        >
          Remove
        </Button>
      </div>
    </Card>
  )
}
