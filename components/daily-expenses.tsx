'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ExpenseItem } from './expense-item'
import { useExpenses, type Expense } from '@/lib/expenses-context'

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

  const dateKey = selectedDate.toISOString().split('T')[0]
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
        <Card className="bg-card p-6 border border-border rounded-lg">
          <p className="text-sm font-bold text-muted-foreground">Loading expenses...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-card p-6 border border-border rounded-lg">
        <h2 className="text-lg font-bold text-primary mb-6">Add Expense</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-input text-foreground border-2 border-border rounded-lg text-sm placeholder:text-muted-foreground"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Description</label>
              <Input
                type="text"
                placeholder="Coffee, Gas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-input text-foreground border-2 border-border rounded-lg text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setShowNewCategory(false)
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="px-4 py-2 rounded-lg font-bold text-sm bg-secondary/20 text-secondary hover:bg-secondary/30 transition border border-secondary/30"
              >
                +New
              </button>
            </div>
          </div>

          {showNewCategory && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="New category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-input text-foreground border-2 border-border rounded-lg text-sm placeholder:text-muted-foreground flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button
                onClick={handleAddCategory}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4"
              >
                Add
              </Button>
            </div>
          )}

          <Button
            onClick={handleAddExpense}
            disabled={!amount || submitting}
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 font-bold disabled:opacity-50 rounded-lg"
          >
            {submitting ? 'Adding...' : 'Add Expense'}
          </Button>
        </div>
      </Card>

      <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg p-6 border border-primary/30">
        <p className="text-sm font-bold text-muted-foreground mb-2">Today's Total</p>
        <p className="text-4xl font-bold text-primary">₱{totalExpenses.toFixed(2)}</p>
      </div>

      <div className="space-y-3">
        {dayExpenses.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center border border-border">
            <p className="text-sm font-bold text-muted-foreground">No expenses yet</p>
            <p className="text-xs text-muted-foreground mt-2">Start tracking your spending!</p>
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
