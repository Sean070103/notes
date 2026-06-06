'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { formatDateKey, parseDateKey } from '@/lib/utils'

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  timestamp: Date
}

export type StorageExpenses = Record<string, Expense[]>

export type RecurringExpense = {
  id: string
  amount: number
  category: string
  description: string
  dayOfMonth: number
  active: boolean
}

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment']
const BUDGET_STORAGE_KEY = 'monthly-budget'
const RECURRING_STORAGE_KEY = 'recurring-expenses'
const RECURRING_MARKER_PREFIX = '[Recurring:'

type ExpensesContextType = {
  allExpenses: StorageExpenses
  categories: string[]
  monthlyBudget: number | null
  recurringExpenses: RecurringExpense[]
  loading: boolean
  addExpense: (dateKey: string, expense: Omit<Expense, 'id'>) => Promise<void>
  deleteExpense: (dateKey: string, id: string) => Promise<void>
  addCategory: (category: string) => Promise<void>
  setMonthlyBudget: (amount: number | null) => Promise<void>
  addRecurringExpense: (item: Omit<RecurringExpense, 'id'>) => Promise<void>
  deleteRecurringExpense: (id: string) => Promise<void>
  toggleRecurringExpense: (id: string) => Promise<void>
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined)

function groupExpensesByDate(rows: { id: string; date: string; amount: number; category: string; description: string | null }[]): StorageExpenses {
  const grouped: StorageExpenses = {}
  for (const row of rows) {
    const dateKey = row.date
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push({
      id: row.id,
      amount: Number(row.amount),
      category: row.category,
      description: row.description ?? '',
      timestamp: parseDateKey(dateKey),
    })
  }
  return grouped
}

function loadBudgetFromStorage(): number | null {
  try {
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY)
    if (stored) {
      const val = Number(stored)
      return isNaN(val) ? null : val
    }
  } catch {
    /* ignore */
  }
  return null
}

function loadRecurringFromStorage(): RecurringExpense[] {
  try {
    const stored = localStorage.getItem(RECURRING_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    /* ignore */
  }
  return []
}

async function processRecurringExpenses(
  recurring: RecurringExpense[],
  allExpenses: StorageExpenses,
  addExpenseFn: (dateKey: string, expense: Omit<Expense, 'id'>) => Promise<void>
) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()

  for (const item of recurring.filter((r) => r.active)) {
    const day = Math.min(item.dayOfMonth, lastDay)
    const date = new Date(year, month, day)
    if (date > today) continue

    const dateKey = formatDateKey(date)
    const marker = `${RECURRING_MARKER_PREFIX}${item.id}]`
    const exists = (allExpenses[dateKey] || []).some((e) =>
      e.description.startsWith(marker)
    )
    if (!exists) {
      await addExpenseFn(dateKey, {
        amount: item.amount,
        category: item.category,
        description: `${marker} ${item.description}`.trim(),
        timestamp: date,
      })
    }
  }
}

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [allExpenses, setAllExpenses] = useState<StorageExpenses>({})
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [monthlyBudget, setMonthlyBudgetState] = useState<number | null>(null)
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)

  const addExpenseInternal = useCallback(
    async (dateKey: string, expense: Omit<Expense, 'id'>) => {
      if (!supabase || !user) return
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          date: dateKey,
          amount: expense.amount,
          category: expense.category,
          description: expense.description || '',
        })
        .select('id, date, amount, category, description')
        .single()
      if (error) {
        console.error('Failed to add expense:', error)
        return
      }
      const row = data as { id: string; date: string; amount: number; category: string; description: string | null }
      setAllExpenses((prev) => {
        const list = prev[dateKey] || []
        return {
          ...prev,
          [dateKey]: [
            ...list,
            {
              id: row.id,
              amount: Number(row.amount),
              category: row.category,
              description: row.description ?? '',
              timestamp: parseDateKey(dateKey),
            },
          ],
        }
      })
    },
    [supabase, user]
  )

  const fetchExpenses = useCallback(async () => {
    if (!supabase || !user) {
      setAllExpenses({})
      setCategories(DEFAULT_CATEGORIES)
      setMonthlyBudgetState(loadBudgetFromStorage())
      setRecurringExpenses(loadRecurringFromStorage())
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('expenses') : null
      if (stored) {
        const parsed: StorageExpenses = JSON.parse(stored)
        for (const [dateKey, list] of Object.entries(parsed)) {
          for (const e of list) {
            await supabase.from('expenses').insert({
              user_id: user.id,
              date: dateKey,
              amount: e.amount,
              category: e.category,
              description: e.description || '',
            })
          }
        }
        localStorage.removeItem('expenses')
        const storedCats = localStorage.getItem('expense-categories')
        if (storedCats) {
          const cats: string[] = JSON.parse(storedCats)
          const custom = cats.filter((c) => !DEFAULT_CATEGORIES.includes(c))
          if (custom.length > 0) {
            await supabase.from('user_categories').upsert(
              custom.map((category) => ({ user_id: user.id, category })),
              { onConflict: 'user_id,category' }
            )
          }
          localStorage.removeItem('expense-categories')
        }
      }
    } catch {
      /* ignore migration errors */
    }

    const [expRes, catRes, budgetRes, recurringRes] = await Promise.all([
      supabase.from('expenses').select('id, date, amount, category, description').eq('user_id', user.id).order('date'),
      supabase.from('user_categories').select('category').eq('user_id', user.id),
      supabase.from('user_budget').select('monthly_budget').eq('user_id', user.id).maybeSingle(),
      supabase.from('recurring_expenses').select('id, amount, category, description, day_of_month, active').eq('user_id', user.id),
    ])

    const grouped = expRes.data
      ? groupExpensesByDate(expRes.data as { id: string; date: string; amount: number; category: string; description: string | null }[])
      : {}
    setAllExpenses(grouped)

    if (catRes.data && catRes.data.length > 0) {
      const custom = (catRes.data as { category: string }[]).map((r) => r.category)
      setCategories([...new Set([...DEFAULT_CATEGORIES, ...custom])])
    } else {
      setCategories(DEFAULT_CATEGORIES)
    }

    if (budgetRes.data && (budgetRes.data as { monthly_budget: number | null }).monthly_budget != null) {
      setMonthlyBudgetState(Number((budgetRes.data as { monthly_budget: number }).monthly_budget))
    } else {
      setMonthlyBudgetState(loadBudgetFromStorage())
    }

    if (recurringRes.data && recurringRes.data.length > 0) {
      setRecurringExpenses(
        (recurringRes.data as { id: string; amount: number; category: string; description: string | null; day_of_month: number; active: boolean }[]).map(
          (r) => ({
            id: r.id,
            amount: Number(r.amount),
            category: r.category,
            description: r.description ?? '',
            dayOfMonth: r.day_of_month,
            active: r.active,
          })
        )
      )
    } else {
      setRecurringExpenses(loadRecurringFromStorage())
    }

    setLoading(false)

    const recurring =
      recurringRes.data && recurringRes.data.length > 0
        ? (recurringRes.data as { id: string; amount: number; category: string; description: string | null; day_of_month: number; active: boolean }[]).map(
            (r) => ({
              id: r.id,
              amount: Number(r.amount),
              category: r.category,
              description: r.description ?? '',
              dayOfMonth: r.day_of_month,
              active: r.active,
            })
          )
        : loadRecurringFromStorage()

    await processRecurringExpenses(recurring, grouped, addExpenseInternal)
  }, [supabase, user, addExpenseInternal])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = useCallback(
    async (dateKey: string, expense: Omit<Expense, 'id'>) => {
      await addExpenseInternal(dateKey, expense)
    },
    [addExpenseInternal]
  )

  const deleteExpense = useCallback(
    async (dateKey: string, id: string) => {
      if (!supabase) return
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) {
        console.error('Failed to delete expense:', error)
        return
      }
      setAllExpenses((prev) => {
        const list = (prev[dateKey] || []).filter((e) => e.id !== id)
        if (list.length === 0) {
          const next = { ...prev }
          delete next[dateKey]
          return next
        }
        return { ...prev, [dateKey]: list }
      })
    },
    [supabase]
  )

  const addCategory = useCallback(
    async (category: string) => {
      if (!supabase || !user || !category.trim()) return
      const trimmed = category.trim()
      if (categories.includes(trimmed)) return
      const { error } = await supabase.from('user_categories').insert({ user_id: user.id, category: trimmed })
      if (error) {
        console.error('Failed to add category:', error)
        return
      }
      setCategories((prev) => [...prev, trimmed])
    },
    [supabase, user, categories]
  )

  const setMonthlyBudget = useCallback(
    async (amount: number | null) => {
      setMonthlyBudgetState(amount)
      if (amount != null) {
        localStorage.setItem(BUDGET_STORAGE_KEY, String(amount))
      } else {
        localStorage.removeItem(BUDGET_STORAGE_KEY)
      }
      if (supabase && user) {
        await supabase.from('user_budget').upsert(
          {
            user_id: user.id,
            monthly_budget: amount,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
      }
    },
    [supabase, user]
  )

  const persistRecurring = useCallback(
    async (items: RecurringExpense[]) => {
      setRecurringExpenses(items)
      localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(items))
    },
    []
  )

  const addRecurringExpense = useCallback(
    async (item: Omit<RecurringExpense, 'id'>) => {
      const id = crypto.randomUUID()
      const newItem: RecurringExpense = { ...item, id }
      if (supabase && user) {
        const { data, error } = await supabase
          .from('recurring_expenses')
          .insert({
            user_id: user.id,
            amount: item.amount,
            category: item.category,
            description: item.description,
            day_of_month: item.dayOfMonth,
            active: item.active,
          })
          .select('id')
          .single()
        if (!error && data) {
          newItem.id = (data as { id: string }).id
        }
      }
      const next = [...recurringExpenses, newItem]
      await persistRecurring(next)
    },
    [supabase, user, recurringExpenses, persistRecurring]
  )

  const deleteRecurringExpense = useCallback(
    async (id: string) => {
      if (supabase) {
        await supabase.from('recurring_expenses').delete().eq('id', id)
      }
      const next = recurringExpenses.filter((r) => r.id !== id)
      await persistRecurring(next)
    },
    [supabase, recurringExpenses, persistRecurring]
  )

  const toggleRecurringExpense = useCallback(
    async (id: string) => {
      const next = recurringExpenses.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      )
      if (supabase && user) {
        const item = next.find((r) => r.id === id)
        if (item) {
          await supabase
            .from('recurring_expenses')
            .update({ active: item.active })
            .eq('id', id)
        }
      }
      await persistRecurring(next)
    },
    [supabase, user, recurringExpenses, persistRecurring]
  )

  const value = useMemo(
    () => ({
      allExpenses,
      categories,
      monthlyBudget,
      recurringExpenses,
      loading,
      addExpense,
      deleteExpense,
      addCategory,
      setMonthlyBudget,
      addRecurringExpense,
      deleteRecurringExpense,
      toggleRecurringExpense,
    }),
    [
      allExpenses,
      categories,
      monthlyBudget,
      recurringExpenses,
      loading,
      addExpense,
      deleteExpense,
      addCategory,
      setMonthlyBudget,
      addRecurringExpense,
      deleteRecurringExpense,
      toggleRecurringExpense,
    ]
  )

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext)
  if (ctx === undefined) throw new Error('useExpenses must be used within ExpensesProvider')
  return ctx
}
