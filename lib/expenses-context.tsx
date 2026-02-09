'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { parseDateKey } from '@/lib/utils'

export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  timestamp: Date
}

export type StorageExpenses = Record<string, Expense[]>

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment']

type ExpensesContextType = {
  allExpenses: StorageExpenses
  categories: string[]
  loading: boolean
  addExpense: (dateKey: string, expense: Omit<Expense, 'id'>) => Promise<void>
  deleteExpense: (dateKey: string, id: string) => Promise<void>
  addCategory: (category: string) => Promise<void>
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

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [allExpenses, setAllExpenses] = useState<StorageExpenses>({})
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  const fetchExpenses = useCallback(async () => {
    if (!supabase || !user) {
      setAllExpenses({})
      setCategories(DEFAULT_CATEGORIES)
      setLoading(false)
      return
    }
    setLoading(true)

    // One-time migration: move any localStorage expenses into Supabase
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
    } catch (_) {
      // ignore migration errors
    }

    const [expRes, catRes] = await Promise.all([
      supabase.from('expenses').select('id, date, amount, category, description').eq('user_id', user.id).order('date'),
      supabase.from('user_categories').select('category').eq('user_id', user.id),
    ])
    if (expRes.data) {
      setAllExpenses(groupExpensesByDate(expRes.data as { id: string; date: string; amount: number; category: string; description: string | null }[]))
    } else {
      setAllExpenses({})
    }
    if (catRes.data && catRes.data.length > 0) {
      const custom = (catRes.data as { category: string }[]).map((r) => r.category)
      setCategories([...new Set([...DEFAULT_CATEGORIES, ...custom])])
    } else {
      setCategories(DEFAULT_CATEGORIES)
    }
    setLoading(false)
  }, [supabase, user])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = useCallback(
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

  const value = useMemo(
    () => ({ allExpenses, categories, loading, addExpense, deleteExpense, addCategory }),
    [allExpenses, categories, loading, addExpense, deleteExpense, addCategory]
  )

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext)
  if (ctx === undefined) throw new Error('useExpenses must be used within ExpensesProvider')
  return ctx
}
