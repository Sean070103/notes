'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ExpenseItem } from './expense-item'

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  timestamp: Date
}

interface DailyExpensesProps {
  selectedDate: Date
}

interface StorageExpenses {
  [date: string]: Expense[]
}

export function DailyExpenses({ selectedDate }: DailyExpensesProps) {
  const [allExpenses, setAllExpenses] = useState<StorageExpenses>({})
  const [categories, setCategories] = useState<string[]>(['Food', 'Transport', 'Shopping', 'Entertainment'])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Food')
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('expenses')
    if (stored) {
      setAllExpenses(JSON.parse(stored))
    }
    const storedCats = localStorage.getItem('expense-categories')
    if (storedCats) {
      setCategories(JSON.parse(storedCats))
      setSelectedCategory(JSON.parse(storedCats)[0])
    }
    setMounted(true)
  }, [])

  const dateKey = selectedDate.toISOString().split('T')[0]
  const dayExpenses = allExpenses[dateKey] || []

  const addExpense = () => {
    if (!amount || isNaN(parseFloat(amount)) || !mounted) return

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category: selectedCategory,
      description,
      timestamp: selectedDate
    }

    const updated = { ...allExpenses, [dateKey]: [...dayExpenses, newExpense] }
    localStorage.setItem('expenses', JSON.stringify(updated))
    setAllExpenses(updated)
    setAmount('')
    setDescription('')
    setSelectedCategory(categories[0])
  }

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      const updated = [...categories, newCategory]
      setCategories(updated)
      localStorage.setItem('expense-categories', JSON.stringify(updated))
      setNewCategory('')
      setShowNewCategory(false)
      setSelectedCategory(newCategory)
    }
  }

  const deleteExpense = (id: string) => {
    const updated = dayExpenses.filter((e: Expense) => e.id !== id)
    const newAllExpenses = { ...allExpenses, [dateKey]: updated }
    localStorage.setItem('expenses', JSON.stringify(newAllExpenses))
    setAllExpenses(newAllExpenses)
  }

  if (!mounted) return null

  const totalExpenses = dayExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-card p-6 border border-border rounded-lg">
        <h2 className="text-lg font-bold text-primary mb-6">Add Expense</h2>

        <div className="space-y-4">
          {/* Amount and Description */}
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

          {/* Category Selection */}
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

          {/* New Category Input */}
          {showNewCategory && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="New category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-input text-foreground border-2 border-border rounded-lg text-sm placeholder:text-muted-foreground flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
              <Button
                onClick={addCategory}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4"
              >
                Add
              </Button>
            </div>
          )}

          {/* Add Button */}
          <Button
            onClick={addExpense}
            disabled={!amount}
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 font-bold disabled:opacity-50 rounded-lg"
          >
            Add Expense
          </Button>
        </div>
      </Card>

      {/* Total */}
      <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg p-6 border border-primary/30">
        <p className="text-sm font-bold text-muted-foreground mb-2">Today's Total</p>
        <p className="text-4xl font-bold text-primary">₱{totalExpenses.toFixed(2)}</p>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {dayExpenses.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center border border-border">
            <p className="text-sm font-bold text-muted-foreground">No expenses yet</p>
            <p className="text-xs text-muted-foreground mt-2">Start tracking your spending!</p>
          </div>
        ) : (
          dayExpenses.map((expense: Expense) => (
            <ExpenseItem key={expense.id} expense={expense} onDelete={deleteExpense} />
          ))
        )}
      </div>
    </div>
  )
}
