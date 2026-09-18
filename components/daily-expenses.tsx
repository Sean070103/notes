'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ExpenseItem } from './expense-item'
import { useExpenses, type Expense } from '@/lib/expenses-context'
import { formatDateKey } from '@/lib/utils'
import { CardSkeleton } from '@/components/loading-skeleton'

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment']

interface DailyExpensesProps {
  selectedDate: Date
}

export function DailyExpenses({ selectedDate }: DailyExpensesProps) {
  const { allExpenses, categories, loading, addExpense, deleteExpense, addCategory, editCategory, deleteCategory } = useExpenses()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0] ?? 'Food')
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryValue, setEditCategoryValue] = useState('')

  const dateKey = formatDateKey(selectedDate)
  const dayExpenses = allExpenses[dateKey] || []
  const isToday = formatDateKey(new Date()) === dateKey

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

  const handleStartEditCategory = (cat: string) => {
    setEditingCategory(cat)
    setEditCategoryValue(cat)
  }

  const handleSaveEditCategory = async () => {
    if (editingCategory) {
      await editCategory(editingCategory, editCategoryValue)
      if (selectedCategory === editingCategory) setSelectedCategory(editCategoryValue.trim())
      setEditingCategory(null)
      setEditCategoryValue('')
    }
  }

  const handleDeleteCategory = async (cat: string) => {
    await deleteCategory(cat)
    if (selectedCategory === cat) setSelectedCategory(categories.find((c) => c !== cat) ?? 'Food')
  }

  const totalExpenses = dayExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={2} />
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
              {categories.map((cat) =>
                editingCategory === cat ? (
                  // Inline edit input for this category
                  <div key={cat} className="flex items-center gap-1 shrink-0">
                    <Input
                      type="text"
                      value={editCategoryValue}
                      onChange={(e) => setEditCategoryValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditCategory()
                        if (e.key === 'Escape') setEditingCategory(null)
                      }}
                      className="text-xs h-[44px] w-28 px-2"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveEditCategory}
                      className="min-h-[44px] px-3 text-xs font-bold"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategory(null)}
                      className="min-h-[44px] px-3 text-xs font-bold"
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  // Normal category chip with edit/delete for custom categories
                  <div key={cat} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat)
                        setShowNewCategory(false)
                      }}
                      className={`min-h-[44px] px-3 xs:px-4 py-2 rounded-md font-bold text-xs xs:text-sm neo-border transition neo-btn-press ${
                        selectedCategory === cat
                          ? 'bg-primary text-primary-foreground neo-shadow-sm'
                          : 'bg-card text-foreground neo-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px]'
                      }`}
                    >
                      {cat}
                    </button>
                    {/* Edit / Delete controls — only for custom (non-default) categories */}
                    {!DEFAULT_CATEGORIES.includes(cat) && (
                      <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-0.5 z-10">
                        <button
                          type="button"
                          title="Edit category"
                          onClick={() => handleStartEditCategory(cat)}
                          className="w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-foreground neo-border text-[10px] hover:bg-primary hover:text-primary-foreground transition"
                        >
                          ✏
                        </button>
                        <button
                          type="button"
                          title="Delete category"
                          onClick={() => handleDeleteCategory(cat)}
                          className="w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-foreground neo-border text-[10px] hover:bg-destructive hover:text-destructive-foreground transition"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
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
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
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
        <p className="text-xs xs:text-sm font-bold text-foreground mb-1 xs:mb-2 uppercase">
          {isToday ? "Today's total" : 'Day total'}
        </p>
        <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-foreground">₱{totalExpenses.toFixed(2)}</p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {dayExpenses.length === 0 ? (
          <div className="bg-muted neo-border neo-shadow-sm rounded-md p-6 xs:p-8 text-center">
            <p className="text-2xl mb-2">💸</p>
            <p className="text-xs xs:text-sm font-bold text-muted-foreground">No expenses yet</p>
            <p className="text-[10px] xs:text-xs text-muted-foreground mt-2">
              {isToday
                ? 'Start tracking your spending today!'
                : `Nothing logged for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — add one above.`}
            </p>
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
