export type CyclePhaseId = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export type CyclePhase = {
  id: CyclePhaseId
  name: string
  shortLabel: string
  description: string
  tips: string
  colorClass: string
  borderClass: string
}

export const CYCLE_PHASES: CyclePhase[] = [
  {
    id: 'menstrual',
    name: 'Menstrual',
    shortLabel: 'Period',
    description: 'Your period. The uterine lining sheds and a new cycle begins.',
    tips: 'Rest, hydrate, and track flow. Light movement can help cramps.',
    colorClass: 'bg-destructive/15 text-destructive',
    borderClass: 'border-destructive/40',
  },
  {
    id: 'follicular',
    name: 'Follicular',
    shortLabel: 'Follicular',
    description: 'Estrogen rises. Follicles in the ovaries mature and energy often increases.',
    tips: 'Good time for new habits, workouts, and planning.',
    colorClass: 'bg-secondary/20 text-secondary',
    borderClass: 'border-secondary/40',
  },
  {
    id: 'ovulation',
    name: 'Ovulation',
    shortLabel: 'Ovulation',
    description: 'An egg is released. This is your most fertile window of the cycle.',
    tips: 'Fertility is highest. You may notice clearer cervical mucus or mild ovulation pain.',
    colorClass: 'bg-primary/20 text-primary',
    borderClass: 'border-primary/40',
  },
  {
    id: 'luteal',
    name: 'Luteal',
    shortLabel: 'Luteal',
    description: 'Progesterone rises after ovulation. The body prepares for a possible pregnancy.',
    tips: 'PMS may appear later in this phase. Prioritize sleep and balanced meals.',
    colorClass: 'bg-accent/25 text-accent-foreground',
    borderClass: 'border-accent/50',
  },
]

export type CycleSettings = {
  lastPeriodStart: string // YYYY-MM-DD
  cycleLength: number
  periodLength: number
}

export type PhaseStatus = {
  phase: CyclePhase
  dayInPhase: number
  phaseDayRange: string
  cycleDay: number
  daysUntilNextPeriod: number | null
}

function daysBetween(start: Date, end: Date): number {
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

/** Cycle day 1 = first day of last period */
export function getCycleDay(settings: CycleSettings, onDate: Date = new Date()): number {
  const start = parseLocal(settings.lastPeriodStart)
  const diff = daysBetween(start, onDate)
  if (diff < 0) return 1
  return (diff % settings.cycleLength) + 1
}

function parseLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getOvulationDay(cycleLength: number): number {
  return Math.max(cycleLength - 14, cycleLength / 2)
}

export function getPhaseForCycleDay(
  cycleDay: number,
  cycleLength: number,
  periodLength: number
): CyclePhaseId {
  const ovulation = getOvulationDay(cycleLength)
  const ovulationStart = Math.max(periodLength + 1, ovulation - 1)
  const ovulationEnd = Math.min(cycleLength, ovulation + 1)

  if (cycleDay <= periodLength) return 'menstrual'
  if (cycleDay < ovulationStart) return 'follicular'
  if (cycleDay <= ovulationEnd) return 'ovulation'
  return 'luteal'
}

export function getPhaseStatus(settings: CycleSettings, onDate: Date = new Date()): PhaseStatus | null {
  if (!settings.lastPeriodStart) return null
  const cycleDay = getCycleDay(settings, onDate)
  const phaseId = getPhaseForCycleDay(cycleDay, settings.cycleLength, settings.periodLength)
  const phase = CYCLE_PHASES.find((p) => p.id === phaseId)!
  const ovulation = getOvulationDay(settings.cycleLength)
  const ovulationStart = Math.max(settings.periodLength + 1, ovulation - 1)
  const ovulationEnd = Math.min(settings.cycleLength, ovulation + 1)

  let phaseStart: number
  let phaseEnd: number
  switch (phaseId) {
    case 'menstrual':
      phaseStart = 1
      phaseEnd = settings.periodLength
      break
    case 'follicular':
      phaseStart = settings.periodLength + 1
      phaseEnd = ovulationStart - 1
      break
    case 'ovulation':
      phaseStart = ovulationStart
      phaseEnd = ovulationEnd
      break
    case 'luteal':
      phaseStart = ovulationEnd + 1
      phaseEnd = settings.cycleLength
      break
  }

  const dayInPhase = cycleDay - phaseStart + 1
  const daysUntilNextPeriod =
    cycleDay <= settings.cycleLength ? settings.cycleLength - cycleDay + 1 : null

  return {
    phase,
    cycleDay,
    dayInPhase,
    phaseDayRange: `Days ${phaseStart}–${phaseEnd}`,
    daysUntilNextPeriod,
  }
}
