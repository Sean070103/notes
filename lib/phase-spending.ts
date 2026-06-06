import type { StorageExpenses } from '@/lib/expenses-context'
import {
  CYCLE_PHASES,
  getCycleDay,
  getPhaseForCycleDay,
  type CyclePhaseId,
  type CycleSettings,
} from '@/lib/cycle-phases'
import { parseDateKey } from '@/lib/utils'

export type PhaseSpending = {
  phaseId: CyclePhaseId
  name: string
  emoji: string
  amount: number
}

export function getSpendingByPhase(
  expenses: StorageExpenses,
  settings: CycleSettings,
  year: number,
  month: number
): PhaseSpending[] {
  if (!settings.lastPeriodStart) return []

  const totals: Record<CyclePhaseId, number> = {
    menstrual: 0,
    follicular: 0,
    ovulation: 0,
    luteal: 0,
  }

  for (const [dateStr, dayExpenses] of Object.entries(expenses)) {
    const expenseDate = parseDateKey(dateStr)
    if (expenseDate.getFullYear() !== year || expenseDate.getMonth() !== month) continue

    const cycleDay = getCycleDay(settings, expenseDate)
    const phaseId = getPhaseForCycleDay(
      cycleDay,
      settings.cycleLength,
      settings.periodLength
    )
    totals[phaseId] += dayExpenses.reduce((sum, e) => sum + e.amount, 0)
  }

  return CYCLE_PHASES.map((p) => ({
    phaseId: p.id,
    name: p.name,
    emoji: p.emoji,
    amount: totals[p.id],
  })).filter((p) => p.amount > 0)
}

export function getTopSpendingPhase(phases: PhaseSpending[]): PhaseSpending | null {
  if (phases.length === 0) return null
  return phases.reduce((top, p) => (p.amount > top.amount ? p : top), phases[0])
}
