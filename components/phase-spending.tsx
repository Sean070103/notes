'use client'

import { useMemo } from 'react'
import { useExpenses } from '@/lib/expenses-context'
import { getSpendingByPhase, getTopSpendingPhase } from '@/lib/phase-spending'
import type { CycleSettings } from '@/lib/cycle-phases'

interface PhaseSpendingProps {
  settings: CycleSettings
  referenceDate?: Date
}

export function PhaseSpending({ settings, referenceDate = new Date() }: PhaseSpendingProps) {
  const { allExpenses } = useExpenses()

  const phases = useMemo(
    () =>
      getSpendingByPhase(
        allExpenses,
        settings,
        referenceDate.getFullYear(),
        referenceDate.getMonth()
      ),
    [allExpenses, settings, referenceDate]
  )

  const top = getTopSpendingPhase(phases)
  const total = phases.reduce((sum, p) => sum + p.amount, 0)
  const monthLabel = referenceDate.toLocaleDateString('en-US', { month: 'long' })

  if (!settings.lastPeriodStart) return null

  if (phases.length === 0) {
    return (
      <div className="neo-card p-5 text-center border-2 border-dashed border-rose-200 bg-rose-50/30">
        <p className="text-2xl mb-2">💸</p>
        <p className="text-xs font-bold text-rose-500">
          No spending logged in {monthLabel} yet — add expenses to see phase insights!
        </p>
      </div>
    )
  }

  return (
    <div className="neo-card overflow-hidden">
      <div className="p-4 xs:p-5 bg-gradient-to-r from-fuchsia-50 to-rose-50 border-b-2 border-fuchsia-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">💅</span>
          <div>
            <h3 className="text-sm xs:text-base font-bold text-fuchsia-700">Spending by cycle phase</h3>
            <p className="text-[10px] xs:text-xs text-fuchsia-400 font-bold">{monthLabel}</p>
          </div>
        </div>
      </div>
      <div className="p-4 xs:p-5 space-y-3">
        {top && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 rounded-lg p-3 border border-rose-200">
            {top.emoji} You spent the most during <span className="text-rose-700">{top.name}</span> phase
            — ₱{top.amount.toFixed(2)} ({total > 0 ? Math.round((top.amount / total) * 100) : 0}% of month)
          </p>
        )}
        {phases.map((phase) => {
          const pct = total > 0 ? (phase.amount / total) * 100 : 0
          return (
            <div key={phase.phaseId} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold">
                  {phase.emoji} {phase.name}
                </span>
                <span className="text-xs font-bold text-primary">₱{phase.amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-rose-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-fuchsia-400 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
