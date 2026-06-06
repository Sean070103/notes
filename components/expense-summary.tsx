'use client'

import { useMemo, useState } from 'react'
import { useExpenses } from '@/lib/expenses-context'
import { getMonthlyTotal, getYearlyTotal } from '@/lib/expense-totals'
import { SummarySkeleton } from '@/components/loading-skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
interface ExpenseSummaryProps {
  referenceDate?: Date
}

export function ExpenseSummary({ referenceDate = new Date() }: ExpenseSummaryProps) {
  const { allExpenses, monthlyBudget, setMonthlyBudget, loading } = useExpenses()
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')

  const { monthlyTotal, yearlyTotal, monthLabel, yearLabel } = useMemo(() => {
    const year = referenceDate.getFullYear()
    const month = referenceDate.getMonth()
    return {
      monthlyTotal: getMonthlyTotal(allExpenses, year, month),
      yearlyTotal: getYearlyTotal(allExpenses, year),
      monthLabel: referenceDate.toLocaleDateString('en-US', { month: 'long' }),
      yearLabel: String(year),
    }
  }, [allExpenses, referenceDate])

  const budgetPct =
    monthlyBudget && monthlyBudget > 0
      ? Math.min(100, (monthlyTotal / monthlyBudget) * 100)
      : 0
  const overBudget = monthlyBudget != null && monthlyTotal > monthlyBudget

  const saveBudget = async () => {
    const val = parseFloat(budgetInput)
    if (!isNaN(val) && val > 0) {
      await setMonthlyBudget(val)
    }
    setEditingBudget(false)
  }

  if (loading) return <SummarySkeleton />

  return (
    <div className="space-y-3 mt-4 sm:mt-6">
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
        <div className="bg-primary neo-border neo-shadow-lg rounded-md p-4 xs:p-5">
          <p className="text-[10px] xs:text-xs font-bold text-primary-foreground/80 uppercase tracking-wide mb-1">
            {monthLabel} total
          </p>
          <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-primary-foreground break-all">
            ₱{monthlyTotal.toFixed(2)}
          </p>
        </div>
        <div className="bg-secondary neo-border neo-shadow-lg rounded-md p-4 xs:p-5">
          <p className="text-[10px] xs:text-xs font-bold text-secondary-foreground/80 uppercase tracking-wide mb-1">
            {yearLabel} yearly total
          </p>
          <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-secondary-foreground break-all">
            ₱{yearlyTotal.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="neo-card p-4 xs:p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[10px] xs:text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Monthly budget
          </p>
          {!editingBudget && (
            <button
              type="button"
              onClick={() => {
                setBudgetInput(monthlyBudget?.toString() ?? '')
                setEditingBudget(true)
              }}
              className="text-[10px] font-bold text-primary underline"
            >
              {monthlyBudget ? 'Edit' : 'Set budget'}
            </button>
          )}
        </div>

        {editingBudget ? (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="15000"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="min-h-[40px] text-sm flex-1"
            />
            <Button size="sm" className="font-bold" onClick={saveBudget}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="font-bold"
              onClick={() => setEditingBudget(false)}
            >
              ✕
            </Button>
          </div>
        ) : monthlyBudget ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className={overBudget ? 'text-destructive' : 'text-foreground'}>
                ₱{monthlyTotal.toFixed(2)} / ₱{monthlyBudget.toFixed(2)}
              </span>
              <span className={overBudget ? 'text-destructive' : 'text-muted-foreground'}>
                {Math.round(budgetPct)}%
              </span>
            </div>
            <Progress
              value={budgetPct}
              className={`h-2.5 ${overBudget ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
            />
            {overBudget && (
              <p className="text-[10px] font-bold text-destructive">
                Over budget by ₱{(monthlyTotal - monthlyBudget).toFixed(2)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground font-bold">
            Set a monthly cap to track spending against your goal.
          </p>
        )}
      </div>
    </div>
  )
}
