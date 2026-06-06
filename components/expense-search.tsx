'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useExpenses } from '@/lib/expenses-context'
import { searchExpenses } from '@/lib/expense-search'
import { ExpenseItem } from '@/components/expense-item'
import { parseDateKey } from '@/lib/utils'

export function ExpenseSearch() {
  const { allExpenses, categories, deleteExpense } = useExpenses()
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const results = useMemo(
    () => searchExpenses(allExpenses, query, categoryFilter || undefined),
    [allExpenses, query, categoryFilter]
  )

  const showResults = query.length > 0 || categoryFilter.length > 0

  return (
    <div className="neo-card p-4 xs:p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔍</span>
        <h3 className="text-sm xs:text-base font-bold text-primary">Search expenses</h3>
      </div>
      <Input
        type="search"
        placeholder="Search by description, category, amount..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="min-h-[44px] text-sm"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategoryFilter('')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] xs:text-xs font-bold neo-border ${
            !categoryFilter ? 'bg-primary text-primary-foreground' : 'bg-card'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] xs:text-xs font-bold neo-border ${
              categoryFilter === cat ? 'bg-primary text-primary-foreground' : 'bg-card'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {showResults && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-xs text-muted-foreground font-bold text-center py-4">
              No matches found ✨
            </p>
          ) : (
            results.slice(0, 50).map(({ dateKey, expense }) => (
              <div key={`${dateKey}-${expense.id}`}>
                <p className="text-[10px] font-bold text-muted-foreground mb-1">
                  {parseDateKey(dateKey).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <ExpenseItem
                  expense={expense}
                  onDelete={(id) => deleteExpense(dateKey, id)}
                />
              </div>
            ))
          )}
          {results.length > 50 && (
            <p className="text-[10px] text-muted-foreground text-center font-bold">
              Showing first 50 of {results.length} results
            </p>
          )}
        </div>
      )}
    </div>
  )
}
