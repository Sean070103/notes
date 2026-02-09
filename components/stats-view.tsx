'use client'

import { useState, useEffect } from 'react'

interface ExpenseData {
  [date: string]: Array<{
    id: string
    description: string
    amount: number
    category: string
  }>
}

export function StatsView() {
  const [expenses, setExpenses] = useState<ExpenseData>({})
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const stored = localStorage.getItem('expenses')
    if (stored) {
      setExpenses(JSON.parse(stored))
    }
  }, [])

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const getWeeksInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const weeks: Array<{ start: Date; end: Date; total: number }> = []
    let currentWeekStart = getWeekStart(firstDay)
    
    while (currentWeekStart <= lastDay) {
      const currentWeekEnd = new Date(currentWeekStart)
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6)
      
      let weekTotal = 0
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(currentWeekStart)
        checkDate.setDate(checkDate.getDate() + i)
        const dateStr = checkDate.toISOString().split('T')[0]
        const dayExpenses = expenses[dateStr] || []
        weekTotal += dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      }
      
      weeks.push({
        start: currentWeekStart,
        end: currentWeekEnd,
        total: weekTotal,
      })
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    }
    
    return weeks
  }

  const getMonthlyTotal = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    let total = 0
    
    for (const [dateStr, dayExpenses] of Object.entries(expenses)) {
      const expenseDate = new Date(dateStr)
      if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
        total += dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      }
    }
    
    return total
  }

  const getCategoryBreakdown = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const categories: { [key: string]: number } = {}
    
    for (const [dateStr, dayExpenses] of Object.entries(expenses)) {
      const expenseDate = new Date(dateStr)
      if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
        dayExpenses.forEach((exp) => {
          categories[exp.category] = (categories[exp.category] || 0) + exp.amount
        })
      }
    }
    
    return Object.entries(categories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const weeks = getWeeksInMonth(currentMonth)
  const monthlyTotal = getMonthlyTotal(currentMonth)
  const categoryBreakdown = getCategoryBreakdown(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90"
          >
            ← PREV
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-primary">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90"
          >
            NEXT →
          </button>
        </div>

        {/* Monthly Total */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-6 border border-primary/30">
          <p className="text-sm font-bold text-muted-foreground mb-2">MONTHLY TOTAL</p>
          <p className="text-4xl font-bold text-primary">₱{monthlyTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-bold text-primary mb-4">WEEKLY BREAKDOWN</h3>
        <div className="space-y-3">
          {weeks.map((week, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
              <div className="text-sm font-bold text-foreground">
                Week {idx + 1}: {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                {week.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-lg font-bold text-primary">₱{week.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-bold text-primary mb-4">SPENDING BY CATEGORY</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((category) => {
              const percentage = (category.amount / monthlyTotal) * 100
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">{category.name}</span>
                    <span className="text-sm font-bold text-primary">₱{category.amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
