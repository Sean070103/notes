'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useExpenses } from '@/lib/expenses-context'

export function RecurringExpenses() {
  const {
    categories,
    recurringExpenses,
    addRecurringExpense,
    deleteRecurringExpense,
    toggleRecurringExpense,
  } = useExpenses()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0] ?? 'Food')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!amount || isNaN(parseFloat(amount))) return
    setAdding(true)
    await addRecurringExpense({
      amount: parseFloat(amount),
      category,
      description,
      dayOfMonth: Math.min(31, Math.max(1, Number(dayOfMonth) || 1)),
      active: true,
    })
    setAmount('')
    setDescription('')
    setDayOfMonth('1')
    setAdding(false)
  }

  return (
    <div className="neo-card p-4 xs:p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔁</span>
        <div>
          <h3 className="text-sm xs:text-base font-bold text-primary">Recurring expenses</h3>
          <p className="text-[10px] xs:text-xs text-muted-foreground font-bold">
            Auto-added each month on the chosen day
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Amount</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="min-h-[44px] text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Day of month</Label>
          <Input
            type="number"
            min={1}
            max={31}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="min-h-[44px] text-sm"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-bold">Description</Label>
          <Input
            placeholder="Rent, Netflix..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[44px] text-sm"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-bold">Category</Label>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold neo-border ${
                  category === cat ? 'bg-primary text-primary-foreground' : 'bg-card'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleAdd}
        disabled={!amount || adding}
        className="w-full sm:w-auto min-h-[44px] font-bold"
      >
        {adding ? 'Adding...' : '+ Add recurring'}
      </Button>

      {recurringExpenses.length > 0 ? (
        <div className="space-y-2">
          {recurringExpenses.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-2 p-3 rounded-md neo-border ${
                item.active ? 'bg-card' : 'bg-muted opacity-60'
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">
                  {item.description || item.category} · Day {item.dayOfMonth}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold">
                  {item.category} · ₱{item.amount.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleRecurringExpense(item.id)}
                  className="px-2 py-1 text-[10px] font-bold neo-border rounded bg-card"
                >
                  {item.active ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteRecurringExpense(item.id)}
                  className="px-2 py-1 text-[10px] font-bold neo-border rounded bg-destructive/10 text-destructive"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground font-bold text-center py-2">
          No recurring expenses yet — add rent, subscriptions, etc.
        </p>
      )}
    </div>
  )
}
