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
  Food: 'bg-accent text-accent-foreground',
  Transport: 'bg-secondary text-secondary-foreground',
  Shopping: 'bg-primary text-primary-foreground',
  Entertainment: 'bg-destructive text-destructive-foreground',
}

export function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
  const categoryColor = categoryColors[expense.category] || 'bg-primary text-primary-foreground'

  return (
    <Card className="p-3 xs:p-4 flex flex-col gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 xs:gap-3 mb-1 xs:mb-2">
          <span
            className={`text-[10px] xs:text-xs font-bold px-2 xs:px-3 py-0.5 xs:py-1 rounded-md neo-border neo-shadow-sm ${categoryColor}`}
          >
            {expense.category}
          </span>
        </div>
        <p className="text-xs xs:text-sm text-foreground font-bold break-words">{expense.description}</p>
      </div>

      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
        <div className="text-base xs:text-lg font-bold text-foreground xs:text-right xs:flex-1">
          ₱{expense.amount.toFixed(2)}
        </div>
        <Button
          onClick={() => onDelete(expense.id)}
          variant="destructive"
          size="sm"
          className="w-full xs:w-auto text-xs xs:text-sm min-h-[44px] xs:min-h-9"
        >
          Remove
        </Button>
      </div>
    </Card>
  )
}
