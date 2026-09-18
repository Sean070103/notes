'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  const [showManage, setShowManage] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Edit state
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryValue, setEditCategoryValue] = useState('')

  // Delete confirmation state
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const dateKey = formatDateKey(selectedDate)
  const dayExpenses = allExpenses[dateKey] || []
  const isToday = formatDateKey(new Date()) === dateKey
  const customCategories = categories.filter((c) => !DEFAULT_CATEGORIES.includes(c))

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

  const handleStartEdit = (cat: string) => {
    setEditingCategory(cat)
    setEditCategoryValue(cat)
  }

  const handleSaveEdit = async () => {
    if (!editingCategory) return
    await editCategory(editingCategory, editCategoryValue)
    if (selectedCategory === editingCategory) setSelectedCategory(editCategoryValue.trim())
    setEditingCategory(null)
    setEditCategoryValue('')
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    await deleteCategory(categoryToDelete)
    if (selectedCategory === categoryToDelete) {
      setSelectedCategory(categories.find((c) => c !== categoryToDelete) ?? 'Food')
    }
    setCategoryToDelete(null)
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
    <>
      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 xs:p-5 sm:p-6">
          <h2 className="text-base xs:text-lg font-bold text-primary mb-4 sm:mb-6">Add Expense</h2>

          <div className="space-y-4">
            {/* Amount + Description */}
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

            {/* Category selector */}
            <div>
              <div className="flex items-center justify-between mb-2 xs:mb-3">
                <label className="block text-xs xs:text-sm font-bold text-foreground">Category</label>
                {customCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowManage((v) => !v)
                      setEditingCategory(null)
                    }}
                    className="text-[10px] xs:text-xs font-bold text-muted-foreground hover:text-primary transition underline underline-offset-2"
                  >
                    {showManage ? 'Done' : 'Manage categories'}
                  </button>
                )}
              </div>

              {/* Category chips — clean, no attached controls */}
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
                  + New
                </button>
              </div>

              {/* Manage panel — edit/delete custom categories */}
              {showManage && customCategories.length > 0 && (
                <div className="mt-3 rounded-md neo-border bg-muted p-3 space-y-2">
                  <p className="text-[10px] xs:text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                    Custom categories
                  </p>
                  {customCategories.map((cat) =>
                    editingCategory === cat ? (
                      <div key={cat} className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={editCategoryValue}
                          onChange={(e) => setEditCategoryValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit()
                            if (e.key === 'Escape') setEditingCategory(null)
                          }}
                          className="text-sm min-h-[40px] flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEdit} className="min-h-[40px] px-3 text-xs font-bold">
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(null)}
                          className="min-h-[40px] px-3 text-xs font-bold"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div key={cat} className="flex items-center justify-between gap-2 py-1">
                        <span className="text-xs xs:text-sm font-bold text-foreground">{cat}</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="text-xs font-bold px-2.5 py-1 rounded neo-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground transition min-h-[36px]"
                          >
                            ✏ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(cat)}
                            className="text-xs font-bold px-2.5 py-1 rounded neo-border bg-card text-destructive hover:bg-destructive hover:text-destructive-foreground transition min-h-[36px]"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* New category input */}
            {showNewCategory && (
              <div className="flex flex-col xs:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="New category name..."
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

        {/* Daily total */}
        <div className="bg-secondary neo-border neo-shadow-lg rounded-md p-4 xs:p-5 sm:p-6">
          <p className="text-xs xs:text-sm font-bold text-foreground mb-1 xs:mb-2 uppercase">
            {isToday ? "Today's total" : 'Day total'}
          </p>
          <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-foreground">₱{totalExpenses.toFixed(2)}</p>
        </div>

        {/* Expense list */}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => { if (!open) setCategoryToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{categoryToDelete}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category from your list. Existing expenses tagged with this category will not be deleted, but will keep the old category label.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
