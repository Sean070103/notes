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
    <Card className="bg-card p-4 flex items-center justify-between border border-border rounded-lg hover:shadow-md transition">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${categoryColor}`}>{expense.category}</span>
        </div>
        <p className="text-sm text-foreground font-bold">{expense.description}</p>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <div className="text-lg font-bold text-primary">₱{expense.amount.toFixed(2)}</div>
        </div>
        <Button
          onClick={() => onDelete(expense.id)}
          className="bg-destructive/20 text-destructive hover:bg-destructive/30 font-bold px-3 text-sm rounded-lg border border-destructive/20"
        >
          Remove
        </Button>
      </div>
    </Card>
  )
}
