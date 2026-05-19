'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ExpenseItem } from './expense-item'
import { useExpenses, type Expense } from '@/lib/expenses-context'
import { formatDateKey } from '@/lib/utils'

interface DailyExpensesProps {
  selectedDate: Date
}

export function DailyExpenses({ selectedDate }: DailyExpensesProps) {
  const { allExpenses, categories, loading, addExpense, deleteExpense, addCategory } = useExpenses()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? 'Food')
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const dateKey = formatDateKey(selectedDate)
  const dayExpenses = allExpenses[dateKey] || []

  const handleAddExpense = async () => {
    if (!amount || isNaN(parseFloat(amount))) return
    setSubmitting(true)
    await addExpense(dateKey, {
      amount: parseFloat(amount),
      category: selectedCategory,
      description,
      timestamp: selectedDate,
    })
    setAmount('')
    setDescription('')
    setSelectedCategory(categories[0] ?? 'Food')
    setSubmitting(false)
  }

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      await addCategory(newCategory.trim())
      setSelectedCategory(newCategory.trim())
      setNewCategory('')
      setShowNewCategory(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(dateKey, id)
  }

  const totalExpenses = dayExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-sm font-bold text-muted-foreground">Loading expenses...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="p-4 xs:p-5 sm:p-6">
        <h2 className="text-base xs:text-lg font-bold text-primary mb-4 sm:mb-6">Add Expense</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs xs:text-sm font-bold text-foreground mb-1.5 xs:mb-2">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-sm min-h-[44px]"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs xs:text-sm font-bold text-foreground mb-1.5 xs:mb-2">Description</label>
              <Input
                type="text"
                placeholder="Coffee, Gas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs xs:text-sm font-bold text-foreground mb-2 xs:mb-3">Category</label>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 md:flex-wrap md:overflow-visible">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat)
                    setShowNewCategory(false)
                  }}
                  className={`min-h-[44px] shrink-0 px-3 xs:px-4 py-2 rounded-md font-bold text-xs xs:text-sm neo-border transition neo-btn-press ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground neo-shadow-sm'
                      : 'bg-card text-foreground neo-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px]'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="min-h-[44px] shrink-0 px-3 xs:px-4 py-2 rounded-md font-bold text-xs xs:text-sm bg-secondary text-secondary-foreground neo-border neo-shadow-sm neo-btn-press"
              >
                +New
              </button>
            </div>
          </div>

          {showNewCategory && (
            <div className="flex flex-col xs:flex-row gap-2">
              <Input
                type="text"
                placeholder="New category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="text-sm min-h-[44px] flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button
                onClick={handleAddCategory}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold min-h-[44px] px-4"
              >
                Add
              </Button>
            </div>
          )}

          <Button
            onClick={handleAddExpense}
            disabled={!amount || submitting}
            className="w-full min-h-[44px] text-sm"
          >
            {submitting ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
      </Card>

      <div className="bg-secondary neo-border neo-shadow-lg rounded-md p-4 xs:p-5 sm:p-6">
        <p className="text-xs xs:text-sm font-bold text-foreground mb-1 xs:mb-2 uppercase">Today&apos;s Total</p>
        <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-foreground">₱{totalExpenses.toFixed(2)}</p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {dayExpenses.length === 0 ? (
          <div className="bg-muted neo-border neo-shadow-sm rounded-md p-6 xs:p-8 text-center">
            <p className="text-xs xs:text-sm font-bold text-muted-foreground">No expenses yet</p>
            <p className="text-[10px] xs:text-xs text-muted-foreground mt-2">Start tracking your spending!</p>
          </div>
        ) : (
          dayExpenses.map((expense: Expense) => (
            <ExpenseItem key={expense.id} expense={expense} onDelete={handleDeleteExpense} />
          ))
        )}
      </div>
    </div>
  )
}
